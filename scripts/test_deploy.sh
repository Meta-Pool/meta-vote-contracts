
# NEAR_ENV=testnet near deploy -f --wasmFile res/meta_vote_contract.wasm --accountId meta-vote.testnet
NEAR_ENV=testnet near deploy -f --wasmFile res/mpip_contract.wasm --accountId v01mpips.testnet
# NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId meta-vote.testnet
# NEAR_ENV=testnet near call metavote.testnet update_min_locking_period '{"new_period": 1}' --accountId meta-vote.testnet