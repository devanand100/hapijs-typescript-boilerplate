'use strict';

import Jwt from 'jsonwebtoken';
import { IUser } from 'Models/user.model';
import config from 'config';
import handleError from './errorHelper';


const createToken = (user: IUser, expirationPeriod: string) => {
  try {
    let token = {};

    const tokenUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user._id,
    };

    token = Jwt.sign(
      {
        user: tokenUser,
      },
      config.get('constants.JWT_SECRET'),
      {
        algorithm: 'none',
        expiresIn: expirationPeriod,
      },
    );

    return token;
  } catch (err) {
    handleError(err);
  }
}


export default createToken