/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {navigate} from 'frontend-js-web';
import React from 'react';

import ApiHelper from '../utils/ApiHelper';

export default function QualifyButton() {
	const onClick = async () => {
		const {id} = await ApiHelper.post('/o/c/houses', {
			status: {code: 2},
		});

		navigate(`/l/${id}`);
	};

	return (
		<ClayButton displayType="primary" onClick={onClick}>
			See If I Qualify
		</ClayButton>
	);
}
