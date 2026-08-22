# Creating New Components

## Quick Start

All Kit components should extend `KitElement` instead of `LitElement` directly.

### 1. Create Component Files

```bash
mkdir src/components/my-component
touch src/components/my-component/my-component.css
touch src/components/my-component/my-component.component.ts
touch src/components/my-component/my-component.test.ts
touch src/components/my-component/my-component.stories.ts
touch src/components/my-component/index.ts
```

### 2. Write Component Styles

**`my-component.css`**

```css
:host {
	display: block;
}

.my-component {
	padding: 1rem;

	&:hover {
		background: var(--color-primary);
	}
}
```

### 3. Create Component Class

**`my-component.component.ts`**

```typescript
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { myComponentStyles } from './my-component.styles.js';

/**
 * My awesome component
 *
 * @slot - Default slot content
 * @csspart container - The container element
 * @fires my-event - Dispatched when something happens
 */
@customElement('kit-my-component')
export class KitMyComponent extends KitElement {
	// ✅ Base styles automatically included!
	static styles = myComponentStyles;

	@property({ type: String })
	label = '';

	render() {
		return html`
			<div class="my-component" part="container">
				${this.label}
				<slot></slot>
			</div>
		`;
	}
}

// TypeScript type support
declare global {
	interface HTMLElementTagNameMap {
		'kit-my-component': KitMyComponent;
	}
}
```

### 4. Export the Component

**`index.ts`**

```typescript
export { KitMyComponent } from './my-component.component.js';
```

### 5. Add to Components Index

**`src/components/index.ts`**

```typescript
export * from './button/index.js';
export * from './my-component/index.js'; // Add this line
```

### 6. Build Styles

```bash
npm run build:styles
```

This generates `my-component.styles.ts` from your CSS file.

### 7. Create Tests

**`my-component.test.ts`**

```typescript
import { html, fixture, expect } from '@open-wc/testing';
import './my-component.component.js';
import { KitMyComponent } from './my-component.component.js';

describe('KitMyComponent', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitMyComponent>(html`
			<kit-my-component></kit-my-component>
		`);

		expect(el).to.exist;
	});

	it('is accessible', async () => {
		const el = await fixture(html`
			<kit-my-component label="Test"></kit-my-component>
		`);

		await expect(el).to.be.accessible();
	});
});
```

### 8. Create Stories

**`my-component.stories.ts`**

```typescript
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './my-component.component.js';

const meta: Meta = {
	title: 'Components/MyComponent',
	component: 'kit-my-component',
	tags: ['autodocs'],
	argTypes: {
		label: {
			control: 'text',
			description: 'The component label',
		},
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-my-component label=${args.label}> Content here </kit-my-component>
	`,
	args: {
		label: 'Hello World',
	},
};
```

## Why Extend KitElement?

### ✅ Benefits

- **DRY**: Base styles defined once
- **Consistency**: All components get same foundation
- **Easy updates**: Change `KitElement` to update all components
- **Extensibility**: Add shared behavior in one place
- **Industry standard**: Used by Spectrum, Carbon, Shoelace, etc.

### Pattern

```typescript
// ✅ CORRECT - Extend KitElement
export class KitButton extends KitElement {
	static styles = buttonStyles; // Base styles auto-included!
}

// ❌ WRONG - Don't extend LitElement directly
export class KitButton extends LitElement {
	static styles = buttonStyles; // Missing base styles
}
```

## Component Checklist

When creating a new component:

- [ ] Extend `KitElement` (not `LitElement`)
- [ ] Define `static styles` (base styles auto-included)
- [ ] Use CSS custom properties for theming
- [ ] Write styles in `.css` file (not template literals)
- [ ] Add JSDoc comments for properties, events, slots
- [ ] Create comprehensive tests
- [ ] Create Storybook stories
- [ ] Export from component index
- [ ] Add TypeScript global type declaration

## Advanced: Custom Base Classes

For specific component families, you can create specialized base classes:

```typescript
// For form components
export class KitFormElement extends KitElement {
	static formAssociated = true;

	protected internals: ElementInternals;

	constructor() {
		super();
		this.internals = this.attachInternals();
	}
}
```

Then:

```typescript
export class KitInput extends KitFormElement {
	// Automatically gets form association
}
```

## See Also

- [CSS Workflow Guide](./CSS_WORKFLOW.md)
- [Reset Styles Best Practices](./RESET_STYLES.md)
- [Testing Guide](./TESTING.md)
