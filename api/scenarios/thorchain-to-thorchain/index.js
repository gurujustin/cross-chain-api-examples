const fetch = require('node-fetch')
const { Client } = require('@xchainjs/xchain-thorchain')
const { Network } = require('@xchainjs/xchain-client')
const { assetFromString, assetAmount, formatBaseAmount } = require('@xchainjs/xchain-util')

const phrase = '...' // your mnemonic phrase

const quoteParams = {
    sellAsset: 'THOR.RUNE',
    buyAsset: 'ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044',
    sellAmount: '10',
    senderAddress: 'thor15knytkmnqxz7jq0aup2v4k99cx6y4luurg0uwr',
    recipientAddress: '0xE9938Fe092e5d79ed79643461b8c92f2DcCbc28A',
    providers: 'THORCHAIN'
}

const baseUrl = `https://api.thorswap.net/aggregator`;
const paramsStr = new URLSearchParams(quoteParams).toString();

function fetchQuote() {
  return fetch(`${baseUrl}/tokens/quote?${paramsStr}`)
      .then(res => res.json())
}

let client;
 // Init TC client
 async function connect() {
    client = new Client({
      network: Network.Mainnet,
      phrase,
      chainIds: 'thorchain-mainnet-v1'
    })
    return true
  }

  async function executeTxn() {
    const quote = await fetchQuote();
    const calldata = quote.routes[0].calldata;

    const fromAsset = assetFromString(quoteParams.sellAsset);
    const toAsset = assetFromString(quoteParams.buyAsset);
    if (fromAsset == null) throw new Error(`Invalid asset ${fromAsset}`)
    if (toAsset == null) throw new Error(`Invalid asset ${toAsset}`)

    const amount = assetAmount(calldata.amountIn)
    const memo = calldata.memo
    
    console.log(`=== Sending transaction ===`)
    console.log(`Memo: ${memo}`)
    console.log(`Amount: ${formatBaseAmount(amount)}`)

    const hash = await client.deposit({
      walletIndex: 0,
      amount,
      asset: fromAsset,
      memo
    })

    console.log(`Transaction hash: https://viewblock.io/thorchain/tx/${hash}`)
  }

  connect()
  .then(_ => executeTxn())
  .then(_ => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
