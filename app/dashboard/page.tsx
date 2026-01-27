import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	return (
		<main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold">Dashboard</h1>
						<p className="text-sm text-neutral-400">
							You are signed in as {session.user.email}.
						</p>
					</div>
					<SignOutButton />
				</div>

				<section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
					<h2 className="text-sm font-semibold text-neutral-200">Session</h2>
					<pre className="mt-3 overflow-auto rounded-lg bg-neutral-950 p-4 text-xs text-neutral-200">
						{JSON.stringify(session, null, 2)}
					</pre>
				</section>
			</div>
		</main>
	);
}
