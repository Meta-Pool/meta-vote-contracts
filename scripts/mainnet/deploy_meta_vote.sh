#!/bin/bash
set -e
NETWORK=mainnet
export NEAR_ENV=$NETWORK

METAVOTE_CONTRACT_ADDRESS="mpdao-vote.near"
METAVOTE_OWNER="meta-pool-dao.near"
METAVOTE_WASM="meta_vote_contract.wasm"

echo $NEAR_ENV $METAVOTE_CONTRACT_ADDRESS $(date) 
near view meta-vote.near get_owner_id

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# 1st Deploy Contract & init
OWNER_ID=$METAVOTE_CONTRACT_ADDRESS
MPDAO_TOKEN_ADDRESS="mpdao-token.near"
STNEAR_TOKEN_ADDRESS="meta-pool.near"
        # owner_id: AccountId,
        # min_unbond_period: Days,
        # max_unbond_period: Days,
        # min_deposit_amount: U128String,
        # max_locking_positions: u8,
        # max_voting_positions: u8,
        # mpdao_token_contract_address: ContractAddress,
        # stnear_token_contract_address: ContractAddress,
        # registration_cost: U128String,
ARGS='{"owner_id":"'$OWNER_ID'","min_unbond_period":30,"max_unbond_period":300,"min_deposit_amount":"10000000",'
ARGS=$ARGS'"operator_id":16,"max_voting_positions":16,'
ARGS=$ARGS'"max_locking_positions":16,"max_voting_positions":16,'
ARGS=$ARGS'"mpdao_token_contract_address":"'$MPDAO_TOKEN_ADDRESS'","stnear_token_contract_address":"'$STNEAR_TOKEN_ADDRESS'",'
ARGS=$ARGS'"registration_cost":"100000000000000000000000"}'
echo $METAVOTE_CONTRACT_ADDRESS
echo $ARGS
NEAR_ENV=$NETWORK near deploy $METAVOTE_CONTRACT_ADDRESS res/$METAVOTE_WASM  \
    --initFunction new --initArgs $ARGS

# backup deployed wasm
mkdir -p res/$NETWORK
cp res/$METAVOTE_WASM res/$NETWORK/$METAVOTE_WASM.`date +%F.%T`
date +%F.%T
