import { html, fixture, expect } from '@open-wc/testing';
import './kit-button-group';
import '../button';
import '../dropdown';
import type KitButtonGroup from './kit-button-group';

let element: KitButtonGroup;

describe('Button Group', () => {
	beforeEach(async () => {
		element = await fixture(html`<kit-button-group></kit-button-group>`);
	});

	it('renders slot', async () => {
		const slot = element.shadowRoot!.querySelector('slot');
		expect(slot).to.exist;
	});

	it('adds grouped-button class to slotted kit-button elements', async () => {
		element = await fixture(html`
			<kit-button-group>
				<kit-button></kit-button>
			</kit-button-group>
		`);
		const button = element.querySelector('kit-button')!;
		expect(button.classList.contains('grouped-button')).to.be.true;
	});

	it('adds grouped-dropdown class to slotted kit-dropdown elements', async () => {
		element = await fixture(html`
			<kit-button-group>
				<kit-dropdown></kit-dropdown>
			</kit-button-group>
		`);
		const dropdown = element.querySelector('kit-dropdown')!;
		expect(dropdown.classList.contains('grouped-dropdown')).to.be.true;
	});
});
