#!/bin/bash
set -e
export NEAR_ENV="testnet"

METAVOTE_CONTRACT_ADDRESS="metavote.testnet"
METAVOTE_WASM="contracts/res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

#NEAR_ENV=testnet near view metavote.testnet get_owner_id
#NEAR_ENV=testnet near call metavote.testnet set_new_governance_contract_id '{"contract_id_opt":"mpdao-vote.testnet"}' --accountId metavote.testnet
NEAR_ENV=testnet near call metavote.testnet migrate_to_new_governance --accountId lucio.testnet --gas $TOTAL_PREPAID_GAS
