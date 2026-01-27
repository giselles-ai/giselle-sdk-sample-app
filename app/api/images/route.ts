import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { validateGenerateImageRequest } from "@/lib/article/schemas";

const getSession = async () =>
	auth.api.getSession({
		headers: await headers(),
	});

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const payload = await request.json();
	const validation = validateGenerateImageRequest(payload);
	if (!validation.ok) {
		return NextResponse.json({ error: validation.error }, { status: 400 });
	}

	const imageId = crypto.randomUUID();
	const width = payload.aspectRatio === "1:1" ? 1024 : 1200;
	const height = payload.aspectRatio === "4:3" ? 900 : 675;
	const url = `https://placehold.co/${width}x${height}/png?text=Generated+Image`;

	return NextResponse.json({
		imageId,
		url,
	});
}
