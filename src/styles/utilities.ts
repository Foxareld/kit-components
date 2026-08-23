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

/**
 * Base input styling
 */
export const baseInput = css`
	.input-base {
		background-color: var(--color-white);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		font-weight: 400;
		height: var(--input-base-height);
		padding: 7px var(--spacing-md);
		transition: background-color var(--transition-base);
		width: 100%;

		&:focus {
			outline: var(--outline);
		}

		&:hover {
			background-color: #e4e7eb;
		}

		&:disabled,
		&.disabled {
			background-color: var(--color-white);
			color: var(--color-text-secondary);
			cursor: not-allowed;
		}

		&.input-error {
			border-color: var(--color-danger);
		}

		&::placeholder {
			color: var(--color-text-secondary);
			font-weight: 400;
		}

		&.input-no-border {
			border-color: transparent;
		}
	}
`;
