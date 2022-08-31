use crate::*;
use crate::utils::proportional;
use near_sdk::json_types::U128;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct LockingPosition {
    pub amount: Meta,
    pub locking_period: Days,
    pub voting_power: VotingPower,
    pub unlocking_started_at: Option<EpochMillis>,
}

impl LockingPosition {
    pub(crate) fn locking_period_millis(&self) -> u64 {
        days_to_millis(self.locking_period)
    }

    pub(crate) fn new(amount: Meta, locking_period: Days, voting_power: VotingPower) -> Self {
        LockingPosition {
            amount,
            locking_period,
            voting_power,
            unlocking_started_at: None,
        }
    }

    pub(crate) fn is_locked(&self) -> bool {
        self.unlocking_started_at.is_none()
    }

    pub(crate) fn is_unlocking(&self) -> bool {
        match self.unlocking_started_at {
            Some(date) => {
                get_current_epoch_millis() <= (date + self.locking_period_millis())
            },
            None => false,
        }
    }

    pub(crate) fn is_unlocked(&self) -> bool {
        match self.unlocking_started_at {
            Some(date) => {
                get_current_epoch_millis() > (date + self.locking_period_millis())
            },
            None => false,
        }
    }

    pub(crate) fn to_json(&self, index: Option<PositionIndex>) -> LockingPositionJSON {
        LockingPositionJSON {
            index,
            amount: U128::from(self.amount),
            locking_period: self.locking_period,
            voting_power: U128::from(self.voting_power),
            unlocking_started_at: self.unlocking_started_at,
            is_unlocked: self.is_unlocked(),
            is_unlocking: self.is_unlocking(),
            is_locked: self.is_locked(),
        }
    }
}

#[near_bindgen]
impl MetaVoteContract {
    /// Voting power is given by f(x) = A + Bx. Where A=1, B=4 and x is the locking period proportion.
    pub(crate) fn calculate_voting_power(&self, amount: Meta, locking_period: Days) -> VotingPower {
        let multiplier = YOCTO_UNITS + proportional(
            4 * YOCTO_UNITS,
            (locking_period - self.min_locking_period) as u128,
            (self.max_locking_period - self.min_locking_period) as u128
        );
        proportional(amount, multiplier, YOCTO_UNITS)
    }

    fn increase_locking_position(
        &self,
        voter: &mut Voter,
        index: u64,
        amount: Meta,
        locking_period: Days
    ) {
        let voting_power = self.calculate_voting_power(amount, locking_period);
        let mut current_position = voter.get_position(index);
        current_position.amount += amount;
        current_position.voting_power += voting_power;

        voter.locking_positions.replace(index, &current_position);
        voter.voting_power += voting_power;
    }

    fn create_locking_position(
        &self,
        voter: &mut Voter,
        amount: Meta,
        locking_period: Days
    ) {
        assert!(
            (voter.locking_positions.len() as u8) < self.max_locking_positions,
            "The max number of locking positions is {}",
            self.max_locking_positions
        );
        let voting_power = self.calculate_voting_power(amount, locking_period);
        let locking_position = LockingPosition::new(
            amount,
            locking_period,
            voting_power
        );
        voter.locking_positions.push(&locking_position);
        voter.voting_power += voting_power;
    }

    pub(crate) fn deposit_locking_position(
        &mut self,
        amount: Meta,
        locking_period: Days,
        voter_id: VoterId,
        voter: &mut Voter
    ) {
        assert!(
            locking_period <= self.max_locking_period
                && locking_period >= self.min_locking_period,
            "Locking period must be between {} and {} days",
            self.min_locking_period, self.max_locking_period 
        );

        match voter.find_locked_position(locking_period) {
            Some(index) => {
                // Deposit into existing locking position.
                self.increase_locking_position(voter, index, amount, locking_period);
            },
            None => {
                self.create_locking_position(voter, amount, locking_period);
            }
        };
        self.voters.insert(&voter_id, &voter);
    }

    pub(crate) fn create_unlocking_position(
        &mut self,
        voter: &mut Voter,
        amount: Meta,
        locking_period: Days,
        voting_power: VotingPower
    ) {
        // TODO: you can split this function into increase and create unlocking position
        // to avoid multiple unlocking positions. Or not, be careful with the rounding
        // in the days.
        assert!(
            (voter.locking_positions.len() as u8) < self.max_locking_positions,
            "The max number of locking positions is {}",
            self.max_locking_positions
        );
        let mut unlocking_position = LockingPosition::new(
            amount,
            locking_period,
            voting_power
        );
        unlocking_position.unlocking_started_at = Some(get_current_epoch_millis());
        voter.locking_positions.push(&unlocking_position);
    }
}
