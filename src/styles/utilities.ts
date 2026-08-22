import { css } from 'lit';

/**
 * Base styles for consistent box-sizing across components
 * Components can opt into this by including it in their styles array
 */
export const boxSizing = css`
	:host {
		box-sizing: border-box;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}
`;

/**
 * Common focus styles for accessibility
 */
export const focusStyles = css`
	:focus-visible {
		outline: 2px solid var(--color-primary, #0062ff);
		outline-offset: 2px;
	}
`;

/**
 * Screen reader only utility
 */
export const srOnly = css`
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
`;

/**
 * Disabled state styles
 */
export const disabledStyles = css`
	:host([disabled]) {
		pointer-events: none;
		opacity: 0.5;
	}
`;
