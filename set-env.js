const fs = require('fs');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'definida' : 'indefinida');
console.log('TMDB_TOKEN:', process.env.TMDB_TOKEN ? 'definido' : 'indefinido');

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