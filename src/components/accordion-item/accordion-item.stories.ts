import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './accordion-item.component.js';

/**
 * A single collapsible header/panel pair. Fully self-contained — it works
 * standalone, without a parent kit-accordion, toggling its own `open` state
 * on click.
 */
const meta: Meta = {
	title: 'Components/Accordion Item',
	component: 'kit-accordion-item',
	tags: ['autodocs'],
	argTypes: {
		open: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
	args: {
		open: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-accordion-item ?open=${args.open} ?disabled=${args.disabled}>
			<span slot="header">What is Kit?</span>
			A Lit-based web component library.
		</kit-accordion-item>
	`,
};
