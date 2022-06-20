CONTRACT_NAME="metavote.testnet"
ACCOUNT_ID="test123512.testnet"
AMOUNT="10"
MESSAGE="30"

NEAR_ENV=testnet near call $CONTRACT_NAME ft_transfer_call '{"receiver_id": "'${ACCOUNT_ID}'", "amount": "'$AMOUNT'", "msg": "'$MESSAGE'" }' --accountId $ACCOUNT_ID


# near call metavote.testnet ft_transfer_call '{"receiver_id": "test123512.testnet", "amount": "10", "msg": "30" }' --accountId test123512.testnet
