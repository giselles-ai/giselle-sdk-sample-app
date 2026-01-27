"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setErrorMessage(null);

		const { error } = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: "/articles",
		});

		if (error) {
			setErrorMessage(error.message ?? "Sign up failed.");
			setIsSubmitting(false);
			return;
		}

		router.push("/articles");
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
			<div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg">
				<h1 className="text-2xl font-semibold">Create account</h1>
				<p className="mt-1 text-sm text-neutral-400">
					Get started with email and password.
				</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<label className="flex flex-col gap-2 text-sm">
						<span className="text-neutral-300">Name</span>
						<input
							type="text"
							autoComplete="name"
							required
							className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</label>

					<label className="flex flex-col gap-2 text-sm">
						<span className="text-neutral-300">Email</span>
						<input
							type="email"
							autoComplete="email"
							required
							className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</label>

					<label className="flex flex-col gap-2 text-sm">
						<span className="text-neutral-300">Password</span>
						<input
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</label>

					{errorMessage ? (
						<p className="text-sm text-red-400">{errorMessage}</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Creating account..." : "Sign up"}
					</button>
				</form>

				<p className="mt-6 text-sm text-neutral-400">
					Already have an account?{" "}
					<Link className="text-blue-400 hover:text-blue-300" href="/sign-in">
						Sign in
					</Link>
				</p>
			</div>
		</main>
	);
}
