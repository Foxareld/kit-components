import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './accordion.component.js';
import '../accordion-item/accordion-item.component.js';

/**
 * Groups kit-accordion-item children: arrow-key navigation between headers
 * and, opt-in via `single`, mutual exclusivity. Items are open/closed
 * independently by default.
 */
const meta: Meta = {
	title: 'Components/Accordion',
	component: 'kit-accordion',
	tags: ['autodocs'],
	argTypes: {
		single: {
			control: 'boolean',
			description: 'Opening one item closes every other item',
		},
	},
	args: {
		single: false,
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-accordion ?single=${args.single}>
			<kit-accordion-item value="what">
				<span slot="header">What is Kit?</span>
				A Lit-based web component library.
			</kit-accordion-item>
			<kit-accordion-item value="why" open>
				<span slot="header">Why Shadow DOM?</span>
				Style isolation without a build-time CSS-in-JS layer.
			</kit-accordion-item>
			<kit-accordion-item value="disabled" disabled>
				<span slot="header">Disabled item</span>
				Not reachable.
			</kit-accordion-item>
		</kit-accordion>
	`,
};

/**
 * With `single`, opening one item closes the others — the same mutual
 * exclusivity kit-tab-group enforces between tabs.
 */
export const SingleOpen: Story = {
	render: () => html`
		<kit-accordion single>
			<kit-accordion-item value="one" open>
				<span slot="header">Section one</span>
				First panel content.
			</kit-accordion-item>
			<kit-accordion-item value="two">
				<span slot="header">Section two</span>
				Second panel content.
			</kit-accordion-item>
			<kit-accordion-item value="three">
				<span slot="header">Section three</span>
				Third panel content.
			</kit-accordion-item>
		</kit-accordion>
	`,
};
