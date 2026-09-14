import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './dropdown.component.js';
import '../button/button.component.js';

/**
 * Anchors floating content to a trigger and shows/hides it via the native
 * Popover API. Content-agnostic — it only owns opening/closing and
 * positioning. Compose whatever content you need (a menu, a form, plain
 * text) inside it.
 */
const meta: Meta = {
	title: 'Components/Dropdown',
	component: 'kit-dropdown',
	tags: ['autodocs'],
	argTypes: {
		open: {
			control: 'boolean',
			description: 'Whether the dropdown content is open',
		},
		disableTrigger: {
			control: 'boolean',
			description:
				'Disables the default toggle-on-click behavior of the trigger slot',
		},
		disabled: {
			control: 'boolean',
			description:
				"Disables the dropdown entirely, including the trigger element's own disabled styling",
		},
	},
	args: {
		open: false,
		disableTrigger: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-dropdown control. Use the controls
 * panel to explore variants instead of maintaining a separate story per
 * prop combination.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-dropdown
			?open=${args.open}
			?disable-trigger=${args.disableTrigger}
			?disabled=${args.disabled}
		>
			<kit-button slot="trigger">Open dropdown</kit-button>
			<div
				style="padding: 1rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); box-shadow: var(--shadow-md);"
			>
				Dropdown content
			</div>
		</kit-dropdown>
	`,
};

/**
 * A realistic composition: kit-dropdown provides the trigger/positioning/
 * dismiss behavior, and a plain list of buttons plays the role a future
 * kit-menu would. The menu's own keyboard/click handling is entirely the
 * consumer's — kit-dropdown doesn't know or care what's inside it.
 */
export const WithAMenu: Story = {
	render: () => {
		const handleItemClick = (event: Event) => {
			const dropdown = (event.currentTarget as HTMLElement).closest(
				'kit-dropdown'
			);
			if (dropdown) (dropdown as HTMLElement & { open: boolean }).open = false;
		};

		return html`
			<style>
				.demo-menu {
					display: flex;
					flex-direction: column;
					min-width: 160px;
					padding: var(--spacing-xs, 0.25rem);
					background: var(--color-white);
					border: 1px solid var(--color-border);
					border-radius: var(--border-radius-md);
					box-shadow: var(--shadow-md);
				}
				.demo-menu button {
					display: block;
					width: 100%;
					padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
					border: none;
					background: none;
					font: inherit;
					text-align: left;
					border-radius: var(--border-radius-sm);
					cursor: pointer;
				}
				.demo-menu button:hover {
					background: var(--color-border);
				}
			</style>
			<kit-dropdown>
				<kit-button slot="trigger">Actions</kit-button>
				<div class="demo-menu" role="menu">
					<button role="menuitem" @click=${handleItemClick}>Edit</button>
					<button role="menuitem" @click=${handleItemClick}>Duplicate</button>
					<button role="menuitem" @click=${handleItemClick}>Delete</button>
				</div>
			</kit-dropdown>
		`;
	},
};
