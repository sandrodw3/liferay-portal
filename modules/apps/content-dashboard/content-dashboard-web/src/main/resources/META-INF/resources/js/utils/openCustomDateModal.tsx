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
import {navigate} from 'frontend-js-web';
import React, {useState} from 'react';

const NOT_SELECTED_OPTION = {
	label: `-- ${Liferay.Language.get('select-type')} --`,
	value: 'not-selected',
};

type Props = {
	dateTypes: Array<{label: string; value: string}>;
	filterUrl: string;
	selectedRange: string | undefined;
};

export default function openCustomDateModal(props: Props) {
	render(CustomDateModal, {...props}, document.createElement('div'));
}

function CustomDateModal({dateTypes, filterUrl, selectedRange}: Props) {
	const {observer, onOpenChange, open} = useModal({
		defaultOpen: true,
		onClose: () => onOpenChange(false),
	});

	const dateTypeId = useId();
	const [dateType, setDateType] = useState(NOT_SELECTED_OPTION.value);

	const rangeId = useId();
	const [range, setRange] = useState<string | undefined>(selectedRange);

	const onSave = () => {
		const url = new URL(filterUrl);

		url.searchParams.set('dateType', dateType);

		const [start, end] = range!.split(' - ');

		url.searchParams.set('startDate', start);
		url.searchParams.set('endDate', end);

		navigate(url.toString());
	};

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
						options={[NOT_SELECTED_OPTION, ...dateTypes]}
						value={dateType}
					/>
				</ClayForm.Group>

				{dateType !== NOT_SELECTED_OPTION.value ? (
					<ClayForm.Group>
						<label htmlFor={rangeId}>
							{Liferay.Language.get('date-range')}
						</label>

						<ClayDatePicker
							onChange={setRange}
							placeholder="YYYY-MM-DD - YYYY-MM-DD"
							range
							value={range}
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

						<ClayButton
							disabled={!dateType || !range}
							onClick={onSave}
						>
							{Liferay.Language.get('done')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</ClayModal>
	);
}
