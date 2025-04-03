const userRoutes = require('./user_routes')

const express = require('express')

const Router = express.Router()

Router.use(userRoutes)

module.exports = Router