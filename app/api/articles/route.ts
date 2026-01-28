import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { article } from "@/db/articles-schema";
import { validateCreateArticleRequest } from "@/lib/article/schemas";
import { getArticleQuota } from "@/lib/article/quota";
import Giselle from "@giselles-ai/sdk";

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

	const quota = await getArticleQuota(session.user.id);
	if (quota.remaining <= 0) {
		return NextResponse.json(
			{
				error: "Daily article limit reached. Please try again later.",
				quota,
			},
			{ status: 429 },
		);
	}

	const payload = await request.json();
	if (!validateCreateArticleRequest(payload)) {
		return NextResponse.json(
			{ error: "Invalid request payload." },
			{ status: 400 },
		);
	}

	const client = new Giselle({
		apiKey: process.env.GISELLE_API_KEY,
	});

	const prompt = `
    <THEME>${payload.prompt.description}</THEME>

    <REFERENCES>
    ${payload.references.texts.join("\n--------------------------\n")}
    </REFERENCES>

    `;

	const { taskId } = await client.apps.run({
		appId: "app-w8hSsCGxtduvLM4H",
		input: { text: prompt },
	});

	const articleId = crypto.randomUUID();
	await db.insert(article).values({
		id: articleId,
		userId: session.user.id,
		giselleTaskId: taskId,
		status: "generating",
		inputJson: JSON.stringify(payload),
	});

	return NextResponse.json({ articleId });
}
