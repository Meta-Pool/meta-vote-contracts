#!/bin/bash
set -ex
export NEAR_ENV="testnet"

METAVOTE_CONTRACT_ADDRESS="metavote.testnet"
METAVOTE_OWNER=$METAVOTE_CONTRACT_ADDRESS
METAVOTE_WASM="contracts/res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

NEAR_ENV=testnet near view metavote.testnet get_owner_id
# Call function 
echo set_new_governance_contract_id
near call $METAVOTE_CONTRACT_ADDRESS set_new_governance_contract_id \
'{"contract_id_opt":"v1.mpdao-vote.testnet"}' \
--accountId $METAVOTE_OWNER
