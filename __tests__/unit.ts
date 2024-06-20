import 'dotenv/config';

import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';

import { envVarToBoolean } from '@/utils/envVarToBoolean';
import { PROCESS_MODE } from '@/constants';

beforeAll(() => {
  process.env.MODE = PROCESS_MODE.TEST;
});

describe('utils', () => {
  describe('envVarToBoolean', () => {
    beforeAll(() => {
      process.env.TEST_TRUE = 'true';
      process.env.TEST_TRUE_IN_UPPER_CASE = 'TRUE';
      process.env.TEST_FALSE = 'false';
    });
    afterAll(() => {
      delete process.env.TEST_TRUE;
      delete process.env.TEST_TRUE_IN_UPPER_CASE;
      delete process.env.TEST_FALSE;
    });

    test('returns "true" when env variable is "\'true\'"', () => {
      expect(envVarToBoolean(process.env.TEST_TRUE)).toEqual(true);
    });

    test('returns "true" when env variable is "\'TRUE\'"', () => {
      expect(envVarToBoolean(process.env.TEST_TRUE_IN_UPPER_CASE)).toEqual(true);
    });

    test('returns "false" when env variable is "\'false\'"', () => {
      expect(envVarToBoolean(process.env.TEST_FALSE)).toEqual(false);
    });

    test('returns "false" when env variable is "\'undefined\'"', () => {
      expect(envVarToBoolean(process.env[String(Date.now())])).toEqual(false);
    });
  });
});
