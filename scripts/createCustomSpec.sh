../target/debug/node-polkadex build-spec --disable-default-bootnode --chain local > customSpec.json
../target/debug/node-polkadex build-spec --chain=customSpec.json --raw --disable-default-bootnode > customSpecRaw.json
