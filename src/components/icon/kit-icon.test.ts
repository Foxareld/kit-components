import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import type KitIcon from './kit-icon';
import './kit-icon';

describe('fs-icon', () => {
	let element: KitIcon, svg: SVGSVGElement | null;

	beforeEach(async () => {
		element = await fixture(html`<kit-icon icon="user"></kit-icon>`);
		svg = element.shadowRoot!.querySelector('svg');
	});

	it('renders svg icon', async () => {
		expect(svg).to.exist;
	});

	it('is accessible', async () => {
		await expect(svg).to.be.accessible();
	});
});
