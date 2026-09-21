import { expect, fixture, html } from '@open-wc/testing';
import './accordion-item.component.js';
import { KitAccordionItem } from './accordion-item.component.js';

describe('KitAccordionItem', () => {
	it('starts closed by default', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);

		expect(el.open).to.be.false;
		expect(el.hasAttribute('open')).to.be.false;
	});

	it('toggles open on header click and dispatches change', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item value="one">
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const button = el.shadowRoot!.querySelector('button')!;

		let detail: { open: boolean; value: string } | undefined;
		el.addEventListener('change', (event) => {
			detail = (event as CustomEvent).detail;
		});

		button.click();
		await el.updateComplete;

		expect(el.open).to.be.true;
		expect(detail).to.deep.equal({ open: true, value: 'one' });

		button.click();
		await el.updateComplete;

		expect(el.open).to.be.false;
		expect(detail).to.deep.equal({ open: false, value: 'one' });
	});

	it('does not toggle when disabled', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item disabled>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const button = el.shadowRoot!.querySelector('button')!;

		expect(button.disabled).to.be.true;

		button.click();
		await el.updateComplete;

		expect(el.open).to.be.false;
	});

	it('wires aria-expanded and aria-controls on the header button', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const button = el.shadowRoot!.querySelector('button')!;
		const panel = el.shadowRoot!.querySelector('[part="panel"]')!;

		expect(button.getAttribute('aria-expanded')).to.equal('false');
		expect(button.getAttribute('aria-controls')).to.equal(panel.id);

		el.open = true;
		await el.updateComplete;

		expect(button.getAttribute('aria-expanded')).to.equal('true');
	});

	it('marks the panel inert while closed', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const panel = el.shadowRoot!.querySelector('[part="panel"]') as HTMLElement;

		expect(panel.inert).to.be.true;

		el.open = true;
		await el.updateComplete;

		expect(panel.inert).to.be.false;
	});

	it('moves focus to the header button on focus()', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const button = el.shadowRoot!.querySelector('button')!;

		el.focus();

		expect(el.shadowRoot!.activeElement).to.equal(button);
	});

	it('wraps the trigger in a kit-heading at heading-level (default 3)', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item heading-level="4">
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);
		const heading = el.shadowRoot!.querySelector('kit-heading')!;

		expect(heading.getAttribute('level')).to.equal('4');
		expect(heading.contains(el.shadowRoot!.querySelector('button'))).to.be
			.true;
	});

	it('is accessible open and closed', async () => {
		const el = await fixture<KitAccordionItem>(html`
			<kit-accordion-item>
				<span slot="header">Header</span>
				Content
			</kit-accordion-item>
		`);

		await expect(el).to.be.accessible();

		el.open = true;
		await el.updateComplete;

		await expect(el).to.be.accessible();
	});
});
