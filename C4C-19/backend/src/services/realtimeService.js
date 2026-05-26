const EVENTS = require("../utils/socketEvents");



let ioInstance;



const initializeSocket = (io) => {

  ioInstance = io;

};



const emitEmergencyAlert = (data) => {

  if (ioInstance) {

    ioInstance.emit(
      EVENTS.EMERGENCY_ALERT,
      data
    );

  }

};



const emitNotification = (data) => {

  if (ioInstance) {

    ioInstance.emit(
      EVENTS.NEW_NOTIFICATION,
      data
    );

  }

};



const emitAppointmentUpdate = (data) => {

  if (ioInstance) {

    ioInstance.emit(
      EVENTS.APPOINTMENT_BOOKED,
      data
    );

  }

};



const emitDashboardUpdate = (data) => {

  if (ioInstance) {

    ioInstance.emit(
      EVENTS.DASHBOARD_UPDATE,
      data
    );

  }

};



module.exports = {

  initializeSocket,

  emitEmergencyAlert,

  emitNotification,

  emitAppointmentUpdate,

  emitDashboardUpdate

};