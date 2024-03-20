#!/bin/bash
set -e
export NEAR_ENV="mainnet"

METAVOTE_CONTRACT_ADDRESS="meta-vote.near"
METAVOTE_OWNER="meta-pool-dao.near"
METAVOTE_WASM="contracts/res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 
near view meta-vote.near get_owner_id

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# # Deploy Contract
# NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM  --initFunction new --initArgs '{"admin_id": "'$ADMIN_ADDRESS'", "operator_id": "'$OPERATOR_ADDRESS'", "meta_token_contract_address": "'$METATOKEN_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period":'$VOTING_PERIOD', "min_voting_power_amount": "'$MIN_VOTING_POWER_AMOUNT'", "mpip_storage_near_cost_per_kilobytes": "'$MPIP_STOGARE_COST_KB'", "quorum_floor": '$QUORUM_FLOOR' }' --accountId $METAVOTE_CONTRACT_ADDRESS

# Redeploy Contract
# echo REDEPLOY ONLY
# near deploy --wasmFile $METAVOTE_WASM --accountId $METAVOTE_CONTRACT_ADDRESS

# reDeploy with MIGRATION - Note: --initFunction caller IS ALWAYS contract-account
echo reDEPLOY AND STATE MIGRATION
near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM --initFunction migrate --initArgs {}

# NEAR_ENV=testnet near deploy -f --wasmFile $METAVOTE_WASM --accountId metavote.testnet
# NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_total_voting_power '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_locking_period '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_test '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near call metavote.testnet update_min_locking_period '{"new_period": 1}' --accountId metavote.testnet