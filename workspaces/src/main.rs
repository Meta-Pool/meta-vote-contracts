// use std::fs;
// use meta_tools::types::{EpochMillis, VaultId};
// use meta_tools::utils::proportional;
// use meta_tools::bond::BondLoaderJSON;
use near_units::{parse_gas, parse_near};
// use json;
use std::str;
// use near_sdk::json_types::{U128, U64};

// use workspaces::network::Sandbox;
use workspaces::{Account, AccountId, Contract, Worker, DevNetwork};

// use meta_test_utils::now::Now;
// use meta_test_utils::now;

const METAVOTE_FILEPATH: &str = "../res/meta_vote_contract.wasm";
const MPIP_FILEPATH: &str = "../res/mpip_contract.wasm";
const METATOKEN_FILEPATH: &str = "../res/test_meta_token.wasm";

pub const NEAR: u128 = 1_000_000_000_000_000_000_000_000;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let worker = workspaces::sandbox().await?;

    // Creating Accounts.
    let owner = worker.dev_create_account().await?;
    let voter = worker.dev_create_account().await?;
    let proposer = worker.dev_create_account().await?;

    ///////////////////////////////////////
    // Stage 1: Deploy relevant contracts
    ///////////////////////////////////////

    let metatoken_contract = create_metatoken(&owner, &worker).await?;
    let metavote_contract = create_metavote(&owner, metatoken_contract.id(), &worker).await?;
    let mpip_contract = create_mpip(
        &owner,
        metatoken_contract.id(),
        metavote_contract.id(),
        &worker
    ).await?;

    println!("mpDAO token Contract: {}", metatoken_contract.id());
    println!("Meta vote Contract: {}", metavote_contract.id());
    println!("MPIPs Contract: {}", mpip_contract.id());

    println!("Owner: {}", owner.id());
    println!("Voter: {}", voter.id());
    println!("Proposer: {}", proposer.id());

    let res = registering_accounts(
        &metatoken_contract,
        &metavote_contract,
        &mpip_contract,
        &owner,
        &voter,
        &proposer
    ).await?;
    println!("Registering Accounts.: {:?}\n", res);

    let res = owner
        .call(metatoken_contract.id(), "ft_transfer")
        .args_json(serde_json::json!({
           "receiver_id": voter.id(),
            "amount": format!("{}", parse_near!("15 N"))
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    println!("Transfer stNEAR: {:?}\n", res);

    let res = owner
        .call(metatoken_contract.id(), "ft_balance_of")
        .args_json(serde_json::json!({
            "account_id": voter.id()
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    println!("mpDAO balance of {}: {:?}\n", voter.id(), res);
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert_eq!(res.to_string(), format!("{}", parse_near!("15 N")));

    let res = owner
        .call(metatoken_contract.id(), "ft_transfer")
        .args_json(serde_json::json!({
           "receiver_id": proposer.id(),
            "amount": format!("{}", parse_near!("15 N"))
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    println!("Transfer stNEAR: {:?}\n", res);

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": voter.id()
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
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
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
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
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    // Due to Workspaces nuances, this is the way to see if a receipt in the tx failed.
    assert!(res.is_success() && res.receipt_failures().len() == 1, "Not enough voting power");

    let res = proposer
        .call(mpip_contract.id(), "get_proposals")
        .args_json(serde_json::json!({
            "from_index": 0,
            "limit": 100
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    assert!(res.len() == 0);

    ///////////////////////////////////////
    // Stage 2: Creating Proposals
    ///////////////////////////////////////

    let res = voter
        .call(metatoken_contract.id(), "ft_transfer_call")
        .args_json(serde_json::json!({
            "receiver_id": metavote_contract.id(),
            "amount": format!("{}", parse_near!("3 N")),
            "msg": "2"
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    println!("Transfer stNEAR: {:?}\n", res);

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": voter.id()
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let res: u128 = res.to_string().parse().unwrap();
    assert!(res > num, "Voting power should be larger than the deposit");
    println!("Transfer stNEAR __: {:?}\n", res);

    let res = proposer
        .call(metatoken_contract.id(), "ft_transfer_call")
        .args_json(serde_json::json!({
            "receiver_id": metavote_contract.id(),
            "amount": format!("{}", parse_near!("3 N")),
            "msg": "2"
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    println!("Transfer stNEAR: {:?}\n", res);

    let res = owner
        .call(metavote_contract.id(), "get_available_voting_power")
        .args_json(serde_json::json!({
            "voter_id": proposer.id()
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(1)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let res: u128 = res.to_string().parse().unwrap();
    assert!(res > num, "Voting power should be larger than the deposit");
    println!("Transfer stNEAR __: {:?}\n", res);

    let res = proposer
        .call(mpip_contract.id(), "create_proposal")
        .args_json(serde_json::json!({
            "title": "title1",
            "short_description": "short_description1",
            "body": "body1",
            "data": "data1",
            "extra": "extra1"
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    // Due to Workspaces nuances, this is the way to see if a receipt in the tx failed.
    assert!(res.is_success() && res.receipt_failures().len() == 0, "Not enough voting power");

    let res = proposer
        .call(mpip_contract.id(), "get_proposals")
        .args_json(serde_json::json!({
            "from_index": 0,
            "limit": 100
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        .transact()
        .await?;
    println!("Starting Voting Period: {:?}\n", res);

    // let res = voter
    //     .call(mpip_contract.id(), "get_proposal")
    //     .args_json(serde_json::json!({
    //         "mpip_id": 0
    //     }))
    //     .gas(parse_gas!("200 Tgas") as u64)
    //     // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;
    println!("vote_proposal: {:?}\n", res);

    let res = voter
        .call(mpip_contract.id(), "get_proposal_votes")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;

    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let aga: u128 = res["against_votes"].to_string().parse().unwrap();
    assert!(aga > num, "Voting power should be larger than the deposit");
    assert_eq!(res["for_votes"], "0");
    assert_eq!(res["abstain_votes"], "0");

    // Remove Vote

    let res = voter
        .call(mpip_contract.id(), "remove_vote_proposal")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    // let res = &res.raw_bytes().unwrap().clone();
    // let res = str::from_utf8(res).unwrap();
    // let res = json::parse(&res)?;
    println!("vote_proposal: {:?}\n", res);

    let res = voter
        .call(mpip_contract.id(), "get_proposal_votes")
        .args_json(serde_json::json!({
            "mpip_id": 0
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;

    let num: u128 = format!("{}", parse_near!("3 N")).parse().unwrap();
    let aga: u128 = res["for_votes"].to_string().parse().unwrap();
    assert!(aga > num, "Voting power should be larger than the deposit");
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
        .gas(parse_gas!("200 Tgas") as u64)
        // .deposit(parse_gas!("300 Tgas") as u128)
        .transact()
        .await?;
    let res = &res.raw_bytes().unwrap().clone();
    let res = str::from_utf8(res).unwrap();
    let res = json::parse(&res)?;
    println!("FINAL: {:?}\n", res);
    
    assert_eq!(res, "Accepted");

    Ok(())
}

async fn create_metatoken(
    owner: &Account,
    worker: &Worker<impl DevNetwork>,
) -> anyhow::Result<Contract> {
    let token_contract_wasm = std::fs::read(METATOKEN_FILEPATH)?;
    let token_contract = worker.dev_deploy(&token_contract_wasm).await?;

    let res = token_contract
        .call("new_default_meta")
        .args_json(serde_json::json!({
            "owner_id": owner.id(),
            "decimals": 24,
            "symbol": "mpDAO",
            "total_supply": format!("{}", parse_near!("1000 N"))
        }))
        .transact()
        .await?;
    println!("mpDAO TOKEN: {:#?}", res);

    Ok(token_contract)
}

async fn create_metavote(
    owner: &Account,
    metatoken_contract: &AccountId,
    worker: &Worker<impl DevNetwork>,
) -> anyhow::Result<Contract> {
    let metavote_contract_wasm = std::fs::read(METAVOTE_FILEPATH)?;
    let metavote_contract = worker.dev_deploy(&metavote_contract_wasm).await?;

    let res = metavote_contract
        .call("new")
        .args_json(serde_json::json!({
            "owner_id": owner.id(),
            "min_locking_period": 0,
            "max_locking_period": 300,
            "min_deposit_amount": format!("{}", parse_near!("1 N")),
            "max_locking_positions": 20,
            "max_voting_positions": 40,
            "meta_token_contract_address": metatoken_contract
        }))
        .transact()
        .await?;
    println!("METAVOTE: {:#?}", res);

    Ok(metavote_contract)
}

async fn create_mpip(
    owner: &Account,
    token_contract_address: &AccountId,
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
            "meta_token_contract_address": token_contract_address,
            "meta_vote_contract_address": metavote_contract_address,
            "voting_period": "3600000",
            "min_voting_power_amount": format!("{}", parse_near!("3 N")),
            "mpip_storage_near": "300000000000000",
            "quorum_floor": 1000
        }))
        .transact()
        .await?;
    println!("MPIPs: {:#?}", res);

    Ok(mpip_contract)
}

async fn registering_accounts(
    metatoken_contract: &Contract,
    metavote_contract: &Contract,
    mpip_contract: &Contract,
    owner: &Account,
    voter: &Account,
    proposer: &Account
) -> anyhow::Result<()> {
    // Register Accounts
    let res = owner
        .call(metatoken_contract.id(), "register_account")
        .args_json(serde_json::json!({
            "account_id": voter.id(),
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .transact()
        .await?;
    println!("Register 1: {:?}\n", res);

    let res = owner
        .call(metatoken_contract.id(), "register_account")
        .args_json(serde_json::json!({
            "account_id": metavote_contract.id(),
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .transact()
        .await?;
    println!("Register 2: {:?}\n", res);

    let res = owner
        .call(metatoken_contract.id(), "register_account")
        .args_json(serde_json::json!({
            "account_id": mpip_contract.id(),
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .transact()
        .await?;
    println!("Register 3: {:?}\n", res);

    let res = owner
        .call(metatoken_contract.id(), "register_account")
        .args_json(serde_json::json!({
            "account_id": proposer.id(),
        }))
        .gas(parse_gas!("200 Tgas") as u64)
        .transact()
        .await?;
    println!("Register 4: {:?}\n", res);

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

