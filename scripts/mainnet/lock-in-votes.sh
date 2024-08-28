#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

if [ $# -ne 2 ]; then
  echo "Error: Please provide exactly 2 arguments."
  echo "Round #, timestamp_ms"
  exit 1
fi
echo Lock-in Grants Round $1 until $2
set -ex
near call $METAVOTE_CONTRACT_ADDRESS set_lock_in_vote_filters \
      '{"end_timestamp_ms":'$2',"votable_numeric_id":'$1',"votable_address":"initiatives"}' \
      --accountId $OPERATOR_ID --gas 150000000000000
