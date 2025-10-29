/**
 * Script to apply forms table schema fixes
 * Run with: npx tsx scripts/apply-forms-fix.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('Reading migration file...')

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251030_fix_forms_schema.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  console.log('Applying migration...')

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
  } catch (error) {
    console.error('Error applying migration:', error)
    console.log('\n⚠️  Please apply the migration manually through Supabase Dashboard:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of:')
    console.log(`   ${migrationPath}`)
    console.log('5. Click "Run"')
    process.exit(1)
  }
}

applyMigration()
