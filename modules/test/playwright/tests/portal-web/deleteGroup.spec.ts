/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {mergeTests} from '@playwright/test';

import {serviceHelpersTest} from '../../fixtures/serviceHelpers.fixture';

export const test = mergeTests(serviceHelpersTest);

test('delete a group', async ({_serviceHelpers, page}) => {
	await page.goto('/');

	await _serviceHelpers.groupAdmin.deleteGroup('33081');
});
