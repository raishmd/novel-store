import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from 'bcryptjs'
const { hash } = pkg

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')

const env = {}
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '')
}

const connectionString = env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not set in .env')
  process.exit(1)
}

const sql = neon(connectionString)

console.log('Creating tables...')

await sql`
  CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    password TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL,
    UNIQUE(identifier, token)
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "Novel" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    "coverImage" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY,
    "novelId" TEXT NOT NULL REFERENCES "Novel"(id),
    email TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

await sql`
  CREATE TABLE IF NOT EXISTS "Setting" (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  );
`

console.log('Tables created')

const adminEmail = env.ADMIN_EMAIL || 'admin@example.com'
const adminPassword = env.ADMIN_PASSWORD || 'admin123'
const hashedPassword = await hash(adminPassword, 12)

const existingUser = await sql`SELECT id FROM "User" WHERE email = ${adminEmail} LIMIT 1`
if (!existingUser.length) {
  await sql`
    INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'المدير', ${adminEmail}, ${hashedPassword}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `
  console.log(`Admin user created: ${adminEmail}`)
} else {
  console.log(`Admin user already exists: ${adminEmail}`)
}

const existingSettings = await sql`SELECT id FROM "Setting" LIMIT 1`
if (!existingSettings.length) {
  const settings = [
    ['siteName', env.SITE_NAME || 'متجر الروايات'],
    ['authorName', 'اسم الكاتب'],
    ['authorBio', 'كاتب ورائي عربي، يكتب بحب وشغف.'],
  ]
  for (const [key, value] of settings) {
    await sql`
      INSERT INTO "Setting" (id, key, value)
      VALUES (gen_random_uuid()::text, ${key}, ${value})
    `
  }
  console.log('Default settings created')
}

console.log('Setup complete!')
