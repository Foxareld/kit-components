import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import './kit-icon';

library.add(fas);

// @ts-expect-error - TS doesn't know definitions
const iconNames = Object.keys(library.definitions.fas).map((icon) => {
	return icon;
});

iconNames.sort();

const meta: Meta = {
	title: 'Icon',
	component: 'kit-icon',
	argTypes: {
		icon: {
			options: iconNames,
			control: { type: 'select' },
		},
		color: {
			options: [
				'default',
				'success',
				'warning',
				'danger',
				'info',
				'white',
				'disabled',
			],
			control: { type: 'select' },
		},
		size: {
			options: ['small', 'medium', 'default', 'large'],
			control: { type: 'radio' },
		},
	},
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
	render: (args) =>
		html`<kit-icon
			icon=${args.icon}
			size=${args.size}
			color=${ifDefined(args.color)}
		></kit-icon>`,
	args: {
		icon: 'user',
	},
};

export const List: Story = {
	render: (args) => {
		const iconList = iconNames.map((icon) => {
			return html`
				<div
					style="display: flex; align-items: center; margin-bottom: 15px;"
				>
					<kit-icon
						icon=${icon}
						size=${args.size}
						color=${ifDefined(args.color)}
					></kit-icon>
					<span style="display:inline-block; margin-left: 4px;"
						>- ${icon}</span
					>
				</div>
			`;
		});

		return html`<div>${iconList}</div>`;
	},
};
