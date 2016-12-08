const builder = require("botbuilder"),
      dotenv = require("dotenv"),
      treehouse = require("./treehouse-client");

// load environment variables in the .env file
dotenv.load();

const LUISUrl = process.env.LUIS_URL;
let recognizer = new builder.LuisRecognizer(LUISUrl);

const createCard = (session, profile) => {
    let text = "JavaScript Points: " + profile.points.JavaScript;
    let card = new builder.HeroCard(session);
    card.title(profile.name);
    card.images([builder.CardImage.create(session, profile.gravatar_url)]);
    card.text(text);
    card.buttons([builder.CardAction.openUrl(session, profile.profile_url, "See Profile")]);
    return card;
};

let confirmUser = (session, args, next) => {
    session.dialogData.entities = args.entities;
    let username = builder.EntityRecognizer.findEntity(args.entities, "User");
    if (username) {
        next({ response: username.entity });
    } else {
        builder.Prompts.text(session, "Could you please tell me who you are searching for?");
    }
};

let showProfile = (session, result) => {
    if (!result.response) {
        session.endDialog(`No profile found for ${result.response}`);
    } else {
        treehouse.getProfile(result.response, profile => {
            if(profile.errorMessage) {
                session.endDialog(`No profile found for ${result.response}`);
            } else{
                let card = createCard(session, profile);
                let message = new builder.Message(session).attachments([card]);
                session.send(message);
            }
        });
    }
};

let dialog = new builder.IntentDialog({ recognizers: [recognizer] });

dialog.matches(/^(hi|hello)/i, session => {
    session.endDialog("Hi there! I'm here to help you. Please, type search and the username you are looking for");
});
dialog.matches("SearchProfile", [ confirmUser, showProfile ]);
dialog.onDefault(builder.DialogAction.send("Sorry I didn't understand you. Please, type search and the username you are looking for"));

module.exports = dialog;