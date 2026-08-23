import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getIconNames } from '../../assets/icons/icon-registry.js';
import './icon.component.js';

/**
 * Icon component for rendering SVG icons from the icon registry
 */
const meta: Meta = {
	title: 'Components/Icon',
	component: 'kit-icon',
	tags: ['autodocs'],
	argTypes: {
		name: {
			control: 'select',
			options: getIconNames(),
			description: 'Icon name from the registry',
		},
		size: {
			control: 'select',
			options: ['small', 'medium', 'default', 'large', 'xlarge'],
			description: 'Icon size',
		},
		color: {
			control: 'select',
			options: [
				'default',
				'success',
				'warning',
				'danger',
				'info',
				'white',
				'grey',
				'disabled',
			],
			description: 'Icon color',
		},
	},
	args: {
		name: 'emoji',
		size: 'default',
		color: 'default',
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-icon
			name=${args.name}
			size=${args.size}
			color=${args.color}
		></kit-icon>
	`,
};

export const Sizes: Story = {
	render: () => html`
		<div style="display: flex; gap: 1rem; align-items: center;">
			<kit-icon name="emoji" size="small"></kit-icon>
			<kit-icon name="emoji" size="medium"></kit-icon>
			<kit-icon name="emoji" size="default"></kit-icon>
			<kit-icon name="emoji" size="large"></kit-icon>
			<kit-icon name="emoji" size="xlarge"></kit-icon>
		</div>
	`,
};

export const Colors: Story = {
	render: () => html`
		<div style="display: flex; gap: 1rem; align-items: center;">
			<kit-icon name="emoji" color="default"></kit-icon>
			<kit-icon name="emoji" color="success"></kit-icon>
			<kit-icon name="emoji" color="warning"></kit-icon>
			<kit-icon name="emoji" color="danger"></kit-icon>
			<kit-icon name="emoji" color="info"></kit-icon>
			<kit-icon name="emoji" color="#ff00ff"></kit-icon>
		</div>
	`,
};

export const IconGallery: Story = {
	render: () => {
		const icons = getIconNames();
		return html`
			<div
				style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; padding: 1rem;"
			>
				${icons.map(
					(name) => html`
						<div
							style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
						>
							<kit-icon name=${name} size="large"></kit-icon>
							<span style="text-align: center;">${name}</span>
						</div>
					`,
				)}
			</div>
		`;
	},
};
