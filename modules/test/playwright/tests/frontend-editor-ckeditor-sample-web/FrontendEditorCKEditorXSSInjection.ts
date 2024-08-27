/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {liferayConfig} from '../../liferay.config';
import getRandomString from '../../utils/getRandomString';
import getPageDefinition from '../layout-content-page-editor-web/utils/getPageDefinition';
import getWidgetDefinition from '../layout-content-page-editor-web/utils/getWidgetDefinition';

export const test = mergeTests(apiHelpersTest, isolatedSiteTest, loginTest());

test.describe('CKEditor', () => {
	test('XSS injection', async ({apiHelpers, page, site}) => {
		let layout: Layout;

		await test.step('Create a content site and the CKEditor sample widget', async () => {
			console.log('foo');
		});

		await test.step('Click on the "Go to XSS', async () => {
			console.log('bar');
		});
	});
});
