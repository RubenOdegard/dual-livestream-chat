const secret = require("../setup.json");
const fetch = require("node-fetch");

var arguments = process.argv;

let comments = [];

async function getChatId(id) {
  try {
    var res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&key=${secret.youtube.api_key}&id=${id}`,
    );

    var data = await res.json();

    if (!data.error) {
      if (!data.items.length == 0) {
        let livechatid = data.items[0].liveStreamingDetails.activeLiveChatId;
        console.log(livechatid);
        getChatMessages(data.items[0].liveStreamingDetails.displayMessage);
      } else {
        let error = "LiveStream not found.";
        throw error;
      }
    } else {
      let error = data.error.code + ": " + data.error.errors[0].reason;
      throw error;
    }
  } catch (error) {
    console.log("Oops! " + error);
  }
}

async function getChatMessages(chatid) {
  try {
    var res = await fetch(
      `https://www.googleapis.com/youtube/v3/liveChat/messages?part=id%2C%20snippet&key=${secret.youtube.api_Key}&liveChatId=${chatid}`,
    );

    var data = await res.json();

    if (!data.error) {
      if (!data.items.length == 0) {
        data.items.forEach((comment) => {
          if (!comments.includes(comment.id)) {
            comments.push(comment.id);
            console.log("<Youtube>" + comment.snippet.displayMessage);
          }
        });
      } else {
        let error = "No messages.";
        throw error;
      }
    } else {
      let error = data.error.code + ": " + data.error.errors[0].reason;
      throw error;
    }
  } catch (error) {
    console.log("Oops! " + error);
  }
}

if (secret.apiKey == "YourAPIKey") {
  console.log("Seems you haven't supplied your API Key yet!");
  return;
}

switch (arguments[2]) {
  case "--id":
    getChatId(arguments[3]);
    break;
  case "--messages":
    setInterval(() => {
      getChatMessages(arguments[3]);
    }, 3000);
    break;
  case "--help":
    console.log(`
Arguments:              Function:

--id [livestreamid]     Prints the LiveChatID for the given Live Stream.
                        The LiveStreamID is found in the URL of the LiveStream:
                        http://www.youtube.com/watch?v=[thisisthelivestreamid].

--messages [livechatid] Prints the chat messages for the given LiveChat.
        `);
    break;
  default:
    console.log(
      "No Valid Argument(s) Passed. Use --help to see valid arguments.",
    );
}
