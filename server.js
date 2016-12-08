const builder = require("botbuilder"),
      restify = require("restify"),
      dotenv = require("dotenv"),
      dialog = require("./dialog");

dotenv.load();

let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let bot = new builder.UniversalBot(connector);

bot.dialog("/", dialog);

let server = restify.createServer();
server.post("/api/messages", connector.listen());
server.listen(process.env.port || process.env.port || 3978, () => {
    console.log("%s listening at %s", server.name, server.url);
});

