const AAVE_WETH_GATEWAY = "0x2E95E3722e695Fddd595F8DEfB5b768D906aE09e";
const AaveWEthGatewayAbi = require("./abi/AaveWETHGateway.json");
const ETH_RPC_URL = "https://mainnet.infura.io/v3/";
const AETH_ADDRESS = "0xF8793d992E2f4De3Eaf7cE65c71e81Bcc0f235Af";
const SYSTEM_PROMPT = `You are a program that returns the following JSON schema which you will create using the user's input. Your whole response should be a valid JSON. Do not print out any message, only the JSON without backticks. Do not give any warnings, notes or errors, only return the JSON.

{
  "protocol": "aave" | "yearn" | null,
  "amount": number | "all",
  "type": "deposit" | "withdraw" | "send",
  "address": "string" | null,
}`;

module.exports = {
  AAVE_WETH_GATEWAY,
  AaveWEthGatewayAbi,
  ETH_RPC_URL,
  AETH_ADDRESS,
  SYSTEM_PROMPT,
};
