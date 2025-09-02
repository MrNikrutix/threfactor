import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const dayOfWeekEnum = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const;
export type DayOfWeek = (typeof dayOfWeekEnum)[number];

export const plans = pgTable('plans', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	event_date: varchar('event_date', { length: 10 }).notNull() // PostgreSQL przechowuje daty jako varchar w formacie ISO
});

export const week_plans = pgTable('week_plans', {
	id: serial('id').primaryKey(),
	plan_id: integer('plan_id')
		.notNull()
		.references(() => plans.id),
	position: integer('position').notNull(),
	notes: text('notes')
});

export const workout_plans = pgTable('workout_plans', {
	id: serial('id').primaryKey(),
	plan_id: integer('plan_id')
		.notNull()
		.references(() => plans.id),
	week_id: integer('week_id')
		.notNull()
		.references(() => week_plans.id),
	name: varchar('name', { length: 255 }),
	description: text('description'),
	day_of_week: varchar('day_of_week', { length: 10 }).$type<DayOfWeek>().notNull(),
	completed: integer('completed').default(0), // PostgreSQL boolean jako integer
	notes: text('notes'),
	work_id: integer('work_id')
});

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
	weeks: many(week_plans),
	workout_plans: many(workout_plans)
}));

export const weekPlansRelations = relations(week_plans, ({ one, many }) => ({
	plan: one(plans, {
		fields: [week_plans.plan_id],
		references: [plans.id]
	}),
	workouts: many(workout_plans)
}));

export const workoutPlansRelations = relations(workout_plans, ({ one }) => ({
	plan: one(plans, {
		fields: [workout_plans.plan_id],
		references: [plans.id]
	}),
	week: one(week_plans, {
		fields: [workout_plans.week_id],
		references: [week_plans.id]
	})
}));