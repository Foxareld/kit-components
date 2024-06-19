import { html, fixture, expect } from '@open-wc/testing';
import type KitRadioGroup from './kit-radio-group';
import './kit-radio-group';
import '../radio/kit-radio';
import { sendKeys } from '@web/test-runner-commands';

describe('FSRadioGroup', () => {
	let el: KitRadioGroup;
	it('renders the component', async () => {
		el = await fixture(
			html`<kit-radio-group name="radioWC">
				<kit-radio value="1">Radio One</kit-radio>
				<kit-radio value="2">Radio Two</kit-radio>
				<kit-radio value="3">Radio Three</kit-radio>
			</kit-radio-group>`,
		);

		el.updateComplete;
		expect(el).shadowDom.to.equalSnapshot();
	});

	it('can set/get the value via the value property', async () => {
		el = await fixture(
			html`<kit-radio-group name="radioWC">
				<kit-radio value="1">Radio One</kit-radio>
				<kit-radio value="2">Radio Two</kit-radio>
				<kit-radio value="3">Radio Three</kit-radio>
			</kit-radio-group>`,
		);

		el.updateComplete;
		el.value = 'Hello';
		expect(el.value).to.equal('Hello');
	});

	it('can set/get the value via the value attribute', async () => {
		el = await fixture(
			html`<kit-radio-group value="Hello" name="radioWC">
				<kit-radio value="1">Radio One</kit-radio>
				<kit-radio value="2">Radio Two</kit-radio>
				<kit-radio value="3">Radio Three</kit-radio>
			</kit-radio-group>`,
		);

		el.updateComplete;
		expect(el.value).to.equal('Hello');
	});

	it('value is set to checked radio', async () => {
		el = await fixture(html`
			<kit-radio-group>
				<kit-radio value="1"></kit-radio>
				<kit-radio value="2" checked></kit-radio>
				<kit-radio value="3"></kit-radio>
			</kit-radio-group>
		`);

		el.updateComplete;
		expect(el.value).to.equal('2');
	});

	it('navigate through radios with arrow keys', async () => {
		el = await fixture(html`
			<kit-radio-group name="radioWC">
				<kit-radio value="1">Radio One</kit-radio>
				<kit-radio value="2">Radio Two</kit-radio>
				<kit-radio value="3">Radio Three</kit-radio>
			</kit-radio-group>
		`);

		el.updateComplete;
		const radios = el.querySelectorAll('fs-radio');
		radios[0].focus();
		await sendKeys({ press: 'ArrowDown' });
		expect(document.activeElement).to.equal(radios[1]);
		expect(radios[1].checked).to.be.true;

		await sendKeys({ press: 'ArrowDown' });
		expect(document.activeElement).to.equal(radios[2]);
		expect(radios[1].checked).to.be.false;
		expect(radios[2].checked).to.be.true;

		await sendKeys({ press: 'ArrowUp' });
		expect(document.activeElement).to.equal(radios[1]);
		expect(radios[2].checked).to.be.false;
		expect(radios[1].checked).to.be.true;

		await sendKeys({ press: 'ArrowUp' });
		expect(document.activeElement).to.equal(radios[0]);
		expect(radios[1].checked).to.be.false;
		expect(radios[0].checked).to.be.true;
	});

	it('is accessible', async () => {
		el = await fixture(html`
			<kit-radio-group name="radioWC">
				<kit-radio value="1">Radio One</kit-radio>
				<kit-radio value="2">Radio Two</kit-radio>
				<kit-radio value="3">Radio Three</kit-radio>
			</kit-radio-group>
		`);

		el.updateComplete;
		await expect(el).to.be.accessible();
	});

	it('is invalid when required and no radio is checked', async () => {
		el = await fixture(html`
			<kit-radio-group name="radioWC" required>
				<kit-radio value="1"></kit-radio>
				<kit-radio value="2"></kit-radio>
				<kit-radio value="3"></kit-radio>
			</kit-radio-group>
		`);

		el.updateComplete;
		expect(el.checkValidity()).to.be.false;
	});

	it('is valid when required and a radio is checked', async () => {
		el = await fixture(html`
			<kit-radio-group name="radioWC" required>
				<kit-radio value="1"></kit-radio>
				<kit-radio value="2" checked></kit-radio>
				<kit-radio value="3"></kit-radio>
			</kit-radio-group>
		`);

		el.updateComplete;
		expect(el.checkValidity()).to.be.true;
	});

	it('is invalid when custom validity is set', async () => {
		el = await fixture(html`
			<kit-radio-group name="radioWC">
				<kit-radio value="1"></kit-radio>
				<kit-radio value="2"></kit-radio>
				<kit-radio value="3"></kit-radio>
			</kit-radio-group>
		`);

		el.setValidity({ customError: true }, 'Custom error');
		expect(el.checkValidity()).to.be.false;
	});
});
