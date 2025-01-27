/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {test} from '@playwright/test';

import {liferayConfig} from '../liferay.config';
import {LoginScreenName, userData} from '../utils/performLogin';

export interface LoginOptions {
	screenName?: LoginScreenName;
}

export interface Login {
	login: {
		screenName: LoginScreenName;
		sessionId: string;
	};
}

/**
 * This fixture performs a login in the default test page for the user with the given screen name
 * and leaves it in the home page.
 *
 * This fixture needs some pre-cooked users in the test DXP instance. They are created by deploying
 * the `modules/test/playwright-setup` OSGi bundle before Playwright is run.
 *
 * That is automatically done by the CI. In local environments, you need to run
 * `npm run test:setup <name of the test>` before running Playwright to achieve the same results.
 *
 * @param options the screen name to use for performing the login
 *
 * @example
 * export const test = mergeTests(
 *   loginTest('unprivileged'),
 *   ...
 * );
 *
 * test('something', ...);
 */
function loginTest(options: LoginOptions = {}) {
	const fixtureImpl = test.extend<Login>({
		login: [
			async ({page}, use) => {
				const screenName = options.screenName || 'test';
				const domain = '@liferay.com';

				const {password} = userData[screenName];

				const params = {
					login: `${screenName}${domain}`,
					password,
					rememberMe: 'true',
				};

				// Login via API

				const url = `${liferayConfig.environment.baseUrl}/c/portal/login`;

				const response = await fetch(url, {
					body: new URLSearchParams(params).toString(),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					method: 'POST',
				});

				// Extract JSESSIONID cookie and inject it in page context

				const [, JSESSIONID] = response.headers
					.get('set-cookie')
					.match(/JSESSIONID=([^;]+)/);

				const cookie = {
					domain: 'localhost',
					expires: -1,
					httpOnly: true,
					name: 'JSESSIONID',
					path: '/',
					sameSite: 'Lax' as const,
					secure: false,
					value: JSESSIONID,
				};

				await page.context().addCookies([cookie]);

				await page.goto('/');

				await page.goto(liferayConfig.environment.baseUrl);

				await use({
					screenName,
					sessionId: JSESSIONID,
				});
			},
			{auto: true},
		],
	});

	return fixtureImpl;
}

export {loginTest};
