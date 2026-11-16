/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {getRandomInt} from '../../../utils/getRandomInt';
import getRandomString from '../../../utils/getRandomString';
import {
	GEOCODED_ADDRESS,
	dragMapPin,
	interceptMapRequests,
} from '../../object-web/utils/location';
import getFormContainerDefinition from '../main/utils/getFormContainerDefinition';
import getFragmentDefinition from '../main/utils/getFragmentDefinition';
import getPageDefinition from '../main/utils/getPageDefinition';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-11388': {enabled: true},
		'LPD-70668': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest()
);

test(
	'Can pick a location on the map of a required location input',
	{tag: '@LPD-70670'},
	async ({apiHelpers, page, site}) => {
		await interceptMapRequests(page);

		// Create an object with a required location field

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectDefinitionExternalReferenceCode: `Office${getRandomInt()}`,
				objectFields: [
					{
						DBType: 'Clob',
						businessType: 'Location',
						externalReferenceCode: getRandomString(),
						label: {en_US: 'Office Location'},
						name: 'location',
						required: true,
					},
				],
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Create a page with a form container mapped to the object

		const layout = await apiHelpers.headlessDelivery.createSitePage({
			pageDefinition: getPageDefinition([
				getFormContainerDefinition({
					id: getRandomString(),
					objectDefinitionClassName: objectDefinition.className,
					pageElements: [
						getFragmentDefinition({
							fragmentConfig: {
								inputFieldId: 'ObjectField_location',
							},
							id: getRandomString(),
							key: 'INPUTS-location-input',
						}),
						getFragmentDefinition({
							id: getRandomString(),
							key: 'INPUTS-submit-button',
						}),
					],
				}),
			]),
			siteId: site.id,
			title: getRandomString(),
		});

		await page.goto(`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`);

		// Submit without a location and check the required error

		await page.getByText('Submit', {exact: true}).click();

		await expect(page.getByText('This field is required')).toBeVisible();

		// Drag the pin and check the input holds the geocoded address

		await dragMapPin(page.locator('.object-field__location-map'), page);

		await expect(
			page.locator('input[id$="-location-input-value"]')
		).toHaveValue(new RegExp(GEOCODED_ADDRESS));
	}
);
