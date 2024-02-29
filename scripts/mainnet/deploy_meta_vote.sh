#!/bin/bash
set -e
export NEAR_ENV="mainnet"

METAVOTE_CONTRACT_ADDRESS="mpdao-vote.near"
METAVOTE_OWNER="meta-pool-dao.near"
METAVOTE_WASM="res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 
near view meta-vote.near get_owner_id

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# 1st Deploy Contract & init
OWNER_ID=$METAVOTE_CONTRACT_ADDRESS
MPDAO_TESTNET_TOKEN_ADDRESS="mpdao-token.near"
STNEAR_TESTNET_TOKEN_ADDRESS="meta-pool.near"
        # owner_id: AccountId,
        # min_unbound_period: Days,
        # max_unbound_period: Days,
        # min_deposit_amount: U128String,
        # max_locking_positions: u8,
        # max_voting_positions: u8,
        # mpdao_token_contract_address: ContractAddress,
        # stnear_token_contract_address: ContractAddress,
        # registration_cost: U128String,
ARGS='{"owner_id":"'$OWNER_ID'","min_unbound_period":30,"max_unbound_period":300,"min_deposit_amount":"10000000",'
ARGS=$ARGS'"max_locking_positions":16,"max_voting_positions":16,'
ARGS=$ARGS'"mpdao_token_contract_address":"'$MPDAO_TESTNET_TOKEN_ADDRESS'","stnear_token_contract_address":"'$STNEAR_TESTNET_TOKEN_ADDRESS'",'
ARGS=$ARGS'"registration_cost":"100000000000000000000000"}'
echo $METAVOTE_CONTRACT_ADDRESS
echo $ARGS
##{"owner_id":"mpdao-vote.testnet","min_unbound_period":1,"max_unbound_period":300,"min_deposit_amount":"1000000","max_locking_positions":32, "max_voting_positions":32,"mpdao_token_contract_address": "mpdao-token.testnet","stnear_token_contract_address":"meta-v2.pool.testnet","registration_cost":"100000"}
NEAR_ENV=testnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM  \
    --initFunction new --initArgs $ARGS
# Redeploy Contract
# echo Re-DEPLOY ONLY
# NEAR_ENV=testnet near deploy --wasmFile $METAVOTE_WASM --accountId $METAVOTE_CONTRACT_ADDRESS

# Deploy with MIGRATION
#echo DEPLOY AND MIGRATION
#near deploy metavote.testnet --wasmFile $METAVOTE_WASM --initFunction migrate --initArgs {}
