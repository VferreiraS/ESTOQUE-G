#!/bin/sh
# Abre o Estoque 99 em http://localhost:8000 (necessário para a IA com Ollama no computador).
cd "$(dirname "$0")" || exit 1
( sleep 1; if command -v open >/dev/null 2>&1; then open "http://localhost:8000/index.html"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:8000/index.html"; fi ) &
echo "Estoque 99 rodando em http://localhost:8000 (Ctrl+C para parar)."
exec python3 -m http.server 8000
