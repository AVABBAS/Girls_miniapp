import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { users, type DatabaseClient, type User } from '@girls/database';
import type { TelegramInitData } from '@girls/shared';

/**
 * All user lookups are keyed by Telegram id. A user record is created on first
 * verified authentication and refreshed with profile fields Telegram provides.
 */
export class UserRepository {
  constructor(private readonly db: DatabaseClient) {}

  async upsertFromTelegram(payload: TelegramInitData): Promise<User> {
    const existing = await this.findByTelegramId(payload.id);
    if (existing) {
      const [updated] = await this.db
        .update(users)
        .set({
          firstName: payload.first_name ?? null,
          lastName: payload.last_name ?? null,
          username: payload.username ?? null,
          photoUrl: payload.photo_url ?? null,
          locale: payload.language_code ?? existing.locale,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.telegramId, payload.id))
        .returning();
      // `update().returning()` yields one row when the row matched.
      if (!updated) throw new Error('failed to update user record');
      return updated;
    }

    const [created] = await this.db
      .insert(users)
      .values({
        id: nanoid(),
        telegramId: payload.id,
        firstName: payload.first_name ?? null,
        lastName: payload.last_name ?? null,
        username: payload.username ?? null,
        photoUrl: payload.photo_url ?? null,
        locale: payload.language_code ?? 'en',
      })
      .returning();
    if (!created) throw new Error('failed to create user record');
    return created;
  }

  async findById(id: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async findByTelegramId(telegramId: number): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return rows[0];
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
