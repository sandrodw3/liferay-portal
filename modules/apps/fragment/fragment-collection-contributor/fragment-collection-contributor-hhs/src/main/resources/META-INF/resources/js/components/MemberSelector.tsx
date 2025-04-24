/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayForm, {ClayCheckbox, ClayRadio, ClayRadioGroup} from '@clayui/form';
import React, {useEffect, useState} from 'react';

import ApiHelper from '../utils/ApiHelper';

type Member = {
	id: number;
	name: string;
};

export default function MemberSelector({
	houseERC,
	input,
}: {
	houseERC: string;
	input: {label: string; name: string; value: string};
}) {
	const [value, setValue] = useState(input.value ? 'yes' : 'no');

	const [members, setMembers] = useState<Member[] | null>(null);

	const [selection, setSelection] = useState(
		new Set(input.value ? input.value.split(', ') : [])
	);

	useEffect(() => {
		if (value === 'yes' && !members) {
			ApiHelper.get(
				`/o/c/members?filter=r_house_c_houseERC eq '${houseERC}'`
			).then(({items}) => setMembers(items));
		}
	}, [houseERC, members, setMembers, value]);

	return (
		<ClayForm.Group>
			<label>{input.label}</label>

			<ClayRadioGroup
				className="c-gap-3 d-flex"
				onChange={(value: string | number) => {
					setValue(value as string);

					if (value === 'no') {
						setMembers(null);
						setSelection(new Set());
					}
				}}
				value={value}
			>
				<ClayRadio label="Yes" value="yes" />

				<ClayRadio label="No" value="no" />
			</ClayRadioGroup>

			{value === 'yes' && members?.length ? (
				<>
					<p className="mb-3 text-italic">If yes, who?</p>

					{members.map((member: Member) => (
						<ClayCheckbox
							aria-label={member.name}
							checked={selection.has(member.name)}
							key={member.id}
							label={member.name}
							onChange={(event) => {
								const nextSelection = new Set(selection);

								if (event.target.checked) {
									nextSelection.add(member.name);
								}
								else {
									nextSelection.delete(member.name);
								}

								setSelection(nextSelection);
							}}
						/>
					))}
				</>
			) : null}

			<input
				name={input.name}
				type="hidden"
				value={
					selection.size > 0 ? Array.from(selection).join(', ') : ''
				}
			/>
		</ClayForm.Group>
	);
}
