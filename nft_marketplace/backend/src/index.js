const server = require("./socket").server;
const {
    CreateSale_monitor,
    DestroySale_monitor,
    PlaceBid_monitor,
    AcceptBid_monitor,
    BuyNow_monitor,
    EndBid_monitor
} = require("./web3events");

const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Listening: http://localhost:${port}`);
// });


server.listen(port, () => console.log(`Listening on port ${port}..`));

// CreateSale_monitor();

// DestroySale_monitor();

// PlaceBid_monitor();

// AcceptBid_monitor();

// BuyNow_monitor();

// EndBid_monitor();