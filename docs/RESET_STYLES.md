# Reset CSS Best Practices for Web Components

## TL;DR: Don't Use Per-Component Resets

**Shadow DOM provides style isolation.** Importing resets into every component causes more problems than it solves.

## The Problem with Traditional Resets

```typescript
// ❌ BAD: Don't do this
const template = `import { css } from 'lit'; import reset from '../../assets/reset.css'; 
export const componentStyles = css\`\${reset} ${resultingCSS}\`;`;
```

**Issues:**

- Reset applies in every shadow root (100+ times if you have 100 components)
- Nested components get multiple resets
- Slotted content gets reset unexpectedly
- Performance overhead
- Hard to debug style conflicts

## Recommended Approach

### 1. Style Only What You Need

Each component should reset only the elements it uses:

```css
/* button.css */
button {
	/* Reset just this element */
	margin: 0;
	padding: 0;
	border: none;
	background: none;
	font: inherit;
	color: inherit;
	cursor: pointer;

	/* Then apply your styles */
	padding: 1rem 2rem;
	background: blue;
}
```

### 2. Use Shared Utilities (Opt-In)

Create utilities that components can choose to include:

```typescript
// component.ts
import { boxSizing, focusStyles } from '../../styles/utilities.js';
import { buttonStyles } from './button.styles.js';

static styles = [boxSizing, focusStyles, buttonStyles];
```

Available utilities:

- `boxSizing` - Consistent box model
- `focusStyles` - Accessible focus rings
- `srOnly` - Screen reader only class
- `disabledStyles` - Disabled state

### 3. Document App-Level Reset

Your library's documentation should recommend consumers add a global reset:

```css
/* User's app.css */
*,
*::before,
*::after {
	box-sizing: border-box;
}

body {
	margin: 0;
	font-family: var(--font-family);
	line-height: 1.5;
}
```

## Why This Works

1. **Shadow DOM Encapsulation** - Styles inside shadow roots don't leak out
2. **Performance** - No redundant reset code in every component
3. **Predictability** - Each component controls exactly what it styles
4. **Composability** - Components nest cleanly without reset conflicts
5. **Maintenance** - Easier to debug and modify individual components

## Component-Specific Patterns

### Host Element

Always explicitly set `:host` display:

```css
:host {
	display: inline-block; /* or block, flex, etc */
}
```

### Form Elements

Reset inherited styles:

```css
input,
textarea,
select {
	font: inherit;
	color: inherit;
	background: none;
	border: none;
	margin: 0;
	padding: 0;
}
```

### Buttons

```css
button {
	all: unset; /* Nuclear option for buttons */
	box-sizing: border-box;
	display: inline-flex;
	cursor: pointer;
}
```

## What Major Libraries Do

- **Shoelace**: No reset, component-specific styles only
- **Lion (ING)**: Minimal host styles, no global reset
- **Material Web Components**: No reset per component
- **Fast**: No built-in reset

## Migration from Reset-Based Approach

If converting from a reset-based system:

1. Remove reset imports from build script
2. Audit each component for missing default styles
3. Add explicit resets only for elements used
4. Test nested component scenarios
5. Update documentation with app-level reset recommendations

## When You MIGHT Need a Reset

Very rarely, you might want a light touch:

```typescript
// styles/light-reset.ts
export const lightReset = css`
	:host {
		box-sizing: border-box;
	}

	* {
		box-sizing: inherit;
	}
`;
```

Use sparingly and only when truly needed.
