 module.exports =  {
    "appName": "hapi-18-boilerplate",
    "port": 1400,
    "debug": {
        "request": ["error", "info"],
        "log": ["info", "error", "warning"]
    },
    "constants": {
        "DEFAULT_COUNTRY": "US",
        "DEFAULT_TIMEZONE": "America/New_York",
        "ROLES": {
            "ADMIN": "admin",
            "USER": "user"
        },
        "EXPIRATION_PERIOD": "730h",
        "JWT_SECRET": "jwtsecret"
    },
    "connections": {
        "db": "mongodb://127.0.0.1:27017/levelAuth"
    }
}
