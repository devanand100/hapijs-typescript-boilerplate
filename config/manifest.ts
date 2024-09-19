import * as dotenv from 'dotenv'
dotenv.config()
import config from 'config'

const DEVELOPMENT = 'development'
const PRODUCTION = 'production'

// REF: https://github.com/z0mt3c/hapi-swaggered , https://github.com/z0mt3c/hapi-swaggered-ui
let swaggerOptions: any = {
    info: {
        title: 'Hapi-18-boilerplate',
        version: require('../package.json').version,
    },
    basePath: '/v1',
    documentationPath: '/docs',
    expanded: 'none',
    tags: [],
    grouping: 'tags',
    securityDefinitions: {
        ApiKeyAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
        },
    },
}

const DEFAULT = 'default'

let plugins: PluginConfig[] = [
    {
        plugin: '@hapi/inert',
    },
]
const ENV = config.util.getEnv('NODE_ENV').trim()

if (ENV !== DEFAULT) {
    // swaggerOptions.schemes = ['https', 'http'];
    // swaggerOptions.host = 'productionurl.com';
    // mongoose.set('debug', true);
}
if (ENV !== PRODUCTION) {
    plugins = plugins.concat([
        {
            plugin: '@hapi/vision',
        },
        {
            plugin: 'hapi-swagger',
            options: swaggerOptions,
        },
        {
            plugin: 'hapi-dev-errors',
            options: {
                showErrors: process.env.NODE_ENV !== 'production',
                toTerminal: true,
            },
        },
    ])
}
plugins = plugins.concat([
    {
        plugin: 'hapi-auth-jwt2',
    },
    {
        plugin: '@hapi/basic',
    },
    {
        // if you need authentication then uncomment this plugin, and remove "auth: false" below
        plugin: 'Plugins/auth.plugin',
    },
    {
        plugin: 'Routes/root.route',
    },
])

const routesOb: RouteConfig = {
    'auth.route': 'auth',
}

const routes = Object.keys(routesOb)

routes.forEach((r) => {
    plugins = plugins.concat([
        {
            plugin: `Routes/${r}`,
            routes: {
                prefix: `/v1${routesOb[r] ? `/${routesOb[r]}` : ``}`,
            },
        },
    ])
})

export const manifest: any = {
    server: {
        router: {
            stripTrailingSlash: true,
            isCaseSensitive: false,
        },
        routes: {
            security: {
                hsts: false,
                xss: 'enabled',
                noOpen: true,
                noSniff: true,
                xframe: false,
            },
            cors: {
                origin: ['*'],
                // ref: https://github.com/hapijs/hapi/issues/2986
                headers: ['Accept', 'Authorization', 'Content-Type'],
            },
            // validate: {
            //   failAction: async (request, h, err) => {
            //     request.server.log(
            //       ['validation', 'error'],
            //       'Joi throw validation error',
            //     );
            //     throw err;
            //   },
            // },
            auth: false, // remove this to enable authentication or set your authentication profile ie. auth: 'jwt'
        },
        debug: config.get('debug'),
        port: config.get('port'),
    },
    register: {
        plugins,
    },
}

interface PluginOptions {
    [key: string]: any
}

interface RouteConfig {
    [key: string]: any
}

interface PluginConfig {
    plugin: string
    options?: PluginOptions
    routes?: RouteConfig
}
