#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

echo DEPLOYING $NEAR_ENV META VOTE
set -ex
NEAR_ENV=mainnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM \
    --initFunction new --initArgs "$ARGS_INIT_META_VOTE"

# register so the contract can receive mpDAO
NEAR_ENV=mainnet near call $MPDAO_TOKEN_ADDRESS storage_deposit '{"account_id":"'$METAVOTE_CONTRACT_ADDRESS'"}' --accountId $OWNER_ID --amount 0.0125
