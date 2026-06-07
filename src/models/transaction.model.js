const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must have a from account'],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must have a to account'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed'],
            message: 'Status must be either pending, completed or failed'
        },
        default: 'pending'
    },
    amount: {
        type: Number,
        required: [true, 'Transaction must have an amount'],
        min: [0, 'Amount must be a positive number']
    },
    idempotencyKey: {  //avoid same transaction being processed multiple times
        type: String,
        required: [true, 'Transaction must have an idempotency key'],
        unique: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;