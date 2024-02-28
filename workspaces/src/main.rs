// use std::fs;
// use meta_tools::types::{EpochMillis, VaultId};
// use meta_tools::utils::proportional;
// use meta_tools::bond::BondLoaderJSON;
use near_units::parse_near;
// use json;
use std::str;
// use near_sdk::json_types::{U128, U64};

// use workspaces::network::Sandbox;
use near_gas::*;
use near_workspaces::{types::NearToken, Account, AccountId, Contract, DevNetwork, Worker};

// use meta_test_utils::now::Now;
// use meta_test_utils::now;

const METAVOTE_FILEPATH: &str = "../res/meta_vote_contract.wasm";
const MPIP_FILEPATH: &str = "../res/mpip_contract.wasm";
const MPDAO_TEST_TOKEN_FILEPATH: &str = "../res/test_meta_token.wasm";

pub const E24: u128 = 1_000_000_000_000_000_000_000_000;

fn mpdao_as_u128_string(mpdao_amount: u64) -> String {
    format!("{}000000", mpdao_amount)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let worker = near_workspaces::sandbox().await?;

    // Creating Accounts.
    let owner = worker.dev_create_account().await?;
    let voter = worker.dev_create_account().await?;
    let proposer = worker.dev_create_account().await?;

    ///////////////////////////////////////
    // Stage 1: Deploy relevant contracts
    ///////////////////////////////////////

    let mpdao_token_contract = create_mpdao_token(&owner, &worker).await?;
    let metavote_contract = create_metavote(
        &owner,
        mpdao_token_contract.id(),
        mpdao_token_contract.id(),
        &worker,
    )
    .await?;
    let mpip_contract = create_mpip(
        &owner,
        mpdao_token_contract.id(),
        metavote_contract.id(),
        &worker,
    )
    .await?;

    println!("mpDAO token Contract: {}", mpdao_token_contract.id());
    println!("Meta vote Contract: {}", metavote_contract.id());
    println!("MPIPs Contract: {}", mpip_contract.id());

    println!("Owner: {}", owner.id());
    println!("Voter: {}", voter.id());
    println!("Proposer: {}", proposer.id());

    register_accounts(
        &mpdao_token_contract,
        &metavote_contract,
        &mpip_contract,
        &owner,
        &voter,
        &proposer,
    )
    .await?;

    let res = owner
        .call(mpdao_token_contract.id(), "ft_transfer")
        .args_json(serde_json::json!({
           "receiver_id": voter.id(),
            "amount": mpdao_as_u128_string(15)
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("Transfer mpdao err: {:?}\n", res);
    }

    let res = owner
        .call(mpdao_token_contract.id(), "ft_balance_of")
        .args_json(serde_json::json!({
            "account_id": voter.id()
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    println!("mpDAO balance of {}: {:?}\n", voter.id(), res.to_string());
    assert_eq!(res.to_string(), mpdao_as_u128_string(15));

    let res = owner
        .call(mpdao_token_contract.id(), "ft_transfer")
        .args_json(serde_json::json!({
           "receiver_id": proposer.id(),
            "amount": mpdao_as_u128_string(15)
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("Transfer mpdao 2 err: {:?}\n", res);
    }

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": voter.id()
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert_eq!(res.to_string(), "0");

    let res = proposer
        .call(mpip_contract.id(), "create_proposal")
        .args_json(serde_json::json!({
            "title": "title1",
            "short_description": "short_description1",
            "body": "body1",
            "data": "data1",
            "extra": "extra1"
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    assert!(res.is_failure(), "Not enough deposit");

    let res = proposer
        .call(mpip_contract.id(), "create_proposal")
        .args_json(serde_json::json!({
            "title": "title1",
            "short_description": "short_description1",
            "body": "body1",
            "data": "data1",
            "extra": "extra1"
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    // Due to Workspaces nuances, this is the way to see if a receipt in the tx failed.
    assert!(
        res.is_success() && res.receipt_failures().len() == 1,
        "Not enough voting power"
    );

    let res = proposer
        .call(mpip_contract.id(), "get_proposals")
        .args_json(serde_json::json!({
            "from_index": 0,
            "limit": 100
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert!(res.len() == 0);

    let res = proposer
        .call(mpip_contract.id(), "get_user_proposals_ids")
        .args_json(serde_json::json!({
            "proposer_id": voter.id()
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert!(res.len() == 0);

    ///////////////////////////////////////
    // Stage 2: Creating Proposals
    ///////////////////////////////////////

    let locked_mpdao = 3;
    let days = 60;
    let args = serde_json::json!({
        "receiver_id": metavote_contract.id(),
        "amount": mpdao_as_u128_string(locked_mpdao),
        "msg": format!(r#"{}"#,days)
    });
    let res = voter
        .call(mpdao_token_contract.id(), "ft_transfer_call")
        .args_json(&args)
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    //println!("args {:?}\n {:?}\n", args, res);
    if res.failures().len() > 0 {
        println!(
            "Transfer {} mpdao, days={} ERR: {:?}\n",
            locked_mpdao, days, res
        );
    }

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": voter.id()
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    let vp: u128 = res.to_string().parse().unwrap();
    let expected_vp: u128 = locked_mpdao as u128 * 1 * E24;
    println!("vp: {:?}\n", vp);
    assert_eq!(vp, expected_vp, "Vp <> expected_vp");

    let res = proposer
        .call(mpdao_token_contract.id(), "ft_transfer_call")
        .args_json(serde_json::json!({
            "receiver_id": metavote_contract.id(),
            "amount": mpdao_as_u128_string(3),
            "msg": "120"
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("lock 3 mpdao unbound 120 d ERR: {:?}\n", res);
    }

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": proposer.id()
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_yoctonear(1))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    let vp: u128 = res.to_string().parse().unwrap();
    let expected_vp: u128 = 3 as u128 * 2 * E24;
    println!("(2) vp: {:?}\n", vp);
    assert_eq!(vp, expected_vp, "(2) vp <> expected_vp");

    let res = proposer
        .call(mpip_contract.id(), "create_proposal")
        .args_json(serde_json::json!({
            "title": "title1",
            "short_description": "short_description1",
            "body": "body1",
            "data": "data1",
            "extra": "extra1"
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    // Due to Workspaces nuances, this is the way to see if a receipt in the tx failed.
    assert!(
        res.is_success() && res.receipt_failures().len() == 0,
        "Not enough voting power"
    );

    let res = proposer
        .call(mpip_contract.id(), "get_proposals")
        .args_json(serde_json::json!({
            "from_index": 0,
            "limit": 100
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert!(res.len() == 1);

    ///////////////////////////////////////
    // Stage 3: Voting Proposals
    ///////////////////////////////////////

    let res = voter
        .call(mpip_contract.id(), "get_proposal")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    println!("Proposal 1: {:?}\n", res);

    let res = voter
        .call(mpip_contract.id(), "get_proposal_state")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert_eq!(res, "Draft");

    let res = proposer
        .call(mpip_contract.id(), "start_voting_period")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("Starting Voting Period ERR: {:?}\n", res);
    }

    // let res = voter
    //     .call(mpip_contract.id(), "get_proposal")
    //     .args_json(serde_json::json!({
    //         "mpip_id": 0
    //     }))
    //     .gas(NearGas::from_tgas(200))
    //     // .deposit(NearToken::from_millinear(3))
    //     .transact()
    //     .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;
    // println!("Proposal ACA: {:?}\n", res);

    let res = voter
        .call(mpip_contract.id(), "get_proposal_state")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert_eq!(res, "VotingProcess");

    let res = voter
        .call(mpip_contract.id(), "get_proposal_votes")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert_eq!(res["for_votes"], "0");
    assert_eq!(res["against_votes"], "0");
    assert_eq!(res["abstain_votes"], "0");

    // Voting AGAINST

    let res = voter
        .call(mpip_contract.id(), "vote_proposal")
        .args_json(serde_json::json!({
            "mpip_id": 0,
            "vote": "Against",
            "memo": ""
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;
    if res.failures().len() > 0 {
        println!("vote_proposal ERR: {:?}\n", res);
    }

    let res = voter
        .call(mpip_contract.id(), "get_proposal_votes")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;

    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let aga: u128 = res["against_votes"].to_string().parse().unwrap();
    assert_eq!(aga , num, "(2) against_votes<>expected");
    assert_eq!(res["for_votes"], "0");
    assert_eq!(res["abstain_votes"], "0");

    // Remove Vote
    let _res = voter
        .call(mpip_contract.id(), "remove_vote_proposal")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;

    // Voting FOR

    let res = voter
        .call(mpip_contract.id(), "vote_proposal")
        .args_json(serde_json::json!({
            "mpip_id": 0,
            "vote": "For",
            "memo": ""
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;
    if res.failures().len() > 0 {
        println!("vote_proposal 2 ERR: {:?}\n", res);
    }

    let res = voter
        .call(mpip_contract.id(), "get_proposal_votes")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;

    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let for_votes: u128 = res["for_votes"].to_string().parse().unwrap();
    assert_eq!(for_votes, num, "(1) for_votes<>expected");
    assert_eq!(res["against_votes"], "0");
    assert_eq!(res["abstain_votes"], "0");

    println!("HERE");
    let blocks_to_advance = 3000;
    worker.fast_forward(blocks_to_advance).await?;
    println!("tHERE");

    let res = voter
        .call(mpip_contract.id(), "get_proposal_state")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(NearGas::from_tgas(200))
        // .deposit(NearToken::from_millinear(3))
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    println!("FINAL: {:?}\n", res);

    assert_eq!(res, "Accepted");

    Ok(())
}

async fn create_mpdao_token(
    owner: &Account,
    worker: &Worker<impl DevNetwork>,
) -> anyhow::Result<Contract> {
    let token_contract_wasm = std::fs::read(MPDAO_TEST_TOKEN_FILEPATH)?;
    let token_contract = worker.dev_deploy(&token_contract_wasm).await?;
    println!(
        "init mpdao token contract {} {}",
        owner.id(),
        format!("{}", "200000000000000")
    );
    let res = token_contract
        .call("new_default_meta")
        .args_json(serde_json::json!({
            "owner_id": owner.id(),
            "total_supply": "200000000000000"
        }))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("mpDAO TOKEN new_default_meta result: {:#?}", res);
        panic!("err on init")
    }

    Ok(token_contract)
}

async fn create_metavote(
    owner: &Account,
    mpdao_token_contract: &AccountId,
    stnear_contract: &AccountId,
    worker: &Worker<impl DevNetwork>,
) -> anyhow::Result<Contract> {
    let metavote_contract_wasm = std::fs::read(METAVOTE_FILEPATH)?;
    let metavote_contract = worker.dev_deploy(&metavote_contract_wasm).await?;

    let res = metavote_contract
        .call("new")
        .args_json(serde_json::json!({
            "owner_id": owner.id(),
            "min_unbound_period": 0,
            "max_unbound_period": 300,
            "min_deposit_amount": mpdao_as_u128_string(1),
            "max_locking_positions": 20,
            "max_voting_positions": 40,
            "mpdao_token_contract_address": mpdao_token_contract,
            "stnear_token_contract_address": stnear_contract,
            "registration_cost":"0",
        }))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("METAVOTE init error: {:#?}", res);
        panic!()
    }

    Ok(metavote_contract)
}

async fn create_mpip(
    owner: &Account,
    mpdao_token_contract_address: &AccountId,
    metavote_contract_address: &AccountId,
    worker: &Worker<impl DevNetwork>,
) -> anyhow::Result<Contract> {
    let mpip_contract_wasm = std::fs::read(MPIP_FILEPATH)?;
    let mpip_contract = worker.dev_deploy(&mpip_contract_wasm).await?;

    let res = mpip_contract
        .call("new")
        .args_json(serde_json::json!({
            "admin_id": owner.id(),
            "operator_id": owner.id(),
            "meta_token_contract_address": mpdao_token_contract_address,
            "meta_vote_contract_address": metavote_contract_address,
            "voting_period": "20000", // milliseconds
            "min_voting_power_amount": format!("{}", parse_near!("3 N")),
            "mpip_storage_near": "300000000000000",
            "quorum_floor": 1000
        }))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("MPIPs init err: {:#?}", res);
        panic!()
    }

    Ok(mpip_contract)
}

async fn register_accounts(
    metatoken_contract: &Contract,
    metavote_contract: &Contract,
    mpip_contract: &Contract,
    owner: &Account,
    voter: &Account,
    proposer: &Account,
) -> anyhow::Result<()> {
    println!("Register Accounts");
    let res = owner
        .call(metatoken_contract.id(), "storage_deposit")
        .args_json(serde_json::json!({
            "account_id": voter.id(),
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(250))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("storage_deposit 1: {:?}\n", res);
    }

    let res = owner
        .call(metatoken_contract.id(), "storage_deposit")
        .args_json(serde_json::json!({
            "account_id": metavote_contract.id(),
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(250))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("storage_deposit 2: {:?}\n", res);
    }

    let res = owner
        .call(metatoken_contract.id(), "storage_deposit")
        .args_json(serde_json::json!({
            "account_id": mpip_contract.id(),
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(250))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("storage_deposit 3: {:?}\n", res);
    }

    let res = owner
        .call(metatoken_contract.id(), "storage_deposit")
        .args_json(serde_json::json!({
            "account_id": proposer.id(),
        }))
        .gas(NearGas::from_tgas(200))
        .deposit(NearToken::from_millinear(250))
        .transact()
        .await?;
    if res.failures().len() > 0 {
        println!("storage_deposit 4: {:?}\n", res);
    }

    Ok(())
}

// # # Generating 3 locking positions: 0, 1, 2 days
// # NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'5$YOCTO_UNITS'", "msg": "0"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
// # NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

// # NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'5$YOCTO_UNITS'", "msg": "1"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
// # NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

// # NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'2$YOCTO_UNITS'", "msg": "2"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
// # NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

// NEAR_ENV=testnet near call $META_CONTRACT_ADDRESS ft_transfer_call '{"receiver_id": "'$METAVOTE_CONTRACT_ADDRESS'", "amount": "'3$YOCTO_UNITS'", "msg": "2"}' --accountId $VOTER_ID --depositYocto 1 --gas $TOTAL_PREPAID_GAS
// NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_all_locking_positions '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

// echo "--------------- get_available_voting_power"
// NEAR_ENV=testnet near view $METAVOTE_CONTRACT_ADDRESS get_available_voting_power '{"voter_id": "'$VOTER_ID'"}' --accountId $VOTER_ID

// echo "--------------- Creating a new proposal"
// NEAR_ENV=testnet near call $MPIPS_CONTRACT_ADDRESS create_proposal '{"title": "title1", "short_description": "short_description1", "body": "body1", "data": "data1", "extra": "extra1"}' --accountId $VOTER_ID --depositYocto $TOTAL_PREPAID_GAS --gas $TOTAL_PREPAID_GAS
