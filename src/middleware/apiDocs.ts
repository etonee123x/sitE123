
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'
import { readFileSync } from 'fs';
import { join } from 'path';

export const apiDocs = [swaggerUi.serve, swaggerUi.setup(parse(readFileSync(join(process.cwd(), 'openapi', 'openapi.bundle.yaml'), 'utf-8')))]