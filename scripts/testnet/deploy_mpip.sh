#!/bin/bash
set -e
export NEAR_ENV="testnet"

MPIP_MASTER_ACCOUNT="mpips.testnet"
ADMIN_ADDRESS="mpips.testnet"
OPERATOR_ADDRESS="mpips.testnet"
# ADMIN_ADDRESS="meta-pool-dao.near"
# OPERATOR_ADDRESS="meta-pool-dao.near"
CONTRACT_ADDRESS="v0002.mpips.testnet"
METATOKEN_CONTRACT_ADDRESS="token.meta.pool.testnet"
METAVOTE_CONTRACT_ADDRESS="metavote.testnet"

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

VOTING_PERIOD=5 
VOTING_DELAY_MILIS=0
# PROPOSAL THRESHOLD - MIN VOTING POWER 10.000
MIN_VOTING_POWER_AMOUNT="1"$YOCTO_UNITS
# QUORUM FLOOR 5%
QUORUM_FLOOR=500
MPIP_STOGARE_COST="1"$YOCTO_UNITS

# Create admin account
# NEAR_ENV=testnet near create-account $ADMIN_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 1
# Create operator account
# NEAR_ENV=testnet near create-account $OPERATOR_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 1
# create contract account

# near create-account $CONTRACT_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 3
# Deploy MPIP Contract
# near deploy --wasmFile res/mpip_contract.wasm --initFunction new --initArgs '{"admin_id": "'$ADMIN_ADDRESS'", "operator_id": "'$OPERATOR_ADDRESS'", "meta_token_contract_address": "'$METATOKEN_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period":'$VOTING_PERIOD', "min_voting_power_amount": "'$MIN_VOTING_POWER_AMOUNT'", "mpip_storage_near": "'$MPIP_STOGARE_COST'", "quorum_floor": '$QUORUM_FLOOR' }' --accountId $CONTRACT_ADDRESS

# Redeploy MPIP Contract
NEAR_ENV=testnet near deploy --wasmFile res/mpip_contract.wasm --accountId $CONTRACT_ADDRESS
