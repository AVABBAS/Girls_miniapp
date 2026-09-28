import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Canonical UTC timestamp columns. Stored as ISO text so they are sortable and
 * unambiguous across timezones.
 */
const timestamps = {
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};

/**
 * Application users. The `telegramId` is the only Telegram identity we require;
 * the remaining profile fields are optional and stored solely to render the
 * user's own profile inside the Mini App.
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  telegramId: integer('telegram_id').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username'),
  photoUrl: text('photo_url'),
  locale: text('locale').notNull().default('en'),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
