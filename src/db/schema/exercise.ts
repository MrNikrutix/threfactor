import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tags } from './tag';

export const exercises = pgTable('exercises', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	instructions: text('instructions'),
	enrichment: text('enrichment'),
	videoUrl: text('video_url'),
	crop_id: integer('crop_id')
});

export const exercise_tags = pgTable('exercise_tags', {
	id: serial('id').primaryKey(),
	exercise_id: integer('exercise_id')
		.notNull()
		.references(() => exercises.id),
	tag_id: integer('tag_id')
		.notNull()
		.references(() => tags.id)
});

// Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
	exercise_tags: many(exercise_tags)
}));

export const exerciseTagsRelations = relations(exercise_tags, ({ one }) => ({
	exercise: one(exercises, {
		fields: [exercise_tags.exercise_id],
		references: [exercises.id]
	}),
	tag: one(tags, {
		fields: [exercise_tags.tag_id],
		references: [tags.id]
	})
}));