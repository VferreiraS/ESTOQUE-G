#!/usr/bin/env bash
# Roda os testes do Stok com servidor local, ntfy falso e emulador do Firebase.
# Uso: bash tests/run.sh            (todos)
#      bash tests/run.sh cloud_test (um só)
set -u
cd "$(dirname "$0")/.."
python3 -m http.server 8000 >/dev/null 2>&1 & P1=$!
node tests/fake_ntfy.js 20130 >/dev/null 2>&1 & P2=$!
npx -y firebase-tools@latest emulators:start --only auth,firestore --project gen-lang-client-0167474823 >/tmp/stok-emu.log 2>&1 & P3=$!
for i in $(seq 1 120); do curl -s localhost:8080 >/dev/null && curl -s localhost:9099 >/dev/null && break; sleep 2; done
fail=0
for t in ${@:-cloud_test social_test theme_sound_test team_link_test team_join_test recover_test login_matrix_test pc_account_test regestor_test reply_test auxpersist_test cartazes_test encerrada_test intro_test seguranca_test sw_test v90_test som_test som_ios_test colar_plano_test conferencia_test pc_dados_test v101_test v102_test v103_test v105_test chat_melhorias_test v107_test v108_test v109_test v110_test v111_test v112_test v117_test v118_test v120_test v121_test v122_test v123_test v124_test v126_test v127_test v128_test v129_test v130_test v131_test v132_test v133_test v134_test v135_test}; do
  echo "== $t"; out=$(timeout 400 node "tests/$t.js" 2>&1); echo "$out" | grep -E "PASS|FAIL|errors|Error"
  echo "$out" | grep -qE "FAIL|Error" && fail=1
done
kill $P1 $P2 $P3 2>/dev/null; pkill -f cloud-firestore-emulator 2>/dev/null
exit $fail
