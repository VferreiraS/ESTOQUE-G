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
for t in ${@:-cloud_test social_test agents_test autopilot_test theme_sound_test team_link_test team_join_test recover_test login_matrix_test pc_account_test totp_test regestor_test gas_ai_test ia_free_test reply_test auxpersist_test profile_test cartazes_test latejoin_test encerrada_test intro_test verificados_test selo_semnuvem_test seguranca_test sw_test v90_test}; do
  echo "== $t"; out=$(timeout 400 node "tests/$t.js" 2>&1); echo "$out" | grep -E "PASS|FAIL|errors|Error"
  echo "$out" | grep -qE "FAIL|Error" && fail=1
done
kill $P1 $P2 $P3 2>/dev/null; pkill -f cloud-firestore-emulator 2>/dev/null
exit $fail
