// Precompiles the Kit components used by the docs chat panel for Storybook's
// manager bundle.
//
// The manager is built by Storybook's own esbuild call, which uses Storybook's
// tsconfig rather than ours, so Kit source imported directly compiles without
// `experimentalDecorators` and crashes at load ("Unsupported decorator location:
// field"). Storybook exposes no hook to change that config, so the panel imports
// this pre-built output instead (generated, gitignored).
//
// Runs automatically via the `prestorybook` / `prebuild-storybook` npm hooks.
// Needs the generated .styles.ts and icon registry, same as Storybook itself.
import * as esbuild from 'esbuild';

await esbuild.build({
	stdin: {
		contents: [
			"import './src/components/input/index.ts';",
			"import './src/components/button/index.ts';",
			"import './src/components/icon/index.ts';",
		].join('\n'),
		resolveDir: '.',
		loader: 'ts',
	},
	outfile: './.storybook/docs-chat/kit.generated.js',
	tsconfig: './tsconfig.json',
	bundle: true,
	format: 'esm',
	target: 'es2020',
	platform: 'browser',
	logLevel: 'warning',
});
