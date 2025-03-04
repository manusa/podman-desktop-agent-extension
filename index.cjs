#!/usr/bin/env node

const express = require('express');
const app = express();

app.use(express.static(`${__dirname}/dist/browser`)); // Serves resources from public folder

app.listen(8000);
console.log('Server started, http://localhost:8000/');
