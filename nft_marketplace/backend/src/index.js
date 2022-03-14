const server = require("./socket").server;
const {getBlockNumber, getData, AuctionTimeout_monitor} =  require("./web3events");

const port = process.env.PORT || 5000;

// app.listen(port, () => {
//   console.log(`Listening: http://localhost:${port}`);
// });

getBlockNumber();

getData();

AuctionTimeout_monitor();

server.listen(port, () => console.log(`Listening on port ${port}..`));
