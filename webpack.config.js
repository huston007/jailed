var path = require('path');

module.exports = {
    entry: {
        _frame: "./lib/_frame",
        jailed: "./lib/jailed"
    },
    output: {
        path: __dirname + "/dist/web",
        filename: "[name].js"
    }
};