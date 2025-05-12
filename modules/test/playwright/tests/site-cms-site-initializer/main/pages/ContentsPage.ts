/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

import {clickAndExpectToBeVisible} from '../../../../utils/clickAndExpectToBeVisible';
import {PORTLET_URLS} from '../../../../utils/portletUrls';

export class ContentsPage {
	readonly page: Page;

	readonly addButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.addButton = page.getByRole('button', {name: 'New'});
	}

	async goto() {
		await this.page.goto(PORTLET_URLS.cmsContents);
		await this.page.getByRole('heading', {name: 'Contents'}).waitFor();
	}

	async addNewContent(structureName: string) {
		await clickAndExpectToBeVisible({
			autoClick: true,
			target: this.page
				.locator('.dropdown-menu')
				.getByRole('menuitem', {name: structureName}),
			trigger: this.addButton,
		});
	}
}
