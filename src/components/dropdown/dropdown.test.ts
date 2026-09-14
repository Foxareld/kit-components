import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import './dropdown.component.js';
import { KitDropdown } from './dropdown.component.js';

describe('KitDropdown', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		expect(el).to.exist;
		expect(el.open).to.be.false;
		expect(el.disableTrigger).to.be.false;
		expect(el.disabled).to.be.false;
	});

	it('renders slotted trigger and content', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		const trigger = el.querySelector('[slot="trigger"]');
		const content = el.querySelector('p');
		expect(trigger?.textContent).to.equal('Open');
		expect(content?.textContent).to.equal('Content');
	});

	it('opens and closes the content as a native popover when toggled via the trigger click', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		const trigger = el.querySelector('button') as HTMLButtonElement;
		const contentEl = el.shadowRoot?.querySelector('#content') as HTMLElement;

		trigger.click();
		await el.updateComplete;
		expect(el.open).to.be.true;
		expect(contentEl.matches(':popover-open')).to.be.true;

		trigger.click();
		await el.updateComplete;
		expect(el.open).to.be.false;
		expect(contentEl.matches(':popover-open')).to.be.false;
	});

	it('does not toggle on trigger click when disableTrigger is set', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown disable-trigger>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		const trigger = el.querySelector('button') as HTMLButtonElement;
		trigger.click();
		await el.updateComplete;

		expect(el.open).to.be.false;
	});

	it('does not open on trigger click, and toggle() no-ops, when disabled', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown disabled>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		const trigger = el.querySelector('button') as HTMLButtonElement;
		trigger.click();
		await el.updateComplete;
		expect(el.open).to.be.false;

		el.toggle();
		await el.updateComplete;
		expect(el.open).to.be.false;
	});

	it('sets disabled and aria-disabled on the trigger element and keeps them in sync', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		const trigger = el.querySelector('button') as HTMLButtonElement;

		expect(trigger.hasAttribute('disabled')).to.be.false;
		expect(trigger.getAttribute('aria-disabled')).to.equal('false');

		el.disabled = true;
		await el.updateComplete;
		expect(trigger.hasAttribute('disabled')).to.be.true;
		expect(trigger.getAttribute('aria-disabled')).to.equal('true');

		el.disabled = false;
		await el.updateComplete;
		expect(trigger.hasAttribute('disabled')).to.be.false;
		expect(trigger.getAttribute('aria-disabled')).to.equal('false');
	});

	it('closes the popover if it becomes disabled while open', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown open>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		await el.updateComplete;
		const contentEl = el.shadowRoot?.querySelector('#content') as HTMLElement;
		expect(contentEl.matches(':popover-open')).to.be.true;

		el.disabled = true;
		await el.updateComplete;

		expect(el.open).to.be.false;
		expect(contentEl.matches(':popover-open')).to.be.false;
	});

	it('opens and closes via the open property directly', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		const contentEl = el.shadowRoot?.querySelector('#content') as HTMLElement;

		el.open = true;
		await el.updateComplete;
		expect(contentEl.matches(':popover-open')).to.be.true;

		el.open = false;
		await el.updateComplete;
		expect(contentEl.matches(':popover-open')).to.be.false;
	});

	it('toggle() flips the open state', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		el.toggle();
		expect(el.open).to.be.true;

		el.toggle();
		expect(el.open).to.be.false;
	});

	it('sets aria-expanded on the trigger and keeps it in sync', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		const trigger = el.querySelector('button') as HTMLButtonElement;

		expect(trigger.getAttribute('aria-expanded')).to.equal('false');

		el.open = true;
		await el.updateComplete;
		expect(trigger.getAttribute('aria-expanded')).to.equal('true');
	});

	it('closes when the native popover closes itself (e.g. Escape) and syncs the open property', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown open>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		await el.updateComplete;
		const contentEl = el.shadowRoot?.querySelector('#content') as HTMLElement;
		expect(contentEl.matches(':popover-open')).to.be.true;

		const toggleEventPromise = oneEvent(el, 'toggle');
		contentEl.hidePopover();
		await toggleEventPromise;

		expect(el.open).to.be.false;
	});

	it('returns focus to the trigger when closed', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown open>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);
		await el.updateComplete;
		const trigger = el.querySelector('button') as HTMLButtonElement;
		const contentEl = el.shadowRoot?.querySelector('#content') as HTMLElement;

		const toggleEventPromise = oneEvent(el, 'toggle');
		contentEl.hidePopover();
		await toggleEventPromise;

		expect(document.activeElement).to.equal(trigger);
	});

	it('dispatches a bubbling, composed toggle event with the new open state as detail', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		const toggleEventPromise = oneEvent(el, 'toggle');
		el.open = true;
		const event = (await toggleEventPromise) as CustomEvent<boolean>;

		expect(event.detail).to.be.true;
		expect(event.bubbles).to.be.true;
		expect(event.composed).to.be.true;
	});

	it('is accessible', async () => {
		const el = await fixture<KitDropdown>(html`
			<kit-dropdown>
				<button slot="trigger">Open</button>
				<p>Content</p>
			</kit-dropdown>
		`);

		await expect(el).to.be.accessible();
	});
});
