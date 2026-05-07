import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack: (config, { dev }) => {
		if (dev) {
			config.watchOptions = {
				...(config.watchOptions ?? {}),
				poll: 1000,
				aggregateTimeout: 300,
			};
		}

		return config;
	},
	async rewrites() {
		const destinationBase =
			process.env.INTERNAL_API_URL ??
			process.env.NEXT_PUBLIC_API_URL ??
			"http://localhost:8000/api/v1";

		return [
			{
				source: "/api/v1/:path*",
				destination: `${destinationBase}/:path*`,
			},
		];
	},
};

export default nextConfig;

