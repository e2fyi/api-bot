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
  country: {
    cmd: '/country',
    args: ['name'],
    method: 'get',
    description: 'Get country general information',
    url: 'https://restcountries.eu/rest/v2/name/${args.name}',
    text:
      '${body.name} can be found in ${body.region}, ${body.subregion}. ${body.name} has a population of ${body.population}.',
    response: {
      type: 'json',
      format: {
        population: ',d'
      }
    }
  }
};

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

/*
describe('Renderer', function() {
  var renderer = new Renderer(sampleConfig.cmd, sampleConfig);

  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, renderer.fn.url());
    });
  });
});
*/
