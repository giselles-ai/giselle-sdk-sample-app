import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getArticleQuota } from "@/lib/article/quota";

const getSession = async () =>
	auth.api.getSession({
		headers: await headers(),
	});

export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const quota = await getArticleQuota(session.user.id);
	return NextResponse.json({ quota });
}
