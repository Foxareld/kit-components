import { expect, fixture, html } from '@open-wc/testing';
import './heading.component.js';
import { KitHeading } from './heading.component.js';

describe('KitHeading', () => {
	it('renders the matching hN tag for level', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading level="3">Section</kit-heading>
		`);
		const rendered = el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6')!;

		expect(rendered.tagName).to.equal('H3');
	});

	it('defaults to level 2', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading>Section</kit-heading>
		`);
		const rendered = el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6')!;

		expect(rendered.tagName).to.equal('H2');
	});

	it('clamps out-of-range levels to 1-6', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading level="9">Section</kit-heading>
		`);
		const rendered = el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6')!;

		expect(rendered.tagName).to.equal('H6');
	});

	it('derives visual size from level (titleN) when size is unset', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading level="1">Section</kit-heading>
		`);
		const rendered = el.shadowRoot!.querySelector('h1')!;

		expect(rendered.classList.contains('size-title1')).to.be.true;
	});

	it('lets size override the level-derived default', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading level="1" size="display">Section</kit-heading>
		`);
		const rendered = el.shadowRoot!.querySelector('h1')!;

		expect(rendered.classList.contains('size-display')).to.be.true;
		expect(rendered.classList.contains('size-title1')).to.be.false;
	});

	it('renders slotted content', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading>Section title</kit-heading>
		`);

		expect(el.textContent?.trim()).to.equal('Section title');
	});

	it('is accessible', async () => {
		const el = await fixture<KitHeading>(html`
			<kit-heading level="2">Section title</kit-heading>
		`);

		await expect(el).to.be.accessible();
	});
});
