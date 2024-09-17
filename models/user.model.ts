'use strict';

import { HydratedDocument, model, Model, Schema } from 'mongoose';
import Joi from 'joi';
import Bcrypt from 'bcrypt';
import { v4 as Uuidv4 } from 'uuid';

const Types = Schema.Types;

export interface IUser {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  emailVerified: boolean;
  emailHash?: string;
  passwordLastUpdated?: Date;
  lastLogin?: Date;
  phone: string;
}

interface GenerateHash {

}

interface IUserMethods {
  generateHash: (this: UserModel, key: string | Buffer | undefined) => Promise<{
    key: any;
    hash: string;
  } | undefined>
}

interface UserModel extends Model<IUser, UserModel, IUserMethods> {
  generateHash: (this: UserModel, key: string | Buffer | undefined) => Promise<{
    key: any;
    hash: string;
  } | undefined>;
  findByCredentials(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const modelName = 'user';

const UserSchema = new Schema<IUser, UserModel , IUserMethods>(
  {
    firstName: {
      type: Types.String,
      default: null,
      canSearch: true,
    },
    lastName: {
      type: Types.String,
      default: null,
      canSearch: true,
    },
    email: {
      type: Types.String,
      required: true,
      unique: true,
      index: true,
      stringType: 'email',
      canSearch: true,
    },
    password: {
      type: Types.String,
      exclude: true,
      required: true,
    },
    emailVerified: {
      type: Types.Boolean,
      allowOnUpdate: false,
      default: false,
    },
    emailHash: {
      type: Types.String,
      default: null,
    },
    passwordLastUpdated: {
      type: Types.Date,
      default: null,
    },
    lastLogin: {
      type: Types.Date,
      default: null,
      canSort: true,
    },
    phone: {
      type: Types.String,
      maxlength: 12,
      minxlength: 10,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);


UserSchema.statics = {
  findByCredentials: async function (username, password) {
    try {
      const self = this;

      let query = {
        email: username.toLowerCase(),
      };

      const emailValidate = Joi.string().email().validate(username);

      if (emailValidate.error) {
        query = {
          phone: username,
        };
      }

      let mongooseQuery = self.findOne(query);

      let user = await mongooseQuery.lean();

      if (!user) {
        return false;
      }

      const source = user.password;

      let passwordMatch = await Bcrypt.compare(password, source);
      if (passwordMatch) {
        return user;
      }
    } catch (err) {
      // errorHelper.handleError(err);
      console.log(err)
    }
  },
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      let salt = await Bcrypt.genSalt(10);
      let hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      // errorHelper.handleError(err);
      console.log(err)
    }
  },
};

UserSchema.pre('save', async function (next) {
  let user = this;
  if (user.isNew) {
    // Set Password & hash before save it
    const passHash = await user.generateHash(user.password);
    user.password = passHash.hash;
    const emailHash = await user.generateHash();
    user.emailHash = emailHash.hash;
    user.wasNew = true;
  }
  next();
});

UserSchema.methods = {
  generateHash: async function (key: string | Buffer | undefined) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      let salt = await Bcrypt.genSalt(10);
      let hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      // errorHelper.handleError(err);
      console.log(err)
    }
  },
};


export default model(modelName, UserSchema)

