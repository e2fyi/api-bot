const request = require('request');

/**
 * Module for handling Facebook messenger hooks.
 * @module
 */

/**
 * `attachment` object for response message to Facebook messenger.
 * [details](https://developers.facebook.com/docs/messenger-platform/reference/send-api#attachment)
 * @typedef {Object} Attachment
 * @property {String} type - Type of attachment, may be `image`, `audio`, `video`, `file` or `template`.
 * @property {Any} payload - Payload of attachment.
 */

/**
 * `quick_reply` object for response message to Facebook messenger.
 * [details](https://developers.facebook.com/docs/messenger-platform/reference/send-api#quick_reply)
 * @typedef {Object} QuickReply
 * @property {String} content_type - `text` or `location`.
 * @property {String} title - Caption of button.
 * @property {String|Number} payload - Custom data that will be sent back to you via webhook.
 * @property {String=} image_url - URL of image for text quick replies.
 */

/**
 * `message` object for response message to Facebook messenger.
 * [details](https://developers.facebook.com/docs/messenger-platform/reference/send-api#message)
 * @typedef {Object} Message
 * @property {String} text - Message text. Previews will not be shown for the URLs in this field. Use attachment instead. Must be UTF-8 and has a 640 character limit.
 * @property {Attachment} attachment -attachment object. Previews the URL. Used to send messages with media or Structured Messages.
 * @property {QuickReply[]} quick_replies - Array of quick_reply to be sent with messages.
 * @property {String=} metadata - Custom string that is delivered as a message echo. 1000 character limit.
 */

/**
 * `payload` object for response message to Facebook messenger.
 * @typedef {Object} Recipient
 * @property {String|Number} id id of the Facebook messenger recipient.
 */

/**
 * `payload` object for response message to Facebook messenger.
 * [details](https://developers.facebook.com/docs/messenger-platform/reference/send-api#payload)
 * @typedef {Object} Payload
 * @property {Recipient} recipient Recipient object.
 * @property {Message} message Message object.
 * @property {String} sender_action `typing_on`, `typing_off` or `mark_seen`.
 * @property {String=} notification_type `REGULAR`, `SILENT_PUSH`, `NO_PUSH`. Defaults to `REGULAR`.
 * @property {String=} tag The message tag string. See [Message Tags](https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags).
 */

/**
 * Facebook messenger response payload.
 * @alias module:Fbot.Response
 */
class FbResponse {
  /**
    * Create a new Facebook Payload.
    * @param {BotRequest} botrequest
    * @param {Rendered} rendered
    */
  constructor(botrequest, rendered) {
    this._state = {
      recipient: {id: botrequest.uid},
      message: {
        text: rendered.textRE$
      }
    };
  }

  /** @return {Payload} response payload. */
  get payload() {
    return this._state;
  }
}

/**
 * Facebook messenger payload for each entry.
 * @alias module:Fbot.Request
 */
class FbRequest {
  /**
    * Create a new Facebook Payload.
    * @param {Object} payload A single `entry` in the raw Facebook messager payload.
    */
  constructor(payload) {
    this._state = {payload};
  }

  /** @return {Object} payload. */
  get payload() {
    return this._state.payload;
  }

  /** @return {String|Number} sender/user id. */
  get uid() {
    return this.payload.sender.id;
  }

  /** @return {String} text message. */
  get text() {
    return this.payload.message.text;
  }
  /**
    * Static function to process the raw Facebook payload into an Array of
    * `FbPayloads`. Handles `page` type of payload only.
    * @static
    * @param {Object} raw The raw Facebook payload.
    * @return {FbPayload[]} An array of `FbPayloads`.
    */
  static process(raw) {
    var r = [];
    // Make sure this is a page subscription
    if (raw.object === 'page') {
      raw.entry.forEach(e => {
        e.messaging.forEach(o => r.push(new FbRequest(o)));
      });
    }
    return r;
  }
}
/**
 * Utility class to handle Facebook messenger APIs.
 * @alias module:Fbot.Bot
 */
class Fbot {
  /**
   * Utility class to handle Facebook messenger APIs.
   * @param {Job} job `Job` object after rendering.
   * @return {Promise}
   */
  static response(job) {
    var response = new FbResponse(job);
    return new Promise((resolve, reject) => {
      request(
        {
          uri: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: process.env.FB_TOKEN},
          method: 'POST',
          json: response.payload
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(job);
          } else {
            console.error('Unable to send message.');
            console.error(body);
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Utility class to handle Facebook messenger raw request body.
   * @param {Object} raw raw request body
   * @return {RequestPayload} An array of RequestPayload.
   */
  static handle(raw) {
    try {
      var json = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return FbRequest.process(json);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {Bot: Fbot, Request: FbRequest, Response: FbResponse};
