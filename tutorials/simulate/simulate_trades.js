// IMPORTANT NOTE
// This is a simple tutorial that shows how to retrieve market data from Polkadex nodes in real time
// These data can be used to do technical analysis off-chain and place trades accordingly.
// The given example uses trades from ETH/BTC market of Binance Public API to simulate trades. Binance API was not chosen on
// endorse them but only as an example, It should only be treated as a quick and dirty solution to simulate real trades.

// Polkadex team is not associated with Binance in any way.


// Import
const {ApiPromise, WsProvider, Keyring} = require('@polkadot/api');
// Crypto promise, package used by keyring internally
const {cryptoWaitReady} = require('@polkadot/util-crypto');
const BN = require("bn.js")
// Initialize Binance
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: '<key>',
    APISECRET: '<secret>'
});


const wsProvider = new WsProvider('ws://localhost:9944');
polkadex_market_data().then();


async function polkadex_market_data() {
    // Wait for the promise to resolve, async WASM or `cryptoWaitReady().then(() => { ... })`
    await cryptoWaitReady();

    // Create a keyring instance
    const keyring = new Keyring({type: 'sr25519'});
    // The create new instance of Alice
    const alice = keyring.addFromUri('//Alice', {name: 'Alice default'});
    const bob = keyring.addFromUri('//Bob', {name: 'Bob default'});
    const charlie = keyring.addFromUri('//Charlie', {name: 'Charlie default'});
    const dave = keyring.addFromUri('//Dave', {name: 'Dave default'});
    const ferdie = keyring.addFromUri('//Ferdie', {name: 'Ferdie default'});
    const api = await ApiPromise.create({
        types: {
            "OrderType": {
                "_enum": [
                    "BidLimit",
                    "BidMarket",
                    "AskLimit",
                    "AskMarket"
                ]
            },
            "Order": {
                "id": "Hash",
                "trading_pair": "Hash",
                "trader": "AccountId",
                "price": "FixedU128",
                "quantity": "FixedU128",
                "order_type": "OrderType"
            },
            "Order4RPC":{
                "id": "[u8;32]",
                "trading_pair": "[u8;32]",
                "trader": "[u8;32]",
                "price": "Vec<u8>",
                "quantity": "Vec<u8>",
                "order_type": "OrderType"
            },
            "MarketData": {
                "low": "FixedU128",
                "high": "FixedU128",
                "volume": "FixedU128",
                "open": "FixedU128",
                "close": "FixedU128"

            },
            "LinkedPriceLevel": {
                "next": "Option<FixedU128>",
                "prev": "Option<FixedU128>",
                "orders": "Vec<Order>"
            },
            "LinkedPriceLevelRpc":{
                "next": "Vec<u8>",
                "prev": "Vec<u8>",
                "orders": "Vec<Order4RPC>"
            },
            "Orderbook": {
                "trading_pair": "Hash",
                "base_asset_id": "u32",
                "quote_asset_id": "u32",
                "best_bid_price": "FixedU128",
                "best_ask_price": "FixedU128"
            },
            "OrderbookRPC":{
                "trading_pair": "[u8;32]",
                "base_asset_id": "u32",
                "quote_asset_id": "u32",
                "best_bid_price": "Vec<u8>",
                "best_ask_price": "Vec<u8>"
            },
            "OrderbookUpdates": {
                "bids": "Vec<FrontendPricelevel>",
                "asks": "Vec<FrontendPricelevel>"
            },
            "FrontendPricelevel": {
                "price": "FixedU128",
                "quantity": "FixedU128"
            },
            "LookupSource": "AccountId",
            "Address": "AccountId"
        },
        rpc: {
            polkadex: {
                getAllOrderbook: {
                    description: " Blah",
                    params: [],
                    type: "Vec<OrderbookRpc>"
                },
                getAskLevel: {
                    description: " Blah",
                    params: [
                        {
                            name: "trading_pair",
                            type: "Hash"
                        }
                    ],
                    type: "Vec<FixedU128>"
                },
                getBidLevel: {
                    description: " Blah",
                    params: [
                        {
                            name: "trading_pair",
                            type: "Hash"
                        }
                    ],
                    type: "Vec<FixedU128>"
                },
                getMarketInfo: {
                    description: " Blah",
                    params: [
                        {
                            name: "trading_pair",
                            type: "Hash"
                        },
                        {
                            name: "blocknum",
                            type: "u32"
                        }
                    ],
                    type: "MarketDataRpc"
                },
                getOrderbook: {
                    description: " Blah",
                    params: [
                        {
                            name: "trading_pair",
                            type: "Hash"
                        }
                    ],
                    type: "OrderbookRpc"
                },
                getOrderbookUpdates: {
                    description: "Gets best 10 bids & asks",
                    params: [
                        {
                            name: "at",
                            type: "Hash"
                        },
                        {
                            name: "trading_pair",
                            type: "Hash"
                        }
                    ],
                    type: "OrderbookUpdates"
                },
                getPriceLevel: {
                    description: " Blah",
                    params: [
                        {
                            name: "trading_pair",
                            type: "Hash"
                        }
                    ],
                    type: "Vec<LinkedPriceLevelRpc>"
                },
            }
        },
        provider: wsProvider
    });


    const tradingPairID = "0xf28a3c76161b8d5723b6b8b092695f418037c747faa2ad8bc33d8871f720aac9";
    const UNIT = new BN(1000000000000,10);
    const total_issuance = UNIT.mul(UNIT);
    let options = {
        permissions: {
            update: null,
            mint: null,
            burn: null
        }
    }
    // Create first token - Say USDT
    await api.tx.genericAsset.create([total_issuance, options]).signAndSend(alice, {nonce: 0});
    // Create second token - Say BTC
    await api.tx.genericAsset.create([total_issuance, options]).signAndSend(alice, {nonce: 1});
    // Note token created first has Token ID as 1 and second token has ID 2.
    // Create the tradingPair BTC/USDT - (2,1)
    await api.tx.polkadex.registerNewOrderbook(2, 1).signAndSend(alice, {nonce: 2});

    let keys_to_generate = 1000;
    // Let's create 1000 keys
    let keys = []
    let nonces = []
    for(let i=0; i<keys_to_generate;i++){
        const key = keyring.addFromUri('//Alice'+i.toString(), {name: 'Alice '+i.toString()});
        keys.push(key);
        nonces.push(0);
        console.log("Creating key #",i)
    }
    let alice_nonce = 3;
    console.log("Assets Transferring...")
    for(let i=0; i<keys_to_generate; i++){
        await api.tx.genericAsset.transfer(1,keys[i].address,total_issuance.div(new BN(keys_to_generate,10))).signAndSend(alice, {nonce: alice_nonce});
        await api.tx.genericAsset.transfer(2,keys[i].address,total_issuance.div(new BN(keys_to_generate,10))).signAndSend(alice, {nonce: alice_nonce+1});
        await api.tx.genericAsset.transfer(0,keys[i].address,total_issuance.div(new BN(keys_to_generate,10))).signAndSend(alice, {nonce: alice_nonce+2});
        alice_nonce = alice_nonce+3;
        console.log("Address: ",keys[i].address," #",i)
    }
    console.log("Assets Transferred.")
    keys.pop()
    nonces.pop()
    let counter = 0;
    binance.websockets.trades(['BTCUSDT'], (trades) => {
        let {e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId} = trades;
        // console.info(symbol+" trade update. price: "+price+", quantity: "+quantity+", BUY: "+maker);

        let price_converted = new BN(cleanString((parseFloat(price) * UNIT).toString()),10);
        let quantity_converted =new BN(cleanString((parseFloat(quantity) * UNIT).toString()),10);
        if (maker === true) {
            api.tx.polkadex.submitOrder("BidLimit", tradingPairID, price_converted, quantity_converted).signAndSend(keys[counter%keys.length], {nonce: nonces[counter%keys.length]}, (status,) => {
                console.log(status.status.isInvalid, ":",keys[counter%keys.length].address);
            });
        } else {
            api.tx.polkadex.submitOrder("AskLimit", tradingPairID, price_converted, quantity_converted).signAndSend(keys[[counter%keys.length]], {nonce: nonces[counter%keys.length]}, (status) => {
                console.log(status.status.isInvalid, ":",keys[counter%keys.length].address);
            });
        }
        nonces[counter%keys.length] = nonces[counter%keys.length] + 1;
        counter = counter + 1;
    });
}

function cleanString(value) {
    let pos = value.indexOf(".");
    if (pos === -1 ){
        return value
    }else{
        return value.substring(0,pos)
    }
}