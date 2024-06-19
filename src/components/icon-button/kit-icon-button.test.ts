import { fixture, expect, html } from '@open-wc/testing';

import './kit-icon-button';
import type KitIconButton from './kit-icon-button';

describe('Icon Button', () => {
	let element: KitIconButton;

	beforeEach(async () => {
		element = await fixture(html`<kit-icon-button></kit-icon-button>`);
	});

	it('renders a button with icon', async () => {
		const button = element.shadowRoot!.querySelector('button'),
			icon = element.shadowRoot!.querySelector('kit-icon');

		expect(icon).to.exist;
		expect(button).to.exist;
	});

	it('is not accessible', async () => {
		const button = element.shadowRoot!.querySelector('button');

		await expect(button).not.to.be.accessible();
	});

	it('is accessible', async () => {
		element = await fixture(
			html`<kit-icon-button label="This is a button"></kit-icon-button>`,
		);
		const button = element.shadowRoot!.querySelector('button');

		await expect(button).to.be.accessible();
	});
});
