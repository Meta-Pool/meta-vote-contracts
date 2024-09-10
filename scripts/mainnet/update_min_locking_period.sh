if ! ([ $# -eq 1 ] && [[ $1 =~ ^[0-9]+$ ]] && [ $1 -ge 60 ] && [ $1 -le 270 ];) then 
  echo "a single argument in the range 60..270 is needed"
  exit 1
fi

METAVOTE_CONTRACT_ADDRESS="meta-vote.near"
METAVOTE_OWNER="meta-pool-dao.near"
NEAR_ENV=mainnet near \
    call $METAVOTE_CONTRACT_ADDRESS \
    update_min_locking_period '{"new_period":'$1'}' \
    --accountId $METAVOTE_OWNER