/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {render} from '@testing-library/react';
import React from 'react';

import AIAssistantButton from '../../../../../src/main/resources/META-INF/resources/page_editor/app/components/ai_assistant/AIAssistantButton';
import {ControlsProvider} from '../../../../../src/main/resources/META-INF/resources/page_editor/app/contexts/ControlsContext';
import {StoreAPIContextProvider} from '../../../../../src/main/resources/META-INF/resources/page_editor/app/contexts/StoreContext';
import updateLayoutData from '../../../../../src/main/resources/META-INF/resources/page_editor/app/thunks/updateLayoutData';

jest.mock('@liferay/ai-hub-cell-js-components-web', () => {
	const state = {command: null, expanded: false};

	return {
		AIAssistant: {
			getState: () => state,
			subscribe: () => () => {},
		},
		AIAssistantTriggerButton: () => null,
		CONTENT_CHANGED_EVENT: 'contentChanged',
	};
});

jest.mock(
	'../../../../../src/main/resources/META-INF/resources/page_editor/app/config/index',
	() => ({
		config: {
			layoutExternalReferenceCode: 'layout-erc',
		},
	})
);

jest.mock(
	'../../../../../src/main/resources/META-INF/resources/page_editor/app/thunks/updateLayoutData',
	() => jest.fn(() => 'updateLayoutData')
);

function getContentChangedHandler() {
	return Liferay.on.mock.calls
		.filter(([name]) => name === 'contentChanged')
		.at(-1)[1];
}

function renderButton(dispatch) {
	render(
		<StoreAPIContextProvider dispatch={dispatch} getState={() => ({})}>
			<ControlsProvider>
				<AIAssistantButton />
			</ControlsProvider>
		</StoreAPIContextProvider>
	);
}

function serialize(page) {
	return JSON.stringify({data: JSON.stringify(page)});
}

describe('AIAssistantButton', () => {
	beforeEach(() => {
		Liferay.on.mockReturnValue({detach: jest.fn()});

		updateLayoutData.mockClear();
	});

	it('reloads the layout data when the agent changes the current page', () => {
		const dispatch = jest.fn();

		renderButton(dispatch);

		getContentChangedHandler()({
			data: serialize({externalReferenceCode: 'layout-erc'}),
		});

		expect(dispatch).toHaveBeenCalledWith('updateLayoutData');
	});

	it('does not reload the layout data when the agent changes another page', () => {
		const dispatch = jest.fn();

		renderButton(dispatch);

		getContentChangedHandler()({
			data: serialize({externalReferenceCode: 'another-erc'}),
		});

		expect(dispatch).not.toHaveBeenCalled();
	});
});
