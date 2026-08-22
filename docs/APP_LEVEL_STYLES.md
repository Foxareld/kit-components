# Global Styles for Kit Component Library Consumers

## Overview

Kit components use Shadow DOM, which provides style isolation. Your application should provide global base styles, while components handle their own internal styling.

## Recommended App-Level Setup

### Basic Reset

Add to your application's global CSS:

```css
/* app.css or global.css */

/* Modern CSS reset */
*,
*::before,
*::after {
	box-sizing: border-box;
}

* {
	margin: 0;
	padding: 0;
}

html {
	-webkit-text-size-adjust: 100%;
}

body {
	min-height: 100vh;
	line-height: 1.5;
	font-family:
		system-ui,
		-apple-system,
		sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

img,
picture,
video,
canvas,
svg {
	display: block;
	max-width: 100%;
}

input,
button,
textarea,
select {
	font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
	overflow-wrap: break-word;
}
```

### CSS Custom Properties (Theme)

**Good news!** CSS variables are automatically injected into `:root` when you import any Kit component. No setup required!

To customize the default theme, simply override the variables in your app's CSS:

```css
:root {
	/* Override any variables you want to customize */
	--color-primary: #0062ff;
	--color-primary-hover: #0050e6;
	--spacing-md: 1.5rem;
	/* etc. */
}

	/* Typography */
	--font-family:
		system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		sans-serif;
	--font-size-sm: 0.875rem;
	--font-size-base: 1rem;
	--font-size-lg: 1.125rem;
	--font-size-xl: 1.25rem;
	--line-height: 1.5;

	/* Border radius */
	--border-radius-sm: 0.25rem;
	--border-radius-md: 0.5rem;
	--border-radius-lg: 1rem;

	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
	--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

	/* Transitions */
	--transition-fast: 150ms ease-in-out;
	--transition-base: 250ms ease-in-out;
	--transition-slow: 350ms ease-in-out;
}
```

### Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
	:root {
		--color-primary: #4589ff;
		--color-text: #f4f4f4;
		--color-text-secondary: #c6c6c6;
		--color-background: #161616;
		--color-border: #393939;
	}
}

/* Or with a class toggle */
.dark {
	--color-primary: #4589ff;
	--color-text: #f4f4f4;
	--color-text-secondary: #c6c6c6;
	--color-background: #161616;
	--color-border: #393939;
}
```

## What NOT To Do

❌ **Don't try to style inside shadow DOM from outside:**

```css
/* This won't work - shadow DOM blocks it */
kit-button button {
	background: red; /* Won't apply */
}
```

✅ **Instead, use CSS custom properties or component attributes:**

```css
/* This works - CSS vars pierce shadow DOM */
kit-button {
	--color-primary: red;
}
```

Or:

```html
<kit-button variant="secondary" size="large">Click me</kit-button>
```

## Framework-Specific Setups

### React

```jsx
// App.jsx
import './global.css'; // Your reset and theme

function App() {
	return (
		<div className='app'>
			<kit-button>Click me</kit-button>
		</div>
	);
}
```

### Vue

```vue
<!-- App.vue -->
<script setup>
import './global.css';
</script>

<template>
	<kit-button>Click me</kit-button>
</template>
```

### Plain HTML

```html
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="global.css" />
		<script type="module" src="path/to/kit.js"></script>
	</head>
	<body>
		<kit-button>Click me</kit-button>
	</body>
</html>
```

## Styling Slotted Content

Content you pass into components is styled by YOUR app styles:

```html
<kit-button>
	<span class="my-icon">🎉</span>
	Click me
</kit-button>
```

```css
/* This works - you're styling your own content */
.my-icon {
	font-size: 1.5rem;
	margin-right: 0.5rem;
}
```

## See Also

- [CSS Custom Properties Reference](./theme-variables.md)
- [Component Styling Guide](./component-theming.md)
