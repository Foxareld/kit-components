import { html, fixture, expect } from '@open-wc/testing';
import './kit-dropdown';
import type KitDropdown from './kit-dropdown';

let element: KitDropdown;

describe('Dropdown', () => {
	it('initially has isOpen set to false', async () => {
		element = await fixture(html`<kit-dropdown></kit-dropdown>`);
		expect(element.isOpen).to.equal(false);
	});

	it('toggles isOpen when the trigger is clicked', async () => {
		element = await fixture(
			html`<kit-dropdown
				><button slot="trigger">Open</button></kit-dropdown
			>`,
		);
		const trigger = element.querySelector('button');
		trigger!.click();
		await element.updateComplete;
		expect(element.isOpen).to.equal(true);
		trigger!.click();
		await element.updateComplete;
		expect(element.isOpen).to.equal(false);
	});

	it('closes the dropdown when clicking outside', async () => {
		element = await fixture(
			html`<kit-dropdown
				><button slot="trigger">Open</button></kit-dropdown
			>`,
		);
		const trigger = element.querySelector('button');
		trigger!.click();
		await element.updateComplete;
		expect(element.isOpen).to.equal(true);
		document.body.click();
		await element.updateComplete;
		expect(element.isOpen).to.equal(false);
	});
});
