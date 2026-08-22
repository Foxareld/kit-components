import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
	files: 'src/**/*.test.ts',
	nodeResolve: true,

	plugins: [
		esbuildPlugin({
			ts: true,
			target: 'auto',
			tsconfig: './tsconfig.json',
		}),
	],

	browsers: [
		playwrightLauncher({ product: 'chromium' }),
		playwrightLauncher({ product: 'firefox' }),
		playwrightLauncher({ product: 'webkit' }),
	],

	testFramework: {
		config: {
			timeout: 3000,
			retries: 1,
		},
	},

	coverage: true,
	coverageConfig: {
		include: ['src/**/*.ts'],
		exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
		threshold: {
			statements: 80,
			branches: 70,
			functions: 80,
			lines: 80,
		},
	},
};
