/**
 * Configuration file for Supabase type generation
 * Used by the npm script to generate TypeScript types from Supabase schema
 */

const project_id = 'sogwgxkxuuvvvjbqlcdo';

module.exports = {
  project: {
    id: project_id,
    name: 'SkillSwap',
  },
  schema: {
    // File to write the generated types to
    outputPath: './src/types/supabase.ts',
    // The format to use
    format: 'ts',
  },
  typescript: {
    // Whether to generate types for all tables or just the public schema
    allSchemas: false,
  },
};
