import { expect, fixture, html } from '@open-wc/testing';
import './accordion.component.js';
import '../accordion-item/accordion-item.component.js';
import { KitAccordion } from './accordion.component.js';
import type { KitAccordionItem } from '../accordion-item/accordion-item.component.js';

describe('KitAccordion', () => {
	it('allows multiple items open at once by default', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion>
				<kit-accordion-item value="one" open>
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two">
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
			</kit-accordion>
		`);
		const [one, two] = [
			...el.querySelectorAll<KitAccordionItem>('kit-accordion-item'),
		] as [KitAccordionItem, KitAccordionItem];

		two.shadowRoot!.querySelector('button')!.click();
		await el.updateComplete;

		expect(one.open).to.be.true;
		expect(two.open).to.be.true;
	});

	it('closes other items when single and one opens', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion single>
				<kit-accordion-item value="one" open>
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two">
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
			</kit-accordion>
		`);
		const [one, two] = [
			...el.querySelectorAll<KitAccordionItem>('kit-accordion-item'),
		] as [KitAccordionItem, KitAccordionItem];

		two.shadowRoot!.querySelector('button')!.click();
		await el.updateComplete;

		expect(one.open).to.be.false;
		expect(two.open).to.be.true;
	});

	it('reconciles multiple declaratively-open items to just the first when single', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion single>
				<kit-accordion-item value="one" open>
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two" open>
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
			</kit-accordion>
		`);
		const [one, two] = [
			...el.querySelectorAll<KitAccordionItem>('kit-accordion-item'),
		] as [KitAccordionItem, KitAccordionItem];

		expect(one.open).to.be.true;
		expect(two.open).to.be.false;
	});

	it('moves focus between headers with ArrowDown/ArrowUp, skipping disabled items', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion>
				<kit-accordion-item value="one">
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two" disabled>
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
				<kit-accordion-item value="three">
					<span slot="header">Three</span>
					Third
				</kit-accordion-item>
			</kit-accordion>
		`);
		const [one, , three] = [
			...el.querySelectorAll<KitAccordionItem>('kit-accordion-item'),
		] as [KitAccordionItem, KitAccordionItem, KitAccordionItem];

		one.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
		);
		await el.updateComplete;

		expect(document.activeElement).to.equal(three);
	});

	it('moves focus to first/last header with Home/End', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion>
				<kit-accordion-item value="one">
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two">
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
			</kit-accordion>
		`);
		const [one, two] = [
			...el.querySelectorAll<KitAccordionItem>('kit-accordion-item'),
		] as [KitAccordionItem, KitAccordionItem];

		one.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(two);

		two.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
		);
		await el.updateComplete;
		expect(document.activeElement).to.equal(one);
	});

	it('is accessible', async () => {
		const el = await fixture<KitAccordion>(html`
			<kit-accordion>
				<kit-accordion-item value="one">
					<span slot="header">One</span>
					First
				</kit-accordion-item>
				<kit-accordion-item value="two">
					<span slot="header">Two</span>
					Second
				</kit-accordion-item>
			</kit-accordion>
		`);

		await expect(el).to.be.accessible();
	});
});
