/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {test} from '@playwright/test';

import {ServiceHelpers} from '../helpers/ServiceHelpers';

const serviceHelpersTest = test.extend<{_serviceHelpers: ServiceHelpers}>({
	_serviceHelpers: async ({page}, use) => {
		await use(new ServiceHelpers(page));
	},
});

export {serviceHelpersTest};
