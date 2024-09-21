import Glue from '@hapi/glue'
import { manifest } from './config/manifest'
import mongoPlugin from './server/plugins/mongoose.plugin'
import config from 'config'

// this is the line we mention in manifest.js
// relativeTo parameter should be defined here
const options = {
    relativeTo: __dirname,
}

// Start server
const startServer = async () => {
    try {
        const server = await Glue.compose(manifest, options)
        await server.register({
            plugin: mongoPlugin,
            options: {
                connections: config.get('connections'),
            },
        })

        server.ext('onPreHandler', (request, h) => {
            console.log(`Incoming request: ${request.method.toUpperCase()} ${request.path}`);
            return h.continue;
        });

        await server.start()
        console.log(`Server listening on ${server.info.uri}`)
    } catch (err) {
        console.log('err: ', err)
        console.error(err)
        process.exit(1)
    }
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

startServer()
