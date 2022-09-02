
# pub fn new(
#     owner_id: AccountId,
#     min_locking_period: Days,
#     max_locking_period: Days,
#     min_deposit_amount: U128,
#     max_locking_positions: u8,
#     max_voting_positions: u8,
#     meta_token_contract_address: ContractAddress,
# ) -> Self

YOCTO_UNITS="000000000000000000000000"

OWNER_ID="meta-vote.near"
MIN_LOCKING_PERIOD=30
MAX_LOCKING_PERIOD=300
MIN_DEPOSIT_AMOUNT="1"$YOCTO_UNITS
MAX_LOCKING_POSITIONS=20
MAX_VOTING_POSITIONS=40
META_TOKEN_CONTRACT_ADDRESS=""


# Deploying Contract
NEAR_ENV=mainnet near deploy --wasmFile res/meta_vote_contract.wasm --initFunction new --initArgs \
'{"owner_id": "'$OWNER_ID'", \
"min_locking_period": '$MIN_LOCKING_PERIOD', \
"max_locking_period": '$MAX_LOCKING_PERIOD', \
"min_deposit_amount": "'$MIN_DEPOSIT_AMOUNT'", \
"max_locking_positions": '$MAX_LOCKING_POSITIONS', \
"max_voting_positions": '$MAX_VOTING_POSITIONS',\
"meta_token_contract_address": "'$META_CONTRACT_ADDRESS'"}'
