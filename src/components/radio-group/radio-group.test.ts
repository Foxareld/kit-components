import { expect, fixture, html } from '@open-wc/testing';
import './radio-group.component.js';
import '../radio/radio.component.js';
import { KitRadioGroup } from './radio-group.component.js';
import type { KitRadio } from '../radio/radio.component.js';

describe('KitRadioGroup', () => {
	it('renders the label in the legend', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red">Red</kit-radio>
				<kit-radio value="green">Green</kit-radio>
			</kit-radio-group>
		`);

		const legend = el.shadowRoot?.querySelector('legend');
		expect(legend?.textContent?.trim()).to.equal('Favorite color');
	});

	it('picks up an initially checked radio as its value', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red">Red</kit-radio>
				<kit-radio value="green" checked>Green</kit-radio>
			</kit-radio-group>
		`);

		expect(el.value).to.equal('green');
	});

	it('enforces mutual exclusivity when a radio is clicked', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red" checked>Red</kit-radio>
				<kit-radio value="green">Green</kit-radio>
			</kit-radio-group>
		`);
		const [red, green] = [...el.querySelectorAll<KitRadio>('kit-radio')] as [KitRadio, KitRadio];

		green.click();
		await el.updateComplete;

		expect(red.checked).to.be.false;
		expect(green.checked).to.be.true;
		expect(el.value).to.equal('green');
	});

	it('moves focus and selection with arrow keys, wrapping and skipping disabled radios', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red" checked>Red</kit-radio>
				<kit-radio value="green" disabled>Green</kit-radio>
				<kit-radio value="blue">Blue</kit-radio>
			</kit-radio-group>
		`);
		const [red, , blue] = [...el.querySelectorAll<KitRadio>('kit-radio')] as [KitRadio, KitRadio, KitRadio];

		red.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
		);
		await el.updateComplete;

		expect(blue.checked).to.be.true;
		expect(el.value).to.equal('blue');
		expect(el.shadowRoot?.activeElement).to.be.null; // focus moved to light DOM
		expect(document.activeElement).to.equal(blue);
	});

	it('defaults roving tabindex to the first enabled radio when nothing is checked', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red" disabled>Red</kit-radio>
				<kit-radio value="green">Green</kit-radio>
				<kit-radio value="blue">Blue</kit-radio>
			</kit-radio-group>
		`);
		const [red, green, blue] = [...el.querySelectorAll<KitRadio>('kit-radio')] as [KitRadio, KitRadio, KitRadio];

		expect(red.tabIndex).to.equal(-1);
		expect(green.tabIndex).to.equal(0);
		expect(blue.tabIndex).to.equal(-1);
	});

	it('is invalid when required and nothing is checked', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color" required>
				<kit-radio value="red">Red</kit-radio>
				<kit-radio value="green">Green</kit-radio>
			</kit-radio-group>
		`);

		expect(el.checkValidity()).to.be.false;
		expect(el.validity.valueMissing).to.be.true;

		const [red] = [...el.querySelectorAll<KitRadio>('kit-radio')] as [KitRadio];
		red.click();
		await el.updateComplete;

		expect(el.checkValidity()).to.be.true;
	});

	it('shows an inline error message once validity is checked', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color" required>
				<kit-radio value="red">Red</kit-radio>
			</kit-radio-group>
		`);

		expect(el.shadowRoot?.querySelector('.error-text')).to.not.exist;

		el.checkValidity();
		await el.updateComplete;

		expect(
			el.shadowRoot?.querySelector('.error-text')?.textContent?.trim()
		).to.equal('Please select an option.');
	});

	it('participates in native form submission via FormData', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-radio-group label="Favorite color" name="color">
					<kit-radio value="red">Red</kit-radio>
					<kit-radio value="green" checked>Green</kit-radio>
				</kit-radio-group>
			</form>
		`);
		const el = form.querySelector('kit-radio-group') as KitRadioGroup;
		await el.updateComplete;

		const formData = new FormData(form);
		expect(formData.get('color')).to.equal('green');
	});

	it('resets to its initial value on formResetCallback', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-radio-group label="Favorite color" name="color">
					<kit-radio value="red" checked>Red</kit-radio>
					<kit-radio value="green">Green</kit-radio>
				</kit-radio-group>
			</form>
		`);
		const el = form.querySelector('kit-radio-group') as KitRadioGroup;
		await el.updateComplete;

		const [red, green] = [...el.querySelectorAll<KitRadio>('kit-radio')] as [KitRadio, KitRadio];
		green.click();
		await el.updateComplete;
		expect(el.value).to.equal('green');

		form.reset();
		await el.updateComplete;

		expect(el.value).to.equal('red');
		expect(red.checked).to.be.true;
		expect(green.checked).to.be.false;
	});

	it('setCustomValidity overrides required validity until cleared', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red" checked>Red</kit-radio>
			</kit-radio-group>
		`);

		expect(el.checkValidity()).to.be.true;

		el.setCustomValidity('Wrong answer.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Wrong answer.');

		el.setCustomValidity('');
		expect(el.checkValidity()).to.be.true;
	});

	it('is accessible', async () => {
		const el = await fixture<KitRadioGroup>(html`
			<kit-radio-group label="Favorite color">
				<kit-radio value="red">Red</kit-radio>
				<kit-radio value="green">Green</kit-radio>
			</kit-radio-group>
		`);

		await expect(el).to.be.accessible();
	});
});
