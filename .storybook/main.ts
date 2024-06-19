import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.wc.stories.@(js|jsx|mjs|ts|tsx)'],

	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@chromatic-com/storybook',
	],

	framework: {
		name: '@storybook/web-components-vite',
		options: {},
	},

	docs: {},
	refs: () => ({
		react: {
			title: 'React',
			url: 'http://localhost:6007',
		},
	}),
};
export default config;
