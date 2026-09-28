@echo off
rem ==========================================================================
rem  TESTAR O SITE NO COMPUTADOR (Windows) - de dois cliques neste arquivo.
rem  Abre o site em http://localhost:8080/ no navegador.
rem  - Com PHP instalado: site completo (formularios, agenda e painel, com um
rem    banco de teste em teste-local\dados).
rem  - Sem PHP: usa o PowerShell que ja vem no Windows. As paginas, o
rem    simulador e os videos funcionam; formularios caem no WhatsApp.
rem  Para parar: feche a janela preta.
rem ==========================================================================
title Astro Consorcios - site no computador
cd /d "%~dp0"
set PORTA=8080

where php >nul 2>nul
if errorlevel 1 goto sem_php

echo.
echo   PHP encontrado: site completo em http://localhost:%PORTA%/
echo   Painel de teste: http://localhost:%PORTA%/painel/instalar.php
echo   (codigo de instalacao: teste-no-computador)
echo   Para parar, feche esta janela.
echo.
set "ASTRO_CONFIG=%~dp0teste-local\config-teste.php"
set "ASTRO_DADOS=%~dp0teste-local\dados"
set ASTRO_PERMITIR_HTTP=1
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORTA%/'"
php -S localhost:%PORTA% -t . teste-local\roteador.php
goto fim

:sem_php
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0teste-local\servidor.ps1" -Porta %PORTA%

:fim
echo.
pause
