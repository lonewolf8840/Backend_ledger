const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');


const router = express.Router();


// *- POST /api/accounts
// - create a new account
// - protected route(requires valid token)


router.post('/', authMiddleware,accountController.createAccountController);



//get all user api

router.get('/', authMiddleware,accountController.getUserAccountController);


// get - /api/accounts/balance

router.get('/balance/:accountId',authMiddleware,accountController.getAccountBalanceController);



module.exports = router;