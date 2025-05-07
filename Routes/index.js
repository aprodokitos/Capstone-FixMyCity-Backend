const userRoutes = require('./user_routes')
const reportRoutes = require('./report_routes');
const commentRoutes = require('./comment_routes');

const express = require('express')

const Router = express.Router()

Router.use('/user', userRoutes);
Router.use(reportRoutes);
Router.use(commentRoutes);

module.exports = Router