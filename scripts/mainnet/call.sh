#!/bin/bash
set -e
export NEAR_ENV="mainnet"

METAVOTE_CONTRACT_ADDRESS="meta-vote.near"
METAVOTE_OWNER="meta-pool-dao.near"
METAVOTE_WASM="res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 
near view meta-vote.near get_owner_id

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# Call function 
echo FIX
near call $METAVOTE_CONTRACT_ADDRESS test \
'{"amount":"123400000000000000000000","account": "test.near"}' \
--accountId $METAVOTE_OWNER
