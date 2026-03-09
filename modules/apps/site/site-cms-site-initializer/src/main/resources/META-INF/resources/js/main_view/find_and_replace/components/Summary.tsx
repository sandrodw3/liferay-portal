/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import ClayList from '@clayui/list';
import ClayModal from '@clayui/modal';
import {
	EConfigInURLBehavior,
	FrontendDataSet,
} from '@liferay/frontend-data-set-web';
import {sub} from 'frontend-js-web';
import React, {useContext} from 'react';

import {
	FindAndReplaceContext,
	ReplaceItem,
	useDiscard,
} from '../contexts/FindAndReplaceContext';

export const MOCK_ITEMS: ReplaceItem[] = Array.from(
	{length: 30},
	(_, index) => {
		const itemNumber = index + 1;

		const valueI18n = {
			[Liferay.ThemeDisplay.getDefaultLanguageId()]: `Title ${itemNumber}`,
		} as ReplaceItem['fields'][number]['value_i18n'];

		return {
			externalReferenceCode: `mock-erc-${itemNumber}`,
			fields: [
				{
					label: 'Title',
					name: 'title',
					value_i18n: valueI18n,
				},
			],
			id: `mock-id-${itemNumber}`,
		};
	}
);

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
						aria-label={Liferay.Language.get('back')}
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

			<ClayModal.Body>
				<DataSet />
			</ClayModal.Body>

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

function DataSet() {
	const {items} = useContext(FindAndReplaceContext);

	return (
		<FrontendDataSet
			configInURLBehavior={EConfigInURLBehavior.OFF}
			id="findAndReplaceItemList"
			items={MOCK_ITEMS}
			pagination={{
				deltas: [{label: 10}, {label: 20}],
				initialDelta: 10,
			}}
			showPagination
			style="fluid"
			views={[
				{
					component: List,
					contentRenderer: 'table',
					name: 'table',
					schema: {
						fields: [],
					},
				},
			]}
		/>
	);
}

function List({items}: {items: ReplaceItem[]}) {
	return (
		<ClayList>
			{items.map((item) => (
				<ClayList.Item
					className="align-items-center"
					flex
					key={item.id}
				>
					<ClayList.ItemField expand>
						<ClayList.ItemTitle>
							{getTitle(item)}
						</ClayList.ItemTitle>

						<ClayList.ItemText>
							{sub(
								Liferay.Language.get('x-changes'),
								item.fields.length
							)}
						</ClayList.ItemText>
					</ClayList.ItemField>

					<ClayList.ItemField>
						<ClayButton displayType="secondary" size="sm">
							{Liferay.Language.get('apply-changes')}
						</ClayButton>
					</ClayList.ItemField>

					<ClayList.ItemField>
						<ClayButtonWithIcon
							aria-label={sub(
								Liferay.Language.get('discard-changes-to-x'),
								getTitle(item)
							)}
							borderless
							displayType="secondary"
							monospaced
							size="sm"
							symbol="times-circle"
						/>
					</ClayList.ItemField>
				</ClayList.Item>
			))}
		</ClayList>
	);
}

function getTitle(item: ReplaceItem) {
	const field = item.fields.find((field) => field.name === 'title');

	return field?.value_i18n![Liferay.ThemeDisplay.getDefaultLanguageId()];
}
