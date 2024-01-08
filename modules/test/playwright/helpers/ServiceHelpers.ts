/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Page} from '@playwright/test';

import {liferayConfig} from '../liferay.config';
import {GroupAdminServiceHelper} from './GroupAdminServiceHelper';

export class ServiceHelpers {
	readonly baseUrl: string;
	readonly groupAdmin: GroupAdminServiceHelper;
	readonly page: Page;

	constructor(page: Page) {
		this.baseUrl = liferayConfig.environment.baseUrl + '/api/jsonws/';
		this.groupAdmin = new GroupAdminServiceHelper(this);
		this.page = page;
	}

	async delete(url: string) {
		return this.page.request.delete(url, {
			headers: await this.getHeader(),
		});
	}

	async getHeader() {
		const authToken = await this.page.evaluate(() => Liferay.authToken);

		return {
			'Content-Type': 'application/json',
			'x-csrf-token': authToken,
		};
	}
}
