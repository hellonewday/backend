const http = require('http');
const port = process.env.port || 8888;
const app = require('./app');


const server = http.createServer(app);
server.listen(port,()=>{
     console.log('Listening on port 8888');
});