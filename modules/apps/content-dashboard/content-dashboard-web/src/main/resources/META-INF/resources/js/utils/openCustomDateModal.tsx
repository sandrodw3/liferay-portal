/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayDatePicker from '@clayui/date-picker';
import ClayForm, {ClaySelectWithOption} from '@clayui/form';
import ClayModal, {useModal} from '@clayui/modal';
import {render} from '@liferay/frontend-js-react-web';
import {useId} from 'frontend-js-components-web';
import React, {useState} from 'react';

const NOT_SELECTED_OPTION = {
	label: '-',
	value: 'not-selected',
};

export default function openCustomDateModal() {
	render(CustomDateModal, {}, document.createElement('div'));
}

function CustomDateModal() {
	const {observer, onOpenChange, open} = useModal({
		defaultOpen: true,
		onClose: () => onOpenChange(false),
	});

	const dateTypeId = useId();
	const [dateType, setDateType] = useState(NOT_SELECTED_OPTION.value);

	const dateId = useId();
	const [date, setDate] = useState<string | undefined>(undefined);

	if (!open) {
		return null;
	}

	return (
		<ClayModal observer={observer}>
			<ClayModal.Header>
				{Liferay.Language.get('filter-by-date')}
			</ClayModal.Header>

			<ClayModal.Body>
				<ClayForm.Group>
					<label htmlFor={dateTypeId}>
						{Liferay.Language.get('date-type')}
					</label>

					<ClaySelectWithOption
						id={dateTypeId}
						onChange={(event) => setDateType(event.target.value)}
						options={[
							NOT_SELECTED_OPTION,
							{
								label: 'Option 1',
								value: '1',
							},
						]}
						value={dateType}
					/>
				</ClayForm.Group>

				{dateType !== NOT_SELECTED_OPTION.value ? (
					<ClayForm.Group>
						<label htmlFor={dateId}>
							{Liferay.Language.get('date')}
						</label>

						<ClayDatePicker
							onChange={setDate}
							placeholder="YYYY-MM-DD - YYYY-MM-DD"
							range
							value={date}
							years={{
								end: 2024,
								start: 1997,
							}}
						/>
					</ClayForm.Group>
				) : null}
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={() => onOpenChange(false)}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton onClick={() => onOpenChange(false)}>
							{Liferay.Language.get('done')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</ClayModal>
	);
}
