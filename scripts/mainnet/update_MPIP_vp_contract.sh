#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

set -ex
NEAR_ENV=mainnet near call $MPIP_CONTRACT_ADDRESS update_meta_vote_contract_address \
'{"new_meta_vote_contract_address":"'$METAVOTE_CONTRACT_ADDRESS'"}' \
--accountId $OWNER_ID
