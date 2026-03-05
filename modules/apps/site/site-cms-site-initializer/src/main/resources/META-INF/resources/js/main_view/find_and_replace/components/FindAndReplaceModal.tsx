/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayModal, {useModal} from '@clayui/modal';
import {Observer} from '@clayui/modal/src/types';
import React, {useContext, useState} from 'react';

import {ISearchAssetObjectEntry} from '../../../common/types/AssetType';
import {
	FindAndReplaceContext,
	FindAndReplaceContextProvider,
	ReplaceItem,
	View,
} from '../contexts/FindAndReplaceContext';
import {Discard} from './Discard';
import {Loading} from './Loading';
import {Setup} from './Setup';
import {Summary} from './Summary';

type Props = {
	fdsItems: ISearchAssetObjectEntry[];
	search: string;
};

export default function Wrapper({fdsItems, search}: Props) {
	const [visible, setVisible] = useState(true);

	const {observer, onClose: closeModal} = useModal({
		onClose: () => setVisible(false),
	});

	if (!visible) {
		return;
	}

	return (
		<FindAndReplaceContextProvider
			closeModal={closeModal}
			fdsItems={fdsItems}
			search={search}
		>
			<FindAndReplaceModal observer={observer} />
		</FindAndReplaceContextProvider>
	);
}

function FindAndReplaceModal({observer}: {observer: Observer}) {
	const {items, view} = useContext(FindAndReplaceContext);

	const size = getSize(view);
	const status = getStatus(items, view);

	return (
		<ClayModal
			center={size !== 'full-screen'}
			disableAutoClose
			observer={observer}
			size={size}
			status={status}
		>
			{view === 'loading' && <Loading />}

			{view === 'setup' && <Setup />}

			{view === 'summary' && <Summary />}

			{view === 'discard' && <Discard />}
		</ClayModal>
	);
}

function getSize(view: View) {
	if (view === 'loading' || view === 'setup') {
		return undefined;
	}

	return 'full-screen';
}

function getStatus(items: ReplaceItem[] | null, view: View) {
	if ((items && !items.length) || view === 'discard') {
		return 'danger';
	}

	return undefined;
}
