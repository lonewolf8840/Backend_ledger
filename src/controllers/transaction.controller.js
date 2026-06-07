const mongoose = require('mongoose');
const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service')
const accountModel = require('../models/accounts.model');

/*
create a new transaction
1* validate the request
2* validate idempotency key
3*check acc status
4*derive sender balance
5*create tansaction pending
6*create debit leedger entry
7*create credit ledger entry
8*mark the transaction as completed
9*commit mondodb session
10*send email notification

*/

async function createTransactionController(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    const user = req.user;

    // Step 1: Validate the request
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields",
            status: "fail"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
* 2. Validate idempotency key
*/

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "completed") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })

        }

        if (isTransactionAlreadyExists.status === "pending") {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if (isTransactionAlreadyExists.status === "failed") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }


    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "active" || toUserAccount.status !== "active") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be active to process transaction"
        })
    }
    /**
        * 4. Derive sender balance from ledger
        */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    let transaction;
    try {
        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "pending"
        }], { session }))[0]

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "debit"
        }], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "credit"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "completed" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    }
    catch (error) {

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }
    /**
    * 10. Send email notification
    */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, toAccount, amount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}


async function createInitialFundsController(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields",
            status: "fail"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
        status: 'active'
    });

    if (!toUserAccount) {
        return res.status(404).json({
            message: "Invalid Account",
            status: "fail"
        });
    }


    const fromUserAccount = await accountModel.findOne({
        user: req.user._id,
        currency: toUserAccount.currency
    });

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "debit"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "credit"
    }], { session })

    transaction.status = "completed"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })

}

module.exports = {
    createTransactionController,
    createInitialFundsController
}