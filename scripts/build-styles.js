const cssnano = require('cssnano');
const fs = require('fs').promises;
const path = require('path');
const postcss = require('postcss');
const presetEnv = require('postcss-preset-env');

// Define the directory path to search for CSS files
const srcDirectory = './src/components';

async function processCssFile(cssFilePath) {
	try {
		const cssFileContents = await fs.readFile(cssFilePath, 'utf-8');

		// Run PostCSS with postcss-preset-env and cssnano
		const result = await postcss([presetEnv, cssnano]).process(
			cssFileContents,
			{
				from: cssFilePath,
			}
		);

		const resultingCSS = result.css;

		// Lit CSS template with processed CSS
		const template = `import { css } from 'lit'; import reset from '../../assets/reset.css'; export const componentStyles = css\` \${reset} ${resultingCSS}\`;`;

		// Create an output file path by replacing the file extension with .css.ts
		const outputFilePath = cssFilePath.replace(/\.css$/, '.styles.ts');

		// Write the template to the .css.ts file
		await fs.writeFile(outputFilePath, template, 'utf-8');

		console.log(`CSS processed and saved to ${outputFilePath}`);
	} catch (error) {
		console.error(`Error processing CSS in ${cssFilePath}:`, error);
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
		console.error(`Error reading directory ${directory}:`, error);
	}
}

module.exports = { processCssFile };

// Start processing CSS files in the specified directory
processCssFilesInDirectory(srcDirectory);
