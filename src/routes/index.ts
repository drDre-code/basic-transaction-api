
import express from 'express';
import { isAuth } from '../utils';
import { createAccount, getIndividualAccount, getAllAccount, transferAmount, getAllTransactions, getIndividualTransaction, errorHandle } from '../controller/controller';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.send(`
  <h1>DRE-TRANSACTION-API</h1>
  <div><b>Information:</b> <em>use "/accounts" to view all accounts in database</em></div>
  <div><b>Information:</b> <em>use "/accounts/{accountNumber}" to view specific account in database</em></div>
  <div><b>Information:</b> <em>use "/transer" to view all transactions in database</em></div>
  <div><b>Information:</b> <em>use "/transer/{reference}" to view specific transaction in database</em></div>
  <div><a href=https://documenter.getpostman.com/view/16998071/Tzz7QJcE>documentationLink</a></div>
  `);
});
router.post('/create-account', isAuth, createAccount);
router.get('/accounts', isAuth, getAllAccount);
router.get('/accounts/:id', isAuth, getIndividualAccount);
router.post('/transfer', isAuth, transferAmount);
router.get('/transfer', isAuth, getAllTransactions);
router.get('/transfer/:id', isAuth, getIndividualTransaction);
router.get('/*', errorHandle);
router.post('/*', errorHandle);




export = router;
