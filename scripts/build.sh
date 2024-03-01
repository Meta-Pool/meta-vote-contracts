cd contracts
RUSTFLAGS='-C link-arg=-s' cargo build --all --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/meta_vote_contract.wasm ../res/
cp target/wasm32-unknown-unknown/release/test_meta_token.wasm ../res/
cp target/wasm32-unknown-unknown/release/mpip_contract.wasm ../res/
cd -