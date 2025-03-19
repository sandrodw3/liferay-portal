/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {loginTest} from '../../fixtures/loginTest';

let i = 0;
let j = 0;

const test = mergeTests(loginTest());

test('First flaky test', async ({page}, testInfo) => {
	if (page && testInfo.retry) {
		i++;
	}

	expect(i).toBe(1);
});

test('Not flaky test', async () => {
	const a = 1;

	expect(a).toBe(1);
});

test('Second flaky test', async ({page}, testInfo) => {
	if (page && testInfo.retry) {
		j++;
	}

	expect(j).toBe(1);
});
