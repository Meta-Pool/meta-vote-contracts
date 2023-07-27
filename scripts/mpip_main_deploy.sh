#!/bin/bash
set -e
export NEAR_ENV="mainnet"

MPIP_MASTER_ACCOUNT="mpip.near"
ADMIN_ADDRESS="mpip.near"
OPERATOR_ADDRESS="mpip.near"
# ADMIN_ADDRESS="meta-pool-dao.near"
# OPERATOR_ADDRESS="meta-pool-dao.near"
CONTRACT_ADDRESS="v003.mpip.near"
METATOKEN_CONTRACT_ADDRESS="meta-token.near"
METAVOTE_CONTRACT_ADDRESS="meta-vote.near"

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

VOTING_PERIOD=5 
VOTING_DELAY_MILIS=0
# PROPOSAL THRESHOLD - MIN VOTING POWER 10.000
MIN_VOTING_POWER_AMOUNT="1"$YOCTO_UNITS
# QUORUM FLOOR 5%
QUORUM_FLOOR=500
MPIP_STOGARE_COST="0"$YOCTO_UNITS

# Create admin account
# NEAR_ENV=mainnet near create-account $ADMIN_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 1
# Create operator account
# NEAR_ENV=mainnet near create-account $OPERATOR_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 1
# create contract account

# near create-account $CONTRACT_ADDRESS --masterAccount $MPIP_MASTER_ACCOUNT --initialBalance 3
# Deploy MPIP Contract
# near deploy --wasmFile res/mpip_contract.wasm --initFunction new --initArgs '{"admin_id": "'$ADMIN_ADDRESS'", "operator_id": "'$OPERATOR_ADDRESS'", "meta_token_contract_address": "'$METATOKEN_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period":'$VOTING_PERIOD', "min_voting_power_amount": "'$MIN_VOTING_POWER_AMOUNT'", "mpip_storage_near": "'$MPIP_STOGARE_COST'", "quorum_floor": '$QUORUM_FLOOR' }' --accountId $CONTRACT_ADDRESS

# Redeploy MPIP Contract
NEAR_ENV=mainnet near deploy --wasmFile res/mpip_contract.wasm --accountId $CONTRACT_ADDRESS
