import { expect, fixture, html } from '@open-wc/testing';
import './icon.component.js';
import { KitIcon } from './icon.component.js';

describe('KitIcon', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitIcon>(html` <kit-icon></kit-icon> `);

		expect(el).to.exist;
		expect(el.name).to.equal('star');
		expect(el.size).to.equal('default');
		expect(el.color).to.equal('default');
	});

	it('renders the correct icon from registry', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="heart"></kit-icon>
		`);

		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg).to.exist;
		expect(svg?.getAttribute('viewBox')).to.exist;
	});

	it('renders SVG with correct viewBox', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="star"></kit-icon>
		`);

		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg?.getAttribute('viewBox')).to.equal('0 0 1024 1024');
	});

	it('applies size attribute correctly', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="heart" size="large"></kit-icon>
		`);

		expect(el.size).to.equal('large');
		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg?.getAttribute('width')).to.equal('48');
		expect(svg?.getAttribute('height')).to.equal('48');
	});

	it('applies all size variants correctly', async () => {
		const sizes = {
			small: 16,
			medium: 24,
			default: 32,
			large: 48,
			xlarge: 64,
		};

		for (const [size, pixels] of Object.entries(sizes)) {
			const el = await fixture<KitIcon>(html`
				<kit-icon name="star" size=${size as any}></kit-icon>
			`);
			const svg = el.shadowRoot?.querySelector('svg');
			expect(svg?.getAttribute('width')).to.equal(String(pixels));
			expect(svg?.getAttribute('height')).to.equal(String(pixels));
		}
	});

	it('applies color attribute correctly', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="heart" color="danger"></kit-icon>
		`);

		expect(el.color).to.equal('danger');
		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg?.getAttribute('color')).to.equal('danger');
	});

	it('applies custom color string', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="heart" color="#ff0000"></kit-icon>
		`);

		expect(el.color).to.equal('#ff0000');
	});

	it('changes icon when name property changes', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="star"></kit-icon>
		`);

		expect(el.name).to.equal('star');
		el.name = 'heart';
		await el.updateComplete;
		expect(el.name).to.equal('heart');
	});

	it('handles non-existent icon gracefully', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name=${'nonexistent' as any}></kit-icon>
		`);

		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg).to.exist;
	});

	it('renders SVG with aria-hidden attribute', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="star"></kit-icon>
		`);

		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).to.equal('true');
	});

	it('exposes shadow part for styling', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="star"></kit-icon>
		`);

		const svg = el.shadowRoot?.querySelector('svg');
		expect(svg?.getAttribute('part')).to.equal('root');
	});

	it('is accessible', async () => {
		const el = await fixture<KitIcon>(html`
			<kit-icon name="star"></kit-icon>
		`);

		await expect(el).to.be.accessible();
	});
});
