const fs = require('fs');

const content = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
  tmdbToken: '${process.env.TMDB_TOKEN}'
};
`;

fs.writeFileSync('./src/environments/environment.production.ts', content);
console.log('environment.production.ts gerado com sucesso');