/**
 * Runs supabase/schema.sql against the Supabase Postgres instance.
 * Usage: node scripts/run-schema.js
 *
 * Requires DATABASE_URL in .env.local:
 *   DATABASE_URL=postgresql://postgres:[password]@db.gueeadaewviylifvtqje.supabase.co:5432/postgres
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL not set in .env.local')
    console.error('Find it in: Supabase dashboard → Settings → Database → Connection string')
    process.exit(1)
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to Supabase Postgres')

  const sql = fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8')
  await client.query(sql)
  console.log('Schema applied successfully')

  await client.end()
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
