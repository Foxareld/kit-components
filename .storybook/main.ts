import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs',
	],
	framework: '@storybook/web-components-vite',
	async viteFinal(config) {
		// Watch generated .styles.ts files for HMR
		config.server = config.server || {};
		config.server.watch = config.server.watch || {};
		config.server.watch.include = config.server.watch.include || [];

		if (Array.isArray(config.server.watch.include)) {
			config.server.watch.include.push('src/**/*.styles.ts');
		}

		return config;
	},
};
export default config;
