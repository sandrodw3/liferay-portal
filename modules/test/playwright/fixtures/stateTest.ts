/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {test} from '@playwright/test';

const DEFAULT_STATE = {
	siteUrl: '/guest',
};

type State = typeof DEFAULT_STATE;

const stateTest = test.extend<{
	state: State;
}>({
	state: async ({page}, use) => {
		await page.goto('/');

		const state = {...DEFAULT_STATE};

		await use(state);
	},
});

export {stateTest, State};
