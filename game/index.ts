import server from './Server'

// about as naive a command line parsing as possible
let args = process.argv
let port = args.length === 3 ? args[2] : 8000;

server.listen(port, () => { console.log(`Listening on port ${port}`) });