#!/bin/bash
__dir=$(dirname "$0")
. $__dir/mainnet-set-vars.sh

REQUIRED_ARGS=1
if [ $# -ne $REQUIRED_ARGS ]; then
  echo "Error: Please provide exactly $REQUIRED_ARGS arguments."
  exit 1
fi

# Call function 
echo near call ...