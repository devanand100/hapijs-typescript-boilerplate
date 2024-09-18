import { Server, Plugin, Request, ResponseToolkit } from '@hapi/hapi';
// Never take constants here
const plugin: Plugin<any> = {
  async register(server, options) {
    const API = (await import('Api/auth.api')).default
    server.route([
      {
        method: 'POST',
        path: '/login',
        options: {
          plugins: {
            policies: ['log.policy'],
          },
          tags: ['api', 'Authentication'],
          description: 'Login',
          notes: 'Login',
          validate: API.login.validate,
          pre: API.login.pre,
          handler: API.login.handler,
        },
      },
      {
        method: 'POST',
        path: '/signup',
        options: {
          plugins: {
            policies: ['log.policy'],
          },
          tags: ['api', 'Authentication'],
          description: 'Signup',
          notes: 'Signup',
          validate: API.signup.validate,
          pre: API.signup.pre,
          handler: API.signup.handler,
        },
      },
      {
        method: 'GET',
        path: '/me',
        options: {
          auth: 'auth',
          plugins: {
            policies: [],
            'hapi-swagger': {
              security: [
                {
                  ApiKeyAuth: [],
                },
              ],
            },
          },
          tags: ['api', 'Authentication'],
          description: 'me',
          notes: 'me',
          validate: API.me.validate,
          pre: API.me.pre,
          handler: API.me.handler,
        },
      },
    ]);
  },
  version: '1.0.0',
  name: 'auth-routes',

};

export default plugin