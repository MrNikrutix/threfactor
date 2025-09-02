import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { exercise_tags } from './exercise';

export const tags = pgTable('tags', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull()
});

export const tagsRelations = relations(tags, ({ many }) => ({
	exercise_tags: many(exercise_tags)
}));