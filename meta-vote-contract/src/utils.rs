use crate::*;

#[inline]
pub fn get_current_epoch_millis() -> EpochMillis {
    return env::block_timestamp() / 1_000_000;
}

#[inline]
/// returns amount * numerator/denominator
pub fn proportional(amount: u128, numerator: u128, denominator: u128) -> u128 {
    return (U256::from(amount) * U256::from(numerator) / U256::from(denominator)).as_u128();
}