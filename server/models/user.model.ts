'use strict'

import { HydratedDocument, model, Model, Schema } from 'mongoose'
import Joi from 'joi'
import Bcrypt from 'bcrypt'
import { v4 as Uuidv4 } from 'uuid'

const Types = Schema.Types

export interface IUser {
    _id: string
    firstName?: string
    lastName?: string
    email: string
    password: string
    emailVerified: boolean
    emailHash?: string
    passwordLastUpdated?: Date
    lastLogin?: Date
    phone: string
}

interface IUserMethods {
    generateHash: (key?: string | Buffer) => Promise<{
        key: any
        hash: string
    }>
}

interface UserModel extends Model<IUser, UserModel, IUserMethods> {
    generateHash: (key?: string | Buffer) => Promise<{
        key: any
        hash: string
    }>
    findByCredentials(
        username: string,
        password: string
    ): Promise<HydratedDocument<IUser, IUserMethods>>
}

const modelName = 'user'

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
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
    }
)

UserSchema.statics = {
    findByCredentials: async function (username, password) {
        const self = this

        let query: any = {
            email: username.toLowerCase(),
        }

        const emailValidate = Joi.string().email().validate(username)

        if (emailValidate.error) {
            query = {
                phone: username,
            }
        }

        const mongooseQuery = self.findOne(query)

        const user = await mongooseQuery.lean()

        if (!user) {
            return false
        }

        const source = user.password

        const passwordMatch = await Bcrypt.compare(password, source)
        if (passwordMatch) {
            return user
        }
    },
    generateHash: async function (key) {
        if (key === undefined) {
            key = Uuidv4()
        }
        const salt = await Bcrypt.genSalt(10)
        const hash = await Bcrypt.hash(key, salt)
        return {
            key,
            hash,
        }
    },
}

UserSchema.pre('save', async function () {
    if (this.isNew) {
        // Set Password & hash before save it
        const passHash = await this.generateHash(this.password)

        this.password = passHash?.hash
        const emailHash = await this.generateHash()
        this.emailHash = emailHash.hash
    }
})

UserSchema.methods = {
    generateHash: async function (key) {
        if (key === undefined) {
            key = Uuidv4()
        }
        const salt = await Bcrypt.genSalt(10)
        const hash = await Bcrypt.hash(key, salt)
        return {
            key,
            hash,
        }
    },
}

export default model<IUser, UserModel>(modelName, UserSchema)
