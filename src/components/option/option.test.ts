import { expect, fixture, html } from '@open-wc/testing';
import './option.component.js';
import { KitOption } from './option.component.js';

describe('KitOption', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitOption>(html` <kit-option>Option</kit-option> `);

		expect(el).to.exist;
		expect(el.selected).to.be.false;
		expect(el.disabled).to.be.false;
		expect(el.value).to.equal('');
	});

	it('renders slotted label content', async () => {
		const el = await fixture<KitOption>(html`
			<kit-option>eu-west-1</kit-option>
		`);

		expect(el.textContent?.trim()).to.equal('eu-west-1');
	});

	it('sets ARIA role and selected state', async () => {
		const el = await fixture<KitOption>(html`
			<kit-option selected>Option</kit-option>
		`);

		expect(el.getAttribute('role')).to.equal('option');
		expect(el.getAttribute('aria-selected')).to.equal('true');
	});

	it('renders a check icon only when selected', async () => {
		const el = await fixture<KitOption>(html` <kit-option>Option</kit-option> `);
		expect(el.shadowRoot?.querySelector('kit-icon')).to.not.exist;

		el.selected = true;
		await el.updateComplete;
		expect(el.shadowRoot?.querySelector('kit-icon')?.getAttribute('name')).to.equal(
			'check'
		);
	});

	it('becomes selected on click', async () => {
		const el = await fixture<KitOption>(html` <kit-option>Option</kit-option> `);

		el.click();
		await el.updateComplete;

		expect(el.selected).to.be.true;
		expect(el.getAttribute('aria-selected')).to.equal('true');
	});

	it('becomes selected on Space keydown', async () => {
		const el = await fixture<KitOption>(html` <kit-option>Option</kit-option> `);

		el.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(el.selected).to.be.true;
	});

	it('ignores click and keydown when disabled', async () => {
		const el = await fixture<KitOption>(html`
			<kit-option disabled>Option</kit-option>
		`);

		el.click();
		el.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(el.selected).to.be.false;
		expect(el.getAttribute('aria-disabled')).to.equal('true');
	});

	it('is accessible', async () => {
		// role="option" requires a role="listbox" ancestor per ARIA, which
		// kit-select normally provides — supply one directly here since this
		// test exercises kit-option in isolation.
		const container = await fixture<HTMLDivElement>(html`
			<div role="listbox" aria-label="Options">
				<kit-option>Accessible option</kit-option>
			</div>
		`);

		await expect(container).to.be.accessible();
	});
});
