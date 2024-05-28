/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {masterPagesTest} from './fixtures/masterPagesTest';

export const test = mergeTests(isolatedSiteTest, loginTest(), masterPagesTest);

test('This is for LPS-102202. Validate if the Blank page template can not be edited and deleted.', async ({
	masterPagesPage,
	site,
}) => {
	await masterPagesPage.goto(site.friendlyUrlPath);

	const templateCard = masterPagesPage.getTemplateCard('Blank');

	await expect(templateCard).toBeVisible();

	await expect(templateCard.getByLabel('More actions')).not.toBeVisible();

	await expect(
		templateCard.locator('.custom-control.custom-checkbox')
	).not.toBeVisible();
});

test('This is a test for LPS-102566, LPS-109594, LPS-119634 and LPS-104629. Add a page based on custom master.', async ({
	masterPagesPage,
	page,
	pageEditorPage,
	site,
}) => {
	const nameNewMasterPage = 'New Master Page';

	await test.step('Create and publish new custom master page', async () => {
		await masterPagesPage.goto(site.friendlyUrlPath);

		masterPagesPage.publishNewMasterTemplate(nameNewMasterPage);

		const templateCard = masterPagesPage.getTemplateCard(nameNewMasterPage);

		await expect(templateCard).toBeVisible();

		await expect(templateCard.getByLabel('More actions')).toBeVisible();

		await expect(
			templateCard.locator('.custom-control.custom-checkbox')
		).toBeVisible();
	});

	await test.step('Assert header of Drop Zone is inside body by default', async () => {
		masterPagesPage.clickAndEdit(nameNewMasterPage);

		await expect(page.locator('.page-editor__drop-zone')).toBeVisible();

		await expect(
			page.getByText(
				'Fragments and widgets for pages based on this master will be placed here.'
			)
		).toBeVisible();
		await expect(
			page.getByText('Configure Allowed Fragments')
		).toBeVisible();
	});
	await test.step('Add and configure a Button fragment on master page', async () => {
		await pageEditorPage.addFragment('Basic Components', 'Button');
	});
});
