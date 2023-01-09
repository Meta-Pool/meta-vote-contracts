use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use super::*;
use near_sdk::{testing_env, VMContext};
use near_sdk::json_types::U128;
mod utils;
use utils::*;

fn new_contract() -> MetaVoteContract {
    MetaVoteContract::new(
        owner_account(),
        MIN_LOCKING_PERIOD,
        MAX_LOCKING_PERIOD,
        U128::from(MIN_DEPOSIT_AMOUNT),
        MAX_LOCKING_POSITIONS,
        MAX_VOTING_POSITIONS,
        meta_token_account(),
    )
}

fn get_contract_setup(context: VMContext) -> MetaVoteContract {
    testing_env!(context.clone());
    let contract = new_contract();
    contract
}

#[test]
fn test_single_deposit() {
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();

    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());
    assert_eq!(1, contract.voters.len(), "Voter was not created!");

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

    let vote_power = contract.calculate_voting_power(
        Meta::from(amount),
        msg.parse::<Days>().unwrap()
    );
    assert_eq!(vote_power, voter.voting_power, "Incorrect voting power calculation!");

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 1);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 1);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 0);
}

#[test]
fn test_multiple_deposit_same_locking_period() {
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();

    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    let new_amount = U128::from(5 * YOCTO_UNITS);
    contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), msg.clone());

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

    let total_vote_power = contract.calculate_voting_power(
        Meta::from(amount.clone()),
        msg.parse::<Days>().unwrap()
    ) + contract.calculate_voting_power(
        Meta::from(new_amount.clone()),
        msg.parse::<Days>().unwrap()
    );

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    testing_env!(context.clone());
    assert_eq!(
        U128::from(total_vote_power),
        contract.get_available_voting_power(sender_id.clone()),
        "Incorrect voting power calculation!"
    );

    let locked_balance = u128::from(amount) + u128::from(new_amount);
    assert_eq!(
        U128::from(locked_balance),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance sum!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_balance(sender_id.clone()),
        "Incorrect balance!"
    );

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 1);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 1);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 0);
}

#[test]
fn test_multiple_deposit_diff_locking_period() {
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();

    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    let new_amount = U128::from(5 * YOCTO_UNITS);
    let new_msg: String = "200".to_owned();
    contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), new_msg.clone());

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(2, voter.locking_positions.len(), "Locking position was not created!");

    let total_vote_power = contract.calculate_voting_power(
        Meta::from(amount),
        msg.parse::<Days>().unwrap()
    ) + contract.calculate_voting_power(
        Meta::from(new_amount),
        new_msg.parse::<Days>().unwrap()
    );

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    testing_env!(context.clone());
    assert_eq!(
        U128::from(total_vote_power),
        contract.get_available_voting_power(sender_id.clone()),
        "Incorrect voting power calculation!"
    );

    let locked_balance = u128::from(amount) + u128::from(new_amount);
    assert_eq!(
        U128::from(locked_balance),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance sum!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_balance(sender_id.clone()),
        "Incorrect balance!"
    );

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 1);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 2);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 0);
}

#[test]
fn test_unlock_position() {
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();

    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    testing_env!(context.clone());

    assert_eq!(
        amount,
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );

    let voter = contract.internal_get_voter(&sender_id);
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    contract.unlock_position(index);
    assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

    let unlocking_started_at = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .unlocking_started_at;
    assert!(unlocking_started_at.is_some(), "Position is not unlocked!");
    assert_eq!(
        U128::from(0),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        amount,
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.voting_power, 0, "Voting power was not removed!");
}

#[test]
fn test_unlock_partial_position() {
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();
    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    let new_amount = U128::from(5 * YOCTO_UNITS);
    let new_msg: String = "200".to_owned();
    contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), new_msg.clone());

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        to_ts(GENESIS_TIME_IN_DAYS)
    );
    testing_env!(context.clone());

    let total_amount = U128::from(u128::from(amount) + u128::from(new_amount));
    assert_eq!(
        total_amount,
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );

    // Partially removing the last (second) locking position.
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).last()
        .unwrap()
        .index
        .unwrap();
    let third_amount = U128::from(4 * YOCTO_UNITS);
    contract.unlock_partial_position(index, third_amount);
    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(3, voter.locking_positions.len(), "Locking position was not created!");

    let unlocking_started_at = contract.get_all_locking_positions(
            sender_id.clone()
        ).last()
        .unwrap()
        .unlocking_started_at;
    assert!(unlocking_started_at.is_some(), "Position is not unlocked!");
    let locked_amount = U128::from(
        u128::from(amount) + u128::from(new_amount) - u128::from(third_amount)
    );
    assert_eq!(
        locked_amount,
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        third_amount,
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );

    let voter = contract.internal_get_voter(&sender_id);
    let total_vote_power = contract.calculate_voting_power(
        Meta::from(amount),
        msg.parse::<Days>().unwrap()
    ) + contract.calculate_voting_power(
        Meta::from(new_amount) - Meta::from(third_amount),
        new_msg.parse::<Days>().unwrap()
    );
    assert_eq!(voter.voting_power, total_vote_power, "Voting power was not removed!");
}

