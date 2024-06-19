import React from 'react';
import { KitButton } from './KitButton';
import { action } from '@storybook/addon-actions';

const meta = {
	title: 'React/Button',
	component: KitButton,
	argTypes: {
		disabled: {
			control: 'boolean',
		},
		size: {
			control: {
				type: 'select',
				options: ['small', 'medium', 'large'],
			},
		},
		variant: {
			control: {
				type: 'select',
				options: ['primary', 'secondary', 'transparent'],
			},
		},
	},
};

export default meta;


export const Button = {
	render: () => <KitButton onClick={action('clicked')}>Click me</KitButton>,
};
