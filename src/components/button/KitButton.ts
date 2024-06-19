import React from 'react';
import { createComponent } from '@lit/react';
import { default as KtButton } from './kit-button';

export const KitButton = createComponent({
	tagName: 'kit-button',
	react: React,
	elementClass: KtButton,
	events: {
		onClick: 'click',
	},
});
