/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ServiceHelpers} from './ServiceHelpers';

export class GroupAdminServiceHelper {
	readonly serviceHelpers: ServiceHelpers;
	readonly basePath: string;

	constructor(serviceHelpers: ServiceHelpers) {
		this.serviceHelpers = serviceHelpers;
		this.basePath = 'group';
	}

	async deleteGroup(groupId: string) {
		return this.serviceHelpers.delete(
			`${this.serviceHelpers.baseUrl}${this.basePath}/delete-group/group-id/${groupId}`
		);
	}

}