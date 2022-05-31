use crate::*;

#[inline]
pub fn get_current_epoch_millis() -> EpochMillis {
    env::block_timestamp() / 1_000_000
}

#[inline]
pub fn days_to_millis(days: Days) -> u64 {
    (days as u64) * 24 * 60 * 60 * 1_000
}

#[inline]
pub fn millis_to_days(millis: u64) -> Days {
    (millis / (24 * 60 * 60 * 1_000)) as Days
}

#[inline]
/// returns amount * numerator/denominator
pub fn proportional(amount: u128, numerator: u128, denominator: u128) -> u128 {
    (U256::from(amount) * U256::from(numerator) / U256::from(denominator)).as_u128()
}