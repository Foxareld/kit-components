import { html, fixture, expect } from '@open-wc/testing';
import type KitRadio from './kit-radio';
import './kit-radio';

describe('Radio', () => {
	let el: KitRadio;
	it('renders the component', async () => {
		el = await fixture(html`<kit-radio></kit-radio>`);
		expect(el).shadowDom.to.equalSnapshot();
	});

	it('can set/get the value via the value property', async () => {
		el = await fixture(html`<kit-radio></kit-radio>`);
		el.value = 'Hello';
		expect(el.value).to.equal('Hello');
	});

	it('can set/get the value via the value attribute', async () => {
		el = await fixture(html`<kit-radio value="Hello"></kit-radio>`);
		expect(el.value).to.equal('Hello');
	});

	it('is accessible', async () => {
		el = await fixture<KitRadio>(html`<kit-radio>My Radio</kit-radio>`);

		await expect(el).to.be.accessible();
	});

	it('can be disabled', async () => {
		el = await fixture(html`<kit-radio disabled></kit-radio>`);
		expect(el.disabled).to.be.true;
	});

	describe('can be checked', () => {
		it('can be checked via the checked property', async () => {
			el = await fixture(html`<kit-radio></kit-radio>`);
			el.checked = true;
			expect(el.checked).to.be.true;
		});

		it('by clicking on it', async () => {
			el = await fixture(html`<kit-radio></kit-radio>`);

			el.click();
			expect(el.checked).to.be.true;
		});
	});
});
