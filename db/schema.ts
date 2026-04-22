//This imports the Drizzle SQLite column types needed to define the schema
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

//This defines the users table with id, username, and hashed password
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

//This defines the categories table with a user reference, name, colour and optional icon
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon'),
});

//This defines the habits table linking each habit to a user and a category
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  metricType: text('metric_type').notNull(),
  unit: text('unit').notNull(),
  categoryId: integer('category_id').notNull(),
});

//This defines the habit_logs table storing a date, value and optional notes per entry
export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  habitId: integer('habit_id').notNull(),
  date: text('date').notNull(),
  value: integer('value').notNull().default(0),
  notes: text('notes'),
});

//This defines the targets table for setting period goals with a direction
export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  habitId: integer('habit_id').notNull(),
  type: text('type').notNull(),
  goal: integer('goal').notNull(),
  direction: text('direction').notNull().default('min'),
});