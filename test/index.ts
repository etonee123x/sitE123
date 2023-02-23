import chai from 'chai';
import chaiHttp from 'chai-http';

import { app } from '../src/app.js';

import { ROUTE } from '../includes/types/index.js';

chai.use(chaiHttp);
const should = chai.should();

process.env.IS_TESTING = 'true';

let requester: ChaiHttp.Agent;

before(() => {
  requester = chai.request(app).keepOpen();
});

after(() => {
  requester.close();
});

describe('/GET main', () => {
  it('it should GET main', (done) => {
    requester.get('/').then((res) => {
      res.should.have.status(200);
      done();
    });
  });
});

describe(`/GET ${ROUTE.HAPPY_NORMING}`, () => {
  it('it should GET happy norming without any query', (done) => {
    requester.get(ROUTE.HAPPY_NORMING).then((res) => {
      res.should.have.status(200);
      done();
    });
  });

  it('it should GET happy norming dotw = "0"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=0`).then((res) => {
      res.should.have.status(200);
      done();
    });
  });

  it('it should GET happy norming dotw = "6"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=6`).then((res) => {
      res.should.have.status(200);
      done();
    });
  });

  it('it should NOT GET happy norming dotw = "7"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=7`).then((res) => {
      res.should.have.status(400);
      done();
    });
  });

  it('it should NOT GET happy norming dotw = "-1"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=-1`).then((res) => {
      res.should.have.status(400);
      done();
    });
  });

  it('it should NOT GET happy norming dotw = "1.5"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=1.5`).then((res) => {
      res.should.have.status(400);
      done();
    });
  });

  it('it should NOT GET happy norming dotw = "01"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=01`).then((res) => {
      res.should.have.status(400);
      done();
    });
  });

  it('it should NOT GET happy norming dotw = "a"', (done) => {
    requester.get(`${ROUTE.HAPPY_NORMING}?dotw=a`).then((res) => {
      res.should.have.status(400);
      done();
    });
  });
});
