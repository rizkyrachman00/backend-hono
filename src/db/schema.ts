import type { InferSelectModel } from "drizzle-orm";

import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// member_type enum
export const memberType = pgEnum("member_type", ["member", "guest"]);

// members table
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
export const membersInsertSchema = createInsertSchema(members, { name: schema => schema.name.min(1), email: schema => schema.email.email() }).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const membersPatchSchema = membersInsertSchema.partial();
export type Member = InferSelectModel<typeof members>;
export type MemberId = Member["id"];

// branches table
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").unique().notNull(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const branchesSelectSchema = createSelectSchema(branches);
export const branchesInsertSchema = createInsertSchema(branches, { name: schema => schema.name.min(1), identifier: schema => schema.identifier.min(1) }).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const branchesPatchSchema = branchesInsertSchema.partial();

// membership_cards table
export const membershipCards = pgTable("membership_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const membershipCardsSelectSchema = createSelectSchema(membershipCards);
export const membershipCardsInsertSchema = createInsertSchema(membershipCards).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const membershipCardsPatchSchema = membershipCardsInsertSchema.partial();

// membership_card_branches table
export const membershipCardBranches = pgTable("membership_card_branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipCardId: uuid("membership_card_id").references(() => membershipCards.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const membershipCardBranchesSelectSchema = createSelectSchema(membershipCardBranches);
export const membershipCardBranchesInsertSchema = createInsertSchema(membershipCardBranches).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const membershipCardBranchesPatchSchema = membershipCardBranchesInsertSchema.partial();

// subscriptions table
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

export const subscriptionsSelectSchema = createSelectSchema(subscriptions);
export const subscriptionsInsertSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const subscriptionsPatchSchema = subscriptionsInsertSchema.partial();

// guests table
export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

// visit_logs table
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

export const visitLogsSelectSchema = createSelectSchema(visitLogs);

// subscription_branches table
export const subscriptionBranches = pgTable("subscription_branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionBranchesSelectSchema = createSelectSchema(subscriptionBranches);
