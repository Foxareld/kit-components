# Kit Component Library

A modern web component library built with [Lit](https://lit.dev/), featuring TypeScript, Storybook documentation, and comprehensive testing.

## Features

- 🔥 **Lit** - Fast, lightweight web components
- 📘 **TypeScript** - Full type safety
- 📚 **Storybook** - Interactive component documentation
- 🧪 **Web Test Runner** - Real browser testing
- 🎨 **Modern CSS** - CSS custom properties for theming
- 📦 **ESM** - Tree-shakeable ES modules
- ♿ **Accessible** - WCAG compliant components

## Installation

```bash
npm install @yourorg/kit
```

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
	<head>
		<script type="module">
			import { KitButton } from '@yourorg/kit';
		</script>
	</head>
	<body>
		<kit-button variant="primary">Click Me</kit-button>
	</body>
</html>
```

### With Build Tools

```typescript
import { KitButton } from '@yourorg/kit';

// Or import individual components
import { KitButton } from '@yourorg/kit/components/button';
```

### Theming

CSS variables are automatically injected into `:root` when you import the library - no setup required!

To customize the theme, simply override the CSS variables in your own stylesheet:

```css
:root {
	--color-primary: #0062ff;
	--color-primary-hover: #0050e6;
	--spacing-md: 1rem;
	--border-radius-md: 0.5rem;
	/* ... and more */
}
```

See [src/styles/variables.css](src/styles/variables.css) for all available CSS variables.

## Development

### Prerequisites

- Node.js 18+ and npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start Storybook dev server
npm run dev

# In a separate terminal, watch CSS changes (recommended)
npm run watch:styles
```

### Available Scripts

- `npm run build` - Build the library for production
- `npm run build:styles` - Compile CSS to TypeScript
- `npm run watch:styles` - Watch CSS files and auto-rebuild
- `npm run dev` - Start Storybook development server
- `npm test` - Run tests in all browsers
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run storybook` - Start Storybook server
- `npm run build-storybook` - Build Storybook for deployment

### CSS Development Workflow

Component styles are written in `.css` files and automatically compiled to `.styles.ts` files:

```css
/* button.css - Write your styles here */
button {
	padding: 1rem;

	&:hover {
		background: blue;
	}
}
```

Run the watch script while developing:

```bash
npm run watch:styles
```

See [CSS Workflow Guide](docs/CSS_WORKFLOW.md) for details.

### Project Structure

```
kit/
├── src/
│   ├── base/                # Base classes
│   │   ├── KitElement.ts    # Base class for all components
│   │   └── index.ts
│   ├── components/          # Component implementations
│   │   ├── button/
│   │   │   ├── button.component.ts   # Component logic
│   │   │   ├── button.css            # Component styles (source)
│   │   │   ├── button.styles.ts      # Generated from CSS
│   │   │   ├── button.test.ts        # Tests
│   │   │   ├── button.stories.ts     # Storybook stories
│   │   │   └── index.ts              # Exports
│   ├── styles/              # Shared style utilities
│   ├── utilities/          # Shared utilities
│   ├── themes/            # Theme definitions
│   └── index.ts           # Main entry point
├── .storybook/            # Storybook configuration
├── scripts/               # Build scripts
└── dist/                  # Build output (generated)
```

### Component Architecture

All components extend `KitElement` (not `LitElement` directly):

```typescript
import { KitElement } from '../../base/KitElement.js';

@customElement('kit-button')
export class KitButton extends KitElement {
	// Base styles automatically included!
	static styles = buttonStyles;
}
```

**Benefits:**

- ✅ Base styles (box-sizing, etc.) applied consistently
- ✅ Easy to add shared behavior across all components
- ✅ Single source of truth for common patterns
- ✅ Industry standard pattern (Spectrum, Carbon, Shoelace)

See [Creating Components Guide](docs/CREATING_COMPONENTS.md) for details.

### Creating a New Component

1. Create a new folder in `src/components/`:

```bash
mkdir -p src/components/my-component
```

2. Create the component files:

```typescript
// my-component.component.ts
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { myComponentStyles } from './my-component.styles.js';

@customElement('kit-my-component')
export class KitMyComponent extends KitElement {
	static styles = myComponentStyles;

	@property({ type: String })
	message = 'Hello';

	render() {
		return html`<div>${this.message}</div>`;
	}
}
```

3. Write styles in CSS:

```css
/* my-component.css */
:host {
	display: block;
}

.container {
	padding: 1rem;

	&:hover {
		background: var(--color-primary);
	}
}
```

4. Build styles and add to exports:

```bash
npm run build:styles
```

See [Component Creation Guide](docs/CREATING_COMPONENTS.md) for full details.
expect(el).to.exist;
});
});

```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and stories
5. Submit a pull request

## License

MIT
```
