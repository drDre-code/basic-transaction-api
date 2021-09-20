import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface Info {
  [key: string]: string | number;
}

export const generateToken = (user: { [key: string]: string; }) => {
  const { _id, name, email, password } = user;
  const pass = process.env.JWT_SECRET || 'takeaguess';
  return jwt.sign({ _id, name, email, password }, pass, { expiresIn: '30d' });
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET || 'takeaguess', (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

