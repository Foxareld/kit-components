import { expect, fixture, html } from '@open-wc/testing';
import './checkbox.component.js';
import { KitCheckbox } from './checkbox.component.js';

describe('KitCheckbox', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitCheckbox>(html` <kit-checkbox></kit-checkbox> `);

		expect(el).to.exist;
		expect(el.checked).to.be.false;
		expect(el.disabled).to.be.false;
		expect(el.required).to.be.false;
		expect(el.indeterminate).to.be.false;
		expect(el.value).to.equal('on');
	});

	it('renders slotted label content', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox>Accept terms</kit-checkbox>
		`);

		expect(el.textContent?.trim()).to.include('Accept terms');
	});

	it('associates the label with the input via for/id', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox>Accept terms</kit-checkbox>
		`);

		const label = el.shadowRoot?.querySelector('label');
		const input = el.shadowRoot?.querySelector('input');

		expect(label?.getAttribute('for')).to.be.a('string').that.is.not.empty;
		expect(label?.getAttribute('for')).to.equal(input?.id);
	});

	it('reflects checked, disabled, and indeterminate onto the input element', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox checked disabled indeterminate></kit-checkbox>
		`);

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		expect(input.checked).to.be.true;
		expect(input.disabled).to.be.true;
		expect(input.indeterminate).to.be.true;
	});

	it('shows a required indicator and marks the input required', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox required>Accept terms</kit-checkbox>
		`);

		const input = el.shadowRoot?.querySelector('input');
		expect(el.shadowRoot?.querySelector('.required-indicator')).to.exist;
		expect(input?.required).to.be.true;
	});

	it('syncs the checked property when the user toggles the native input', async () => {
		const el = await fixture<KitCheckbox>(html` <kit-checkbox></kit-checkbox> `);

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.checked = true;
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

		expect(el.checked).to.be.true;
	});

	it('participates in native form submission via FormData', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-checkbox name="terms" value="accepted" checked></kit-checkbox>
			</form>
		`);
		const el = form.querySelector('kit-checkbox') as KitCheckbox;
		await el.updateComplete;

		let formData = new FormData(form);
		expect(formData.get('terms')).to.equal('accepted');

		el.checked = false;
		await el.updateComplete;

		formData = new FormData(form);
		expect(formData.get('terms')).to.be.null;
	});

	it('is invalid when a required checkbox is unchecked, and valid once checked', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox required>Accept terms</kit-checkbox>
		`);

		expect(el.checkValidity()).to.be.false;
		expect(el.validity.valueMissing).to.be.true;

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.checked = true;
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;

		expect(el.checkValidity()).to.be.true;
	});

	it('setCustomValidity overrides native validity until cleared', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox checked>Accept terms</kit-checkbox>
		`);

		expect(el.checkValidity()).to.be.true;

		el.setCustomValidity('Not allowed.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Not allowed.');

		el.setCustomValidity('');
		expect(el.checkValidity()).to.be.true;
	});

	it('setValidity accepts arbitrary constraint flags', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox checked>Accept terms</kit-checkbox>
		`);
		expect(el.checkValidity()).to.be.true;

		el.setValidity({ customError: true }, 'Blocked.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Blocked.');

		el.setValidity({}, '');
		expect(el.checkValidity()).to.be.true;
	});

	it('shows an inline error message once validity is checked', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox required>Accept terms</kit-checkbox>
		`);

		expect(el.shadowRoot?.querySelector('.error-text')).to.not.exist;

		el.checkValidity();
		await el.updateComplete;

		const errorText = el.shadowRoot?.querySelector('.error-text');
		expect(errorText?.textContent?.trim()).to.equal('This field is required.');
	});

	it('clears the inline error message once the field becomes valid', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox required>Accept terms</kit-checkbox>
		`);

		el.checkValidity();
		await el.updateComplete;
		expect(el.shadowRoot?.querySelector('.error-text')).to.exist;

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.checked = true;
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;

		expect(el.shadowRoot?.querySelector('.error-text')).to.not.exist;
	});

	it('resets to whatever was checked at connect time on formResetCallback', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-checkbox name="terms" checked></kit-checkbox>
			</form>
		`);
		const el = form.querySelector('kit-checkbox') as KitCheckbox;
		await el.updateComplete;

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.checked = false;
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;
		expect(el.checked).to.be.false;

		form.reset();
		await el.updateComplete;

		expect(el.checked).to.be.true;
		expect(input.checked).to.be.true;
	});

	it('exposes the owning form via the form getter', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-checkbox name="terms"></kit-checkbox>
			</form>
		`);
		const el = form.querySelector('kit-checkbox') as KitCheckbox;

		expect(el.form).to.equal(form);
	});

	it('delegates focus and blur to the native input', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox>Accept terms</kit-checkbox>
		`);
		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

		el.focus();
		expect(el.shadowRoot?.activeElement).to.equal(input);

		el.blur();
		expect(el.shadowRoot?.activeElement).to.be.null;
	});

	it('is accessible', async () => {
		const el = await fixture<KitCheckbox>(html`
			<kit-checkbox>Accept terms</kit-checkbox>
		`);

		await expect(el).to.be.accessible();
	});
});
