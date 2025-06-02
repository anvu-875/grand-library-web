import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define Role Enum
export const userRoles = ['admin', 'mod'] as const;
export type UserRole = 'admin' | 'mod';
export const userRoleEnum = pgEnum('user_role', userRoles);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userName: varchar('user_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  passwordSalt: varchar('password_salt', { length: 255 }).notNull(),
  joinAt: timestamp('join_at').defaultNow().notNull(),
});

// Games Table
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  mainImage: text('main_image'),
  endPoint: varchar('end_point', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pages Table
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  editedBy: uuid('edited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  endPoint: varchar('end_point', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// SubPages Table
export const subPages = pgTable('sub_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id')
    .notNull()
    .references(() => pages.id, { onDelete: 'cascade' }),
  editedBy: uuid('edited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  endPoint: varchar('end_point', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
