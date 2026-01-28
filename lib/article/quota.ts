import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { article } from "@/db/articles-schema";

export const ARTICLE_RATE_LIMIT = 6;
export const ARTICLE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type ArticleQuota = {
	limit: number;
	used: number;
	remaining: number;
	nextRefillAt: number | null;
	windowMs: number;
};

const getRecentArticles = async (userId: string) => {
	const cutoff = new Date(Date.now() - ARTICLE_WINDOW_MS);
	return db
		.select({ createdAt: article.createdAt })
		.from(article)
		.where(and(eq(article.userId, userId), gte(article.createdAt, cutoff)))
		.orderBy(desc(article.createdAt));
};

export const getArticleQuota = async (
	userId: string,
): Promise<ArticleQuota> => {
	const rows = await getRecentArticles(userId);
	const used = rows.length;
	const remaining = Math.max(ARTICLE_RATE_LIMIT - used, 0);
	const nextRefillAt =
		used === 0
			? null
			: Math.min(
					...rows.map((row) => row.createdAt.getTime() + ARTICLE_WINDOW_MS),
				);

	return {
		limit: ARTICLE_RATE_LIMIT,
		used,
		remaining,
		nextRefillAt,
		windowMs: ARTICLE_WINDOW_MS,
	};
};
