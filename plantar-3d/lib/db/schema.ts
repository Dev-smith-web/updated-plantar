import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "./utils";

// ── Users ────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  password: text("password"), // bcrypt hash, null for OAuth-only users
  role: text("role", { enum: ["student", "teacher", "admin"] })
    .notNull()
    .default("student"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Plants ───────────────────────────────────────────────────────────────────

export const plants = sqliteTable("plants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  scientificName: text("scientific_name"),
  description: text("description").notNull(),
  funFacts: text("fun_facts", { mode: "json" }).$type<string[]>(),
  imageUrl: text("image_url"),
  modelUrl: text("model_url"), // path to GLB file, e.g. /models/sunflower.glb
  color: text("color"), // hex color for UI accent
  createdBy: text("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Plant Parts ──────────────────────────────────────────────────────────────

export const plantParts = sqliteTable("plant_parts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  plantId: text("plant_id")
    .notNull()
    .references(() => plants.id, { onDelete: "cascade" }),
  partName: text("part_name", {
    enum: ["Roots", "Stem", "Leaves", "Flowers", "Seeds", "Fruits"],
  }).notNull(),
  description: text("description").notNull(),
  detailedInfo: text("detailed_info"),
  funFact: text("fun_fact"),
  function: text("function"), // what this part does
  color: text("color"), // hex color for 3D highlight
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Quiz Questions ───────────────────────────────────────────────────────────

export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  plantId: text("plant_id").references(() => plants.id, {
    onDelete: "set null",
  }),
  question: text("question").notNull(),
  options: text("options", { mode: "json" }).$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default(
    "medium"
  ),
  createdByTeacher: integer("created_by_teacher", { mode: "boolean" }).default(
    false
  ),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Quiz Results ─────────────────────────────────────────────────────────────

export const quizResults = sqliteTable("quiz_results", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  studentName: text("student_name").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken"), // seconds
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  plants: many(plants),
  quizResults: many(quizResults),
}));

export const plantsRelations = relations(plants, ({ one, many }) => ({
  creator: one(users, {
    fields: [plants.createdBy],
    references: [users.id],
  }),
  parts: many(plantParts),
  quizQuestions: many(quizQuestions),
}));

export const plantPartsRelations = relations(plantParts, ({ one }) => ({
  plant: one(plants, {
    fields: [plantParts.plantId],
    references: [plants.id],
  }),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  plant: one(plants, {
    fields: [quizQuestions.plantId],
    references: [plants.id],
  }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
}));

// ── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Plant = typeof plants.$inferSelect;
export type NewPlant = typeof plants.$inferInsert;
export type PlantPart = typeof plantParts.$inferSelect;
export type NewPlantPart = typeof plantParts.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;
