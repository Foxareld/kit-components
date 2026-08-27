import { expect, fixture, html } from '@open-wc/testing';
import './input.component.js';
import { KitInput } from './input.component.js';

describe('KitInput', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitInput>(html` <kit-input></kit-input> `);

		expect(el).to.exist;
		expect(el.disabled).to.be.false;
		expect(el.required).to.be.false;
		expect(el.type).to.equal('text');
		expect(el.value).to.equal('');
	});

	it('renders the label text', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email"></kit-input>
		`);

		const label = el.shadowRoot?.querySelector('label');
		expect(label?.textContent?.trim()).to.equal('Email');
	});

	it('associates the label with the input via for/id', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" name="email"></kit-input>
		`);

		const label = el.shadowRoot?.querySelector('label');
		const input = el.shadowRoot?.querySelector('input');

		expect(label?.getAttribute('for')).to.be.a('string').that.is.not.empty;
		expect(label?.getAttribute('for')).to.equal(input?.id);
	});

	it('shows a required indicator and marks the input required', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" required></kit-input>
		`);

		const label = el.shadowRoot?.querySelector('label');
		const input = el.shadowRoot?.querySelector('input');

		expect(label?.textContent).to.include('*');
		expect(input?.required).to.be.true;
	});

	it('reflects disabled state onto the input element', async () => {
		const el = await fixture<KitInput>(html` <kit-input disabled></kit-input> `);

		const input = el.shadowRoot?.querySelector('input');
		expect(input?.disabled).to.be.true;
	});

	it('reflects type and name onto the input element', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input type="email" name="email"></kit-input>
		`);

		const input = el.shadowRoot?.querySelector('input');
		expect(input?.type).to.equal('email');
		expect(input?.name).to.equal('email');
	});

	it('reflects the value property onto the input element', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input value="hello"></kit-input>
		`);

		const input = el.shadowRoot?.querySelector('input');
		expect(input?.value).to.equal('hello');
	});

	it('is accessible', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email"></kit-input>
		`);

		await expect(el).to.be.accessible();
	});
});
