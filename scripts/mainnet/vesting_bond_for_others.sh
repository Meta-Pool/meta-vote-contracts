#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

if [ $# -ne 3 ]; then
  echo "Error: Please provide exactly 3 arguments."
  echo "voter_id, mpDAO-amount bonding-days"
  exit 1
fi
echo VESTING for $1 $2 mpDAO for $3 days
near call $MPDAO_TOKEN_ADDRESS ft_transfer_call \
      '{"receiver_id":"'$METAVOTE_CONTRACT_ADDRESS'","amount":"'$2$MPDAO_DECIMALS'","msg":"[\"'$1'\",'$3']"}' \
      --accountId $OWNER_ID --depositYocto 1 --gas 150000000000000
near view $METAVOTE_CONTRACT_ADDRESS get_voter_info '{"voter_id":"'$1'"}'
