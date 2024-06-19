import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './kit-radio';

const meta: Meta = {
	title: 'Radio',
	component: 'kit-radio',
	args: {
		label: 'My Radio',
		name: 'radio',
		value: 'radio',
		checked: false,
	},
};

export default meta;

type Story = StoryObj;

export const Radio: Story = {
	render: (args) =>
		html`<kit-radio
			name=${args.name}
			value=${args.value}
			?checked=${args.checked}
			?disabled=${args.disabled}
		>
			${args.label}
		</kit-radio>`,
};
