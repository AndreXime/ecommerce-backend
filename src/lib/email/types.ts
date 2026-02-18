export type WelcomeJob = {
	type: "welcome";
	name: string;
	email: string;
};

export type ForgotPasswordJob = {
	type: "forgot-password";
	name: string;
	email: string;
	resetLink: string;
};

export type PromotionProduct = {
	id: string;
	name: string;
	price: number;
	discountPercentage: number | null;
	image: string;
};

export type PromotionJob = {
	type: "promotion";
	name: string;
	email: string;
	products: PromotionProduct[];
};

export type DispatchPromotionsJob = {
	type: "dispatch-promotions";
};

export type AbandonedCartItem = {
	name: string;
	image: string;
	price: number;
	quantity: number;
};

export type AbandonedCartJob = {
	type: "abandoned-cart";
	name: string;
	email: string;
	items: AbandonedCartItem[];
};

export type DispatchAbandonedCartsJob = {
	type: "dispatch-abandoned-carts";
};

export type EmailJobData =
	| WelcomeJob
	| ForgotPasswordJob
	| PromotionJob
	| DispatchPromotionsJob
	| AbandonedCartJob
	| DispatchAbandonedCartsJob;
