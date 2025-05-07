const userRoutes = require('./user_routes')
const reportRoutes = require('./report_routes');
const commentRoutes = require('./comment_routes');

const express = require('express')

const Router = express.Router()

Router.use('/user', userRoutes);
Router.use('/reports', reportRoutes);
Router.use('/comments', commentRoutes);

module.exports = Router