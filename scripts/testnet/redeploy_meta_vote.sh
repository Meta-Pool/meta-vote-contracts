#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh


# Redeploy Contract
echo Re-DEPLOY ONLY
NEAR_ENV=testnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM

# re-Deploy and call state MIGRATION
#echo DEPLOY AND MIGRATION
#near deploy metavote.testnet --wasmFile $METAVOTE_WASM --initFunction migrate --initArgs {}
