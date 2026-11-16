/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {render} from '@liferay/frontend-js-react-web';
import React from 'react';

import {LocationFragmentInput} from './LocationFragmentInput';

type Props = React.ComponentProps<typeof LocationFragmentInput>;

export function renderLocationInput(
	container: HTMLElement,
	props: Props
): void {
	render(
		LocationFragmentInput,
		{componentId: `${props.namespace}-location-input`, ...props},
		container
	);
}
