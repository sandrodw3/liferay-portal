/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {AIAssistant} from '@liferay/ai-hub-cell-js-components-web';
import {useSyncExternalStore} from 'react';

import {AI_ASSISTANT_TRIGGER_ID} from '../../config/constants/aiAssistant';

export default function useAIAssistantOpen() {
	const {command, expanded} = useSyncExternalStore(
		AIAssistant.subscribe,
		AIAssistant.getState
	);

	return command?.triggerId === AI_ASSISTANT_TRIGGER_ID && expanded;
}
