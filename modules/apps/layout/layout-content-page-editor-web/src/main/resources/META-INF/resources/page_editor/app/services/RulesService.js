/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {config} from '../config/index';
import serviceFetch from './serviceFetch';

export default {

	/**
	 * Add a rule
	 */
	addRule({
		actions,
		conditions,
		name,
		onNetworkStatus,
		segmentsExperienceId,
	}) {
		return serviceFetch(
			config.addRuleURL,
			{
				body: {
					actions: JSON.stringify(actions),
					conditions: JSON.stringify(conditions),
					name,
					segmentsExperienceId,
				},
			},
			onNetworkStatus
		);
	},

	/**
	 * Delete a rule
	 */
	deleteRule({onNetworkStatus, ruleId, segmentsExperienceId}) {
		return serviceFetch(
			config.deleteRuleURL,
			{
				body: {
					ruleId,
					segmentsExperienceId,
				},
			},
			onNetworkStatus
		);
	},

	/**
	 * Get users
	 */
	getUsers() {
		return serviceFetch(config.getUsersURL, {}, () => {});
	},

	/**
	 * Update a rule with new name, actions and conditions
	 */
	updateRule({
		actions,
		conditions,
		name,
		onNetworkStatus,
		ruleId,
		segmentsExperienceId,
	}) {
		return serviceFetch(
			config.updateRuleURL,
			{
				body: {
					actions: JSON.stringify(actions),
					conditions: JSON.stringify(conditions),
					name,
					ruleId,
					segmentsExperienceId,
				},
			},
			onNetworkStatus
		);
	},
};
