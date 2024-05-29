import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './kit-button';
import type KitButton from './kit-button';

let button: KitButton;

describe('kit-button', () => {
	beforeEach(async () => {
		button = await fixture(html`<kit-button>Button Text</kit-button>`);
	});

	it('renders', () => {
		expect(button).to.exist;
	});

	it('renders with text', async () => {
		const slot = button.shadowRoot!.querySelector('slot'),
			[name] = slot!.assignedNodes();

		expect(name).to.have.trimmed.text('Button Text');
	});

	it('is accessible', async () => {
		await expect(button).to.be.accessible();
	});
});
