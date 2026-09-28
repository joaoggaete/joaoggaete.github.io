#!/bin/bash
# ==========================================================================
#  TESTAR O SITE NO COMPUTADOR (Mac ou Linux) - dois cliques neste arquivo.
#  Abre o site em http://localhost:8080/ no navegador.
#  Com PHP: site completo (formularios, agenda e painel, banco de teste em
#  teste-local/dados). Sem PHP: so as paginas (formularios caem no WhatsApp).
#  Para parar: feche a janela do Terminal (ou Ctrl+C).
#  Se o Mac disser que nao pode abrir: clique com o botao direito > Abrir.
# ==========================================================================
cd "$(dirname "$0")" || exit 1
PORTA=8080
abrir() { (sleep 2; open "http://localhost:$PORTA/" 2>/dev/null || xdg-open "http://localhost:$PORTA/" 2>/dev/null) & }

if command -v php >/dev/null 2>&1; then
  echo "PHP encontrado: site completo em http://localhost:$PORTA/"
  echo "Painel de teste: http://localhost:$PORTA/painel/instalar.php (codigo: teste-no-computador)"
  export ASTRO_CONFIG="$PWD/teste-local/config-teste.php" ASTRO_DADOS="$PWD/teste-local/dados" ASTRO_PERMITIR_HTTP=1
  abrir
  php -S localhost:$PORTA -t . teste-local/roteador.php
elif command -v python3 >/dev/null 2>&1; then
  echo "Sem PHP: abrindo so as paginas em http://localhost:$PORTA/ (formularios caem no WhatsApp)"
  abrir
  python3 -m http.server $PORTA --bind 127.0.0.1
else
  echo "Nao achei PHP nem Python neste computador."
  echo "Abra o index.html com dois cliques: as paginas funcionam direto do disco."
  read -r -p "Enter para fechar"
fi
