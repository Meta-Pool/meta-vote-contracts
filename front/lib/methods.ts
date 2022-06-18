// katherine gasless methods (view methods)
export const metavoteViewMethods = {
  getAllLockingPositions: "get_all_locking_positions",
  getLockingPosition: "get_locking_position",
  getBalance: "get_balance",
  getLockedBalance: "get_locked_balance",
  getUnlockingBalance: "get_unlocking_balance",
  getAvailableVotingPower: "get_available_voting_power",
  getUsedVotingPower: "get_used_voting_power",
  getTotalVotes: "get_total_votes",
  getVotesByAddress: "get_voting_results"

};

// katherine gas methods (change methods)
export const metavoteChangeMethods = {
  unlockPosition: "unlock_position",
  unlockPartialPosition: "unlock_partial_position",
  relockPosition: "relock_position",
  relockPartialPosition: "relock_partial_position",
  relockFromBalance: "relock_from_balance",
  clear_locking_position: "clear_locking_position",
  withdraw: "withdraw",
  vote: "vote",
  rebalance: "rebalance",
  unvote: "unvote",
  newLocking: "new"
};

export const metaPoolMethods = {
  getStNearPrice: "get_st_near_price",
  getAccountInfo: "get_account_info"
};

export const metaTokenMethods = {
  getMetas: "ft_balance_of",
  getAccountInfo: "ft_metadata"
};

export const projectTokenViewMethods = {
  storageBalanceOf: "storage_balance_of",
  metadata: "ft_metadata",
  storageBalanceBounds: "storage_balance_bounds"
}

export const projectTokenChangeMethods = {
  storageDeposit: "storage_deposit"
}
