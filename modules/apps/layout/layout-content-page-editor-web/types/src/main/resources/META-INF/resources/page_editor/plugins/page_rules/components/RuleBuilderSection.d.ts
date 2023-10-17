/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

import {Fetcher} from '../../../app/utils/useCache';
import {Action as ActionType} from './Action';
import {Condition as ConditionType} from './Condition';
declare type RuleBuilderActionProps = {
	actions: ActionType[];
	fetcher: Fetcher;
	setActions: (initializer: (previous: ActionType[]) => ActionType[]) => {};
};
export declare function RuleBuilderActionSection({
	actions,
	setActions,
}: RuleBuilderActionProps): JSX.Element;
declare type RuleBuilderConditionProps = {
	conditions: ConditionType[];
	fetcher: Fetcher;
	setConditions: (
		initializer: (previous: ConditionType[]) => ConditionType[]
	) => {};
};
export declare function RuleBuilderConditionSection({
	conditions,
	fetcher,
	setConditions,
}: RuleBuilderConditionProps): JSX.Element;
export {};
