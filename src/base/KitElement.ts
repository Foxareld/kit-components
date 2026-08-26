import { LitElement } from 'lit';

/**
 * Base class for all Kit components
 *
 * Extends LitElement as a single place to hang shared behavior across
 * every Kit component. Components should extend this instead of
 * LitElement directly.
 *
 * Base styles are not applied automatically — spread `baseStyles` from
 * `../styles/utilities.js` into each component's own `static styles` array.
 *
 * @example
 * ```typescript
 * export class KitButton extends KitElement {
 *   static styles = [baseStyles, buttonStyles];
 * }
 * ```
 */
export class KitElement extends LitElement {}
