import { prometheus } from "@hono/prometheus";
import { Registry } from "prom-client";

const metricsRegistry = new Registry();

const { printMetrics, registerMetrics } = prometheus({
	registry: metricsRegistry,
	collectDefaultMetrics: true,
	prefix: "ecommerce_backend_",
});

export { printMetrics, registerMetrics };
