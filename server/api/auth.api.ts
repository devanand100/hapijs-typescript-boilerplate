import Joi from 'joi'
import Boom from '@hapi/boom'
import config from 'config'
import { Request, ResponseToolkit } from '@hapi/hapi'

import userModel, { IUser } from '../models/user.model'
import handleError from '../utils/errorHelper'
import createToken from '../utils/createToken'
import UserService from '../services/user.service'

interface UserPayload {
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
    cPassword?: string
}

const handlers: any = {
    login: {
        validate: {
            payload: Joi.object<UserPayload>().keys({
                email: Joi.string().required().trim().label('Username'),
                password: Joi.string().required().trim().label('Password'),
            }),
        },
        pre: [
            {
                assign: 'user',
                method: async (request: Request, h: ResponseToolkit) => {
                    try {
                        const { email, password } =
                            request.payload as UserPayload

                        const user = await userModel.findByCredentials(
                            email,
                            password
                        )
                        if (user) {
                            return user
                        } else {
                            throw Boom.badRequest('Wrong username or password')
                        }
                    } catch (err) {
                        handleError(err)
                    }
                    return h.continue
                },
            },
            {
                assign: 'accessToken',
                method: (request: Request, h: ResponseToolkit) => {
                    return createToken(
                        request.pre.user,
                        config.get('constants.EXPIRATION_PERIOD')
                    )
                },
            },
            {
                assign: 'emailVerified',
                method: (request: Request, h: ResponseToolkit) => {
                    // TODO: Create Email service to send emails
                    return h.continue
                },
            },
            {
                assign: 'lastLogin',
                method: async (request: Request, h: ResponseToolkit) => {
                    try {
                        const lastLogin = Date.now()
                        await userModel.findByIdAndUpdate(
                            request.pre.user._id,
                            { lastLogin }
                        )
                        return lastLogin
                    } catch (err) {
                        handleError(err)
                    }
                    return h.continue
                },
            },
        ],
        handler: async (request: Request, h: ResponseToolkit) => {
            const accessToken = request.pre.accessToken
            const user = request.pre.user

            // Exclude sensitive information
            delete user.password
            delete user.createdAt
            delete user.role
            delete user.updatedAt

            const response = {
                user,
                accessToken,
                expiresIn: config.get('constants.EXPIRATION_PERIOD'),
            }
            return h.response(response).code(200)
        },
    },
    signup: {
        validate: {
            payload: Joi.object<UserPayload>().keys({
                firstName: Joi.string().required().trim().label('First Name'),
                lastName: Joi.string().required().trim().label('Last Name'),
                email: Joi.string().email().required().trim().label('Email'),
                phone: Joi.string()
                    .trim()
                    .optional()
                    .allow('', null)
                    .label('Phone Number'),
                password: Joi.string().required().trim().label('Password'),
                cPassword: Joi.string()
                    .required()
                    .trim()
                    .valid(Joi.ref('password'))
                    .label('Compare Password'),
            }),
        },
        pre: [
            {
                assign: 'uniqueEmail',
                method: async (request: Request<any>, h: ResponseToolkit) => {
                    try {
                        const user = await userModel.findOne({
                            email: request.payload.email,
                        })
                        if (user) {
                            throw Boom.badRequest(
                                'Email address already exists'
                            )
                        }
                    } catch (err) {
                        handleError(err)
                    }
                    return h.continue
                },
            },
            {
                assign: 'uniquePhone',
                method: async (request: Request<any>, h: ResponseToolkit) => {
                    try {
                        const user = await userModel.findOne({
                            phone: request.payload.phone,
                        })
                        if (user) {
                            throw Boom.badRequest('Phone number already exists')
                        }
                    } catch (err) {
                        handleError(err)
                    }
                    return h.continue
                },
            },
            {
                assign: 'signup',
                method: async (request: Request<any>, h: ResponseToolkit) => {
                    if (request.payload.cPassword) {
                        delete request.payload.cPassword
                    }

                    try {
                        const createdUser = await userModel.create(
                            request.payload
                        )
                        return createdUser
                    } catch (err) {
                        handleError(err)
                    }
                },
            },
        ],
        handler: async (request: Request, h: ResponseToolkit) => {
            return h.response(request.pre.signup).code(201)
        },
    },
    me: {
        validate: {
            headers: Joi.object({
                authorization: Joi.string(),
            }).options({ allowUnknown: true }),
        },
        pre: [],
        handler: async (request: Request<any>, h: ResponseToolkit) => {
            const user = await UserService.getUserById(
                request.auth.credentials.user._id
            )

            return h.response(user as IUser)
        },
    },
}

export default handlers
