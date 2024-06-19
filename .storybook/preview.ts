import '../src/assets/index.css';
import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';

import customElementsManifest from '../custom-elements.json';

setCustomElementsManifest(customElementsManifest);

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},

	tags: ['autodocs'],
};

export default preview;
