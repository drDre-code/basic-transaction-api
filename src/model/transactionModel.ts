import mongoose, { Schema } from 'mongoose';



const transactionSchema = new Schema({
  reference: { type: String, required: true, unique: true },
  senderAccount: { type: String, required: true },
  receiverAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  transferDescription: { type: String, required: true },
}, {
  timestamps: { createdAt: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export = Transaction;
