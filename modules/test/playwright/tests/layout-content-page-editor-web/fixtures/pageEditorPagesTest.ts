/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// @ts-ignore

import {stateTest} from '../../../fixtures/stateTest';
import {PageEditorPage} from '../pages/PageEditorPage';

const pageEditorPagesTest = stateTest.extend<{
	pageEditorPage: PageEditorPage;
}>({
	pageEditorPage: async ({page, state}, use) => {
		await use(new PageEditorPage(page, state));
	},
});

export {pageEditorPagesTest};
