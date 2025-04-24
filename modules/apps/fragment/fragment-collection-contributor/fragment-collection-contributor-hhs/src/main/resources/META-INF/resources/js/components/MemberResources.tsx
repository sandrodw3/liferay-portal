/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayForm, {ClayInput, ClayRadio, ClayRadioGroup} from '@clayui/form';
import ClayTable from '@clayui/table';
import React, {useCallback, useEffect, useState} from 'react';

import ApiHelper from '../utils/ApiHelper';

type Member = {
	cash?: number;
	checking?: number;
	id: number;
	name: string;
	savings?: number;
};

export default function MemberResources({houseERC}: {houseERC: string}) {
	const [value, setValue] = useState('no');

	const [members, setMembers] = useState<Member[] | null>(null);

	const loadMembers = useCallback(async () => {
		const {items} = await ApiHelper.get(
			`/o/c/members?filter=r_house_c_houseERC eq '${houseERC}'`
		);

		setMembers(items);

		return items;
	}, [houseERC]);

	const clearResources = useCallback(async () => {
		if (!members) {
			return;
		}

		for (const member of members) {
			await ApiHelper.patch(`/o/c/members/${member.id}`, {
				cash: 0,
				checking: 0,
				savings: 0,
			});
		}
	}, [members]);

	useEffect(() => {
		if (!members) {
			loadMembers().then((members) => {
				if (
					members.every(
						(member: Member) =>
							!member.cash && !member.checking && !member.savings
					)
				) {
					setValue('no');
				}
				else {
					setValue('yes');
				}
			});
		}
	}, [loadMembers, members]);

	useEffect(() => {
		if (value === 'yes' && !members?.length) {
			loadMembers();
		}

		if (value === 'no') {
			clearResources();

			loadMembers();
		}
	}, [clearResources, loadMembers, members, value]);

	return (
		<ClayForm.Group>
			<h2 className="sheet-subtitle">Your Household Resources</h2>

			<p className="sheet-text">
				We need to know how much money you have. You should include:
				Cash on hand, which is any money you carry or have under your
				control. Money in a bank, such as checking and savings accounts
			</p>

			<label>
				Does anyone in your home have any cash on hand or money in a
				bank?
			</label>

			<ClayRadioGroup
				className="c-gap-3 d-flex"
				onChange={(value: string | number) => {
					setValue(value as string);
				}}
				value={value}
			>
				<ClayRadio label="Yes" value="yes" />

				<ClayRadio label="No" value="no" />
			</ClayRadioGroup>

			{value === 'yes' && members?.length ? (
				<ResourceTable members={members} />
			) : null}
		</ClayForm.Group>
	);
}

function ResourceTable({members}: {members: Member[]}) {
	return (
		<>
			<ClayTable borderedColumns hover={false}>
				<ClayTable.Head>
					<ClayTable.Row>
						<ClayTable.Cell expanded headingCell noWrap>
							Name
						</ClayTable.Cell>

						<ClayTable.Cell headingCell noWrap>
							Cash
						</ClayTable.Cell>

						<ClayTable.Cell headingCell noWrap>
							Checking
						</ClayTable.Cell>

						<ClayTable.Cell headingCell noWrap>
							Savings
						</ClayTable.Cell>
					</ClayTable.Row>
				</ClayTable.Head>

				<ClayTable.Body>
					{members.map((member) => (
						<Row key={member.id} member={member} />
					))}
				</ClayTable.Body>
			</ClayTable>
		</>
	);
}

function Row({member}: {member: Member}) {
	const [cash, setCash] = useState(member.cash);
	const [checking, setChecking] = useState(member.checking);
	const [savings, setSavings] = useState(member.savings);

	const onBlur = async () => {
		await ApiHelper.patch(`/o/c/members/${member.id}`, {
			cash,
			checking,
			savings,
		});
	};

	return (
		<ClayTable.Row>
			<ClayTable.Cell>
				<span>{member.name}</span>
			</ClayTable.Cell>

			<ClayTable.Cell>
				<ClayInput.Group>
					<ClayInput.GroupItem prepend shrink>
						<ClayInput.GroupText>$</ClayInput.GroupText>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem prepend>
						<ClayInput
							onBlur={onBlur}
							onChange={(event) =>
								setCash(Number(event.target.value))
							}
							type="number"
							value={cash}
						/>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayTable.Cell>

			<ClayTable.Cell>
				<ClayInput.Group>
					<ClayInput.GroupItem prepend shrink>
						<ClayInput.GroupText>$</ClayInput.GroupText>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem prepend>
						<ClayInput
							onBlur={onBlur}
							onChange={(event) =>
								setChecking(Number(event.target.value))
							}
							type="number"
							value={checking}
						/>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayTable.Cell>

			<ClayTable.Cell>
				<ClayInput.Group>
					<ClayInput.GroupItem prepend shrink>
						<ClayInput.GroupText>$</ClayInput.GroupText>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem prepend>
						<ClayInput
							onBlur={onBlur}
							onChange={(event) =>
								setSavings(Number(event.target.value))
							}
							type="number"
							value={savings}
						/>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayTable.Cell>
		</ClayTable.Row>
	);
}
