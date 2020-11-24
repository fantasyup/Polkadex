// Import
const {ApiPromise, WsProvider, Keyring} = require('@polkadot/api');

const wsProvider = new WsProvider('ws://localhost:9944');
polkadex_market_data().then();


async function polkadex_market_data() {
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
    api.derive.chain.subscribeNewHeads((header) => {
        api.rpc.author.pendingExtrinsics().then((extrinsics) => {
            console.log("Pending Transactions in Pool: ", extrinsics.length)
        });
    });
}