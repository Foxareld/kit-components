import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { DocsChatPanel } from './docs-chat/Panel.js';

const ADDON_ID = 'kit/docs-chat';

addons.register(ADDON_ID, () => {
	addons.add(`${ADDON_ID}/panel`, {
		type: types.PANEL,
		title: 'Ask the docs',
		render: ({ active }) => <DocsChatPanel active={active} />,
	});
});
