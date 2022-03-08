const jwt_enc_key = "THIS IS THR AUTH TOKEN ENCTYPTION KEY";
const admin_address = "0xccccCCCCcccccCCCCCCccc";
const signIn_break_timeout =  24*60*60;   //24*60*60 equals with 24 hours
const upload_path = "/public/uploads/";
const mainnet_ws_RPC = "wss://speedy-nodes-nyc.moralis.io/28d3cf172b5d4a2a5ca57641/avalanche/mainnet/ws";
const testnet_ws_RPC = "wss://speedy-nodes-nyc.moralis.io/28d3cf172b5d4a2a5ca57641/avalanche/testnet/ws";
const mainnet_http_RPC = "https://speedy-nodes-nyc.moralis.io/28d3cf172b5d4a2a5ca57641/avalanche/mainnet";
const testnet_http_RPC = "https://speedy-nodes-nyc.moralis.io/28d3cf172b5d4a2a5ca57641/avalanche/testnet";

const bsc_testnet_ws_RPC = "wss://speedy-nodes-nyc.moralis.io/28d3cf172b5d4a2a5ca57641/bsc/testnet/ws";

module.exports  =  { 
	jwt_enc_key, 
	admin_address,
	signIn_break_timeout,
	upload_path,
	mainnet_ws_RPC,
	testnet_ws_RPC,
	mainnet_http_RPC,
	testnet_http_RPC,
	bsc_testnet_ws_RPC
};
