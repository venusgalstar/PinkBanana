const server = require("./socket").server;
require("./web3events");


const port = process.env.PORT || 5000;

// app.listen(port, () => {
//   console.log(`Listening: http://localhost:${port}`);
// });

server.listen(port, () => console.log(`Listening on port ${port}..`));
