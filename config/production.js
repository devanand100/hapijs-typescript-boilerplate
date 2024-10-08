module.exports = {
    "appName": "hapi-18-boilerplate",
    "port": 1400,
    "debug": {
        "request": ["error", "info"],
        "log": ["info", "error", "warning"]
    },
    "connections": {
        "db": "mongodb://localhost:27017/hapi18"
    }
}
