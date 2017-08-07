'use strict';

 /**
  * To deploy, run: grunt deploy --verbose
  * Most helpful references:
  *     http://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html#using-lambda-response-format
  *     https://github.com/awslabs/aws-lex-convo-bot-example/blob/master/index.js
  */

 // --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------
function elicitIntent(sessionAttributes, messageContent) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitIntent',
            message: {
              contentType: 'PlainText',
              content: messageContent
            }
        }
    };
}

// NOTE: Response cards are not currently supported with ElicitIntent dialog action
function elicitIntentWithCard(sessionAttributes, messageContent, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitIntent',
            message: {
              contentType: 'PlainText',
              content: messageContent
            },
            responseCard : responseCard
        }
    };
}
// TODO: Experiment with response cards
// NOTE: Response cards are not currently supported with ElicitIntent dialog action
function elicitIntentWithCardDetails(sessionAttributes, messageContent) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitIntent',
            message: {
              contentType: 'PlainText',
              content: messageContent
            },
            responseCard: {
                version: 1,
                contentType: "application/vnd.amazonaws.card.generic",
                genericAttachments: [
                {
                    title: "What Flavor?",
                    subTitle: "What flavor do you want?",
                    // imageUrl: "Link to image",
                    // attachmentLinkUrl: "Link to attachment",
                    buttons: [
                    {
                        text: "Lemon",
                        value: "lemon"
                    },
                    {
                        text: "Raspberry",
                        value: "raspberry"
                    },
                    {
                        text: "Plain",
                        value: "plain"
                    }
                    ]
                }
                ]
            }
        }
    };
}

// e.g. callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function elicitSlotWithCard(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
            responseCard,
        },
    };
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message,
            responseCard,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

// ---------------- Helper Functions --------------------------------------------------
function buildValidationResult(isValid, violatedSlot, messageContent) {
    if (messageContent == null) {
        return {
            isValid,
            violatedSlot,
        };
    }
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}

// Build a responseCard with a title, subtitle, and an optional set of options which should be displayed as buttons.
function buildResponseCard(title, subTitle, options) {
    let buttons = null;
    if (options != null) {
        buttons = [];
        for (let i = 0; i < Math.min(5, options.length); i++) {
            buttons.push(options[i]);
        }
    }
    return {
        contentType: 'application/vnd.amazonaws.card.generic',
        version: 1,
        genericAttachments: [{
            title,
            subTitle,
            buttons,
        }],
    };
}

 // --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment.
 */
function hello(intentRequest, callback) {
    callback(elicitIntent(intentRequest.sessionAttributes,
        `Hello!`
    ));
}
function search(intentRequest, callback) {

    // If search term is null, ask what they'd like to search for
    if(!intentRequest.currentIntent.slots.AIConcept){
        callback(elicitSlot(
            intentRequest.sessionAttributes, // sessionAttributes
            intentRequest.currentIntent.name, // intentName
            intentRequest.currentIntent.slots, // slots
            'AIConcept', // slotToElicit
            null // message
        ));
    }

    // TODO: If search term is not null and saved item is null, display list of results for user to select.
    if(!intentRequest.currentIntent.slots.Item){
        callback(elicitSlot(
            intentRequest.sessionAttributes, // sessionAttributes
            intentRequest.currentIntent.name, // intentName
            intentRequest.currentIntent.slots, // slots
            'Item', // slotToElicit
            {
              contentType: 'PlainText',
              content: "test"
            }
        ));
    }

    // TODO: if both search term and saved item are there, complete the request.


}


 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;

    // Dispatch to your skill's intent handlers
    if (intentName === 'Hello') {
        return hello(intentRequest, callback);
    }
    if (intentName === 'Search') {
        return search(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        /*
        if (event.bot.name !== 'OrderFlowers') {
             callback('Invalid Bot Name');
        }
        */
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
