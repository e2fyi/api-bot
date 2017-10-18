/**
 * Module for handling messages from bot.
 * @module
 * @example const BotCmd = require('api-bot').BotCmd;
 */

/**
  * Base class to parse message string into commands and arguments.
  * @alias module:BotCmd.BaseCmd
  * @property {Object} payload payload from bot.
  * @property {String} text text message from the payload.
  * @property {String} cmd Command string.
  * @property {String[]} tokens Argument tokens.
  */
class BaseCmd {
  /**
    * Create a new BaseCmd instance.
    * @param {BotRequest} botrequest payload from bot.
    */
  constructor(botrequest) {
    this._state = {botrequest};
  }

  /** @return {String} text message from the payload */
  get text() {
    return this._state.botrequest.text;
  }

  /** @return {Object} cmd Command string. */
  get cmd() {
    return this._state.cmd;
  }

  /** @return {String[]} tokens Argument tokens. */
  get tokens() {
    return this._state.tokens;
  }
  /*
   * Function to update the internal state.
   * @param {String} key
   * @param {Any} value
   * @return {BaseCmd} reference to itself
   */
  setState(key, value) {
    this._state[key] = value;
    return this;
  }
}

/**
 * Class to extract a slash command string (i.e. `/hello`) and the argument tokens from a text message.
 * @alias module:BotCmd.SlashCmd
 * @extends BaseCmd
 */
class SlashCmd extends BaseCmd {
  /**
    * Create a new SlashCmd instance.
    * @param {BotRequest} botrequest payload from bot.
    */
  constructor(botrequest) {
    super(botrequest);
    if (!this.text) return;
    var tokens = this.text.trim().split(/ +/g);
    if (tokens.length === 0) return;
    var cmd = tokens
      .shift()
      .trim()
      .toLowerCase();
    if (cmd && cmd.length > 0) {
      this.setState('tokens', tokens);
      this.setState('cmd', cmd);
    }
  }
}

module.exports = {BaseCmd, SlashCmd};
