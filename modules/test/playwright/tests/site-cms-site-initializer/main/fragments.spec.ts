/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../fixtures/apiHelpersTest';
import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {loginTest} from '../../../fixtures/loginTest';
import {pageEditorPagesTest} from '../../../fixtures/pageEditorPagesTest';
import {clickAndExpectToBeVisible} from '../../../utils/clickAndExpectToBeVisible';
import {cmsPagesTest} from './fixtures/cmsPagesTest';

const test = mergeTests(
	apiHelpersTest,
	cmsPagesTest,
	loginTest(),
	pageEditorPagesTest,
	dataApiHelpersTest
);

test.describe('Space List Fragment CMS', () => {
	test(
		'Check the functionality of the Space List fragment CMS',
		{tag: ['@LPD-52223']},
		async ({contentsPage, page, pageEditorPage, structuresPage}) => {

			// Go to the Structures Pages

			await structuresPage.goto();

			// Edit Basic Web Content structure

			const row = page.locator('.cell-label', {
				hasText: 'Basic Web Content',
			});

			await clickAndExpectToBeVisible({
				autoClick: true,
				target: page.getByRole('menuitem', {
					name: 'Edit',
				}),
				trigger: row.getByLabel('options'),
			});

			// Customize Experience

			await page
				.getByRole('button', {
					exact: true,
					name: 'Customize Experience',
				})
				.click();

			// Add a Space List fragment

			await pageEditorPage.addFragment(
				'fragment.collection.label.space-list',
				'space-list'
			);

			await pageEditorPage.publishPage();

			// Add new content with the structure

			await contentsPage.goto();

			await contentsPage.addNewContent('Basic Web Content');

			// Check the default Space List fragment configuration

			await expect(page.locator('.space-list-fragment')).toBeVisible();

			await expect(page.locator('.space-list-title-text')).toHaveText(
				'Space'
			);

			await expect(
				page.locator('.space-list-name .sticker-overlay')
			).toHaveText('D');

			await expect(
				page.locator('.space-list-name').locator('span').last()
			).toHaveText('Default');
		}
	);
});
