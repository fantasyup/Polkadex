rm -r -f /tmp/bob/
../target/release/node-polkadex --base-path /tmp/bob --chain customSpecRaw.json --dave --port 30333 --ws-port 9945 --rpc-port 9934 --validator --node-key 0000000000000000000000000000000000000000000000000000000000000004 -lpeerset=trace,sync=trace,sub-libp2p=trace,libp2p=trace