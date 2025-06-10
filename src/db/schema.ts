import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const memberType = pgEnum("member_type", ["member", "guest"]);

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }).unique().notNull(),
  email: varchar("email", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const membersSelectSchema = createSelectSchema(members);

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").unique().notNull(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const membershipCards = pgTable("membership_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const membershipCardBranches = pgTable("membership_card_branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipCardId: uuid("membership_card_id").references(() => membershipCards.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipCardId: uuid("membership_card_id").references(() => membershipCards.id, { onDelete: "cascade" }),
  activeSince: timestamp("active_since").notNull(),
  activeUntil: timestamp("active_until").notNull(),
  createdBy: text("created_by"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const visitLogs = pgTable("visit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),

  type: memberType("type").default("guest").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});
