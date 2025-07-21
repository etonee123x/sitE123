import { TableTransformController } from '@/helpers/databaseController';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

(async () => {
  const { argv } = yargs(hideBin(process.argv)).option('table', {
    type: 'string',
    demandOption: true,
    description: 'The name of the database table to transform',
  });

  const arvgAwaited = await argv;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableTransformController = new TableTransformController(arvgAwaited.table as any);

  tableTransformController.transformToNewMetaFormat();
})();
