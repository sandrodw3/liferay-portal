/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import ClayModal from '@clayui/modal';
import React, {useContext} from 'react';

import {
	FindAndReplaceContext,
	useDiscard,
} from '../contexts/FindAndReplaceContext';

export function Summary() {
	const {setView} = useContext(FindAndReplaceContext);

	const discard = useDiscard();

	return (
		<>
			<ClayModal.Header
				closeButtonAriaLabel={Liferay.Language.get('close')}
			>
				<div className="align-items-center c-gap-3 d-flex">
					<ClayButtonWithIcon
						aria-label="back"
						borderless
						className="text-secondary"
						displayType="unstyled"
						monospaced
						onClick={() => setView('setup')}
						size="sm"
						symbol="angle-left"
					/>

					{Liferay.Language.get('review-changes')}
				</div>
			</ClayModal.Header>

			<ClayModal.Body>SUMMARY</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton displayType="secondary" onClick={discard}>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton>
							{Liferay.Language.get(
								'apply-changes-to-all-assets'
							)}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</>
	);
}
