const fs = require("fs");
const fetch = require("node-fetch");
const { youtube } = require("../setup.json");

const apiKey = youtube.api_key;
const liveChatId = youtube.live_chat_id;

let previousMessageIds = new Set();
let currentMessageIds = new Set();
let apiCallInProgress = false;
let delay = 0;
let channelCache = {};

async function getLiveChatMessages(handleMessage) {
  if (apiCallInProgress) {
    return;
  }

  try {
    apiCallInProgress = true;
    delay = 0;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet&liveChatId=${liveChatId}&maxResults=200&key=${apiKey}`,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      currentMessageIds.clear();
      for (const item of data.items) {
        const messageId = item.id;
        const authorChannelId = item.snippet.authorChannelId;
        const messageText = item.snippet.displayMessage;
        const channelName = await getChannelName(authorChannelId);
        currentMessageIds.add(messageId);
        if (!previousMessageIds.has(messageId)) {
          setTimeout(() => {
            handleMessage(channelName, messageText);
          }, delay);
          delay += 500;
        }
      }
    }

    previousMessageIds = new Set(currentMessageIds);
  } catch (error) {
    console.error("Error fetching live chat messages:", error);
  } finally {
    apiCallInProgress = false;
  }
}

async function getChannelName(authorChannelId) {
  if (channelCache[authorChannelId]) {
    return channelCache[authorChannelId];
  } else {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${authorChannelId}&key=${apiKey}`,
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const channelName = data.items[0].snippet.title;
        channelCache[authorChannelId] = channelName;
        writeChannelCacheToFile();
        return channelName;
      } else {
        return "Unknown";
      }
    } catch (error) {
      console.error("Error fetching channel details:", error);
      return "Unknown";
    }
  }
}

function writeChannelCacheToFile() {
  fs.writeFile(
    "channelCache.json",
    JSON.stringify(channelCache, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing channel cache to file:", err);
      } else {
        return;
      }
    },
  );
}

try {
  if (fs.existsSync("channelCache.json")) {
    const channelCacheData = fs.readFileSync("channelCache.json");
    channelCache = JSON.parse(channelCacheData);
  }
} catch (err) {
  console.error("Error loading channel cache from file:", err);
}

module.exports = { getLiveChatMessages, getChannelName };
