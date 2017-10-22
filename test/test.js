const assert = require('assert');
const {ApiBot, Job, Renderer, RendererMap, BotCmd, Fb} = require('../index.js');

const fbevent = {
  object: 'page',
  entry: [
    {
      id: 'PAGE_ID',
      time: 1458692752478,
      messaging: [
        {
          sender: {
            id: '<PSID1>'
          },
          recipient: {
            id: '<PAGE_ID1>'
          },
          timestamp: 1458692752478,
          message: {
            mid: 'mid.1457764197618:41d102a3e1ae206a38',
            text: '/country Singapore',
            quick_reply: {
              payload: '<DEVELOPER_DEFINED_PAYLOAD>'
            }
          }
        },
        {
          sender: {
            id: '<PSID2>'
          },
          recipient: {
            id: '<PAGE_ID2>'
          },
          timestamp: 1458692752478,
          message: {
            mid: 'mid.1458696618141:b4ef9d19ec21086067',
            attachments: [
              {
                type: 'image',
                payload: {
                  url: '<IMAGE_URL>'
                }
              }
            ]
          }
        }
      ]
    }
  ]
};
const sampleConfig = {
  cmd: '/country',
  args: ['name'],
  method: 'get',
  description: 'Get country general information',
  url: 'https://restcountries.eu/rest/v2/name/${args.name}',
  text:
    '${body.name} can be found in ${body.subregion}. ${body.name} has a population of ${body.population}.',
  response: {
    type: 'json',
    format: {
      population: ',d'
    }
  }
};

/**
 * Fb.Request
 */
describe('Fb.Request', function() {
  var fbrequests = Fb.Request.process(fbevent);

  describe('Fb.Request.process', function() {
    it('Should return 2', function() {
      assert.equal(2, fbrequests.length);
    });
  });

  describe('Fb.Request.uid for 1st entry', function() {
    it('Should return <PSID1>', function() {
      assert.equal('<PSID1>', fbrequests[0].uid);
    });
  });

  describe('Fb.Request.text for 1st entry', function() {
    it('Should return "/country Singapore"', function() {
      assert.equal('/country Singapore', fbrequests[0].text);
    });
  });

  describe('Fb.Request.uid for 2nd entry', function() {
    it('Should return <PSID2>', function() {
      assert.equal('<PSID2>', fbrequests[1].uid);
    });
  });

  describe('Fb.Request.text for 2nd entry', function() {
    it('Should return undefined', function() {
      assert.equal(undefined, fbrequests[1].text);
    });
  });
});

/**
 * BotCmd
 */
describe('BotCmd.SlashCmd', function() {
  var fbrequest = Fb.Request.process(fbevent)[0];
  var slashcmd = new BotCmd.SlashCmd(fbrequest);

  describe('SlashCmd.cmd', function() {
    it('Should return /country', function() {
      assert.equal('/country', slashcmd.cmd);
    });
  });

  describe('SlashCmd.tokens', function() {
    it('Should return ["Singapore"]', function() {
      assert.deepEqual(['Singapore'], slashcmd.tokens);
    });
  });
});

/**
 * Renderer
 */
describe('Renderer', function() {
  var renderer = new Renderer(sampleConfig.cmd, sampleConfig);

  describe('Renderer.getArgs', function() {
    it('should return {"name": "Singapore"} when input is ["Singapore"]', function() {
      assert.deepEqual({name: 'Singapore'}, renderer.getArgs(['Singapore']));
    });
  });

  describe('Renderer.fn.url', function() {
    it('should return "https://restcountries.eu/rest/v2/name/Singapore"', function() {
      assert.deepEqual(
        'https://restcountries.eu/rest/v2/name/Singapore',
        renderer.fn.url({name: 'Singapore'})
      );
    });
  });

  describe('Renderer.fn.text', function() {
    it('should return "Singapore can be found in ASEAN. Singapore has a population of 50000000."', function() {
      assert.deepEqual(
        'Singapore can be found in ASEAN. Singapore has a population of 50000000.',
        renderer.fn.text(
          {name: 'Singapore'},
          {name: 'Singapore', subregion: 'ASEAN', population: 50000000}
        )
      );
    });
  });
});


/**
 * Job

describe('Job', function() {
  var fbrequest = Fb.Request.process(fbevent)[0];
  var slashcmd = new BotCmd.SlashCmd(fbrequest);
  var renderer = new Renderer(sampleConfig.cmd, sampleConfig);
  var job = new Job(slashcmd, renderer, Fb.Bot);

  describe('Renderer.fn.text', function() {
    it('should return "Singapore can be found in ASEAN. Singapore has a population of 50000000."', function() {

    });
  });

});
 */
