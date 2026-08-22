# CSS Development Workflow

## Overview

Component styles are written in `.css` files and automatically compiled to `.styles.ts` files for use in Lit components.

## Workflow

### 1. Write Styles in CSS Files

Create a `.css` file next to your component:

```css
/* button.css */
:host {
	display: inline-block;
}

button {
	padding: 1rem;

	&:hover {
		background: blue;
	}
}
```

### 2. Build Styles

Generate the `.styles.ts` file:

```bash
npm run build:styles
```

This creates `button.styles.ts`:

```typescript
import { css } from 'lit';

export const buttonStyles = css`
	/* minified CSS */
`;
```

### 3. Use in Components

Import the generated styles:

```typescript
import { buttonStyles } from './button.styles.js';

@customElement('kit-button')
export class KitButton extends LitElement {
	static styles = buttonStyles;
	// ...
}
```

## Watch Mode (Recommended for Development)

Run the watch script in a separate terminal while coding:

```bash
npm run watch:styles
```

This automatically rebuilds `.styles.ts` files whenever you save a `.css` file.

**To stop:** Press `Ctrl+C`

## Features

### Modern CSS Support

The build process supports:

- **CSS Nesting** (`&` selector)
- **CSS Custom Properties** (CSS variables)
- **Modern pseudo-classes** (`:is()`, `:where()`, etc.)
- **Autoprefixer** (automatic vendor prefixes)
- **Minification** (optimized for production)

### Example with Nesting

```css
.button {
	padding: 1rem;

	&:hover {
		background: blue;
	}

	&.primary {
		background: red;

		&:hover {
			background: darkred;
		}
	}
}
```

## Build Process

### Full Build

```bash
npm run build
```

Runs in order:

1. Clean dist folder
2. **Build styles** (`.css` → `.styles.ts`)
3. Build TypeScript
4. Generate custom elements manifest

### Individual Steps

```bash
npm run build:styles    # Build CSS only
npm run build:ts        # Build TypeScript only
npm run build:metadata  # Generate manifest only
```

## File Structure

```
src/components/button/
├── button.css           # ✅ Source file (committed to git)
├── button.styles.ts     # 🚫 Generated file (gitignored)
├── button.component.ts  # Imports from button.styles.js
├── button.test.ts
├── button.stories.ts
└── index.ts
```

## Important Notes

- **Do NOT edit `.styles.ts` files** - They are auto-generated
- `.styles.ts` files are gitignored
- The export name matches the filename: `button.css` → `buttonStyles`
- Always run `build:styles` before building the library
- Use `watch:styles` during active development

## Tips

### VS Code Setup

For better CSS development experience:

1. Install extension: **CSS Nesting Syntax Highlighting**
2. Enable CSS IntelliSense for custom properties
3. Format on save is configured automatically

### PostCSS Configuration

Customize in `postcss.config.js`:

```javascript
export default {
	plugins: {
		autoprefixer: {},
		cssnano: {
			preset: [
				'default',
				{
					discardComments: { removeAll: true },
				},
			],
		},
	},
};
```

### Advanced: Custom Build Script

Modify `scripts/build-styles.mjs` for:

- Custom PostCSS plugins
- Different CSS processing
- Additional transformations
