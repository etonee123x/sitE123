import chai from 'chai';
import chaiHttp from 'chai-http';
import assert from 'assert';

import { app } from '@/app';
import { envVarToBoolean } from '@/utils';

// TODO resolve mocha aliases
import { ROUTE } from '@includes/types';

chai.use(chaiHttp);
const should = chai.should();

process.env.IS_TESTING = 'true';

context('UNIT', () => {
  context('utils', () => {
    describe('envVarToBoolean', () => {
      before(() => {
        process.env.TEST_TRUE = 'true';
        process.env.TEST_TRUE_IN_UPPER_CASE = 'TRUE';
        process.env.TEST_FALSE = 'false';
      });
      after(() => {
        delete process.env.TEST_TRUE;
        delete process.env.TEST_TRUE_IN_UPPER_CASE;
        delete process.env.TEST_FALSE;
      });

      it('returns "true" when env variable is "\'true\'"', () => {
        assert.strictEqual(envVarToBoolean(process.env.TEST_TRUE), true);
      });

      it('returns "true" when env variable is "\'TRUE\'"', () => {
        assert.strictEqual(envVarToBoolean(process.env.TEST_TRUE_IN_UPPER_CASE), true);
      });

      it('returns "false" when env variable is "\'false\'"', () => {
        assert.strictEqual(envVarToBoolean(process.env.TEST_FALSE), false);
      });

      it('returns "false" when env variable is "\'undefined\'"', () => {
        assert.strictEqual(envVarToBoolean(process.env[String(Date.now())]), false);
      });
    });
  });
});

context('INTEGRATION', () => {
  let requester: ChaiHttp.Agent;

  before(() => {
    requester = chai.request(app).keepOpen();
  });

  after(() => {
    requester.close();
  });

  describe(`/GET ${ROUTE.FUNNY_ANIMALS}`, () => {
    it(`it should get ${ROUTE.FUNNY_ANIMALS}`, (done) => {
      requester.get(ROUTE.FUNNY_ANIMALS).then((res) => {
        res.should.have.status(200);
        done();
      });
    });
  });

  describe(`/GET ${ROUTE.HAPPY_NORMING}`, () => {
    it(`it should get ${ROUTE.HAPPY_NORMING} without any query`, (done) => {
      requester.get(ROUTE.HAPPY_NORMING).then((res) => {
        res.should.have.status(200);
        done();
      });
    });

    it(`it should get ${ROUTE.HAPPY_NORMING}?dotw=0`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=0`).then((res) => {
        res.should.have.status(200);
        done();
      });
    });

    it(`it should get ${ROUTE.HAPPY_NORMING}?dotw=6`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=6`).then((res) => {
        res.should.have.status(200);
        done();
      });
    });

    it(`it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=7`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=7`).then((res) => {
        res.should.have.status(400);
        done();
      });
    });

    it(`it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=-1`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=-1`).then((res) => {
        res.should.have.status(400);
        done();
      });
    });

    it(`it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=1.5`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=1.5`).then((res) => {
        res.should.have.status(400);
        done();
      });
    });

    it(`it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=01`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=01`).then((res) => {
        res.should.have.status(400);
        done();
      });
    });

    it(`it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=a`, (done) => {
      requester.get(`${ROUTE.HAPPY_NORMING}?dotw=a`).then((res) => {
        res.should.have.status(400);
        done();
      });
    });
  });

  describe(`/GET ${ROUTE.GET_FOLDER_DATA}`, () => {
    it(`it should get ${ROUTE.GET_FOLDER_DATA}`, (done) => {
      requester.get(ROUTE.GET_FOLDER_DATA).then((res) => {
        res.should.have.status(200);
        done();
      });
    });
  });
});
