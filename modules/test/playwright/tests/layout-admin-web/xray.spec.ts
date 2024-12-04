/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {pagesAdminPagesTest} from '../../fixtures/pagesAdminPagesTest';
import {clickAndExpectToBeVisible} from '../../utils/clickAndExpectToBeVisible';
import getRandomString from '../../utils/getRandomString';

const test = mergeTests(
	apiHelpersTest,
	featureFlagsTest({
		'LPD-35220': true,
		'LPS-178052': true,
	}),
	isolatedSiteTest,
	loginTest(),
	pagesAdminPagesTest
);

test('First example test for XRay', async ({
	apiHelpers,
	page,
	pagesAdminPage,
	site,
}) => {

	// Create a page with only one permission

	const pageName = getRandomString();

	await apiHelpers.headlessDelivery.createSitePage({
		pagePermissions: [
			{
				actionKeys: ['VIEW'],
				roleKey: 'Owner',
			},
		],
		siteId: site.id,
		title: pageName,
	});

	// Go to admin page and check if the Restricted Page label is in the Miller Columns item

	await pagesAdminPage.goto(site.friendlyUrlPath);

	await expect(
		page
			.locator('.miller-columns-item')
			.getByLabel(`${pageName}. Restricted Page`)
	).toBeVisible();
});

test('Second example test for XRay', async ({
	apiHelpers,
	page,
	pagesAdminPage,
	site,
}) => {

	// Create parent page

	const parentPageName = getRandomString();

	await apiHelpers.jsonWebServicesLayout.addLayout({
		groupId: site.id,
		title: parentPageName,
	});

	// Create child page and check it actually appears as child

	const childPageName = getRandomString();

	await pagesAdminPage.goto(site.friendlyUrlPath);

	await pagesAdminPage.createNewPage({
		draft: true,
		name: childPageName,
		parent: parentPageName,
	});

	await pagesAdminPage.goto(site.friendlyUrlPath);

	await page.getByRole('button', {name: parentPageName}).click();

	await expect(page.getByRole('link', {name: childPageName})).toBeVisible();

	// Check Draft label is shown and we can preview the draft

	await expect(
		page
			.locator('li', {has: page.getByText(childPageName)})
			.getByText('Draft')
	).toBeVisible();

	await clickAndExpectToBeVisible({
		target: page.getByRole('menuitem', {
			name: 'Preview Draft',
		}),
		trigger: page
			.locator('li', {has: page.getByText(childPageName)})
			.getByRole('button', {name: 'Open Page Options Menu'}),
	});

	// Delete child page

	await pagesAdminPage.deletePage(childPageName);

	await expect(
		page.getByRole('link', {name: childPageName})
	).not.toBeVisible();
});

test('Third example test for XRay', async ({
	apiHelpers,
	page,
	pagesAdminPage,
	site,
}) => {

	// Add listener with expect so it fails when a browser dialog is shown

	page.on('dialog', async (dialog) => {
		dialog.accept();

		expect(dialog.message(), 'This alert should not be shown').toBeNull();
	});

	// Create page and go to view mode to check dialog is not shown

	await apiHelpers.jsonWebServicesLayout.addLayout({
		groupId: site.id,
		title: '<script>alert(123);</script>',
	});

	await pagesAdminPage.goto(site.friendlyUrlPath);
});
