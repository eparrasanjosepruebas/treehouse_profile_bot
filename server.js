const builder = require("botbuilder"),
      restify = require("restify"),
      dotenv = require("dotenv"),
      treehouse = require("./treehouse-client");

// load environment variables in the .env file
dotenv.load();

let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
let bot = new builder.UniversalBot(connector);

const LUISUrl = process.env.LUIS_URL;
let recognizer = new builder.LuisRecognizer(LUISUrl);

let dialog = new builder.IntentDialog({
    recognizers: [recognizer]
});


let confirmUser = (session, args, next) => {
    session.dialogData.entities = args.entities;
    let username = builder.EntityRecognizer.findEntity(args.entities, "User");
    if (username) {
        next({ response: username.entity });
    } else {
        builder.Prompts.text(session, "Who you are searching for?");
    }
};

let showProfile = (session, result) => {
    if (!result.response) {
        session.endDialog("No profile found!");
    } else {
        treehouse.getProfile(result.response, profile => {
            let text = "JavaScript Points: " + profile.points.JavaScript;
            let card = new builder.HeroCard(session);
            card.title(profile.name);
            card.images([builder.CardImage.create(session, profile.gravatar_url)]);
            card.text(text);
            card.buttons([builder.CardAction.openUrl(session, profile.profile_url, "See Profile")]);
            let message = new builder.Message(session).attachments([card]);
            session.send(message);
        });
    }
};


dialog.matches("SearchProfile", [ confirmUser, showProfile ]);

dialog.onDefault(builder.DialogAction.send("Please, type search and the username you are looking for"));

bot.dialog("/", dialog);

let server = restify.createServer();
server.post("/api/messages", connector.listen());
server.listen(process.env.port || process.env.port || 3978, () => {
    console.log("%s listening at %s", server.name, server.port);
});