fn generate_relock_position_context() -> MetaVoteContract {
    const LOCKING_PERIOD: u64 = 100;
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
    let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);
    let timestamp_2 = to_ts(GENESIS_TIME_IN_DAYS + 5 + LOCKING_PERIOD);
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(10 * YOCTO_UNITS);
    let msg: String = LOCKING_PERIOD.to_string();
    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_1
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    contract.unlock_position(index);
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(
        locking_position.unlocking_started_at.unwrap(),
        nanos_to_millis(timestamp_1),
        "Incorrect unlocking started at date."
    );
    assert_eq!(
        locking_position.unlocking_started_at.unwrap()
            + locking_position.locking_period_millis(),
        nanos_to_millis(timestamp_2),
        "Incorrect unlocking finish date."
    );
    assert_eq!(
        U128::from(0),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        amount,
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );
    contract
}

#[test]
#[should_panic(expected="The new locking period should be greater than 88 days.")]
fn test_relock_position_1() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 12);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    contract.relock_position(0, 30, U128::from(0));
}

#[test]
fn test_relock_position_2() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 12);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

    let amount = locking_position.amount;
    let locking_period: Days = 89;
    contract.relock_position(0, locking_period, U128::from(0));

    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(
        voter.voting_power,
        contract.calculate_voting_power(amount, locking_period),
        "Voting power of Voter is incorrect.");
    assert_eq!(
        U128::from(locking_position.amount),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );
    assert!(
        locking_position.unlocking_started_at.is_none(),
        "Unlocking started should be None."
    );
}

#[test]
fn test_relock_position_3() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 177);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

    let amount = locking_position.amount;
    let locking_period: Days = 30;
    contract.relock_position(0, locking_period, U128::from(0));

    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(
        voter.voting_power,
        contract.calculate_voting_power(amount, locking_period),
        "Voting power of Voter is incorrect.");
    assert_eq!(
        U128::from(locking_position.amount),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );
    assert!(
        locking_position.unlocking_started_at.is_none(),
        "Unlocking started should be None."
    );
}

#[test]
#[should_panic(expected="The new locking period should be greater than 77 days.")]
fn test_relock_partial_position_1() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 23);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    contract.relock_partial_position(
        index,
        U128::from(
            locking_position.amount - 2 * YOCTO_UNITS
        ),
        30,
        U128::from(0)
    );
}

#[test]
fn test_relock_partial_position_2() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 23);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

    let keep_amount = 2 * YOCTO_UNITS;
    let relock_amount = locking_position.amount - keep_amount;
    let locking_period: Days = 89;
    contract.relock_partial_position(
        index,
        U128::from(relock_amount),
        locking_period,
        U128::from(0)
    );

    // The Unlocking is index 0, and the Relocked is index 1.
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).last()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.locking_positions.len(), 2, "Incorrect locking position.");
    assert_eq!(
        voter.voting_power,
        contract.calculate_voting_power(relock_amount, locking_period),
        "Voting power of Voter is incorrect."
    );
    assert_eq!(
        U128::from(relock_amount),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(keep_amount),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );
    assert!(
        locking_position.unlocking_started_at.is_none(),
        "Unlocking started should be None."
    );
}

#[test]
fn test_relock_partial_position_3() {
    let mut contract = generate_relock_position_context();
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 177);
    let sender_id: AccountId = voter_account();

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

    let keep_amount = 2 * YOCTO_UNITS;
    let relock_amount = locking_position.amount - keep_amount;
    let locking_period: Days = 30;
    contract.relock_partial_position(
        index,
        U128::from(relock_amount),
        locking_period,
        U128::from(0)
    );

    // The Unlocking is index 0, and the Relocked is ALSO index 0.
    let voter = contract.internal_get_voter(&sender_id);
    let locking_position = voter.locking_positions.get(index).unwrap();
    assert_eq!(voter.locking_positions.len(), 1, "Incorrect locking position.");
    assert_eq!(
        voter.voting_power,
        contract.calculate_voting_power(relock_amount, locking_period),
        "Voting power of Voter is incorrect."
    );
    assert_eq!(
        voter.balance,
        keep_amount,
        "Voter balance is incorrect."
    );
    assert_eq!(
        U128::from(keep_amount),
        contract.get_balance(sender_id.clone()),
        "Incorrect free balance!"
    );
    assert_eq!(
        U128::from(relock_amount),
        contract.get_locked_balance(sender_id.clone()),
        "Incorrect locked balance!"
    );
    assert_eq!(
        U128::from(0),
        contract.get_unlocking_balance(sender_id.clone()),
        "Incorrect unlocking balance!"
    );
    assert!(
        locking_position.unlocking_started_at.is_none(),
        "Unlocking started should be None."
    );

    contract.unlock_position(index);
    let locking_period: Days = 38;
    let keep_amount_1 = keep_amount - (1 * YOCTO_UNITS);
    let keep_amount_2 = keep_amount - keep_amount_1;
    contract.relock_position(
        index,
        locking_period,
        U128::from(keep_amount_1)
    );

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.balance, keep_amount_2, "Incorrect voter balance.");
    assert_eq!(
        voter.voting_power,
        contract.calculate_voting_power(relock_amount + keep_amount_1, locking_period),
        "Voting power of Voter is incorrect."
    );

    // Relock from balance
    let locking_period: Days = 278;
    contract.relock_from_balance(locking_period, U128::from(keep_amount_2));
    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.balance, 0, "Incorrect voter balance.");
    assert_eq!(voter.locking_positions.len(), 2, "Incorrect number of Locking Positions.");
}

