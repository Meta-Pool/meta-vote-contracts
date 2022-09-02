#
# Makefile for katherine fundraising
#

YOCTO_UNITS=000000000000000000000000

ifndef NEAR_ACCOUNT
NEAR_ACCOUNT="kate_tester3.testnet"
endif

lint:
	cargo clippy --all-targets --all-features -- -D warnings

# Build library dynamically linked to the rust runtime libraries
build:
	RUSTFLAGS='-C link-arg=-s' cargo +stable build --all --target wasm32-unknown-unknown --release
	cp target/wasm32-unknown-unknown/release/meta_vote_contract.wasm res/
	cp target/wasm32-unknown-unknown/release/pipeline_contract.wasm res/
	cp target/wasm32-unknown-unknown/release/test_meta_token.wasm res/

publish-dev: build
	NEAR_ENV=testnet near dev-deploy --wasmFile res/katherine_fundraising_contract.wasm

publish-dev-init: build
	rm -rf neardev/
	NEAR_ENV=testnet near dev-deploy --wasmFile res/katherine_fundraising_contract.wasm --initFunction new --initArgs '{"owner_id": ${NEAR_ACCOUNT}, "min_deposit_amount": "2000000000000", "metapool_contract_address": "meta-v2.pool.testnet", "katherine_fee_percent": 100 }'

integration-test: build
	./scripts/integration_test.sh

integration: build
	scripts/integration.sh

install:
	cp target/release/libcfdi.so /usr/local/lib64/

test:
	RUST_BACKTRACE=1 cargo test -- --color always --nocapture

format:
	cargo fmt -- --check

doc:
	cargo doc

clean:
	cargo clean
