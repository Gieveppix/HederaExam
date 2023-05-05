const { PrivateKey, Client, AccountCreateTransaction, TransferTransaction, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();

const treasuryAccount = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const treasuryId = process.env.MY_ACCOUNT_ID

const treasuryClient = Client.forTestnet();
treasuryClient.setOperator(treasuryId, treasuryAccount).setDefaultMaxTransactionFee(new Hbar(10));

async function createAccount(n) {
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const tx = await new AccountCreateTransaction()
        .setKey(newAccountPrivateKey)
        .execute(treasuryClient);

    const accountId = (await tx.getReceipt(treasuryClient)).accountId;
    console.log(`- Account ${n}`);
    console.log(`Private key: ${newAccountPrivateKey}`);
    console.log(`Account ID: ${accountId}\n`);
    return accountId
}

async function fundAccounts(accountIds){
    console.log(accountIds)
    const tx = await new TransferTransaction()
        .addHbarTransfer(treasuryId, new Hbar(-1000))
        .addHbarTransfer(accountIds[0], new Hbar(200))
        .addHbarTransfer(accountIds[1], new Hbar(200))
        .addHbarTransfer(accountIds[2], new Hbar(200))
        .addHbarTransfer(accountIds[3], new Hbar(200))
        .addHbarTransfer(accountIds[4], new Hbar(200))
        .execute(treasuryClient)

    const txId = (await tx.getReceipt(treasuryClient));
    console.log(txId)

}

async function main() {
    const accounts = [];
    for (let i = 1; i <= 5; i++) {
        let id = await createAccount(i);
        accounts.push(id)
    }
    
   await fundAccounts(accounts)
   process.exit()
}

main();