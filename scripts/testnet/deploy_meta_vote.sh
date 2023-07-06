#!/bin/bash
set -e
# export NEAR_ENV="testnet"

METAVOTE_CONTRACT_ADDRESS="metavote.testnet"
METAVOTE_WASM="contracts/res/meta_vote_contract.wasm"

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# # Deploy Contract
# NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM  --initFunction new --initArgs '{"admin_id": "'$ADMIN_ADDRESS'", "operator_id": "'$OPERATOR_ADDRESS'", "meta_token_contract_address": "'$METATOKEN_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period":'$VOTING_PERIOD', "min_voting_power_amount": "'$MIN_VOTING_POWER_AMOUNT'", "mpip_storage_near_cost_per_kilobytes": "'$MPIP_STOGARE_COST_KB'", "quorum_floor": '$QUORUM_FLOOR' }' --accountId $METAVOTE_CONTRACT_ADDRESS

# # Redeploy Contract
NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM --accountId $METAVOTE_CONTRACT_ADDRESS

# Deploy with migration.
# near deploy metavote.testnet --wasmFile $METAVOTE_WASM --initFunction migrate --initArgs {}

# NEAR_ENV=testnet near deploy -f --wasmFile $METAVOTE_WASM --accountId metavote.testnet
# NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_total_voting_power '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_locking_period '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_test '{}' --accountId metavote.testnet
# NEAR_ENV=testnet near call metavote.testnet update_min_locking_period '{"new_period": 1}' --accountId metavote.testnet