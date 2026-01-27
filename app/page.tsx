export default function Home() {
	// `/` is treated as `/articles`
	const { redirect } =
		require("next/navigation") as typeof import("next/navigation");
	redirect("/articles");
}
