import { execSync } from 'child_process';
import chokidar from 'chokidar';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('👀 Watching for CSS file changes...\n');
console.log('Project root:', projectRoot);

// Use glob to find all CSS files (** pattern works better with glob than chokidar polling)
const cssPattern = path
	.join(projectRoot, 'src', 'components', '**', '*.css')
	.replace(/\\/g, '/');
console.log('Finding CSS files with pattern:', cssPattern);

const cssFiles = await glob(cssPattern);
console.log(`\nFound ${cssFiles.length} CSS file(s):`);
cssFiles.forEach((f) => console.log(`  - ${path.relative(projectRoot, f)}`));
console.log('');

if (cssFiles.length === 0) {
	console.error('❌ No CSS files found! Exiting...');
	process.exit(1);
}

function rebuildStyles() {
	try {
		console.log('🔨 Rebuilding styles...');
		execSync('node scripts/build-styles.mjs', {
			stdio: 'inherit',
			cwd: projectRoot,
		});
		console.log('✅ Rebuild complete!\n');
	} catch (error) {
		console.error('❌ Build failed:', error.message);
	}
}

// Watch all found CSS files
const watcher = chokidar.watch(cssFiles, {
	persistent: true,
	ignoreInitial: true,
	usePolling: true,
	interval: 300,
	awaitWriteFinish: {
		stabilityThreshold: 300,
		pollInterval: 100,
	},
});

watcher
	.on('ready', () => {
		console.log(
			'✅ Watcher ready! Make changes to CSS files to trigger rebuild...\n',
		);
	})
	.on('add', (filePath) => {
		console.log(`\n📝 Added: ${path.relative(projectRoot, filePath)}`);
		rebuildStyles();
	})
	.on('change', (filePath) => {
		console.log(`\n📝 Changed: ${path.relative(projectRoot, filePath)}`);
		rebuildStyles();
	})
	.on('unlink', (filePath) => {
		console.log(`\n🗑️ Removed: ${path.relative(projectRoot, filePath)}`);
	})
	.on('error', (error) => {
		console.error('\n❌ Watcher error:', error);
	});

// Handle graceful shutdown
process.on('SIGINT', () => {
	console.log('\n\n👋 Stopping watch mode...');
	watcher.close();
	process.exit(0);
});
