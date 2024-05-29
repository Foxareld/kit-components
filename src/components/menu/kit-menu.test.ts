import { html, fixture, expect } from '@open-wc/testing';
import './kit-menu';
import KitMenu from './kit-menu';

let element: KitMenu;

describe('Menu', () => {
	beforeEach(async () => {
		element = await fixture(html`<kit-menu></kit-menu>`);
	});

	it('renders with role "menu"', async () => {
		expect(element.getAttribute('role')).to.equal('menu');
	});

	it('renders menu item with role "menuitem"', async () => {
		element = await fixture(html`
			<kit-menu>
				<kit-menu-item></kit-menu-item>
			</kit-menu>
		`);
		const menuItem = element.querySelector('kit-menu-item');
		expect(menuItem!.getAttribute('role')).to.equal('menuitem');
	});

	it('sets tabindex of first fs-menu-item to 0', async () => {
		element = await fixture(html`
			<kit-menu>
				<kit-menu-item></kit-menu-item>
				<kit-menu-item></kit-menu-item>
			</kit-menu>
		`);
		const menuItem = element.querySelector('kit-menu-item');
		expect(menuItem!.getAttribute('tabindex')).to.equal('0');
	});
});
