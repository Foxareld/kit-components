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

	it('syncs the value property when the user types', async () => {
		const el = await fixture<KitInput>(html` <kit-input></kit-input> `);

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.value = 'typed value';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

		expect(el.value).to.equal('typed value');
	});

	it('participates in native form submission via FormData', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-input name="email" value="hello@example.com"></kit-input>
			</form>
		`);
		const el = form.querySelector('kit-input') as KitInput;
		await el.updateComplete;

		const formData = new FormData(form);
		expect(formData.get('email')).to.equal('hello@example.com');
	});

	it('is invalid when a required field is empty, and valid once filled', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" required></kit-input>
		`);

		expect(el.checkValidity()).to.be.false;
		expect(el.validity.valueMissing).to.be.true;

		el.value = 'hello@example.com';
		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.value = 'hello@example.com';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;

		expect(el.checkValidity()).to.be.true;
	});

	it('setCustomValidity overrides native validity until cleared', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Color" value="red"></kit-input>
		`);

		expect(el.checkValidity()).to.be.true;

		el.setCustomValidity('Wrong answer.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Wrong answer.');

		el.setCustomValidity('');
		expect(el.checkValidity()).to.be.true;
	});

	it('exposes willValidate from the underlying ElementInternals', async () => {
		const el = await fixture<KitInput>(html` <kit-input></kit-input> `);

		expect(el.willValidate).to.be.true;
	});

	it('shows an inline error message and error styling once validity is checked', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" required></kit-input>
		`);

		expect(el.shadowRoot?.querySelector('.error-text')).to.not.exist;

		el.checkValidity();
		await el.updateComplete;

		const errorText = el.shadowRoot?.querySelector('.error-text');
		expect(errorText?.textContent?.trim()).to.equal(
			'This field is required.'
		);

		const input = el.shadowRoot?.querySelector('input');
		expect(input?.classList.contains('input-error')).to.be.true;
	});

	it('clears the inline error message once the field becomes valid', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" required></kit-input>
		`);

		el.checkValidity();
		await el.updateComplete;
		expect(el.shadowRoot?.querySelector('.error-text')).to.exist;

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.value = 'hello@example.com';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;

		expect(el.shadowRoot?.querySelector('.error-text')).to.not.exist;
	});

	it('resets to its initial value on formResetCallback', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-input name="firstName" value="Ada"></kit-input>
			</form>
		`);
		const el = form.querySelector('kit-input') as KitInput;
		await el.updateComplete;

		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
		input.value = 'Changed';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;
		expect(el.value).to.equal('Changed');

		form.reset();
		await el.updateComplete;

		expect(el.value).to.equal('Ada');
		expect(input.value).to.equal('Ada');
	});

	it('supports declarative isInvalid and customError properties', async () => {
		const el = await fixture<KitInput>(html` <kit-input value="red"></kit-input> `);
		expect(el.checkValidity()).to.be.true;

		el.customError = 'Wrong answer.';
		el.isInvalid = true;
		await el.updateComplete;

		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Wrong answer.');
		expect(el.shadowRoot?.querySelector('.error-text')?.textContent?.trim()).to.equal(
			'Wrong answer.'
		);

		el.isInvalid = false;
		await el.updateComplete;

		expect(el.checkValidity()).to.be.true;
	});

	it('setValidity accepts arbitrary constraint flags', async () => {
		const el = await fixture<KitInput>(html` <kit-input value="10"></kit-input> `);
		expect(el.checkValidity()).to.be.true;

		el.setValidity({ rangeOverflow: true }, 'Too high.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Too high.');

		el.setValidity({}, '');
		expect(el.checkValidity()).to.be.true;
	});

	it('exposes the owning form via the form getter', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-input name="firstName"></kit-input>
			</form>
		`);
		const el = form.querySelector('kit-input') as KitInput;

		expect(el.form).to.equal(form);
	});

	it('delegates focus, blur, and setSelectionRange to the native input', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email" value="hello@example.com"></kit-input>
		`);
		const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

		el.focus();
		expect(el.shadowRoot?.activeElement).to.equal(input);

		el.setSelectionRange(1, 3);
		expect(input.selectionStart).to.equal(1);
		expect(input.selectionEnd).to.equal(3);

		el.blur();
		expect(el.shadowRoot?.activeElement).to.be.null;
	});

	it('renders an icon when the icon property is set, positioned by iconPlacement', async () => {
		const el = await fixture<KitInput>(html` <kit-input></kit-input> `);
		expect(el.shadowRoot?.querySelector('kit-icon')).to.not.exist;

		el.icon = 'plus';
		await el.updateComplete;

		const icon = el.shadowRoot?.querySelector('kit-icon');
		expect(icon).to.exist;
		expect(icon?.getAttribute('name')).to.equal('plus');
		expect(icon?.classList.contains('icon-right')).to.be.false;

		el.iconPlacement = 'right';
		await el.updateComplete;

		expect(icon?.classList.contains('icon-right')).to.be.true;
		expect(
			el.shadowRoot?.querySelector('input')?.classList.contains('icon-right')
		).to.be.true;
	});

	it('is accessible', async () => {
		const el = await fixture<KitInput>(html`
			<kit-input label="Email"></kit-input>
		`);

		await expect(el).to.be.accessible();
	});
});
