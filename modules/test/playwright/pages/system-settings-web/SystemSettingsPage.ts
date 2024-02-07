/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {ApplicationsMenuPage} from '../product-navigation-applications-menu/ApplicationsMenuPage';

export class SystemSettingsPage {
	readonly applicationsMenuPage: ApplicationsMenuPage;
	readonly page: Page;
	readonly updateButton: Locator;

	constructor(page: Page) {
		this.applicationsMenuPage = new ApplicationsMenuPage(page);
		this.page = page;
		this.updateButton = page.getByRole('button', {
			exact: true,
			name: 'Update',
		});
	}

	async goto() {
		await this.applicationsMenuPage.goToSystemSettingsLink();
	}

	async disableProperty(categoryName, sectionName, propertyName) {
		await this.goto();

		await this.page.getByText(categoryName, {exact: true}).click();
		await this.page
			.getByRole('menuitem', {exact: true, name: sectionName})
			.click();

		await expect(
			this.page.getByLabel(propertyName, {exact: true})
		).toBeChecked();

		await this.page.getByLabel(propertyName, {exact: true}).uncheck();

		await this.updateButton.click();

		await expect(
			this.page.getByLabel(propertyName, {exact: true})
		).not.toBeChecked();
	}

	async enableProperty(categoryName, sectionName, propertyName) {
		await this.goto();

		await this.page.getByText(categoryName, {exact: true}).click();
		await this.page
			.getByRole('menuitem', {exact: true, name: sectionName})
			.click();

		await expect(
			this.page.getByLabel(propertyName, {exact: true})
		).not.toBeChecked();

		await this.page.getByLabel(propertyName, {exact: true}).check();

		await this.updateButton.click();

		await expect(
			this.page.getByLabel(propertyName, {exact: true})
		).toBeChecked();
	}
}
