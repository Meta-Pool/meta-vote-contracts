#!/bin/bash
set -e
export NEAR_ENV="testnet"
MPIP_MASTER_ACCOUNT="mpips.testnet"
ADMIN_ADDRESS="meta-pool-mpips.testnet"
OPERATOR_ADDRESS="meta-pool-mpips.testnet"
CONTRACT_ADDRESS="v001.mpips.testnet"
METATOKEN_CONTRACT_ADDRESS="token.meta.pool.testnet"
METAVOTE_CONTRACT_ADDRESS="metavote.testnet"

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

VOTING_PERIOD=1 
VOTING_DELAY_MILIS=0
# PROPOSAL THRESHOLD - MIN VOTING POWER 10.000 - MIN NEAR 5
MIN_VOTING_POWER_AMOUNT="10000000000000000000000000000"
# QUORUM FLOOR 5%
QUORUM_FLOOR=500
MPIP_STOGARE_COST="5"$YOCTO_UNITS

# create contract account
near create-account $CONTRACT_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 10

# Deploy Contract
NEAR_ENV=testnet near deploy --wasmFile res/mpip_contract.wasm --initFunction new --initArgs '{"admin_id": "'$ADMIN_ADDRESS'", "operator_id": "'$OPERATOR_ADDRESS'", "meta_token_contract_address": "'$METATOKEN_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period":'$VOTING_PERIOD', "min_voting_power_amount": "'$MIN_VOTING_POWER_AMOUNT'", "min_near_amount": "'$MIN_NEAR_AMOUNT'", "mpip_storage_near": "'$MPIP_STOGARE_COST'", "quorum_floor": '$QUORUM_FLOOR' }' --accountId $CONTRACT_ADDRESS

# Redeploy Contract
# NEAR_ENV=testnet near deploy --wasmFile res/mpip_contract.wasm --accountId $CONTRACT_ADDRESS



# NEAR_ENV=testnet near deploy -f --wasmFile res/meta_vote_contract.wasm --accountId meta-vote.testnet
# NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId meta-vote.testnet
# NEAR_ENV=testnet near call metavote.testnet update_min_locking_period '{"new_period": 1}' --accountId meta-vote.testnet