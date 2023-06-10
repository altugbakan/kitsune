require("dotenv").config();
const { ethers } = require("ethers");
const { AAVE_WETH_GATEWAY, AETH_ADDRESS } = require("../constants");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const aeth = new ethers.Contract(
  AETH_ADDRESS,
  ["function approve(address spender, uint256 amount) public returns (bool)"],
  wallet
);

const approve = async () => {
  const tx = await aeth.approve(AAVE_WETH_GATEWAY, ethers.MaxUint256);
  const result = await tx.wait();
  return result;
};

approve().then((result) => {
  console.log(
    result.status === 1 ? "Successfully approved AETH" : "Transaction failed"
  );
});
