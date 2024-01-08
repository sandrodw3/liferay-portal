/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpers.fixture';
import {applicationsMenuPageTest} from '../../fixtures/applicationsMenuPages.fixture';
import {getFragmentDefinition} from '../../utils/getFragmentDefinition';
import {getPageDefinition} from '../../utils/getPageDefinition';
import {getRandomId} from '../../utils/util';

export const test = mergeTests(apiHelpersTest, applicationsMenuPageTest);

const NON_DESKTOP_PANELS = [
	{
		name: 'General',
		sections: [
			{name: 'Frame', visible: true},
			{name: 'Options', visible: false},
		],
	},
	{
		name: 'Styles',
		sections: [
			{name: 'Background', visible: true},
			{name: 'Borders', visible: true},
			{name: 'Effects', visible: true},
			{name: 'Spacing', visible: true},
			{name: 'Text', visible: true},
		],
	},
	{
		name: 'Advanced',
		sections: [
			{name: 'Hide from Site Search Results', visible: false},
			{name: 'CSS', visible: true},
		],
	},
];

test('shows correct sections on each configuration panel when viewport is not Desktop', async ({
	_apiHelpers,
	page,
}) => {
	await page.goto('/');

	// Create a site

	const site = await _apiHelpers.headlessSite.createSite(getRandomId());

	// Create a page with a Heading fragment

	const headingId = getRandomId();

	const headingFragment = getFragmentDefinition(
		headingId,
		'BASIC_COMPONENT-heading'
	);

	const layout = await _apiHelpers.headlessDelivery.createSitePage(
		site.id,
		getRandomId(),
		getPageDefinition([headingFragment])
	);

	// Go to edit mode of page

	await page.goto(
		`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}?p_l_mode=edit`
	);

	// Switch to Tablet viewport and select the fragment

	await page.getByLabel('Tablet').click();

	await page
		.frameLocator('.page-editor__global-context-iframe')
		.locator(`.lfr-layout-structure-item-${headingId}`)
		.click();

	// Go to each panel and check correct sections are shown

	for (const {name, sections} of NON_DESKTOP_PANELS) {
		await page.getByRole('tab', {name}).click();

		for (const {name, visible} of sections) {
			const section = page.locator('.panel-title').getByText(name);

			if (visible) {
				await expect(section).toBeVisible();
			}
			else {
				await expect(section).not.toBeVisible();
			}
		}
	}

	// Delete the site

	await _apiHelpers.headlessSite.deleteSite(site.id);
});
