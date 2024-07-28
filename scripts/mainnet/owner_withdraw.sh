#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

if [ $# -ne 1 ]; then
  echo "Error: Please provide exactly 1 argument: mpDAO-amount"
  exit 1
fi

set -ex

near view $MPDAO_TOKEN_ADDRESS ft_balance_of '{"account_id":"'$METAVOTE_CONTRACT_ADDRESS'"}'

echo owner-withdraw extra $1 mpDAO from voting contract

near call $METAVOTE_CONTRACT_ADDRESS owner_withdraw_mpdao \
      '{"mpdao_amount":"'$1$MPDAO_DECIMALS'"}' \
      --accountId $OWNER_ID --depositYocto 1 --gas 150000000000000

near view $MPDAO_TOKEN_ADDRESS ft_balance_of '{"account_id":"'$METAVOTE_CONTRACT_ADDRESS'"}'
