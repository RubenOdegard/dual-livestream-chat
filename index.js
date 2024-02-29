const { interval } = require("./setup.json");

///////////////////////////////////////////////////////////////////////////////
///////////////////////////// TWITCH CHAT /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const {
  connectClient: connectTwitchClient,
  client: twitchClient,
} = require("./twitch-chat/index.js");

connectTwitchClient();

twitchClient.on("message", (channel, tags, message) => {
  handleMessageTwitch(tags["display-name"], message, "Twitch");
});

async function handleMessageTwitch(displayName, messageText) {
  const chalk = (await import("chalk")).default;
  const formattedMessage = `${chalk.blue(displayName)}: ${messageText}`;
  console.log(formattedMessage);
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////// YOUTUBE CHAT /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const {} = require("./youtube-chat/livechat.js");

async function fetchYoutubeMessages() {
  const { getLiveChatMessages } = require("./youtube-chat/livechat.js");

  getLiveChatMessages(async (channelName, messageText) => {
    await handleMessageYoutube(channelName, messageText);
  });
}

async function handleMessageYoutube(channelName, messageText) {
  const chalk = (await import("chalk")).default;
  const formattedMessage = `${chalk.red(channelName)}: ${messageText}`;
  console.log(formattedMessage);
}

fetchYoutubeMessages();
setInterval(fetchYoutubeMessages, interval);
