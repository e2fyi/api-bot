/**
 * @module
 */
/**
 * Class to wrap the various functions to implement the pipeline.
 * @alias module:ApiBot.Job
 */
class Job {
  /**
   * Create a new Job.
   * @param {BotCmd} botCmd `BotCmd` parsed from the bot message.
   * @param {renderer} renderer The renderer for the botCmd.
   * @param {Bot} dstBot The bot type to response to.
   */
  constructor(botCmd, renderer, dstBot) {
    this._renderer = renderer;
    this._dstBot = dstBot;
    // get the argument map from renderer
    this.args = renderer.getArgs(botCmd.tokens);
    // get the url of the API to request from renderer
    this.url = renderer.fn.url(botCmd.args);
  }

  exec() {
    return this._renderer
      .query(this) // request API
      .then(this._renderer.formatBody.bind(this._renderer)) // format the results
      .then(this._renderer.render.bind(this._renderer)) // transform the results
      .then(this._dstBot.response); // response to target bot
  }
}

/**
 * Class to handle events from any bots.
 * @alias module:ApiBot.ApiBot
 */
class ApiBot {
  /**
   * Creates a new ApiBot instance.
   * @param {BotCmd} BotCmd Type of BotCmd to handle.
   * @param {Bot} SrcBot Type of Bot the event came from.
   * @param {Bot} DstBot Type of Bot to response to.
   */
  constructor(BotCmd, SrcBot, DstBot) {
    this.BotCmd = BotCmd;
    this.SrcBot = SrcBot;
    this.DstBot = DstBot;
  }

  /**
   * Parse the event, transfrom, and response to the pre-defined bot type.
   * @param {Object|String} event Events from the a bot of type defined by `SrcBot`.
   * @param {RendererMap} rendererMap A map of command key and `Renderer` instances.
   * @return {Promise}
   */
  exec(event, rendererMap) {
    var jobs = this.SrcBot.handle(event).map(botrequest => {
      var botCmd = new this.BotCmd(botrequest);
      var renderer = rendererMap.getRenderer(botCmd.cmd);
      return new Job(botCmd, renderer, this.DstBot);
    });

    return Promise.all(jobs.map(j => j.exec()));
  }
}

module.exports = {ApiBot, Job};
