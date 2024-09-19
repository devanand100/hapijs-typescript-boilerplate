import config from 'config'
import { Server, Plugin, Request, ResponseToolkit } from '@hapi/hapi'
import { IUser } from '../models/user.model'
interface decodedTokenType {
    user: Partial<IUser>
}
const plugin = {
    register: async function (server: Server, options: any) {
        const jwtValidate = async (
            decodedToken: decodedTokenType,
            request: Request,
            h: ResponseToolkit
        ) => {
            const User = (await import('../models/user.model')).default
            const credentials = {
                user: {},
            }
            let isValid = false
            const user = await User.findById(decodedToken.user._id)
            if (user) {
                isValid = true
                credentials.user = user
            }
            // Authentication Code will be here
            return {
                isValid,
                credentials,
            }
        }

        server.auth.strategy('auth', 'jwt', {
            key: config.get('constants.JWT_SECRET'),
            validate: jwtValidate,
            verifyOptions: {
                algorithms: ['HS256'],
            },
        })

        // Add helper method to get request ip
        const getIP = function (request: Request) {
            // We check the headers first in case the server is behind a reverse proxy.
            // see: https://ypereirareis.github.io/blog/2017/02/15/nginx-real-ip-behind-nginx-reverse-proxy/
            return (
                request.headers['x-real-ip'] ||
                request.headers['x-forwarded-for'] ||
                request.info.remoteAddress
            )
        }
        server.method('getIP', getIP, {})
    },
    name: 'auth',
    version: '1.0.0',
}

export default plugin
