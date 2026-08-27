import * as esbuild from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';

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
