const sendButton = document.getElementById("send");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");
const input = document.getElementById("input");
const message = document.getElementById("message");
const balance = document.getElementById("balance");

const SERVER_IP = "http://localhost:3000";

let transaction = null;

const getBalance = async () => {
  const response = await fetch(`${SERVER_IP}/balance`);
  balance.innerText = `${await response.text()} ETH`;
};
await getBalance();

const toggleButtonVisibility = (accept) => {
  yesButton.style.display = accept ? "block" : "none";
  noButton.style.display = accept ? "block" : "none";
  sendButton.style.display = accept ? "none" : "block";
  input.style.display = accept ? "none" : "block";
};

sendButton.addEventListener("click", async () => {
  sendButton.style.display = "none";
  message.innerText = "Thinking...";

  const response = await fetch(`${SERVER_IP}?input=${input.value}`);
  transaction = await response.json();

  if (transaction.type === "send") {
    message.innerText = `Would you like to send ${transaction.amount} Ether to ${transaction.address}?`;
  } else if (transaction.type === "deposit") {
    message.innerText = `Would you like to deposit ${transaction.amount} Ether to ${transaction.protocol}?`;
  } else if (transaction.type === "withdraw") {
    message.innerText = `Would you like to withdraw ${transaction.amount} Ether from ${transaction.protocol}?`;
  } else {
    message.innerText = `I don't understand what you mean by ${transaction.type}.`;
    sendButton.style.display = "block";
    return;
  }

  toggleButtonVisibility(true);
});

noButton.addEventListener("click", () => {
  message.innerText = "Okay, let's try again.";
  setTimeout(() => {
    message.innerText = "What would you like to do today?";
  }, 2000);
  toggleButtonVisibility(false);
});

yesButton.addEventListener("click", async () => {
  message.innerText = "Okay, sending transaction...";
  yesButton.style.display = "none";
  noButton.style.display = "none";

  const response = await fetch(
    `${SERVER_IP}/send?transaction=${JSON.stringify(transaction)}`
  );

  message.innerText =
    (await response.text()) === "success"
      ? "Transaction successful!"
      : "Transaction failed.";
  setTimeout(() => {
    message.innerText = "What would you like to do today?";
  }, 5000);

  await getBalance();
  toggleButtonVisibility(false);
});
