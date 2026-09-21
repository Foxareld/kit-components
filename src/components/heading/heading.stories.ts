import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './heading.component.js';

/**
 * Renders a real `hN` element. Keeps the semantic level (document outline
 * position) independent of visual size — size defaults to a level-derived
 * value but can be overridden on its own.
 */
const meta: Meta = {
	title: 'Components/Heading',
	component: 'kit-heading',
	tags: ['autodocs'],
	argTypes: {
		level: { control: { type: 'number', min: 1, max: 6 } },
		size: {
			control: 'select',
			options: [
				'',
				'display',
				'title1',
				'title2',
				'title3',
				'title4',
				'title5',
				'title6',
			],
		},
	},
	args: {
		level: 2,
		size: '',
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-heading level=${args.level} size=${args.size}>Heading text</kit-heading>
	`,
};

/**
 * Every level with its level-derived default size — no size override.
 */
export const AllLevels: Story = {
	render: () => html`
		<kit-heading level="1">Level 1</kit-heading>
		<kit-heading level="2">Level 2</kit-heading>
		<kit-heading level="3">Level 3</kit-heading>
		<kit-heading level="4">Level 4</kit-heading>
		<kit-heading level="5">Level 5</kit-heading>
		<kit-heading level="6">Level 6</kit-heading>
	`,
};

/**
 * Semantic level and visual size set independently — an h4 that's visually
 * large, for when the document outline and the design don't want to match.
 */
export const SizeOverride: Story = {
	render: () =>
		html` <kit-heading level="4" size="display">Big h4</kit-heading> `,
};
