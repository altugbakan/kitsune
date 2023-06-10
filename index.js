require("dotenv").config();
const { AAVE_WETH_GATEWAY, AaveWEthGatewayAbi } = require("./constants.js");
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 3000;
const systemPrompt = `You are a program that returns the following JSON schema which you will create using the user's input. Your whole response should be a valid JSON. Do not print out any message, only the JSON without backticks. Do not give any warnings, notes or errors, only return the JSON.

{
  "protocol": "aave" | "yearn" | null,
  "amount": number | "all",
  "type": "deposit" | "withdraw" | "send",
  "address": "string" | null,
  "response": null | string,
}`;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(cors());

app.get("/", async (req, res) => {
  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: req.query.input },
    ],
    temperature: 0,
  });
  res.send(result.data.choices[0].message.content);
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ethProvider = new ethers.InfuraProvider(ethers.Network.Mainnet);
const ethWallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethProvider);

app.get("/balance", async (_req, res) => {
  const balance = await provider.getBalance(wallet.address);
  return res.send(parseFloat(ethers.formatEther(balance)).toFixed(2));
});

app.get("/send", async (req, res) => {
  const params = JSON.parse(req.query.transaction);
  let tx;

  let amount = ethers.parseEther(params.amount.toString());
  if (params.amount === "all") {
    amount = await provider.getBalance(wallet.address);
  }

  if (params.type === "send") {
    let address = params.address;
    if (params.address.includes(".eth")) {
      address = await ethProvider.resolveName(params.address);
    }

    tx = await wallet.sendTransaction({
      to: address,
      value: amount,
    });
  } else if (params.type === "deposit") {
    if (params.protocol !== "aave") {
      res.status(500).send("Protocol not supported");
      return;
    }

    const gateway = new ethers.Contract(
      AAVE_WETH_GATEWAY,
      AaveWEthGatewayAbi,
      wallet
    );

    tx = await gateway.depositETH(ethers.ZeroAddress, wallet.address, 0, {
      value: amount,
    });
  } else if (params.type === "withdraw") {
    if (params.protocol !== "aave") {
      res.status(500).send("Protocol not supported");
      return;
    }

    const gateway = new ethers.Contract(
      AAVE_WETH_GATEWAY,
      AaveWEthGatewayAbi,
      wallet
    );

    tx = await gateway.withdrawETH(ethers.ZeroAddress, amount, wallet.address);
  } else {
    res.status(400).send("Invalid transaction type");
  }

  const result = await tx.wait();
  res.send(result.status === 1 ? "success" : "failure");
});

app.listen(port, () => {
  console.log("Started listening for requests");
});
