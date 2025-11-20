#!/usr/bin/env node

/**
 * Script to apply Supabase migrations
 * Can be run by AI agent or manually
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

async function main() {
  log('🚀 Applying Supabase migrations...', 'info');

  // Check if Supabase CLI is installed
  const checkCli = exec('supabase --version');
  if (!checkCli.success) {
    log('❌ Supabase CLI is not installed!', 'error');
    log('Install it from: https://supabase.com/docs/guides/cli', 'info');
    process.exit(1);
  }

  log(`✓ Supabase CLI version: ${checkCli.output.trim()}`, 'success');

  // Check if project is linked
  log('🔗 Checking Supabase project link...', 'info');
  const linkCheck = exec('supabase projects list');
  if (!linkCheck.success) {
    log('⚠️  Not logged in to Supabase. Run: supabase login', 'warn');
    process.exit(1);
  }

  // Apply migrations
  log('📦 Pushing migrations to Supabase...', 'info');
  const push = exec('supabase db push', { stdio: 'inherit' });

  if (!push.success) {
    log('❌ Failed to apply migrations', 'error');
    log('Try running: supabase db remote commit', 'info');
    process.exit(1);
  }

  log('✅ Migrations applied successfully!', 'success');

  // Generate types
  log('🔧 Generating TypeScript types...', 'info');
  const genTypes = exec('supabase gen types typescript --linked > types/database.types.ts');

  if (genTypes.success) {
    log('✅ TypeScript types updated!', 'success');
  } else {
    log('⚠️  Could not generate types (this is optional)', 'warn');
  }

  log('🎉 All done!', 'success');
}

main().catch(error => {
  log(`❌ Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});
