import { html, fixture, expect } from '@open-wc/testing';
import type KitMenuItem from './kit-menu-item';
import './kit-menu-item';

let element: KitMenuItem;

describe('Menu Item', () => {
	beforeEach(async () => {
		element = await fixture(html`<kit-menu-item></kit-menu-item>`);
	});

	it('renders a div with class "menu-item"', async () => {
		const div = element.shadowRoot!.querySelector('.menu-item');
		expect(div).to.exist;
	});

	it('renders slot', async () => {
		const slot = element.shadowRoot!.querySelector('slot');
		expect(slot).to.exist;
	});
});
