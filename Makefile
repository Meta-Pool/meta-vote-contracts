#
# Makefile for Meta Vote
#

YOCTO_UNITS=000000000000000000000000

ifndef NEAR_ACCOUNT
NEAR_ACCOUNT="kate_tester3.testnet"
endif

lint:
	cargo clippy --all-targets --all-features -- -D warnings

# Build library dynamically linked to the rust runtime libraries
build:
	./scripts/build.sh

publish-dev: build
	NEAR_ENV=testnet near dev-deploy --wasmFile res/katherine_fundraising_contract.wasm

publish-dev-init: build
	rm -rf neardev/
	NEAR_ENV=testnet near dev-deploy --wasmFile res/katherine_fundraising_contract.wasm --initFunction new --initArgs '{"owner_id": ${NEAR_ACCOUNT}, "min_deposit_amount": "2000000000000", "metapool_contract_address": "meta-v2.pool.testnet", "katherine_fee_percent": 100 }'

integration-test: build
	./scripts/integration_test.sh

integration: build
	scripts/integration_test.sh

workspace: build
	scripts/run_workspace.sh

install:
	cp target/release/libcfdi.so /usr/local/lib64/

test:
	cd contracts && cargo test --lib -- --color always

test-nocapture:
	cd contracts && cargo test -- --color always  --nocapture

format:
	cargo fmt -- --check

doc:
	cargo doc

clean:
	cargo clean
