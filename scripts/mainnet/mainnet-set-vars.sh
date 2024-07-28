#!/bin/bash
set -e
export NEAR_ENV="mainnet"

BASE_METAVOTE_ADDRESS="mpdao-vote.near"
METAVOTE_CONTRACT_ADDRESS=$BASE_METAVOTE_ADDRESS
METAVOTE_WASM="res/meta_vote_contract.wasm"
OLD_METAVOTE_CONTRACT="meta-vote.near"
OWNER_ID="meta-pool-dao.near"
OPERATOR_ID="operator.$METAVOTE_CONTRACT_ADDRESS"
MPDAO_TOKEN_ADDRESS="mpdao-token.near"
STNEAR_TOKEN_ADDRESS="meta-pool.near"

MPIP_CONTRACT_ADDRESS="mpip.meta-pool-dao.near"
MPIP_WASM="res/mpip_contract.wasm"

echo $NEAR_ENV $(date) 

MPDAO_DECIMALS="000000" 
YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"

# args to init meta-vote contract
        # owner_id: AccountId,
        # min_unbond_period: Days,
        # max_unbond_period: Days,
        # min_deposit_amount: U128String,
        # max_locking_positions: u8,
        # max_voting_positions: u8,
        # mpdao_token_contract_address: ContractAddress,
        # stnear_token_contract_address: ContractAddress,
        # registration_cost: U128String,
ARGS_INIT_META_VOTE=$(cat <<EOA
{
"owner_id":"$OWNER_ID","operator_id":"$OPERATOR_ID",
"min_unbond_period":30, "max_unbond_period":300, "min_deposit_amount":"1000000",
"max_locking_positions": 32, "max_voting_positions": 32,
"mpdao_token_contract_address":"$MPDAO_TOKEN_ADDRESS","stnear_token_contract_address":"$STNEAR_TOKEN_ADDRESS",
"prev_governance_contract":"$OLD_METAVOTE_CONTRACT",
"registration_cost":"100000"
}
EOA
)

KV_STORE_CONTRACT_ADDRESS="kv-store.near"
KV_STORE_WASM=target/wasm32-unknown-unknown/release/kv_store_contract.wasm
