/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ClayButtonWithIcon} from '@clayui/button';
import React from 'react';

export function HelpModalTrigger() {
	return (
		<ClayButtonWithIcon
			aria-label={Liferay.Language.get('open-help-modal')}
			className="bg-dark m-5 position-fixed rounded-circle structure-builder__help-modal-trigger text-white"
			displayType="unstyled"
			symbol="question-circle"
		/>
	);
}
