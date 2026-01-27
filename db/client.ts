import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as authSchema from "./auth-schema";
import * as articleSchema from "./articles-schema";
import { authRelations } from "./auth-relations";

const client = createClient({
	url: process.env.TURSO_DATABASE_URL ?? "",
	authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle({
	client,
	schema: {
		...authSchema,
		...articleSchema,
	},
	relations: {
		...authRelations,
	},
});
