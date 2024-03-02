set -ex
export NEAR_ENV=testnet
export CONTRACT_NAME=mpdao-vote.testnet
KEY
near --accountId $CONTRACT_NAME call $CONTRACT_NAME clean --base64 "$(node scripts/testnet/view_state_keys.js | base64 -w0)" --gas 300000000000000
