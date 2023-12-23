import { context } from 'esbuild';

import { options } from './esbuild.config.common.js';

context(options).then(({ watch }) => watch());
