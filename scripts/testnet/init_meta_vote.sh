#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh


# init Contract
echo INIT ONLY
NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS new $ARGS --useAccount $METAVOTE_CONTRACT_ADDRESS
