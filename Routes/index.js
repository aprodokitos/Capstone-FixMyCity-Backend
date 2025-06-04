const userRoutes = require("./user_routes");
const reportRoutes = require("./report_routes");
const commentRoutes = require("./comment_routes");
const inputsearchController = require("./inputsearch_router");

const express = require("express");

const Router = express.Router();

Router.use(inputsearchController);
Router.use(userRoutes);
Router.use(reportRoutes);
Router.use(commentRoutes);

module.exports = Router;
