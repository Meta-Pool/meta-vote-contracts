#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

echo mpip-contract: $MPIP_CONTRACT_ADDRESS 
ls -l $MPIP_WASM

# Redeploy Contract
echo Re-DEPLOY ONLY
NEAR_ENV=mainnet near deploy $MPIP_CONTRACT_ADDRESS $MPIP_WASM
