METAVOTE_CONTRACT_ADDRESS="metavote.testnet"
#NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_voters '{"from_index":0,"limit":10}'
NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_total_migrated_meta
NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_used_voting_power '{"voter_id":"vhieu.testnet"}'

