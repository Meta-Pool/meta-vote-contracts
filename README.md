# Meta Vote

![Meta Vote Logo](media/logo.png)

Implementation of a general voting system using the $META token.

## Locking and Unlocking process

To Lock funds into the Meta Vote contract, the user must define an amount in the $META token and a number of days (between 30 and 300 days) to lock the funds.

![Locking and Unlocking process](media/process.png)

Consider:

To reclaim the META tokens you will have to wail the period selected in the locking.

Implement **NEP264** for cross-contract calls: https://github.com/near/near-sdk-rs/issues/740
Release notes for `near-sdk = "4.0.0"`: https://github.com/near/near-sdk-rs/discussions/797
