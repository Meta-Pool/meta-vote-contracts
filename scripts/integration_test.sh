#!/bin/bash
set -e
clear

NEAR_ACCOUNT="metavote.testnet"
YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS=300000000000000

rm -rf neardev/
rm -rf neardev_meta_token/
rm -rf neardev_meta_vote/
rm -rf neardev_mpips/

NEAR_ENV=testnet near dev-deploy --wasmFile res/test_meta_token.wasm --initFunction new_default_meta --initArgs '{"owner_id": "'$NEAR_ACCOUNT'", "total_supply": "1000'$YOCTO_UNITS'", "symbol": "testMETA", "decimals": 24}'
mv neardev/ neardev_meta_token/
META_CONTRACT_ADDRESS=$(head -n1 ./neardev_meta_token/dev-account)

NEAR_ENV=testnet near dev-deploy --wasmFile res/meta_vote_contract.wasm --initFunction new --initArgs '{"owner_id": "'$NEAR_ACCOUNT'", "min_locking_period": 0, "max_locking_period": 300, "min_deposit_amount": "1'$YOCTO_UNITS'", "max_locking_positions": 20, "max_voting_positions": 40, "meta_token_contract_address": "'$META_CONTRACT_ADDRESS'"}'
mv neardev/ neardev_meta_vote/
METAVOTE_CONTRACT_ADDRESS=$(head -n1 ./neardev_meta_vote/dev-account)

NEAR_ENV=testnet near dev-deploy --wasmFile res/mpip_contract.wasm --initFunction new --initArgs '{"admin_id": "'$NEAR_ACCOUNT'", "operator_id": "'$NEAR_ACCOUNT'", "meta_token_contract_address": "'$META_CONTRACT_ADDRESS'", "meta_vote_contract_address": "'$METAVOTE_CONTRACT_ADDRESS'", "voting_period": 2, "min_voting_power_amount": "3000000000000000000000000", "mpip_storage_near": "300000000000000", "quorum_floor": 1000}'
mv neardev/ neardev_mpips/
MPIPS_CONTRACT_ADDRESS=$(head -n1 ./neardev_mpips/dev-account)

echo "METAVOTE_CONTRACT_ADDRESS="$METAVOTE_CONTRACT_ADDRESS
echo "META_CONTRACT_ADDRESS="$META_CONTRACT_ADDRESS
echo "MPIPS_CONTRACT_ADDRESS="$MPIPS_CONTRACT_ADDRESS

VOTER_ID="metavote_voter.testnet"

echo "------------------ Registering accounts"
NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS register_account '{"account_id": "'$VOTER_ID'"}' --accountId $VOTER_ID
NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS register_account '{"account_id": "'$METAVOTE_CONTRACT_ADDRESS'"}' --accountId $METAVOTE_CONTRACT_ADDRESS

echo "------------------ Sending META token to the voter"
NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer '{"receiver_id": "'$VOTER_ID'", "amount": "'15$YOCTO_UNITS'"}' --accountId $NEAR_ACCOUNT --depositYocto 1 --gas $TOTAL_PREPAID_GAS

echo "------------------ Checking META stNear balance"
NEAR_ENV=testnet near view $META_CONTRACT_ADDRESS ft_balance_of '{"account_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

# # Generating 3 locking positions: 0, 1, 2 days
# NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'5$YOCTO_UNITS'", "msg": "0"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

# NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'5$YOCTO_UNITS'", "msg": "1"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

# NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'2$YOCTO_UNITS'", "msg": "2"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'3$YOCTO_UNITS'", "msg": "2"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

echo "--------------- get_available_voting_power"
NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_available_voting_power '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

echo "--------------- Creating a new proposal"
NEAR_ENV=testnet near call $MPIPS_CONTRACT_ADDRESS create_proposal '{"title": "title1", "short_description": "short_description1", "body": "body1", "data": "data1", "extra": "extra1"}' --accountId $VOTER_ID --depositYocto $TOTAL_PREPAID_GAS --gas $TOTAL_PREPAID_GAS

