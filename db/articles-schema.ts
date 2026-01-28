import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const article = sqliteTable(
	"article",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("queued"),
		giselleTaskId: text("giselle_task_id").notNull(),
		title: text("title"),
		bodyMarkdown: text("body_markdown"),
		coverImageUrl: text("cover_image_url"),
		inputJson: text("input_json").notNull(),
		errorMessage: text("error_message"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("article_userId_idx").on(table.userId)],
);
