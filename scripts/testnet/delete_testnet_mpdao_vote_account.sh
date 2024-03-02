__dir=$(dirname "$0")
. $__dir/testnet-set-vars.sh

# delete the contract account in testnet
# use an rpc allowing large state view
set -ex
near --nodeUrl https://endpoints.omniatech.io/v1/near/testnet/public \
    delete $METAVOTE_CONTRACT_ADDRESS meta-pool-dao.testnet

