import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './kit-button';

let button;

describe('kit-button', () => {
	beforeEach(async () => {
		button = await fixture(html`<kit-button>Button Text</kit-button>`);
	});

	it('renders', () => {
		expect(button).to.exist;
	});
});
