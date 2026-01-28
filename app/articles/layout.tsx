import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { article } from "@/db/articles-schema";
import Sidebar from "./Sidebar";

export const dynamic = "force-dynamic";

type ArticlesLayoutProps = {
	children: ReactNode;
};

export default async function ArticlesLayout({
	children,
}: ArticlesLayoutProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	const articles = await db
		.select({
			id: article.id,
			title: article.title,
			status: article.status,
			createdAt: article.createdAt,
		})
		.from(article)
		.where(eq(article.userId, session.user.id))
		.orderBy(desc(article.createdAt));

	return (
		<div className="flex min-h-screen bg-neutral-950 text-neutral-100">
			<Sidebar initialArticles={articles} />
			<main className="flex-1 px-8 py-10">{children}</main>
		</div>
	);
}
