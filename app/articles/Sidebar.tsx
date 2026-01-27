"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ArticleListItem = {
	id: string;
	title: string | null;
	status: string;
	createdAt: Date | number;
};

type SidebarProps = {
	articles: ArticleListItem[];
};

const formatDate = (value: Date | number) => {
	const date = value instanceof Date ? value : new Date(value);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
};

export default function Sidebar({ articles }: SidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="flex h-full w-72 flex-col border-r border-neutral-800 bg-neutral-950 px-4 py-6 text-neutral-100">
			<div className="flex items-center gap-2">
				<div className="h-8 w-8 rounded-lg bg-emerald-500/20" />
				<div className="text-sm font-semibold uppercase tracking-wide text-neutral-200">
					Article Generator
				</div>
			</div>

			<Link
				href="/articles"
				className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-700"
			>
				<span className="text-base">+</span>
				New Article
			</Link>

			<div className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
				Articles
			</div>
			<nav className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto">
				{articles.length === 0 ? (
					<div className="rounded-lg border border-dashed border-neutral-800 p-3 text-xs text-neutral-500">
						No articles yet.
					</div>
				) : null}
				{articles.map((item) => {
					const isActive = pathname?.includes(`/articles/${item.id}`);
					return (
						<Link
							key={item.id}
							href={`/articles/${item.id}`}
							className={`rounded-xl border px-3 py-3 text-sm transition ${
								isActive
									? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
									: "border-neutral-800 bg-neutral-900 text-neutral-100 hover:border-neutral-700"
							}`}
						>
							<div className="truncate font-medium">
								{item.title ?? "Untitled Article"}
							</div>
							<div className="mt-1 text-xs text-neutral-500">
								{formatDate(item.createdAt)}
							</div>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
