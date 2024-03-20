#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh


# call view function
EVM_ADDRESS_1="0xf06B9633c6a6b255C80B4900f693797F43393ea3"
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voter_info '{"voter_id":"'$EVM_ADDRESS_1'.evmp.near"}'
EVM_ADDRESS_2="0x0B438De1DCa9FBa6D14F17c1F0969ECc73C8186F"
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voter_info '{"voter_id":"'$EVM_ADDRESS_2'.evmp.near"}'

DELEGATE="asimov.testnet"

# NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS \
# pre_delegate_evm_address '{"evm_address":"'$EVM_ADDRESS_2'","signature":"xx"}' \
#     --useAccount $DELEGATE --depositYocto 1 

# NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS \
# remove_delegated_evm_address '{"evm_address":"'$EVM_ADDRESS_2'.evmp.near"}' \
#     --useAccount $DELEGATE --depositYocto 1 

# NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS \
# operator_confirm_delegated_evm_address '{"evm_address":"'$EVM_ADDRESS_2'"}' \
#     --useAccount $OPERATOR_ID --depositYocto 1 

NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_delegating_evm_addresses '{"account_id":"'$DELEGATE'"}'

NEAR_ENV=testnet near call $METAVOTE_CONTRACT_ADDRESS \
    vote_delegated '{"evm_address":"'$EVM_ADDRESS_2'","voting_power":"21'$YOCTO_UNITS'","contract_address":"xx","votable_object_id":"xx"}' \
     --useAccount $DELEGATE

NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS \
    get_voter_info '{"voter_id":"'$EVM_ADDRESS_2'.evmp.near"}' \
