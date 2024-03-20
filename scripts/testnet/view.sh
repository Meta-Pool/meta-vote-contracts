#!/bin/bash
__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh


# call view function
# VOTER_ID_1="0xf06B9633c6a6b255C80B4900f693797F43393ea3.evmp.near"
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voter_info '{"voter_id":"'$VOTER_ID_1'"}'
# VOTER_ID_2="0x0B438De1DCa9FBa6D14F17c1F0969ECc73C8186F.evmp.near"
# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voter_info '{"voter_id":"'$VOTER_ID_2'"}'

# NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voters '{"from_index":0,"limit":10}'

NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_dele '{"from_index":0,"limit":10}'

