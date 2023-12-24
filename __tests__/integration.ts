import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { app } from '@/app';

import { ROUTE } from '@includes/types';

describe(`/GET ${ROUTE.FUNNY_ANIMALS}`, () => {
  test(
    `it should get ${ROUTE.FUNNY_ANIMALS}`,
    () => request(app).get(ROUTE.FUNNY_ANIMALS).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );
});

describe(`/GET ${ROUTE.HAPPY_NORMING}`, () => {
  test(
    `it should get ${ROUTE.HAPPY_NORMING} without any query`,
    () => request(app).get(ROUTE.HAPPY_NORMING).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should get ${ROUTE.HAPPY_NORMING}?dotw=0`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=0`).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should get ${ROUTE.HAPPY_NORMING}?dotw=6`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=6`).then((res) => {
      expect(res.statusCode).toBe(200);
    }),
  );

  test(
    `it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=7`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=7`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=-1`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=-1`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=1.5`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=1.5`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=01`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=01`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );

  test(
    `it should NOT get ${ROUTE.HAPPY_NORMING}?dotw=a`,
    () => request(app).get(`${ROUTE.HAPPY_NORMING}?dotw=a`).then((res) => {
      expect(res.statusCode).toBe(400);
    }),
  );
});
