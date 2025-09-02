import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const analysers = pgTable('analysers', {
	id: serial('id').primaryKey(),
	video_url: text('video_url').notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	download_id: varchar('download_id', { length: 255 })
});

export const annotations = pgTable('annotations', {
	id: serial('id').primaryKey(),
	analyser_id: integer('analyser_id')
		.notNull()
		.references(() => analysers.id),
	time_from: varchar('time_from', { length: 50 }).notNull(),
	time_to: varchar('time_to', { length: 50 }),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	color: varchar('color', { length: 7 }).notNull(),
	saved: integer('saved').default(0) // PostgreSQL boolean jako integer
});

export const cropped_videos = pgTable('cropped_videos', {
	id: serial('id').primaryKey(),
	anno_id: integer('anno_id')
		.notNull()
		.references(() => annotations.id),
	video_url: text('video_url').notNull(),
	crop_id: integer('crop_id').notNull()
});

// Relations pozostają takie same
export const analysersRelations = relations(analysers, ({ many }) => ({
	annotations: many(annotations)
}));

export const annotationsRelations = relations(annotations, ({ one, many }) => ({
	analyser: one(analysers, {
		fields: [annotations.analyser_id],
		references: [analysers.id]
	}),
	cropped_videos: many(cropped_videos)
}));

export const croppedVideosRelations = relations(cropped_videos, ({ one }) => ({
	annotation: one(annotations, {
		fields: [cropped_videos.anno_id],
		references: [annotations.id]
	})
}));