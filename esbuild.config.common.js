export const options = {
  entryPoints: ['src/www.ts'],
  platform: 'node',
  outfile: 'dist/index.js',
  format: 'esm',
  bundle: true,
  resolveExtensions: ['.ts', '.js'],
  packages: 'external'
}