const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Ledger entry must be associated with an account'],
        index : true,
        immutable: true
    },
    transaction :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'Ledger entry must be associated with a transaction'],
        index : true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true, 'Ledger entry must have an amount'],
        index : true,
        immutable: true
    },
    type:{
        type: String,
        enum: {
            values: ['debit', 'credit'],
            message: 'Type must be either debit or credit'
        },
        required: [true, 'Ledger entry must have a type'],
        index : true,
        immutable: true
    }
})

function preventLedgerModification(){
    throw new Error('Ledger entries cannot be modified after creation');
}

ledgerSchema.pre('save', function(next){   // Prevent updates to existing ledger entries; allow creation only.
    if(!this.isNew){
         preventLedgerModification();
    }
 
})
ledgerSchema.pre('updateOne', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('findOneAndUpdate', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('updateMany', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('deleteOne', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('remove', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('findOneAndDelete', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('deleteMany', function(next){
    return preventLedgerModification();
})
ledgerSchema.pre('findOneAndRemove', function(next){
    return preventLedgerModification();
})





const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;