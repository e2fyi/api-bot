const request = require('request');
const ev = require('safe-eval');
const d3 = require('d3-format');

/**
 * Class to generate the functions to transform response body into rendered
 * outputs to various bots.
 * @alias module:ApiBot.Renderer
 */
class Renderer {
  /**
   * Create a new Renderer.
   * @param {String} cmd
   * @param {Object} config
   */
  constructor(cmd, config) {
    this.cmd = cmd;
    this.config = config;
    this.fn = {
      url: this._getUrl(config),
      text: this._renderText(config)
    };
  }

  parseResponse(job, body) {
    if (
      this.config.response &&
      this.config.response.type.toLowerCase() === 'text'
    ) {
      job.body = body.length > 0 && body;
      job.error = body.length === 0 ? 'API return nothing' : job.error;
    } else {
      try {
        job.body = JSON.parse(body);
      } catch (error) {
        job.error = error;
        console.error({body, error});
      }
    }
    return job.body && !job.error;
  }

  query(job) {
    return new Promise((resolve, reject) => {
      var method = this.config.method || 'get';
      request({method, url: job.url}, (error, response, body) => {
        if (error) reject(error);
        else {
          if (this.parseResponse(job, body)) resolve(job);
          else reject(job.error);
        }
      });
    });
  }

  render(job) {
    return new Promise((resolve, reject) => {
      try {
        var body = job.body;
        var args = job.args;
        job.text = Array.isArray(body)
          ? body.map(o => this.fn.text(args, this.formatBody(o))).join('\n\n')
          : this.fn.text(args, this.formatBody(body));
        resolve(job);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  get format() {
    return this.config.response && this.config.response.format;
  }

  formatBody(job) {
    if (!this.format) return job;
    var format = this.format;
    if (Array.isArray(job.body)) {
      job.body = job.body.map(_formatEntry);
    } else {
      job.body = _formatEntry(job.body);
    }
    return job;

    function _formatEntry(item) {
      // apply on text body
      if (typeof format === 'string' && typeof item === 'string') {
        return d3.format(format)(item);
      }
      // return raw string
      if (typeof item === 'string') return item;
      // apply on json Object
      for (let key in format) {
        if (item[key]) item[key] = d3.format(format[key])(item[key]);
      }
      return item;
    }
  }

  getArgs(tokens) {
    var config = this.config;
    var args = Object.create(null);
    Array.isArray(config.args) &&
      config.args.forEach((key, i) => {
        args[key] = tokens[i];
      });
    return args;
  }

  _getUrl(config) {
    config = config || this.config;
    try {
      return ev('function(args) { return `' + config.url + '`;};');
    } catch (err) {
      console.error(err.stack);
    }
    return () => 'renderer error';
  }

  _renderText(config) {
    config = config || this.config;
    try {
      return ev('function(args, body) { return `' + config.text + '`;};');
    } catch (err) {
      console.error(err.stack);
    }
    return () => 'renderer error';
  }
}

/**
 * Class to hold the current list of cmd/renderer.
 * @alias module:ApiBot.RendererMap
 */
class RendererMap {
  constructor(map) {
    var cmdMap = Object.create(null);
    for (let key in map) {
      cmdMap[key] = new Renderer(key, map[key]);
    }
    this.map = cmdMap;
  }

  /**
   * Add a new Renderer.
   * @param {String} key
   * @param {Object} config
   */
  add(key, config) {
    this.map[key] = new Renderer(key, config);
  }
  /**
   * Retrieve the renderer.
   * @param {String} cmd
   * @return {Renderer}
   */
  getRenderer(cmd) {
    return this.map[cmd];
  }
}

module.exports = {Renderer, RendererMap};
