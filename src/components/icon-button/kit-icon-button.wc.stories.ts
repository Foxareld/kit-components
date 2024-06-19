import type { Meta, StoryObj } from '@storybook/web-components';
import type { IconButtonSize, IconButtonVariant } from './kit-icon-button';
import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

import '../icon/kit-icon';
import './kit-icon-button';

// @ts-expect-error - TS doesn't know definitions
const iconNames = Object.keys(library.definitions.fas).map((icon) => {
	return icon;
});

const variantOptions: IconButtonVariant[] = [
		'primary',
		'transparent',
		'success',
		'grey',
	],
	sizeOptions: IconButtonSize[] = ['small', 'medium', 'large'];

const meta: Meta = {
	title: 'Icon Button',
	component: 'kit-icon-button',
	args: {
		icon: 'user',
		onclick: action('Clicked'),
		variant: 'primary',
	},
	argTypes: {
		disabled: {
			control: 'boolean',
		},
		icon: {
			options: iconNames,
			control: { type: 'select' },
		},
		label: {
			control: 'text',
		},
		size: {
			options: sizeOptions,
			control: { type: 'radio' },
		},
		variant: {
			options: variantOptions,
			control: { type: 'radio' },
		},
	},
	decorators: [
		(story) =>
			html`<div style={{ width: '800px', height: '600px', placeContent: 'center'}}>
			${story()}
		</div>`,
	],
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
	render: (args) =>
		html`<kit-icon-button
			icon=${args.icon}
			label=${args.label}
			size=${args.size}
			variant=${args.variant}
			?disabled=${args.disabled}
			@click=${action('clicked')}
		></kit-icon-button>`,
};
