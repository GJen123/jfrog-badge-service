#!/usr/bin/env node

// @<COPYRIGHT>@
// ==================================================
// Copyright 2020.
// Siemens Product Lifecycle Management Software Inc.
// All Rights Reserved.
// ==================================================
// @<COPYRIGHT>@

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const badgeRoute = require('./src/badgeRoute');
const rootRoute = require('./src/rootRoute');
const notFoundRoute = require('./src/notFoundRoute');

const app = express();

const credentials = {
    key: fs.readFileSync('certificate/private.pem', 'utf8'), 
    cert: fs.readFileSync('certificate/ca.cer', 'utf8')
};

let port = 4010;
if(process.argv.PORT) {
    port = process.argv.PORT;
}else if(process.env.PORT) {
    port = process.env.PORT;
}

app.use('/:scope/:package/:tag', badgeRoute);
app.use('/:scope/:package', badgeRoute);
app.use('/:scope', badgeRoute);
app.use('/', rootRoute);
app.use('/*', notFoundRoute);

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(port, () => {
    console.log('Service listening on port', port);
});