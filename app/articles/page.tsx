"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
	ArticleReferenceImage,
	ArticleReferenceText,
	CreateArticleRequest,
	GenerateImageRequest,
} from "@/lib/article/schemas";

const createReferenceText = (content: string): ArticleReferenceText => ({
	id: crypto.randomUUID(),
	content,
});

const createReferenceImage = async (
	file: File,
): Promise<ArticleReferenceImage> => {
	const dataUrl = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

	return {
		id: crypto.randomUUID(),
		filename: file.name,
		mimeType: file.type,
		dataUrl,
	};
};

export default function ArticlesPage() {
	const router = useRouter();
	const [description, setDescription] = useState("");
	const [textInput, setTextInput] = useState("");
	const [textMaterials, setTextMaterials] = useState<ArticleReferenceText[]>(
		[],
	);
	const [imageMaterials, setImageMaterials] = useState<ArticleReferenceImage[]>(
		[],
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleAddText = () => {
		if (!textInput.trim()) {
			return;
		}
		setTextMaterials((prev) => [
			...prev,
			createReferenceText(textInput.trim()),
		]);
		setTextInput("");
	};

	const handleRemoveText = (id: string) => {
		setTextMaterials((prev) => prev.filter((item) => item.id !== id));
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = Array.from(event.target.files ?? []);
		if (files.length === 0) {
			return;
		}
		const nextImages = await Promise.all(files.map(createReferenceImage));
		setImageMaterials((prev) => [...prev, ...nextImages]);
		event.target.value = "";
	};

	const handleRemoveImage = (id: string) => {
		setImageMaterials((prev) => prev.filter((item) => item.id !== id));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setErrorMessage(null);

		const payload: CreateArticleRequest = {
			article: {
				language: "ja",
				tone: "professional",
				targetAudience: "general",
				length: "medium",
				format: "markdown",
			},
			prompt: {
				description,
			},
			references: {
				texts: textMaterials,
				images: imageMaterials,
			},
			imageGeneration: {
				enabled: true,
				prompt: description || "Article cover image",
				style: "photorealistic",
				aspectRatio: "16:9",
				count: 1,
			},
		};

		try {
			const imageRequest: GenerateImageRequest = {
				prompt: payload.imageGeneration.prompt,
				style: payload.imageGeneration.style,
				aspectRatio: payload.imageGeneration.aspectRatio,
				count: payload.imageGeneration.count,
			};
			await fetch("/api/images", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(imageRequest),
			});

			const response = await fetch("/api/articles", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error?.error ?? "Failed to create article.");
			}

			const data = (await response.json()) as { articleId: string };
			router.push(`/articles/${data.articleId}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Something went wrong.",
			);
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
			<header>
				<h1 className="text-3xl font-semibold">Article Generator</h1>
				<p className="mt-2 text-sm text-neutral-400">
					Enter your article theme and objectives, add reference materials, and
					let AI generate your article.
				</p>
			</header>

			<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
				<section>
					<h2 className="text-sm font-semibold text-neutral-200">
						Article Description
					</h2>
					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder="What kind of article do you want to create? Enter the theme, objectives, target audience, etc..."
						className="mt-3 min-h-35 w-full rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none"
					/>
				</section>

				<section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
					<h3 className="text-sm font-semibold text-neutral-200">
						Reference Materials
					</h3>

					<div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
						<div className="text-xs font-semibold text-neutral-400">
							Text Materials
						</div>
						<div className="mt-3 flex gap-2">
							<input
								value={textInput}
								onChange={(event) => setTextInput(event.target.value)}
								placeholder="Enter reference text..."
								className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
							/>
							<button
								type="button"
								onClick={handleAddText}
								className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-neutral-500"
							>
								Add
							</button>
						</div>
						{textMaterials.length > 0 ? (
							<div className="mt-3 flex flex-col gap-2">
								{textMaterials.map((item) => (
									<div
										key={item.id}
										className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
									>
										<p className="flex-1 whitespace-pre-wrap">{item.content}</p>
										<button
											type="button"
											onClick={() => handleRemoveText(item.id)}
											className="text-xs text-neutral-500 hover:text-neutral-300"
										>
											Remove
										</button>
									</div>
								))}
							</div>
						) : null}
					</div>

					<div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
						<div className="text-xs font-semibold text-neutral-400">
							Image Materials
						</div>
						<label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-800 px-4 py-3 text-sm text-neutral-400 hover:border-neutral-600">
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleFileChange}
								className="hidden"
							/>
							Upload Images
						</label>
						{imageMaterials.length > 0 ? (
							<div className="mt-3 grid grid-cols-2 gap-3">
								{imageMaterials.map((item) => (
									<div
										key={item.id}
										className="relative overflow-hidden rounded-lg border border-neutral-800"
									>
										<img
											src={item.dataUrl}
											alt={item.filename}
											className="h-28 w-full object-cover"
										/>
										<button
											type="button"
											onClick={() => handleRemoveImage(item.id)}
											className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-1 text-[10px] text-neutral-100"
										>
											Remove
										</button>
									</div>
								))}
							</div>
						) : null}
					</div>
				</section>

				{errorMessage ? (
					<p className="text-sm text-red-400">{errorMessage}</p>
				) : null}

				<button
					type="submit"
					disabled={isSubmitting}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? "Generating..." : "Generate Article"}
				</button>
			</form>
		</div>
	);
}
