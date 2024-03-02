#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh

echo DEPLOYING $NEAR_ENV META VOTE
NEAR_ENV=testnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM \
    --initFunction new --initArgs $ARGS
