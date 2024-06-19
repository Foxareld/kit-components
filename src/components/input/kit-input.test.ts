import { html, fixture, expect } from '@open-wc/testing';
import type KitInput from './kit-input';
import './kit-input'; // Import your web component

describe('Input', () => {
	let el: KitInput;
	it('renders the component', async () => {
		el = await fixture(html`<kit-input></kit-input>`);
		expect(el).shadowDom.to.equalSnapshot();
	});

	it('renders the component with a label', async () => {
		el = await fixture(html`<kit-input label="Test Label"></kit-input>`);
		const label = el.shadowRoot?.querySelector('label');
		expect(label).to.exist;
	});

	it('has a default type of "text"', async () => {
		el = await fixture(html`<kit-input></kit-input>`);
		expect(el.type).to.equal('text');
	});

	it('can override the type via attribute', async () => {
		el = await fixture(html`<kit-input type="number"></kit-input>`);
		expect(el.type).to.equal('number');
	});

	it('can set/get the value via the value property', async () => {
		el = await fixture(html`<kit-input></kit-input>`);
		el.value = 'Hello';
		expect(el.value).to.equal('Hello');
	});

	it('can set/get the value via the value attribute', async () => {
		el = await fixture(html`<kit-input value="Hello"></kit-input>`);
		expect(el.value).to.equal('Hello');
	});

	it('is accessible', async () => {
		el = await fixture(
			html`<kit-input label="Test Label" name="my-input"></kit-input>`,
		);

		await expect(el).to.be.accessible();
	});

	/**
	 * NOTE: testing for validity doesn't seem possible programatically (at least for minlength/maxlength)
	 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#setting-minimum-input-length-requirements:-the-minlength-attribute
	 */
});
