@echo off
rem Abre o Estoque 99 em http://localhost:8000 (necessário para a IA com Ollama no computador).
cd /d "%~dp0"
where py >nul 2>nul && (set PY=py) || (set PY=python)
start "" "http://localhost:8000/index.html"
echo Estoque 99 rodando em http://localhost:8000 . Feche esta janela para parar.
%PY% -m http.server 8000
