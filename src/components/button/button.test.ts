import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import './button.component.js';
import { KitButton } from './button.component.js';

describe('KitButton', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button>Click me</kit-button>
		`);

		expect(el).to.exist;
		expect(el.variant).to.equal('primary');
		expect(el.size).to.equal('medium');
		expect(el.disabled).to.be.false;
		expect(el.fullWidth).to.be.false;
	});

	it('renders button with correct text content', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button>Test Button</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button).to.exist;
		expect(el.textContent?.trim()).to.equal('Test Button');
	});

	it('applies variant classes correctly', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button variant="secondary">Secondary</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button?.className).to.include('secondary');
	});

	it('applies size classes correctly', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button size="large">Large Button</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button?.className).to.include('large');
	});

	it('handles disabled state', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button disabled>Disabled</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button?.disabled).to.be.true;
	});

	it('applies full-width class when specified', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button full-width>Full Width</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button?.className).to.include('full-width');
	});

	it('fires click event on click', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button>Clickable</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button).to.exist;

		setTimeout(() => button?.click());
		const event = await oneEvent(el, 'click');

		expect(event).to.exist;
		expect(event).to.be.instanceOf(MouseEvent);
	});

	it('does not fire click when disabled', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button disabled>Disabled</kit-button>
		`);

		let eventFired = false;
		el.addEventListener('click', () => {
			eventFired = true;
		});

		const button = el.shadowRoot?.querySelector('button');
		button?.click();

		// Wait a bit to ensure event doesn't fire
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(eventFired).to.be.false;
	});

	it('is accessible', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button>Accessible Button</kit-button>
		`);

		await expect(el).to.be.accessible();
	});

	it('has correct button type', async () => {
		const el = await fixture<KitButton>(html`
			<kit-button type="submit">Submit</kit-button>
		`);

		const button = el.shadowRoot?.querySelector('button');
		expect(button?.type).to.equal('submit');
	});
});
