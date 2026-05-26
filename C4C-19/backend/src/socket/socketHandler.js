const EVENTS = require("../utils/socketEvents");



const socketHandler = (io) => {

  io.on(EVENTS.CONNECTION, (socket) => {

    console.log(`Socket Connected: ${socket.id}`);



    socket.on(EVENTS.DISCONNECT, () => {

      console.log(
        `Socket Disconnected: ${socket.id}`
      );

    });

  });

};

module.exports = socketHandler;