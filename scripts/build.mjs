import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import * as esbuild from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';
import postcss from 'postcss';

// PostCSS plugin for esbuild to process CSS in .styles.ts files
const postcssPlugin = {
	name: 'postcss',
	setup(build) {
		build.onLoad({ filter: /\.styles\.ts$/ }, async (args) => {
			const fs = await import('fs/promises');
			const contents = await fs.readFile(args.path, 'utf8');

			// Extract CSS from css`...` template literals
			const cssRegex = /css`([^`]*)`/gs;
			let match;
			let processedContents = contents;

			while ((match = cssRegex.exec(contents)) !== null) {
				const originalCSS = match[1];

				// Process with PostCSS
				const result = await postcss([
					autoprefixer,
					cssnano({ preset: 'default' }),
				]).process(originalCSS, { from: undefined });

				// Replace in the file
				processedContents = processedContents.replace(
					match[0],
					`css\`${result.css}\``,
				);
			}

			return {
				contents: processedContents,
				loader: 'ts',
			};
		});
	},
};

// Get all component entry points
async function getComponentEntries() {
	const componentsDir = './src/components';
	try {
		const dirs = await readdir(componentsDir, { withFileTypes: true });
		const componentDirs = dirs.filter((dirent) => dirent.isDirectory());

		return componentDirs.map((dir) =>
			join(componentsDir, dir.name, 'index.ts'),
		);
	} catch (error) {
		// Components directory might not exist yet
		return [];
	}
}

async function build() {
	console.log('🔨 Building component library...');

	const componentEntries = await getComponentEntries();

	const entryPoints = ['./src/index.ts', ...componentEntries];

	try {
		await esbuild.build({
			entryPoints,
			outdir: 'dist',
			bundle: true,
			format: 'esm',
			target: 'es2020',
			sourcemap: true,
			splitting: true,
			platform: 'browser',
			packages: 'external', // Treat all node_modules packages as external
			plugins: [postcssPlugin],
			logLevel: 'info',
			chunkNames: 'chunks/[name]-[hash]',
		});

		// Run TypeScript compiler for declarations
		console.log('📝 Generating TypeScript declarations...');
		const { exec } = await import('child_process');
		const { promisify } = await import('util');
		const execAsync = promisify(exec);

		await execAsync(
			'tsc --project tsconfig.prod.json --emitDeclarationOnly',
		);

		console.log('✅ Build completed successfully!');
	} catch (error) {
		console.error('❌ Build failed:', error);
		process.exit(1);
	}
}

build();
