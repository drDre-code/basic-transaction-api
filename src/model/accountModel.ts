import mongoose, { Schema } from 'mongoose';



const accountSchema = new Schema({
  account: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
}, {
  timestamps: true,
});

const Account = mongoose.model('Account', accountSchema);

export = Account;
