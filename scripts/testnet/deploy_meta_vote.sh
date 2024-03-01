#!/bin/bash
set -e
export NEAR_ENV="testnet"

METAVOTE_CONTRACT_ADDRESS=mpdao-vote.testnet
METAVOTE_WASM="res/meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# 1st Deploy Contract & init
OWNER_ID=$METAVOTE_CONTRACT_ADDRESS
MPDAO_TESTNET_TOKEN_ADDRESS="mpdao-token.testnet"
STNEAR_TESTNET_TOKEN_ADDRESS="meta-v2.pool.testnet"
        # owner_id: AccountId,
        # min_unbound_period: Days,
        # max_unbound_period: Days,
        # min_deposit_amount: U128String,
        # max_locking_positions: u8,
        # max_voting_positions: u8,
        # mpdao_token_contract_address: ContractAddress,
        # stnear_token_contract_address: ContractAddress,
        # registration_cost: U128String,
ARGS='{"owner_id":"'$OWNER_ID'","min_unbound_period":1,"max_unbound_period":300,"min_deposit_amount":"1000000",'
ARGS=$ARGS'"max_locking_positions":32,"max_voting_positions":32,'
ARGS=$ARGS'"mpdao_token_contract_address":"'$MPDAO_TESTNET_TOKEN_ADDRESS'","stnear_token_contract_address":"'$STNEAR_TESTNET_TOKEN_ADDRESS'",'
ARGS=$ARGS'"registration_cost":"100000"}'
#NEAR_ENV=testnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM  \
#    --initFunction new --initArgs $ARGS
# Redeploy Contract
echo Re-DEPLOY ONLY
NEAR_ENV=testnet near deploy $METAVOTE_CONTRACT_ADDRESS $METAVOTE_WASM

# Deploy with MIGRATION
#echo DEPLOY AND MIGRATION
#near deploy metavote.testnet --wasmFile $METAVOTE_WASM --initFunction migrate --initArgs {}
