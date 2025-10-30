import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables manually
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking reservation_types table schema...\n')

  // Try to get a sample record to see columns
  const { data: sample, error: sampleError } = await supabase
    .from('reservation_types')
    .select('*')
    .limit(1)

  if (sample && sample.length > 0) {
    console.log('✅ Reservation types columns:', Object.keys(sample[0]))
    console.log('Sample record:', sample[0])
  } else if (sample && sample.length === 0) {
    console.log('⚠️  Table exists but is empty')

    // Check table structure via raw query
    const { data: structure, error: structError } = await supabase.rpc('exec_sql', {
      query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'reservation_types' ORDER BY ordinal_position;`
    })

    if (structure) {
      console.log('Columns from schema:', structure)
    } else {
      console.log('Schema query error:', structError)
    }
  } else {
    console.log('❌ Error fetching sample:', sampleError)
  }

  console.log('\n\nChecking reservations table schema...\n')

  const { data: resSample, error: resError } = await supabase
    .from('reservations')
    .select('*')
    .limit(1)

  if (resSample && resSample.length > 0) {
    console.log('✅ Reservations columns:', Object.keys(resSample[0]))
  } else if (resSample && resSample.length === 0) {
    console.log('⚠️  Reservations table exists but is empty')
  } else {
    console.log('❌ Error fetching reservations:', resError)
  }
}

checkSchema().then(() => {
  console.log('\n✅ Schema check complete')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
