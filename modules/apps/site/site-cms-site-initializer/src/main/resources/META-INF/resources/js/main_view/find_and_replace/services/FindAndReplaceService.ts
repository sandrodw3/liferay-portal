/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ApiHelper from '../../../common/services/ApiHelper';
import {ISearchAssetObjectEntry} from '../../../common/types/AssetType';
import {ReplaceItem} from '../contexts/FindAndReplaceContext';

async function getReplaceItems(fdsItems: ISearchAssetObjectEntry[]) {
	const formData = new FormData();

	const objectEntries = fdsItems.map((item) => ({
		className: item.entryClassName,
		objectEntryId: item.embedded.id,
	}));

	formData.append('objectEntries', JSON.stringify(objectEntries));

	return await ApiHelper.postFormData<ReplaceItem[]>(
		formData,
		`${Liferay.ThemeDisplay.getPathMain()}/cms/get_object_entries_values`
	);
}

export default {getReplaceItems};
