import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { article } from "@/db/articles-schema";
import { validateCreateArticleRequest } from "@/lib/article/schemas";

const getSession = async () =>
	auth.api.getSession({
		headers: await headers(),
	});

export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await db
		.select({
			id: article.id,
			title: article.title,
			status: article.status,
			createdAt: article.createdAt,
		})
		.from(article)
		.where(eq(article.userId, session.user.id))
		.orderBy(desc(article.createdAt));

	return NextResponse.json({ articles: items });
}

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const payload = await request.json();
	if (!validateCreateArticleRequest(payload)) {
		return NextResponse.json(
			{ error: "Invalid request payload." },
			{ status: 400 },
		);
	}

	const articleId = crypto.randomUUID();
	await db.insert(article).values({
		id: articleId,
		userId: session.user.id,
		status: "generating",
		title: null,
		bodyMarkdown: null,
		coverImageUrl: null,
		inputJson: JSON.stringify(payload),
		errorMessage: null,
	});

	return NextResponse.json({ articleId });
}
