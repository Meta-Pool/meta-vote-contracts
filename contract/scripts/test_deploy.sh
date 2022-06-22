
NEAR_ENV=testnet near deploy -f --wasmFile res/meta_vote_contract.wasm --accountId metavote.testnet
NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId metavote.testnet
NEAR_ENV=testnet near call metavote.testnet update_min_locking_period '{"new_period": 1}' --accountId metavote.testnet


NEAR_ENV=testnet near view $CONTRACT_NAME get_project_details '{"kickstarter_id": 0}' --accountId $SUPPORTER_ID