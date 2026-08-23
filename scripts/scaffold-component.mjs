#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get component name from command line args
const componentName = process.argv[2];

if (!componentName) {
	console.error('❌ Error: Please provide a component name');
	console.log('Usage: npm run scaffold <component-name>');
	console.log('Example: npm run scaffold text-input');
	process.exit(1);
}

// Validate component name (kebab-case)
if (!/^[a-z]+(-[a-z]+)*$/.test(componentName)) {
	console.error(
		'❌ Error: Component name must be in kebab-case (e.g., text-input, custom-card)',
	);
	process.exit(1);
}

// Convert kebab-case to PascalCase
function toPascalCase(str) {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}

const pascalName = toPascalCase(componentName);
const componentDir = path.join(
	__dirname,
	'..',
	'src',
	'components',
	componentName,
);

// Check if component already exists
if (fs.existsSync(componentDir)) {
	console.error(`❌ Error: Component "${componentName}" already exists`);
	process.exit(1);
}

// Create component directory
fs.mkdirSync(componentDir, { recursive: true });

// Template for component file
const componentTemplate = `import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { ${componentName}Styles } from './${componentName}.styles.js';

/**
 * ${pascalName} component
 *
 * @slot - Default slot content
 *
 * @csspart root - The root element
 */
@customElement('kit-${componentName}')
export class Kit${pascalName} extends KitElement {
	static styles = ${componentName}Styles;

	/**
	 * Example property
	 */
	@property({ type: String })
	variant: 'default' | 'primary' | 'secondary' = 'default';

	render() {
		return html\`
			<div part="root" class="\${this.variant}">
				<slot></slot>
			</div>
		\`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-${componentName}': Kit${pascalName};
	}
}
`;

// Template for index file
const indexTemplate = `export { Kit${pascalName} } from './${componentName}.component.js';
`;

// Template for CSS file
const cssTemplate = `:host {
	display: block;
	box-sizing: border-box;
}

.default {
	/* Add your default styles here */
}

.primary {
	/* Add your primary variant styles here */
}

.secondary {
	/* Add your secondary variant styles here */
}
`;

// Template for test file
const testTemplate = `import { expect, fixture, html } from '@open-wc/testing';
import './${componentName}.component.js';
import { Kit${pascalName} } from './${componentName}.component.js';

describe('Kit${pascalName}', () => {
	it('renders with default properties', async () => {
		const el = await fixture<Kit${pascalName}>(html\`
			<kit-${componentName}>Content</kit-${componentName}>
		\`);

		expect(el).to.exist;
		expect(el.variant).to.equal('default');
	});

	it('renders slotted content', async () => {
		const el = await fixture<Kit${pascalName}>(html\`
			<kit-${componentName}>Test Content</kit-${componentName}>
		\`);

		expect(el.textContent?.trim()).to.equal('Test Content');
	});

	it('applies variant correctly', async () => {
		const el = await fixture<Kit${pascalName}>(html\`
			<kit-${componentName} variant="primary">Content</kit-${componentName}>
		\`);

		expect(el.variant).to.equal('primary');
	});

	it('is accessible', async () => {
		const el = await fixture<Kit${pascalName}>(html\`
			<kit-${componentName}>Accessible Content</kit-${componentName}>
		\`);

		await expect(el).to.be.accessible();
	});
});
`;

// Template for stories file
const storiesTemplate = `import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './${componentName}.component.js';

/**
 * ${pascalName} component description
 */
const meta: Meta = {
	title: 'Components/${pascalName}',
	component: 'kit-${componentName}',
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'primary', 'secondary'],
			description: 'The visual style variant',
		},
	},
	args: {
		variant: 'default',
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html\`
		<kit-${componentName} variant=\${args.variant}>
			${pascalName} Content
		</kit-${componentName}>
	\`,
};

export const Primary: Story = {
	args: {
		variant: 'primary',
	},
	render: (args) => html\`
		<kit-${componentName} variant=\${args.variant}>
			Primary ${pascalName}
		</kit-${componentName}>
	\`,
};

export const Secondary: Story = {
	args: {
		variant: 'secondary',
	},
	render: (args) => html\`
		<kit-${componentName} variant=\${args.variant}>
			Secondary ${pascalName}
		</kit-${componentName}>
	\`,
};
`;

// Write files
const files = [
	{ name: `${componentName}.component.ts`, content: componentTemplate },
	{ name: 'index.ts', content: indexTemplate },
	{ name: `${componentName}.css`, content: cssTemplate },
	{ name: `${componentName}.test.ts`, content: testTemplate },
	{ name: `${componentName}.stories.ts`, content: storiesTemplate },
];

console.log(`\n📦 Creating component: kit-${componentName}\n`);

files.forEach(({ name, content }) => {
	const filePath = path.join(componentDir, name);
	fs.writeFileSync(filePath, content);
	console.log(`✅ Created: src/components/${componentName}/${name}`);
});

console.log(`\n✨ Component scaffolded successfully!\n`);
console.log('Next steps:');
console.log('  1. Run "npm run build:styles" to generate the styles file');
console.log('  2. Edit the component files as needed');
console.log('  3. Run "npm run storybook" to view your component');
console.log('  4. Run "npm test" to run tests\n');
