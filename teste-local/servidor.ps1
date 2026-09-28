# ============================================================================
#  SERVIDOR DO TESTE NO COMPUTADOR (Windows, sem instalar nada)
#  Usado pelo TESTAR-NO-COMPUTADOR.bat quando o PHP não está instalado.
#  Serve as páginas, imagens e vídeos do site em http://localhost:8080/ com o
#  PowerShell que já vem no Windows. Sem PHP, formulário e agenda caem no
#  WhatsApp (como o site faz quando o servidor falha) e o painel não abre.
#  Compatível com o Windows PowerShell 5.1 (o que vem no Windows 10/11).
# ============================================================================
param([int]$Porta = 8080)

$raiz = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sep = [IO.Path]::DirectorySeparatorChar
$tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.xml' = 'application/xml; charset=utf-8'
  '.txt' = 'text/plain; charset=utf-8'; '.svg' = 'image/svg+xml'
  '.webp' = 'image/webp'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'; '.ico' = 'image/x-icon'; '.woff2' = 'font/woff2'; '.woff' = 'font/woff'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'; '.pdf' = 'application/pdf'
}

$ouvinte = New-Object System.Net.HttpListener
$ouvinte.Prefixes.Add("http://localhost:$Porta/")
try { $ouvinte.Start() }
catch {
  Write-Host ""
  Write-Host "Nao consegui usar a porta $Porta. Talvez outro programa (ou outra janela"
  Write-Host "deste teste) ja esteja usando. Feche e tente de novo."
  exit 1
}

Write-Host ""
Write-Host "  Site da Astro rodando em:  http://localhost:$Porta/"
Write-Host "  (sem PHP: formularios caem no WhatsApp e o painel nao abre)"
Write-Host "  Para parar, feche esta janela."
Write-Host ""
try { Start-Process "http://localhost:$Porta/" } catch { }

function Responder-Texto($res, [int]$codigo, [string]$tipo, [string]$texto) {
  $res.StatusCode = $codigo
  $res.ContentType = $tipo
  $b = [Text.Encoding]::UTF8.GetBytes($texto)
  $res.ContentLength64 = $b.Length
  $res.OutputStream.Write($b, 0, $b.Length)
}

while ($ouvinte.IsListening) {
  try { $ctx = $ouvinte.GetContext() } catch { break }
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $caminho = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    $codigo = 200

    # o mesmo que o .htaccess bloqueia no servidor de verdade
    if ($caminho -match '^/(app|ferramentas|parciais|docs|teste-local)(/|$)' -or $caminho -match '/\.') {
      $caminho = '/404.html'; $codigo = 404
    }
    # sem PHP, a API responde como "servidor fora" e o site cai no WhatsApp
    if ($caminho -match '\.php$') {
      Responder-Texto $res 503 'application/json; charset=utf-8' '{"ok":false,"motivo":"sem-php","mensagem":"Teste sem PHP no computador."}'
      continue
    }
    # /imoveis/ -> /imoveis (com a barra, os caminhos relativos da página quebrariam)
    if ($caminho -match '^/([a-z0-9-]+)/$' -and (Test-Path -LiteralPath (Join-Path $raiz ($matches[1] + '.html')) -PathType Leaf)) {
      $res.StatusCode = 301
      $res.RedirectLocation = '/' + $matches[1]
      continue
    }
    # /imoveis -> imoveis.html ; pasta -> index.html
    if ($caminho -match '^/([a-z0-9-]+)$' -and (Test-Path -LiteralPath (Join-Path $raiz ($matches[1] + '.html')) -PathType Leaf)) {
      $caminho = '/' + $matches[1] + '.html'
    }
    if ($caminho.EndsWith('/')) { $caminho = $caminho + 'index.html' }

    $arquivo = [IO.Path]::GetFullPath((Join-Path $raiz ($caminho.TrimStart('/').Replace('/', $sep))))
    if (-not $arquivo.StartsWith($raiz) -or -not (Test-Path -LiteralPath $arquivo -PathType Leaf)) {
      $arquivo = Join-Path $raiz '404.html'; $codigo = 404
    }

    $ext = [IO.Path]::GetExtension($arquivo).ToLower()
    $tipo = $tipos[$ext]
    if (-not $tipo) { $tipo = 'application/octet-stream' }

    $fs = [IO.File]::OpenRead($arquivo)
    try {
      $total = $fs.Length
      $ini = [long]0
      $fim = $total - 1
      $res.AddHeader('Accept-Ranges', 'bytes')
      $res.AddHeader('Cache-Control', 'no-store')
      # pedaços do arquivo (o navegador pede assim para tocar e avançar vídeo)
      $faixa = $req.Headers['Range']
      if ($codigo -eq 200 -and $faixa -and $faixa -match '^bytes=(\d*)-(\d*)$') {
        if ($matches[1] -ne '') {
          $ini = [long]$matches[1]
          if ($matches[2] -ne '') { $fim = [Math]::Min([long]$matches[2], $total - 1) }
        } elseif ($matches[2] -ne '') {
          $ini = [Math]::Max([long]0, $total - [long]$matches[2])
        }
        if ($ini -gt $fim) {
          $res.AddHeader('Content-Range', "bytes */$total")
          Responder-Texto $res 416 'text/plain' ''
          continue
        }
        $codigo = 206
        $res.AddHeader('Content-Range', "bytes $ini-$fim/$total")
      }
      $res.StatusCode = $codigo
      $res.ContentType = $tipo
      $res.ContentLength64 = $fim - $ini + 1
      if ($req.HttpMethod -ne 'HEAD') {
        [void]$fs.Seek($ini, [IO.SeekOrigin]::Begin)
        $buf = New-Object byte[] 65536
        $falta = $fim - $ini + 1
        while ($falta -gt 0) {
          $n = $fs.Read($buf, 0, [int][Math]::Min([long]$buf.Length, $falta))
          if ($n -le 0) { break }
          $res.OutputStream.Write($buf, 0, $n)
          $falta -= $n
        }
      }
    } finally { $fs.Dispose() }
  }
  catch {
    # o navegador fechou a conexão no meio (comum com vídeo): segue a vida
  }
  finally {
    try { $res.Close() } catch { }
  }
}
