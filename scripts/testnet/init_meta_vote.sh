#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh



# init Contract
echo INIT ONLY
NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS new $ARGS_INIT_META_VOTE --useAccount $METAVOTE_CONTRACT_ADDRESS
