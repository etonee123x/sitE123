import { describe, expect, test, beforeAll } from '@jest/globals';
import request from 'supertest';

import { app } from '@/app';

import { HANDLER_NAME } from '@includes/types';
import { HANDLER_NAME_TO_ROUTE, PROCESS_MODE } from '@/constants';

beforeAll(() => {
  process.env.MODE = PROCESS_MODE.TEST;
});

describe(`/GET ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS]}`, () => {
  test(
    `it should get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS]}`,
    () => request(app).get(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS]).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );
});

describe(`/GET ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}`, () => {
  test(
    `it should get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]} without any query`,
    () => request(app).get(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=0`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=0`).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=6`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=6`).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should NOT get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=7`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=7`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=-1`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=-1`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=1.5`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=1.5`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=01`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=01`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=a`,
    () => request(app).get(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]}?dotw=a`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );
});
