"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		await authClient.signOut();
		router.push("/sign-in");
	};

	return (
		<button
			type="button"
			onClick={handleSignOut}
			disabled={isSigningOut}
			className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{isSigningOut ? "Signing out..." : "Sign out"}
		</button>
	);
}
