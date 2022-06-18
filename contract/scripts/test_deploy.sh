
NEAR_ENV=testnet near deploy -f --wasmFile res/meta_vote_contract.wasm --accountId metavote.testnet
NEAR_ENV=testnet near view metavote.testnet get_all_locking_positions '{"voter_id": "test123512.testnet"}' --accountId metavote.testnet