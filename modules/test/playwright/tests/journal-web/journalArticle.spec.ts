/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {applicationsMenuPageTest} from '../../fixtures/applicationsMenuPageTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {loginTest} from '../../fixtures/loginTest';
import {clickAndExpectToBeVisible} from '../../utils/clickAndExpectToBeVisible';
import getRandomString from '../../utils/getRandomString';
import {journalPagesTest} from './fixtures/journalPagesTest';

const clickAndFill = async (input) => {
	const text = getRandomString();

	await input.click();
	await input.fill(text);
};

export const test = mergeTests(
	apiHelpersTest,
	applicationsMenuPageTest,
	featureFlagsTest({
		'LPD-11253': true,
		'LPD-16469': true,
		'LPS-114700': true,
	}),
	loginTest(),
	journalPagesTest
);

const PERMISSIONS_LOCATORS = [
	'#guest_ACTION_DELETE',
	'#guest_ACTION_PERMISSIONS',
];

const NAMESPACE = '_com_liferay_journal_web_portlet_JournalPortlet_';

test('LPD-17245: Add error message in Translation for concurrent users', async ({
	journalEditArticlePage,
	journalEditArticleTranslationsPage,
	journalPage,
	page,
}) => {
	await journalPage.goto();

	const title = getRandomString();

	await journalEditArticlePage.publishNewBasicArticle(title);

	const article = page
		.locator(`#${NAMESPACE}_articlesSearchContainer .list-group-item`)
		.filter({hasText: title});

	await article.waitFor();

	const editBasicArticleTranslationUrl =
		await journalEditArticleTranslationsPage.editBasicArticleTranslations(
			title,
			''
		);

	await journalEditArticlePage.editAndPublishExistingBasicArticle(title);

	await journalEditArticleTranslationsPage.assertErrorInEditBasicArticleTranslations(
		editBasicArticleTranslationUrl
	);

	await journalPage.deleteJournalArticle(title);
});

test('LPD-17782: This is a test for bulk permissions of web content', async ({
	journalEditArticlePage,
	journalPage,
	page,
}) => {
	await journalPage.goto();

	const title1 = getRandomString();
	const title2 = getRandomString();

	await journalEditArticlePage.publishNewBasicArticle(title1);

	const article1 = page
		.locator(`#${NAMESPACE}articlesSearchContainer .list-group-item`)
		.filter({hasText: title1});

	await article1.waitFor();

	await journalEditArticlePage.publishNewBasicArticle(title2);

	const article2 = page
		.locator(`#${NAMESPACE}articlesSearchContainer .list-group-item`)
		.filter({hasText: title2});

	await article2.waitFor();

	await journalPage.setJournalArticlePermissions(
		[article1, article2],
		PERMISSIONS_LOCATORS
	);

	await journalPage.assertJournalArticlePermissions(
		title1,
		PERMISSIONS_LOCATORS
	);
	await journalPage.assertJournalArticlePermissions(
		title2,
		PERMISSIONS_LOCATORS
	);

	await journalPage.deleteJournalArticle(title1);
	await journalPage.deleteJournalArticle(title2);
});

test('LPD-19627: Translate several fields and check how many fields have been translated', async ({
	journalEditArticlePage,
	journalPage,
	page,
}) => {
	await journalPage.goto();

	const defaultTitle = getRandomString();

	await journalEditArticlePage.createNewBasicArticle(defaultTitle);

	const friendlyURLInput = page.getByLabel('Friendly URL', {exact: true});

	await clickAndFill(friendlyURLInput);

	const translationButton = page.getByRole('combobox', {
		name: 'Select a language',
	});

	await clickAndExpectToBeVisible({
		autoClick: true,
		target: page.getByRole('option', {
			name: 'Catalan Language: Not Translated',
		}),
		trigger: translationButton,
	});

	await clickAndFill(friendlyURLInput);
	await clickAndFill(page.getByPlaceholder('Untitled Basic Web Content'));
	await clickAndFill(
		page
			.frameLocator(`#${NAMESPACE}descriptionMapAsXMLBoundingBox iframe`)
			.getByRole('textbox')
	);

	await translationButton.click();

	await expect(
		page.getByRole('option', {name: 'Catalan Language: Translating 3/4'})
	).toBeVisible({timeout: 1000});
});
