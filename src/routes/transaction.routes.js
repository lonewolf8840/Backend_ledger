const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const  authMiddleware  = require('../middleware/auth.middleware');

const transactionRoutes = express.Router();

/* 
post api /api/transactions
creating new transaction
*/

transactionRoutes.post('/',authMiddleware.authMiddleware, transactionController.createTransactionController);

transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsController);

module.exports = transactionRoutes;