/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayTable from '@clayui/table';
import React, {useEffect, useState} from 'react';

import ApiHelper from '../utils/ApiHelper';

type Member = {
	age: number;
	id: number;
	name: string;
};

type Row = Partial<Member> & {persisted: boolean};

export default function MemberTable({houseERC}: {houseERC: string}) {
	const [rows, setRows] = useState<Row[]>([]);

	useEffect(() => {
		ApiHelper.get(
			`/o/c/members?filter=r_house_c_houseERC eq '${houseERC}'`
		).then(({items}) => {
			setRows(getInitialRows(items));
		});
	}, [houseERC]);

	return (
		<>
			<h2 className="sheet-subtitle">Household Members</h2>

			<p className="sheet-text">List everyone in your home</p>

			<ClayTable borderedColumns hover={false}>
				<ClayTable.Head>
					<ClayTable.Row>
						<ClayTable.Cell expanded headingCell noWrap>
							Name
						</ClayTable.Cell>

						<ClayTable.Cell
							className="table-cell-minw-100"
							headingCell
							noWrap
						>
							Age
						</ClayTable.Cell>

						<ClayTable.Cell
							className="table-cell-minw-75"
							headingCell
							noWrap
						/>
					</ClayTable.Row>
				</ClayTable.Head>

				<ClayTable.Body>
					{rows.map((row) =>
						row.persisted ? (
							<PersistedRow
								key={row.id}
								row={row}
								rows={rows}
								setRows={setRows}
							/>
						) : (
							<EditingRow
								houseERC={houseERC}
								key={row.id}
								row={row}
								rows={rows}
								setRows={setRows}
							/>
						)
					)}
				</ClayTable.Body>
			</ClayTable>

			<ClayButton
				displayType="secondary"
				onClick={() => {
					const nextRows = [...rows];

					nextRows.push(getEmptyRow());

					setRows(nextRows);
				}}
			>
				<span className="inline-item inline-item-before">
					<ClayIcon aria-label="Add more" symbol="plus" />
				</span>
				Add More
			</ClayButton>
		</>
	);
}

function PersistedRow({
	row,
	rows,
	setRows,
}: {
	row: Row;
	rows: Row[];
	setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}) {
	const onDelete = async () => {
		await ApiHelper.del(`/o/c/members/${row.id}`);

		const nextRows = rows.filter((_row) => _row.id !== row.id);

		setRows(nextRows);
	};

	return (
		<ClayTable.Row>
			<ClayTable.Cell expanded headingCell noWrap>
				{row.name}
			</ClayTable.Cell>

			<ClayTable.Cell className="table-cell-minw-100" headingCell noWrap>
				{row.age}
			</ClayTable.Cell>

			<ClayTable.Cell className="table-cell-minw-75" headingCell noWrap>
				<ClayButtonWithIcon
					aria-label="Delete member"
					displayType="secondary"
					onClick={onDelete}
					symbol="trash"
				/>
			</ClayTable.Cell>
		</ClayTable.Row>
	);
}

function EditingRow({
	houseERC,
	row,
	rows,
	setRows,
}: {
	houseERC: string;
	row: Row;
	rows: Row[];
	setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}) {
	const [name, setName] = useState('');

	const [age, setAge] = useState(0);

	const onSave = async () => {
		const {id} = await ApiHelper.post('/o/c/members', {
			age,
			name,
			r_house_c_houseERC: houseERC,
		});

		const nextRow = {age, id, name, persisted: true};

		const nextRows = rows.map((_row) =>
			_row.id === row.id ? nextRow : _row
		);

		setRows(nextRows);
	};

	return (
		<ClayTable.Row>
			<ClayTable.Cell expanded>
				<ClayInput
					onChange={(event) => setName(event.target.value)}
					value={name}
				/>
			</ClayTable.Cell>

			<ClayTable.Cell expanded>
				<ClayInput
					onChange={(event) => setAge(Number(event.target.value))}
					value={age}
				/>
			</ClayTable.Cell>

			<ClayTable.Cell>
				<ClayButtonWithIcon
					aria-label="Save member"
					displayType="primary"
					onClick={onSave}
					symbol="check"
					title="Save member"
				/>
			</ClayTable.Cell>
		</ClayTable.Row>
	);
}

function getEmptyRow() {
	return {
		id: Math.floor(Math.random() * 90000) + 10000,
		persisted: false,
	};
}

function getInitialRows(members?: Member[] | null) {
	if (!members || !members.length) {
		return [getEmptyRow()];
	}

	return [
		...members.map((member) => ({...member, persisted: true})),
		getEmptyRow(),
	];
}
