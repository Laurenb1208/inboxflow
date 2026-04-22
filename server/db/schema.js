import { pgTable, uuid, text, timestamp, boolean, integer, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  googleSub: text('google_sub').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  picture: text('picture'),
  provider: text('provider').notNull().default('gmail'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const oauthTokens = pgTable('oauth_tokens', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  refreshTokenEnc: text('refresh_token_enc').notNull(),
  iv: text('iv').notNull(),
  scope: text('scope'),
  connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
  lastRefreshedAt: timestamp('last_refreshed_at', { withTimezone: true }),
})

export const folders = pgTable('folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  priority: text('priority').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => ({ uniqUserName: unique().on(t.userId, t.name) }))

export const filters = pgTable('filters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keywords: text('keywords').notNull(),
  folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'cascade' }),
  priority: text('priority').notNull(),
  rank: integer('rank').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  autoSort: boolean('auto_sort').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const emails = pgTable('emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  gmailMessageId: text('gmail_message_id').notNull(),
  gmailThreadId: text('gmail_thread_id'),
  fromAddr: text('from_addr'),
  fromName: text('from_name'),
  subject: text('subject'),
  snippet: text('snippet'),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  labels: text('labels').array(),
  folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  priority: text('priority'),
  matchedFilterId: uuid('matched_filter_id').references(() => filters.id, { onDelete: 'set null' }),
  manuallyImportant: boolean('manually_important').notNull().default(false),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
}, t => ({ uniqUserMsg: unique().on(t.userId, t.gmailMessageId) }))

export const syncLog = pgTable('sync_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  fetchedCount: integer('fetched_count').default(0),
  classifiedCount: integer('classified_count').default(0),
  status: text('status'),
  errorMessage: text('error_message'),
})

export const sessionTable = pgTable('session', {
  sid: text('sid').primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire', { withTimezone: false }).notNull(),
})
