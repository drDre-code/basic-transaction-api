import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import User from '../model/userModel';
import { generateToken} from '../utils';

const userRouter = express.Router();

userRouter.post('/registration', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = {
    name: value.name,
    email: value.email,
    password: bcrypt.hashSync(value.password, 8),
  };

  try {
    const newUser = new User({ ...user });
    const createdUser = await newUser.save() as unknown as { [key: string]: string; };
    res.send({
      ...createdUser,
      token: generateToken(createdUser)
    });
    return;
  } catch (error:any) {
    res.status(400).send({ message: error.message });
  }

});


userRouter.post('/signin', async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) return res.status(400).send({ message: error.details[0].message });
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user)
      });
    }
    return;
  }

  return res.status(400).send({ message: `User with ${req.body.email} doesn't exists` });

});


export = userRouter;
