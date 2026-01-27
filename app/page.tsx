import Link from "next/link";

export default function Home() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
			<div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg">
				<h1 className="text-2xl font-semibold">Better Auth demo</h1>
				<p className="mt-2 text-sm text-neutral-400">
					Quick links to the authentication pages.
				</p>
				<div className="mt-6 flex flex-wrap gap-3 text-sm">
					<Link
						href="/sign-in"
						className="rounded-lg border border-neutral-700 px-4 py-2 text-neutral-100 transition hover:border-neutral-500"
					>
						Sign in
					</Link>
					<Link
						href="/sign-up"
						className="rounded-lg border border-neutral-700 px-4 py-2 text-neutral-100 transition hover:border-neutral-500"
					>
						Sign up
					</Link>
					<Link
						href="/dashboard"
						className="rounded-lg border border-neutral-700 px-4 py-2 text-neutral-100 transition hover:border-neutral-500"
					>
						Dashboard
					</Link>
				</div>
			</div>
		</main>
	);
}
