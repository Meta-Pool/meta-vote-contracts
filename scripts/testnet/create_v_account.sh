#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh

set -ex
NEAR_ENV=testnet npx near-cli@3 -v create-account $METAVOTE_CONTRACT_ADDRESS --masterAccount $BASE_METAVOTE_CONTRACT_ADDRESS  --initialBalance 3
