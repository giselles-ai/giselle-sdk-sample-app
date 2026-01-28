"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
	const [isRefreshing, setIsRefreshing] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const isMountedRef = useRef(true);

	const fetchDetail = useCallback(
		async (refresh = false) => {
			try {
				const url = refresh
					? `/api/articles/${articleId}?refresh=1`
					: `/api/articles/${articleId}`;
				const response = await fetch(url, {
					cache: "no-store",
				});
				if (!response.ok) {
					const message = await response.json();
					throw new Error(message?.error ?? "Failed to load article.");
				}
				const payload = (await response.json()) as ArticleDetailResponse;
				if (isMountedRef.current) {
					setData(payload);
					setIsLoading(false);
					setIsRefreshing(false);
					if (payload.article.status === "completed") {
						if (intervalRef.current) {
							clearInterval(intervalRef.current);
							intervalRef.current = null;
						}
					}
				}
			} catch (err) {
				if (isMountedRef.current) {
					setError(
						err instanceof Error ? err.message : "Something went wrong.",
					);
					setIsLoading(false);
					setIsRefreshing(false);
				}
			}
		},
		[articleId],
	);

	useEffect(() => {
		isMountedRef.current = true;

		fetchDetail();
		intervalRef.current = setInterval(() => {
			void fetchDetail();
		}, 5000);

		return () => {
			isMountedRef.current = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [articleId, fetchDetail]);

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
	const isCompleted = article.status === "completed";

	return (
		<div className="flex flex-col gap-6">
			<header>
				<div className="text-xs uppercase tracking-wide text-neutral-500">
					{isCompleted ? "Completed Article" : "Generating Article"}
				</div>
				<div className="mt-2 text-sm text-neutral-400">
					Created: {formatDateTime(article.createdAt)}
				</div>
				{isCompleted ? (
					<div className="mt-4 flex items-center gap-3">
						<button
							type="button"
							onClick={() => {
								setError(null);
								setIsRefreshing(true);
								void fetchDetail(true);
							}}
							disabled={isRefreshing}
							className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-200 transition hover:border-neutral-500 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isRefreshing ? "Refreshing..." : "Re-fetch"}
						</button>
						<span className="text-xs text-neutral-500">
							Use this if the completed content is missing.
						</span>
					</div>
				) : null}
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

			{isCompleted ? (
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
