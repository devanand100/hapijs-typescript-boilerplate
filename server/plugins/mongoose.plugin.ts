'use strict'

import mongoose from 'mongoose'
import Glob from 'glob'

const plugin = {
    name: 'mongoose_connector',
    version: '1.0.0',
    register: async function (server: any, options: any) {
        try {
            await mongoose.connect(options.connections.db)

            mongoose.connection.on('connected', () => {
                console.log('Mongoose connected to the database')
            })

            mongoose.connection.on('error', (err) => {
                console.error('Mongoose connection error:', err)
            })

            await import('../models')

            // If the node process ends, close the mongoose connection
            process.on('SIGINT', async () => {
                try {
                    await mongoose.disconnect()

                    server.log(
                        ['mongoose', 'info'],
                        'Mongo Database disconnected through app termination'
                    )
                } catch (err) {
                    server.log(
                        ['mongoose', 'error'],
                        'Error while disconnecting MongoDB: ' + err
                    )
                }
                process.exit(0)
            })
        } catch (err) {
            server.log(
                ['mongoose', 'error'],
                'Error during MongoDB setup: ' + err
            )
            throw err
        }
    },
}

export default plugin
