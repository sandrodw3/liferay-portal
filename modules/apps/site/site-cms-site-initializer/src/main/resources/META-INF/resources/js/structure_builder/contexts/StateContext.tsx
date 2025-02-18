/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {
	Dispatch,
	ReactNode,
	createContext,
	useContext,
	useReducer,
} from 'react';

import {State} from '../../../../../../../../../../frontend-js/frontend-js-state-web/src/main/resources/META-INF/resources';

const DEFAULT_STRUCTURE_NAME = Liferay.Language.get('untitled-structure');

type State = {
	error: string | null;
	name: string;
};

const INITIAL_STATE: State = {error: null, name: DEFAULT_STRUCTURE_NAME};

type SetErrorAction = {error: string | null; type: 'set-error'};
type SetNameAction = {name: string; type: 'set-name'};

type Action = SetErrorAction | SetNameAction;

function reducer(state: State, action: Action) {
	switch (action.type) {
		case 'set-error':
			return {...state, error: action.error};
		case 'set-name':
			return {...state, name: action.name};
		default:
			return state;
	}
}

const StateContext = createContext<{dispatch: Dispatch<Action>; state: State}>({
	dispatch: () => {},
	state: INITIAL_STATE,
});

export default function StateContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

	return (
		<StateContext.Provider value={{dispatch, state}}>
			{children}
		</StateContext.Provider>
	);
}

function useStateDispatch() {
	return useContext(StateContext).dispatch;
}

function useStructureError() {
	const {state} = useContext(StateContext);

	return state.error;
}

function useStructureName() {
	const {state} = useContext(StateContext);

	return state.name;
}

export {
	StateContextProvider,
	useStateDispatch,
	useStructureError,
	useStructureName,
};
