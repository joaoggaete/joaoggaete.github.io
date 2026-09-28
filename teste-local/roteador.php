<?php
/* ============================================================================
   ROTEADOR DO TESTE NO COMPUTADOR (php -S … teste-local/roteador.php)
   O servidor embutido do PHP não lê o .htaccess. Este arquivo imita as
   regras que importam para testar: bloqueia app/, ferramentas/ e afins,
   abre /imoveis como imoveis.html e responde a página 404 do site.
   Não é usado na hospedagem (lá quem manda é o .htaccess, que ainda bloqueia
   esta pasta inteira).
   ========================================================================= */
$raiz = dirname(__DIR__);
$uri = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

function pagina_404(string $raiz): bool {
  http_response_code(404);
  header('Content-Type: text/html; charset=utf-8');
  readfile($raiz . '/404.html');
  return true;
}

if (preg_match('#^/(app|ferramentas|parciais|docs|teste-local)(/|$)#', $uri) || preg_match('#/\.#', $uri)) return pagina_404($raiz);

/* /imoveis/ → /imoveis (com a barra, os caminhos relativos da página quebrariam) */
if (preg_match('#^/([a-z0-9-]+)/$#', $uri, $m) && is_file($raiz . '/' . $m[1] . '.html')) {
  header('Location: /' . $m[1], true, 301);
  return true;
}
/* /imoveis → imoveis.html */
if (preg_match('#^/([a-z0-9-]+)$#', $uri, $m) && !is_dir($raiz . '/' . $m[1]) && is_file($raiz . '/' . $m[1] . '.html')) {
  header('Content-Type: text/html; charset=utf-8');
  readfile($raiz . '/' . $m[1] . '.html');
  return true;
}

if ($uri !== '/' && !file_exists($raiz . $uri)) return pagina_404($raiz);

return false; /* arquivo que existe: o próprio php -S entrega (e roda os .php) */
