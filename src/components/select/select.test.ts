import { expect, fixture, html } from '@open-wc/testing';
import './select.component.js';
import '../option/option.component.js';
import { KitSelect } from './select.component.js';
import type { KitOption } from '../option/option.component.js';

describe('KitSelect', () => {
	it('renders the label', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);

		const label = el.shadowRoot?.querySelector('label');
		expect(label?.textContent).to.include('Region');
	});

	it('shows the placeholder when nothing is selected', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region" placeholder="Pick a region">
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);

		const trigger = el.shadowRoot?.querySelector('#trigger');
		expect(trigger?.textContent?.trim()).to.equal('Pick a region');
	});

	it('picks up an initially selected option as its value and trigger text', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1" selected>US East</kit-option>
			</kit-select>
		`);

		expect(el.value).to.equal('us-east-1');
		const trigger = el.shadowRoot?.querySelector('#trigger');
		expect(trigger?.textContent?.trim()).to.equal('US East');
	});

	it('opens the listbox on trigger click and focuses the selected option', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1" selected>US East</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [, usEast] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
		];

		trigger.click();
		await el.updateComplete;

		expect(trigger.getAttribute('aria-expanded')).to.equal('true');
		expect(document.activeElement).to.equal(usEast);
	});

	it('selects an option on click, closes the listbox, and returns focus to the trigger', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1">US East</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest] = [...el.querySelectorAll<KitOption>('kit-option')] as [KitOption];

		trigger.click();
		await el.updateComplete;

		euWest.click();
		await el.updateComplete;

		expect(el.value).to.equal('eu-west-1');
		expect(euWest.selected).to.be.true;
		expect(trigger.getAttribute('aria-expanded')).to.equal('false');
		expect(el.shadowRoot?.activeElement).to.equal(trigger);
	});

	it('dispatches a change event with the new value when an option is selected', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest] = [...el.querySelectorAll<KitOption>('kit-option')] as [KitOption];

		let detail: string | undefined;
		el.addEventListener('change', (e) => {
			detail = (e as CustomEvent<string>).detail;
		});

		trigger.click();
		await el.updateComplete;
		euWest.click();
		await el.updateComplete;

		expect(detail).to.equal('eu-west-1');
	});

	it('selects the focused option on Enter and Space without requiring a click', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1">US East</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
		];

		trigger.click();
		await el.updateComplete;
		euWest.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(el.value).to.equal('eu-west-1');
	});

	it('moves focus among options with arrow keys without selecting until committed', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1">US East</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest, usEast] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
		];

		trigger.click();
		await el.updateComplete;
		expect(document.activeElement).to.equal(euWest);

		euWest.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(document.activeElement).to.equal(usEast);
		expect(el.value).to.equal('');
	});

	it('wraps and skips disabled options when navigating with arrow keys', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1" disabled>US East</kit-option>
				<kit-option value="ap-south-1">AP South</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest, , apSouth] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
			KitOption,
		];

		trigger.click();
		await el.updateComplete;

		euWest.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(apSouth);

		apSouth.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(euWest);
	});

	it('jumps to the first/last option on Home/End', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1">US East</kit-option>
				<kit-option value="ap-south-1">AP South</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest, , apSouth] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
			KitOption,
		];

		trigger.click();
		await el.updateComplete;

		euWest.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(apSouth);

		apSouth.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(euWest);
	});

	it('opens the listbox with ArrowDown when the trigger has focus and it is closed', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;

		trigger.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(trigger.getAttribute('aria-expanded')).to.equal('true');
	});

	it('closes the listbox on Tab without selecting', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);
		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest] = [...el.querySelectorAll<KitOption>('kit-option')] as [KitOption];

		trigger.click();
		await el.updateComplete;

		euWest.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
		);
		await el.updateComplete;

		expect(trigger.getAttribute('aria-expanded')).to.equal('false');
		expect(el.value).to.equal('');
	});

	it('is invalid when required and nothing is selected', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region" required>
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);

		expect(el.checkValidity()).to.be.false;
		expect(el.validity.valueMissing).to.be.true;

		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [euWest] = [...el.querySelectorAll<KitOption>('kit-option')] as [KitOption];
		trigger.click();
		await el.updateComplete;
		euWest.click();
		await el.updateComplete;

		expect(el.checkValidity()).to.be.true;
	});

	it('shows an inline error message once validity is checked', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region" required>
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
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
				<kit-select label="Region" name="region">
					<kit-option value="eu-west-1">EU West</kit-option>
					<kit-option value="us-east-1" selected>US East</kit-option>
				</kit-select>
			</form>
		`);
		const el = form.querySelector('kit-select') as KitSelect;
		await el.updateComplete;

		const formData = new FormData(form);
		expect(formData.get('region')).to.equal('us-east-1');
	});

	it('resets to its initial value on formResetCallback', async () => {
		const form = await fixture<HTMLFormElement>(html`
			<form>
				<kit-select label="Region" name="region">
					<kit-option value="eu-west-1" selected>EU West</kit-option>
					<kit-option value="us-east-1">US East</kit-option>
				</kit-select>
			</form>
		`);
		const el = form.querySelector('kit-select') as KitSelect;
		await el.updateComplete;

		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		const [, usEast] = [...el.querySelectorAll<KitOption>('kit-option')] as [
			KitOption,
			KitOption,
		];
		trigger.click();
		await el.updateComplete;
		usEast.click();
		await el.updateComplete;
		expect(el.value).to.equal('us-east-1');

		form.reset();
		await el.updateComplete;

		expect(el.value).to.equal('eu-west-1');
	});

	it('setCustomValidity overrides required validity until cleared', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1" selected>EU West</kit-option>
			</kit-select>
		`);

		expect(el.checkValidity()).to.be.true;

		el.setCustomValidity('Wrong answer.');
		expect(el.checkValidity()).to.be.false;
		expect(el.validationMessage).to.equal('Wrong answer.');

		el.setCustomValidity('');
		expect(el.checkValidity()).to.be.true;
	});

	it('propagates disabled to the trigger button via kit-dropdown', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region" disabled>
				<kit-option value="eu-west-1">EU West</kit-option>
			</kit-select>
		`);

		const trigger = el.shadowRoot?.querySelector('#trigger') as HTMLButtonElement;
		expect(trigger.disabled).to.be.true;

		trigger.click();
		await el.updateComplete;
		expect(trigger.getAttribute('aria-expanded')).to.equal('false');
	});

	it('is accessible', async () => {
		const el = await fixture<KitSelect>(html`
			<kit-select label="Region">
				<kit-option value="eu-west-1">EU West</kit-option>
				<kit-option value="us-east-1">US East</kit-option>
			</kit-select>
		`);

		await expect(el).to.be.accessible();
	});
});
