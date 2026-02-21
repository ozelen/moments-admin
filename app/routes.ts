import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	route("albums", "routes/albums.index.tsx"),
	route("albums/new", "routes/albums.new.tsx"),
	route("albums/:id", "routes/albums.$id.tsx"),
	route("albums/:id/edit", "routes/albums.$id.edit.tsx"),
] satisfies RouteConfig;
