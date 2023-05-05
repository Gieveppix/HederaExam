const {
  TransferTransaction,
  Client,
  ScheduleCreateTransaction,
  ScheduleDeleteTransaction,
  ScheduleSignTransaction,
  PrivateKey,
  Hbar
} = require("@hashgraph/sdk");
require("dotenv").config();

const myAccountId = process.env.MY_ACCOUNT_ID
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY)

const acc1_id = process.env.ACC_1_ID
const acc1 = PrivateKey.fromString(process.env.ACC_1_PK)
const acc2_id = process.env.ACC_2_ID

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

  //Create a transaction to schedule
  const transferTransaction = new TransferTransaction()
      .addHbarTransfer(acc1_id, Hbar.fromTinybars(-100))
      .addHbarTransfer(acc2_id, Hbar.fromTinybars(100));

  //Schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
      .setScheduledTransaction(transferTransaction)
      .setScheduleMemo("Scheduled Transaction Test Cert!")
      .setAdminKey(myPrivateKey)
      .execute(client);

  //Get the receipt of the transaction
  const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

  //Get the schedule ID
  const scheduleId = scheduledTxReceipt.scheduleId;
  console.log("The schedule ID is " + scheduleId);

  //Get the scheduled transaction ID
  const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
  console.log("The scheduled transaction ID is " + scheduledTxId);

  //Create the transaction and sign with the admin key
  const transaction = await new ScheduleDeleteTransaction()
      .setScheduleId(scheduleId)
      .freezeWith(client)
      .sign(myPrivateKey);

  //Sign with the operator key and submit to a Hedera network
  const txResponse = await transaction.execute(client);

  //Get the transaction receipt
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction status
  const transactionStatus = receipt.status;
  console.log("The transaction consensus status is " +transactionStatus);

  //Try to execute the deleted scheduled tx
  const scheduledSignTransaction = await new ScheduleSignTransaction()
      .setScheduleId(scheduleId)
      .freezeWith(client)
      .sign(acc1);

  const txResponse1 = await scheduledSignTransaction.execute(client);
  const receipt1 = await txResponse1.getReceipt(client);

  //Get the transaction status - should fail
  const transactionStatus1 = receipt1.status;
  console.log("The transaction consensus status is " + transactionStatus1);


  process.exit();
}

main();