#[test]
fn test_clear_locking_position() {
    const LOCKING_PERIOD: u64 = 100;
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
    let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);
    let timestamp_2 = to_ts(GENESIS_TIME_IN_DAYS + 5 + LOCKING_PERIOD);
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(2 * YOCTO_UNITS);
    let msg: String = "30".to_owned();

    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    let new_amount = U128::from(5 * YOCTO_UNITS);
    let new_msg: String = "32".to_owned();
    contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), new_msg.clone());

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(2, voter.locking_positions.len(), "Locking position was not created!");

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_1
    );
    testing_env!(context.clone());

    contract.unlock_position(0);
    contract.unlock_position(1);

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_2
    );
    testing_env!(context.clone());

    let position_index_list: Vec<PositionIndex> = vec![0, 1];
    contract.clear_locking_position(position_index_list);

    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(0, voter.locking_positions.len(), "Locking position was not deleted!");
    assert_eq!(
        Meta::from(amount) + Meta::from(new_amount),
        voter.balance,
        "Incorrect balance!"
    );
    assert_eq!(
        Meta::from(amount) + Meta::from(new_amount),
        Meta::from(contract.get_balance(sender_id.clone())),
        "Incorrect balance!"
    );

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 1);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 0);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 0);
}

#[test]
#[should_panic(expected="Not enough free voting power to unlock! You have 0, required 20370370370370370370370370.")]
fn test_unlock_position_without_voting_power() {
    const LOCKING_PERIOD: u64 = 100;
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
    let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(10 * YOCTO_UNITS);
    let msg: String = LOCKING_PERIOD.to_string();
    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_1
    );
    testing_env!(context.clone());
    let index = contract.get_all_locking_positions(
            sender_id.clone()
        ).first()
        .unwrap()
        .index
        .unwrap();


    let vote = contract.calculate_voting_power(
        Meta::from(amount),
        msg.parse::<Days>().unwrap()
    );
    contract.vote(
        U128::from(vote),
        votable_account(),
        "0".to_owned()
    );
    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.voting_power, 0, "Incorrect Voting Power calculation.");
    assert_eq!(
        U128::from(vote),
        contract.get_votes_for_object(sender_id.clone(), votable_account(), "0".to_owned()),
        "Incorrect votes for votable object"
    );
    contract.unlock_position(index);
}

#[test]
fn test_rebalance_increase_and_decrease() {
    const LOCKING_PERIOD: u64 = 100;
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
    let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);
    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    let mut contract = get_contract_setup(context);

    let sender_id: AccountId = voter_account();
    let amount = U128::from(10 * YOCTO_UNITS);
    let msg: String = LOCKING_PERIOD.to_string();
    contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

    // New context: the voter is doing the call now!
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_1
    );
    testing_env!(context.clone());

    let vote = contract.calculate_voting_power(
        Meta::from(amount),
        msg.parse::<Days>().unwrap()
    );
    let contract_address = votable_account();
    let votable_object_id = "0".to_owned();

    contract.vote(
        U128::from(vote),
        contract_address.clone(),
        votable_object_id.clone() 
    );

    // Decrease votes.
    let delta_1 = 5 * YOCTO_UNITS;
    let decreased_votes = U128::from(vote - delta_1);
    contract.rebalance(
        decreased_votes,
        contract_address.clone(),
        votable_object_id.clone()
    );
    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.voting_power, delta_1, "Incorrect Voting Power calculation.");

    let votes_for_address = voter.get_votes_for_address(&sender_id, &contract_address);
    let votes = votes_for_address.get(&votable_object_id).unwrap();

    // Increase votes.
    let delta_2 = 1 * YOCTO_UNITS;
    let additional_votes = U128::from(votes + delta_2);
    contract.rebalance(
        additional_votes,
        contract_address.clone(),
        votable_object_id.clone()
    );
    let voter = contract.internal_get_voter(&sender_id);
    assert_eq!(voter.voting_power, delta_1 - delta_2, "Incorrect Voting Power calculation.");

    let votes_for_address = voter.get_votes_for_address(&sender_id, &contract_address);
    let votes = votes_for_address.get(&votable_object_id).unwrap();
    assert_eq!(votes, u128::from(additional_votes), "Incorrect Voting Power calculation.");

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 1);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 1);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 1);
}

