import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { exercises } from './exercise';
import { sql } from 'drizzle-orm';

export const exerciseUnitEnum = ['CZAS', 'ILOŚĆ'] as const;
export type ExerciseUnit = (typeof exerciseUnitEnum)[number];

export const workouts = pgTable('workouts', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	duration: integer('duration'),
	created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const workout_sections = pgTable('workout_sections', {
	id: serial('id').primaryKey(),
	work_id: integer('work_id')
		.notNull()
		.references(() => workouts.id),
	name: varchar('name', { length: 255 }).notNull(),
	position: integer('position').notNull()
});

export const workout_exercises = pgTable('workout_exercises', {
	id: serial('id').primaryKey(),
	section_id: integer('section_id')
		.notNull()
		.references(() => workout_sections.id),
	ex_id: integer('ex_id')
		.notNull()
		.references(() => exercises.id),
	sets: integer('sets').notNull(),
	quantity: integer('quantity'),
	unit: varchar('unit', { length: 10 }).$type<ExerciseUnit>().notNull(),
	duration: integer('duration'),
	rest: integer('rest').notNull(),
	position: integer('position').notNull()
});

// Relations
export const workoutsRelations = relations(workouts, ({ many }) => ({
	sections: many(workout_sections)
}));

export const workoutSectionsRelations = relations(workout_sections, ({ one, many }) => ({
	workout: one(workouts, {
		fields: [workout_sections.work_id],
		references: [workouts.id]
	}),
	exercises: many(workout_exercises)
}));

export const workoutExercisesRelations = relations(workout_exercises, ({ one }) => ({
	section: one(workout_sections, {
		fields: [workout_exercises.section_id],
		references: [workout_sections.id]
	}),
	exercise: one(exercises, {
		fields: [workout_exercises.ex_id],
		references: [exercises.id]
	})
}));