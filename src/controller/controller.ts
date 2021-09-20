import { Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import Account from '../model/accountModel';
import Transaction from '../model/transactionModel';

export const createAccount = async (req: Request, res: Response) => {
  const schema = Joi.object({
    account: Joi.string().length(10).required(),
    amount: Joi.number().required().min(0),
  });
  const { error } = schema.validate({
    account: req.body.account,
    amount: req.body.amount,
  });
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const acct = new Account({
      account: req.body.account,
      amount: req.body.amount,
    });
    const newAccount = await acct.save();
    res.send(newAccount);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const getAllAccount = async (req: Request, res: Response) => {
  const pageNumber: number = +(req.query.page || 1);
  const pageLimit = 5;

  const accounts = await Account.find({}).select({
    account: 1, amount: 1, createdAt: 1, updatedAt: 1,
  }).skip((pageNumber - 1) * pageLimit).limit(pageLimit);

  const count = Math.ceil(await Account.find({}).count() / pageLimit);

  if (accounts) {
    res.status(200).send({
      previous: pageNumber - 1,
      next: count > pageNumber ? pageNumber + 1 : null,
      data: accounts
    });
  } else {
    res.status(404).send('No Accounts found in the database.');
  }
};

export const getIndividualAccount = async (req: Request, res: Response) => {
  const account = req.params.id;
  const data = await Account.findOne({ account: account });
  if (data) {
    res.send(data);
  } else {
    res.status(404).send(`User with ${account} doesn't exists`);
  }
};

export const transferAmount = async (req: Request, res: Response) => {
  const schema = Joi.object({
    from: Joi.string().length(10).required(),
    to: Joi.string().length(10).required(),
    amount: Joi.number().min(0).required(),
    description: Joi.string().required()
  });
  const { error } = schema.validate({
    from: req.body.from,
    to: req.body.to,
    amount: req.body.amount,
    description: req.body.description,
  });
  if (error) return res.status(400).send({ message: error.details[0].message });

  const sender = await Account.findOne({ account: req.body.from });
  if (!sender) return res.status(404).send({ message: `User with account ${req.body.from} does not exist` });
  const receiver = await Account.findOne({ account: req.body.to });
  if (!receiver) return res.status(404).send({ message: `User with account ${req.body.to} does not exist` });

  const { error: errorTransfer } = Joi.object({ amount: Joi.number().max(sender.amount) }).validate({ amount: req.body.amount });
  if (errorTransfer) return res.status(400).send({ message: errorTransfer.details[0].message });

  sender.amount = +sender.amount - Number(req.body.amount);
  receiver.amount = +receiver.amount + Number(req.body.amount);

  sender.save();
  receiver.save();

  const transaction = new Transaction({
    reference: uuidv4(),
    senderAccount: req.body.from,
    receiverAccount: req.body.to,
    amount: req.body.amount,
    transferDescription: req.body.description,
  });

  const newTransaction = await transaction.save();
  res.send(newTransaction);
};

export const getAllTransactions = async (req: Request, res: Response) => {
  const pageNumber: number = +(req.query.page || 1);
  const pageLimit = 5;

  const transactions = await Transaction.find({})
    .limit(2).select({
      reference: 1,
      senderAccount: 1,
      receiverAccount: 1,
      amount: 1,
      transferDescription: 1,
      createdAt: 1
    }).skip((pageNumber - 1) * pageLimit).limit(pageLimit);

  const count = Math.ceil(await Account.find({}).count() / pageLimit);

  if (transactions) {
    res.status(200).send({
      previous: pageNumber - 1,
      next: count > pageNumber ? pageNumber + 1 : null,
      data: transactions
    });
  } else {
    res.status(404).send('No transaction found in the database.');
  }
};

export const getIndividualTransaction = async (req: Request, res: Response) => {
  const transaction = await Transaction.findOne({ reference: req.params.id });
  if (transaction) {
    res.status(200).send(transaction);
  } else {
    res.status(404).send(`Transaction with reference id ${req.params.id} doesn't exists`);
  }
};

export const errorHandle = (req: Request, res: Response) => {
  res.status(404).send('Invalid Url');
};
