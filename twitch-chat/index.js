const tmi = require("tmi.js");

const { twitch } = require("../setup.json");

const client = new tmi.Client({
  channels: twitch.channels,
});

function connectClient() {
  client.connect();
}

module.exports = { connectClient, client };
