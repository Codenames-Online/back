"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
// about as naive a command line parsing as possible
let args = process.argv;
let port = args.length === 3 ? args[2] : 3000;
Server_1.default.listen(port, () => { console.log(`Listening on port ${port}`); });
