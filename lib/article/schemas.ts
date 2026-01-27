export type ArticleStatus = "queued" | "generating" | "completed" | "error";

export type ArticleReferenceText = {
	id: string;
	title?: string;
	content: string;
};

export type ArticleReferenceImage = {
	id: string;
	filename: string;
	mimeType: string;
	dataUrl: string;
};

export type CreateArticleRequest = {
	article: {
		language: string;
		tone: string;
		targetAudience: string;
		length: "short" | "medium" | "long";
		format: "markdown" | "html" | "plain";
	};
	prompt: {
		description: string;
	};
	references: {
		texts: ArticleReferenceText[];
		images: ArticleReferenceImage[];
	};
	imageGeneration: {
		enabled: boolean;
		prompt: string;
		style: string;
		aspectRatio: "1:1" | "4:3" | "16:9";
		count: number;
	};
};

export type GenerateImageRequest = {
	prompt: string;
	style: string;
	aspectRatio: "1:1" | "4:3" | "16:9";
	count: number;
	seed?: number;
	referenceImageDataUrls?: string[];
};

type ValidationResult = { ok: true } | { ok: false; error: string };

const isNonEmptyString = (value: unknown) =>
	typeof value === "string" && value.trim().length > 0;

export const validateCreateArticleRequest = (
	payload: unknown,
): payload is CreateArticleRequest => {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	const candidate = payload as CreateArticleRequest;
	return (
		isNonEmptyString(candidate.prompt?.description) &&
		Array.isArray(candidate.references?.texts) &&
		Array.isArray(candidate.references?.images) &&
		typeof candidate.imageGeneration?.enabled === "boolean" &&
		isNonEmptyString(candidate.article?.language) &&
		isNonEmptyString(candidate.article?.tone) &&
		isNonEmptyString(candidate.article?.targetAudience)
	);
};

export const validateGenerateImageRequest = (
	payload: unknown,
): ValidationResult => {
	if (!payload || typeof payload !== "object") {
		return { ok: false, error: "Payload must be an object." };
	}

	const candidate = payload as GenerateImageRequest;
	if (!isNonEmptyString(candidate.prompt)) {
		return { ok: false, error: "Prompt is required." };
	}

	if (!Number.isFinite(candidate.count) || candidate.count <= 0) {
		return { ok: false, error: "Count must be a positive number." };
	}

	return { ok: true };
};
