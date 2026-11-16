/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {UPDATE_LAYOUT_DATA} from '../../../../src/main/resources/META-INF/resources/page_editor/app/actions/types';
import LayoutService from '../../../../src/main/resources/META-INF/resources/page_editor/app/services/LayoutService';
import updateLayoutData from '../../../../src/main/resources/META-INF/resources/page_editor/app/thunks/updateLayoutData';

jest.mock(
	'../../../../src/main/resources/META-INF/resources/page_editor/app/services/LayoutService',
	() => ({
		getLayoutData: jest.fn(() =>
			Promise.resolve({
				fragmentEntryLinks: {1: {fragmentEntryLinkId: '1'}},
				layoutData: {items: {}, rootItems: {main: 'root'}},
			})
		),
	})
);

describe('updateLayoutData', () => {
	it('replaces the layout data with the one stored in the server', async () => {
		const dispatch = jest.fn();

		await updateLayoutData()(dispatch, () => ({
			segmentsExperienceId: '0',
		}));

		expect(LayoutService.getLayoutData).toHaveBeenCalledWith({
			onNetworkStatus: dispatch,
			segmentsExperienceId: '0',
		});

		expect(dispatch).toHaveBeenCalledWith({
			fragmentEntryLinks: {1: {fragmentEntryLinkId: '1'}},
			layoutData: {items: {}, rootItems: {main: 'root'}},
			type: UPDATE_LAYOUT_DATA,
		});
	});
});