#[test]
fn test_multi_voter_contract() {
    struct User {
        id: String,
        votes: VotingPower,
        locking_period: Days,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId
    }
    let users = vec![
        User{id: "1".to_owned(), votes: 10 * YOCTO_UNITS, locking_period: 30,
                contract_address: multi_voter_account("v1.near".to_owned()),
                votable_object_id: "1".to_string()},
        User{id: "2".to_owned(), votes: 1 * YOCTO_UNITS, locking_period: 45,
                contract_address: multi_voter_account("v1.near".to_owned()),
                votable_object_id: "1".to_string()},
        User{id: "3".to_owned(), votes: 24 * YOCTO_UNITS, locking_period: 200,
                contract_address: multi_voter_account("v1.near".to_owned()),
                votable_object_id: "2".to_string()},
        User{id: "4".to_owned(), votes: 8 * YOCTO_UNITS, locking_period: 300,
                contract_address: multi_voter_account("v2.near".to_owned()),
                votable_object_id: "1".to_string()},
    ];

    let mut votes_1_1 = 0_u128;
    let mut votes_1_2 = 0_u128;
    let mut votes_2_1 = 0_u128;
    let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
    let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);

    let context = get_context(
        meta_token_account(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_0
    );
    let mut contract = get_contract_setup(context);

    for user in users.iter() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0
        );
        testing_env!(context.clone());

        let sender_id: AccountId = multi_voter_account(user.id.clone());
        let amount = U128::from(user.votes);
        let msg: String = user.locking_period.to_string();
        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_1
        );
        testing_env!(context.clone());

        let voting_power = contract.calculate_voting_power(
            u128::from(amount),
            user.locking_period.clone()
        );
        assert_eq!(
            u128::from(contract.get_available_voting_power(sender_id.clone())),
            voting_power,
            "Incorrect voting power for user."
        );
        let votes_to_use = user.votes;
        let remaining = voting_power - votes_to_use;
        contract.vote(
            U128::from(votes_to_use),
            user.contract_address.clone(),
            user.votable_object_id.clone()
        );

        if user.id.clone() == "1".to_string() || user.id.clone() == "2".to_string() {
            votes_1_1 += votes_to_use;
        } else if user.id.clone() == "3".to_string() {
            votes_1_2 += votes_to_use;
        } else if user.id.clone() == "4".to_string() {
            votes_2_1 += votes_to_use;
        }

        assert_eq!(
            U128::from(votes_to_use),
            contract.get_used_voting_power(sender_id.clone()),
            "Incorrect used voting power."
        );
        assert_eq!(
            U128::from(remaining),
            contract.get_available_voting_power(sender_id.clone()),
            "Incorrect remaining voting power."
        );
    }

    // Unvote and vote again to test contract total voting consistency.
    let user = users.get(3).unwrap();
    let sender_id: AccountId = multi_voter_account(user.id.clone());
    let context = get_context(
        sender_id.clone(),
        ntoy(TEST_INITIAL_BALANCE),
        0,
        timestamp_1
    );
    testing_env!(context.clone());
    contract.unvote(
        user.contract_address.clone(),
        user.votable_object_id.clone()
    );
    contract.vote(
        U128::from(user.votes.clone()),
        user.contract_address.clone(),
        user.votable_object_id.clone()
    );

    assert_eq!(
        contract.get_total_votes(multi_voter_account("v1.near".to_owned()), "1".to_string()),
        U128::from(votes_1_1),
        "Incorrect vote count for project 1, object 1."
    );
    assert_eq!(
        contract.get_total_votes(multi_voter_account("v1.near".to_owned()), "2".to_string()),
        U128::from(votes_1_2),
        "Incorrect vote count for project 1, object 2."
    );
    assert_eq!(
        contract.get_total_votes(multi_voter_account("v2.near".to_owned()), "1".to_string()),
        U128::from(votes_2_1),
        "Incorrect vote count for project 2, object 1."
    );

    let voters = contract.get_voters(0, 10);
    assert_eq!(voters.len(), 4);
    let locking_position = &voters.first().unwrap().locking_positions;
    assert_eq!(locking_position.len(), 1);
    let vote_position = &voters.first().unwrap().vote_positions;
    assert_eq!(vote_position.len(), 1);
}
