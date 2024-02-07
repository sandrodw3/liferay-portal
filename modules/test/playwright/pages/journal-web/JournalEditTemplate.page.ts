/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {JournalPage} from './Journal.page';

export class JournalEditTemplatePage {
	readonly elementsPanel: Locator;
	readonly page: Page;
	readonly saveButton: Locator;
	readonly titlePlaceholder: Locator;

	journalPage: JournalPage;

	constructor(page: Page) {
		this.elementsPanel = page.getByTitle('Elements', {exact: true});
		this.journalPage = new JournalPage(page);
		this.page = page;
		this.saveButton = page.getByRole('button', {exact: true, name: 'Save'});
		this.titlePlaceholder = page.getByPlaceholder('Untitled Template');
	}

	async goto() {
		await this.journalPage.goToCreateNewTemplate();
	}

	async gotoElements() {
		await this.journalPage.goToCreateNewTemplate();
		await this.elementsPanel.click();
	}

	async addNewTemplate(title: string) {
		await this.goto();
		await this.titlePlaceholder.fill(title);
		await this.saveButton.click();
	}
}
