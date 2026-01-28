"use client";

import { useEffect, useState } from "react";

type ProgressStep = {
	label: string;
	status: "done" | "active" | "pending";
};

type ArticleDetailResponse = {
	article: {
		id: string;
		status: "queued" | "generating" | "completed" | "error";
		title: string | null;
		bodyMarkdown: string | null;
		coverImageUrl: string | null;
		createdAt: string | number | Date;
		updatedAt: string | number | Date;
		errorMessage: string | null;
	};
	progress: {
		percent: number;
		phase: string;
		steps: ProgressStep[];
	};
};

type ArticleDetailClientProps = {
	articleId: string;
};

const formatDateTime = (value: string | number | Date) => {
	const date =
		value instanceof Date
			? value
			: new Date(typeof value === "string" ? value : value);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export default function ArticleDetailClient({
	articleId,
}: ArticleDetailClientProps) {
	const [data, setData] = useState<ArticleDetailResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		let intervalId: ReturnType<typeof setInterval> | null = null;

		const fetchDetail = async () => {
			try {
				const response = await fetch(`/api/articles/${articleId}`, {
					cache: "no-store",
				});
				if (!response.ok) {
					const message = await response.json();
					throw new Error(message?.error ?? "Failed to load article.");
				}
				const payload = (await response.json()) as ArticleDetailResponse;
				if (isMounted) {
					setData(payload);
					setIsLoading(false);
					if (payload.article.status === "completed") {
						if (intervalId) {
							clearInterval(intervalId);
						}
					}
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Something went wrong.",
					);
					setIsLoading(false);
				}
			}
		};

		fetchDetail();
		intervalId = setInterval(fetchDetail, 5000);

		return () => {
			isMounted = false;
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [articleId]);

	if (isLoading) {
		return <div className="text-sm text-neutral-400">Loading article...</div>;
	}

	if (error) {
		return (
			<div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
				{error}
			</div>
		);
	}

	if (!data) {
		return null;
	}

	const { article, progress } = data;

	return (
		<div className="flex flex-col gap-6">
			<header>
				<div className="text-xs uppercase tracking-wide text-neutral-500">
					{article.status === "completed"
						? "Completed Article"
						: "Generating Article"}
				</div>
				<div className="mt-2 text-sm text-neutral-400">
					Created: {formatDateTime(article.createdAt)}
				</div>
			</header>

			<section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
				<div className="flex items-center justify-between text-sm text-neutral-300">
					<span>{progress.phase}</span>
					<span>{progress.percent}%</span>
				</div>
				<div className="mt-3 h-2 rounded-full bg-neutral-800">
					<div
						className="h-2 rounded-full bg-emerald-500 transition-all"
						style={{ width: `${progress.percent}%` }}
					/>
				</div>
				<div className="mt-4 grid gap-2 text-xs text-neutral-400">
					{progress.steps.map((step) => (
						<div key={step.label} className="flex items-center gap-2">
							<span
								className={`h-2 w-2 rounded-full ${
									step.status === "done"
										? "bg-emerald-400"
										: step.status === "active"
											? "bg-emerald-200"
											: "bg-neutral-700"
								}`}
							/>
							<span>{step.label}</span>
						</div>
					))}
				</div>
			</section>

			{article.status === "completed" ? (
				<section className="flex flex-col gap-4">
					<h1 className="text-2xl font-semibold">
						{article.title ?? "Untitled Article"}
					</h1>
					<div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-200">
						<pre className="whitespace-pre-wrap font-sans">
							{article.bodyMarkdown ?? ""}
						</pre>
					</div>
				</section>
			) : null}
		</div>
	);
}
