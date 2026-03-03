/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openToast} from 'frontend-js-components-web';
import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

import {ISearchAssetObjectEntry} from '../../../common/types/AssetType';
import FindAndReplaceService from '../services/FindAndReplaceService';

export type View = 'loading' | 'setup' | 'summary' | 'discard';

type ReplaceItemField = {
	label: string;
	name: string;
	value?: string;
	value_i18n?: Partial<Record<Liferay.Language.Locale, string>>;
};

export type ReplaceItem = {
	externalReferenceCode: string;
	fields: ReplaceItemField[];
	id: string;
	related?: Array<{
		externalReferenceCode: string;
		fields: ReplaceItemField[];
		label: string;
	}>;
};

export const FindAndReplaceContext = createContext<{
	closeModal: () => void;
	items: ReplaceItem[] | null;
	localeId: string;
	previousView: View | null;
	replacement: string;
	search: string;
	setItems: Dispatch<SetStateAction<ReplaceItem[] | null>>;
	setLocaleId: Dispatch<SetStateAction<string>>;
	setPreviousView: Dispatch<SetStateAction<View | null>>;
	setReplacement: Dispatch<SetStateAction<string>>;
	setView: Dispatch<SetStateAction<View>>;
	view: View;
}>({
	closeModal: () => {},
	items: null,
	localeId: 'all',
	previousView: null,
	replacement: '',
	search: '',
	setItems: () => {},
	setLocaleId: () => {},
	setPreviousView: () => {},
	setReplacement: () => {},
	setView: () => {},
	view: 'loading',
});

type Props = {
	children: React.ReactNode;
	closeModal: () => void;
	fdsItems: ISearchAssetObjectEntry[];
	search: string;
};

export function FindAndReplaceContextProvider({
	children,
	closeModal,
	fdsItems,
	search,
}: Props) {
	const [items, setItems] = useState<ReplaceItem[] | null>(null);

	const [localeId, setLocaleId] = useState('all');

	const [replacement, setReplacement] = useState('');

	const [view, setView] = useState<View>('loading');

	const [previousView, setPreviousView] = useState<View | null>(null);

	const loadingRef = useRef(false);

	useEffect(() => {
		async function loadItems() {
			const response =
				await FindAndReplaceService.getReplaceItems(fdsItems);

			if (response.error) {
				openToast({
					message: Liferay.Language.get(
						'an-unexpected-error-occurred'
					),
					type: 'danger',
				});

				closeModal();

				return;
			}

			setItems(response.data);

			setView('setup');
		}

		if (!items && !loadingRef.current) {
			loadingRef.current = true;

			loadItems();
		}
	}, [closeModal, fdsItems, items]);

	return (
		<FindAndReplaceContext.Provider
			value={{
				closeModal,
				items,
				localeId,
				previousView,
				replacement,
				search,
				setItems,
				setLocaleId,
				setPreviousView,
				setReplacement,
				setView,
				view,
			}}
		>
			{children}
		</FindAndReplaceContext.Provider>
	);
}

export function useDiscard() {
	const {setPreviousView, setView, view} = useContext(FindAndReplaceContext);

	return useCallback(() => {
		setPreviousView(view);

		setView('discard');
	}, [setPreviousView, setView, view]);
}

export function useCancelDiscard() {
	const {previousView, setPreviousView, setView} = useContext(
		FindAndReplaceContext
	);

	return useCallback(() => {
		if (previousView) {
			setView(previousView);
		}

		setPreviousView(null);
	}, [previousView, setPreviousView, setView]);
}
