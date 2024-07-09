/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

import {ViewObjectDefinitionsPage} from '../ViewObjectDefinitionsPage';

export class ObjectDetailsPage {
	readonly detailsTabItem: Locator;
	readonly saveButton: Locator;
	readonly viewObjectDefinitionsPage: ViewObjectDefinitionsPage;
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
		this.detailsTabItem = page
			.getByRole('listitem')
			.filter({hasText: 'Details'});
		this.viewObjectDefinitionsPage = new ViewObjectDefinitionsPage(page);
	}

	async goto(objectDefinitionLabel: string) {
		await this.viewObjectDefinitionsPage.goto();

		await this.viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			objectDefinitionLabel
		);

		await this.detailsTabItem.click();
	}

	async updateConfiguration({
		fieldLabel,
		objectName,
		value,
	}: {
		fieldLabel: string;
		objectName: string;
		value: boolean;
	}) {
		await this.goto(objectName);

		const saveButton = this.page.getByRole('button', {name: 'Save'});

		await saveButton.waitFor();

		const field = this.page.getByLabel(fieldLabel, {exact: true});

		if (value) {
			await field.check();
		}
		else {
			await field.uncheck();
		}

		await saveButton.click();
	}
}
