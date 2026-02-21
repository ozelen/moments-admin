import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/albums.$id";
import { getSessionUser } from "../lib/auth.server";
import { getAlbum, deleteAlbum } from "../lib/albums.server";

export function meta({ params, loaderData }: Route.MetaArgs) {
	const album = loaderData?.album;
	return [{ title: album ? `${album.name} — Moments Admin` : "Album — Moments Admin" }];
}

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const secret = (context.cloudflare.env as { SESSION_SECRET?: string }).SESSION_SECRET;
	const user = await getSessionUser(request, context.cloudflare.env.DB, secret);
	if (!user) return redirect("/login");

	const album = await getAlbum(context.cloudflare.env.DB, params.id, user.id);
	if (!album) throw new Response("Not found", { status: 404 });
	return { album };
}

export async function action({ params, request, context }: Route.ActionArgs) {
	const secret = (context.cloudflare.env as { SESSION_SECRET?: string }).SESSION_SECRET;
	const user = await getSessionUser(request, context.cloudflare.env.DB, secret);
	if (!user) return redirect("/login");

	const formData = await request.formData();
	const action = formData.get("_action");
	if (action === "delete") {
		const deleted = await deleteAlbum(context.cloudflare.env.DB, params.id, user.id);
		if (deleted) return redirect("/albums");
	}
	throw new Response("Bad request", { status: 400 });
}

export default function AlbumDetail({ loaderData }: Route.ComponentProps) {
	const { album } = loaderData;

	return (
		<div>
			<div className="flex justify-between items-start mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
						{album.name}
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						/{album.slug} · {album.kind}
						{album.isPublic ? " · Public" : " · Private"}
					</p>
				</div>
				<div className="flex gap-2">
					<Link
						to={`/albums/${album.id}/edit`}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
					>
						Edit
					</Link>
					<Form method="post">
						<input type="hidden" name="_action" value="delete" />
						<button
							type="submit"
							className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium text-sm"
							onClick={(e) => {
								if (!confirm("Delete this album? This cannot be undone."))
									e.preventDefault();
							}}
						>
							Delete
						</button>
					</Form>
				</div>
			</div>
			{album.description && (
				<p className="text-gray-600 dark:text-gray-300 mb-6">
					{album.description}
				</p>
			)}
			<div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
				<p className="text-gray-500 dark:text-gray-400">
					No photos yet. Upload coming soon.
				</p>
			</div>
		</div>
	);
}
