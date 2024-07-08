/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {pageViewModePagesTest} from '../../fixtures/pageViewModePagesTest';
import {UIElementsPage} from '../../pages/uielements/UIElementsPage';
import getRandomString from '../../utils/getRandomString';
import addApprovedStructuredContent from '../../utils/structured-content/addApprovedStructuredContent';
import getBasicWebContentStructureId from '../../utils/structured-content/getBasicWebContentStructureId';

const test = mergeTests(
	apiHelpersTest,
	isolatedSiteTest,
	loginTest(),
	pageViewModePagesTest
);

test('View web content is shown in Web Content Display after be added via content panel', async ({
	apiHelpers,
	page,
	site,
	widgetPagePage,
}) => {
	const longWebContentTitle =
		'Inside the life coaching cult that takes over lives';
	const webContentTitle = getRandomString();
	const uiElementsPage = new UIElementsPage(page);

	const contentStructureId = await getBasicWebContentStructureId(apiHelpers);

	await addApprovedStructuredContent({
		apiHelpers,
		contentStructureId,
		siteId: site.id,
		title: longWebContentTitle,
	});

	await addApprovedStructuredContent({
		apiHelpers,
		contentStructureId,
		siteId: site.id,
		title: webContentTitle,
	});

	const layout = await apiHelpers.jsonWebServicesLayout.addLayout({
		groupId: site.id,
		title: getRandomString(),
	});

	await widgetPagePage.goToSitePage(site, layout.friendlyURL);
	await widgetPagePage.clickControlMenuAddButton();
	await widgetPagePage.goToControlMenuAddPanelContentTab();

	await expect(
		page.getByTitle(longWebContentTitle, {exact: true})
	).toBeVisible();
	await expect(page.getByText(longWebContentTitle)).toBeVisible();

	await widgetPagePage.addContent(longWebContentTitle);

	await uiElementsPage.pageCreatedAlert.waitFor({state: 'hidden'});

	await expect(page.getByText(longWebContentTitle)).toBeVisible();

	await widgetPagePage.addContent(webContentTitle);

	await uiElementsPage.pageCreatedAlert.waitFor({state: 'hidden'});

	await expect(page.getByText(webContentTitle)).toBeVisible();
});
