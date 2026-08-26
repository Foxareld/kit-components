import cssnano from 'cssnano';
import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import presetEnv from 'postcss-preset-env';

// Define the directory path to search for CSS files
const srcDirectory = './src/components';

// Convert kebab-case to camelCase (e.g., text-input -> textInput)
function toCamelCase(str) {
	return str
		.split('-')
		.map((word, i) =>
			i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
		)
		.join('');
}

async function processCssFile(cssFilePath) {
	try {
		const cssFileContents = await fs.readFile(cssFilePath, 'utf-8');

		// Run PostCSS with postcss-preset-env (includes nesting) and cssnano
		const result = await postcss([
			presetEnv({
				stage: 3, // Enable modern CSS features including nesting
				features: {
					'nesting-rules': true,
				},
			}),
			cssnano({
				preset: [
					'default',
					{
						discardComments: {
							removeAll: true,
						},
					},
				],
			}),
		]).process(cssFileContents, {
			from: cssFilePath,
		});

		const resultingCSS = result.css;

		// Generate export name from file name (e.g., button.css -> buttonStyles,
		// text-input.css -> textInputStyles)
		const fileName = path.basename(cssFilePath, '.css');
		const exportName = `${toCamelCase(fileName)}Styles`;

		// Lit CSS template with processed CSS
		const template = `import { css } from 'lit';\n\nexport const ${exportName} = css\`${resultingCSS}\`;\n`;

		// Create an output file path by replacing the file extension with .styles.ts
		const outputFilePath = cssFilePath.replace(/\.css$/, '.styles.ts');

		// Write the template to the .styles.ts file
		await fs.writeFile(outputFilePath, template, 'utf-8');

		console.log(
			`✅ ${path.relative(process.cwd(), cssFilePath)} → ${path.basename(outputFilePath)}`,
		);
	} catch (error) {
		console.error(`❌ Error processing CSS in ${cssFilePath}:`, error);
	}
}

async function processCssFilesInDirectory(directory) {
	try {
		const files = await fs.readdir(directory);

		for (const file of files) {
			const filePath = path.join(directory, file);
			const stat = await fs.stat(filePath);

			if (stat.isDirectory()) {
				// Recursively process subdirectories
				await processCssFilesInDirectory(filePath);
			} else if (file.endsWith('.css')) {
				// Process CSS files
				await processCssFile(filePath);
			}
		}
	} catch (error) {
		console.error(`❌ Error reading directory ${directory}:`, error);
	}
}

console.log('🎨 Building component styles...\n');

// Start processing CSS files in the specified directory
processCssFilesInDirectory(srcDirectory)
	.then(() => {
		console.log('\n✨ Styles build completed!');
	})
	.catch((error) => {
		console.error('❌ Styles build failed:', error);
		process.exit(1);
	});
