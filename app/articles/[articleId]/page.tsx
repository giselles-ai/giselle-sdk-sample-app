import ArticleDetailClient from "./ArticleDetailClient";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
	params,
}: {
	params: Promise<{ articleId: string }>;
}) {
	const { articleId } = await params;

	return <ArticleDetailClient articleId={articleId} />;
}
