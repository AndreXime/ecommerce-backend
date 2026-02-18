import { createAuthRoutes } from "./auth";
import { createCartRoutes } from "./cart";
import { createCategoriesRoutes } from "./categories";
import { createHealthRoutes } from "./health";
import { createOrdersRoutes } from "./orders";
import { createProductsRoutes } from "./products";
import { createRoutesUser } from "./user";
import { createWishlistRoutes } from "./wishlist";

const registerRoutes = (server: ServerType) => {
	server.route("/health", createHealthRoutes());
	server.route("/auth", createAuthRoutes());
	server.route("/users", createRoutesUser());
	server.route("/products", createProductsRoutes());
	server.route("/categories", createCategoriesRoutes());
	server.route("/cart", createCartRoutes());
	server.route("/wishlist", createWishlistRoutes());
	server.route("/orders", createOrdersRoutes());
};

export { registerRoutes };
