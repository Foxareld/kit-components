import { expect, fixture, html } from '@open-wc/testing';
import './input.component.js';
import { KitInput } from './input.component.js';

describe('KitInput', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input>Content</kit-input>
		`);

		expect(el).to.exist;
		expect(el.variant).to.equal('default');
	});

	it('renders slotted content', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input>Test Content</kit-input>
		`);

		expect(el.textContent?.trim()).to.equal('Test Content');
	});

	it('applies variant correctly', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input variant="primary">Content</kit-input>
		`);

		expect(el.variant).to.equal('primary');
	});

	it('is accessible', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input>Accessible Content</kit-input>
		`);

		await expect(el).to.be.accessible();
	});
});
