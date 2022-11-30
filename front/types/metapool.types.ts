export type U128String = string;

export type MetapoolAccountInfo = {
  account_id: string;
  available: string;
  can_withdraw: boolean;
  meta: string;
  nslp_share_bp: number;
  nslp_share_value: string;
  nslp_shares: string;
  realized_meta: string;
  st_near: string;
  total: string;
  trip_accum_stakes: string;
  trip_accum_unstakes: string;
  trip_rewards: string;
  trip_start: string;
  trip_start_stnear: string;
  unstake_full_epochs_wait_left: number;
  unstaked: string;
  unstaked_requested_unlock_epoch: string;
  valued_st_near: string;
};

export type MetapoolContractState = {
  env_epoch_height: string;
  contract_account_balance: string;
  total_available: string;
  total_for_staking: string;
  total_actually_staked: string;
  epoch_stake_orders: string;
  epoch_unstake_orders: string;
  total_unstaked_and_waiting: string;
  total_stake_shares: string;
  st_near_price: string;
  total_unstake_claims: string;
  reserve_for_unstake_claims: string;
  total_meta: string;
  accumulated_staked_rewards: string;
  nslp_liquidity: string;
  nslp_target: string;
  nslp_stnear_balance: string;
  nslp_share_price: string;
  nslp_total_shares: string;
  nslp_current_discount_basis_points: number;
  nslp_min_discount_basis_points: number;
  nslp_max_discount_basis_points: number;
  accounts_count: string;
  staking_pools_count: number;
  min_deposit_amount: string;
  est_meta_rewards_stakers: string;
  est_meta_rewards_lp: string;
  est_meta_rewards_lu: string;
  max_meta_rewards_stakers: string;
  max_meta_rewards_lp: string;
  max_meta_rewards_lu: string;
};

export type LiquidUnstakeResult = {
  near: U128String;
  fee: U128String;
  meta: U128String;
};
