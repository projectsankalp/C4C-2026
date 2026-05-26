const axios = require("axios");

const vapi = axios.create({
  baseURL: "https://api.vapi.ai",
  headers: {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    "Content-Type": "application/json"
  }
});

module.exports = vapi;