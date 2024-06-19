import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
	stories: [
		'../../src/**/*.mdx',
		'../../src/**/*.react.stories.@(js|jsx|mjs|ts|tsx)',
	],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@chromatic-com/storybook',
	],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	docs: {},
	typescript: {
		reactDocgen: 'react-docgen-typescript', //https://github.com/storybookjs/storybook/issues/27175
	},
};
export default config;
