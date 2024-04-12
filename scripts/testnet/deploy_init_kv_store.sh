#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh

echo DEPLOYING $KV_STORE_CONTRACT_ADDRESS
NEAR_ENV=testnet near deploy $KV_STORE_CONTRACT_ADDRESS $KV_STORE_WASM \
    --initFunction new --initArgs '{"owner_id":"'$KV_STORE_CONTRACT_ADDRESS'","operator_id":"operator.'$KV_STORE_CONTRACT_ADDRESS'"}'
