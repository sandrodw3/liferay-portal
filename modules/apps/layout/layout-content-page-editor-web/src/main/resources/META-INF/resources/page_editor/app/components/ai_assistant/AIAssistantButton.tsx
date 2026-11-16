/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	AIAssistantTriggerButton,
	CONTENT_CHANGED_EVENT,
} from '@liferay/ai-hub-cell-js-components-web';
import React, {useEffect, useRef} from 'react';

import {
	AI_ASSISTANT_CONTAINER_ID,
	AI_ASSISTANT_TRIGGER_ID,
	EDIT_PAGE_CHATBOT_ERC,
} from '../../config/constants/aiAssistant';
import {config} from '../../config/index';
import {useActiveItemIds} from '../../contexts/ControlsContext';
import {useDispatch, useGetState} from '../../contexts/StoreContext';
import selectSegmentsExperienceId from '../../selectors/selectSegmentsExperienceId';
import switchSidebarPanel from '../../thunks/switchSidebarPanel';
import updateLayoutData from '../../thunks/updateLayoutData';
import useAIAssistantOpen from './useAIAssistantOpen';

function getPage(data: string | undefined): {
	externalReferenceCode?: string;
} | null {
	if (!data) {
		return null;
	}

	try {
		return JSON.parse(JSON.parse(data).data);
	}
	catch {
		return null;
	}
}

export default function AIAssistantButton() {
	const activeItemIds = useActiveItemIds();
	const aiAssistantOpen = useAIAssistantOpen();
	const dispatch = useDispatch();
	const getState = useGetState();

	const activeItemIdsRef = useRef(activeItemIds);

	useEffect(() => {
		activeItemIdsRef.current = activeItemIds;
	}, [activeItemIds]);

	useEffect(() => {
		if (aiAssistantOpen) {
			dispatch(
				switchSidebarPanel({
					hidden: false,
					itemConfigurationOpen: true,
				})
			);
		}
	}, [aiAssistantOpen, dispatch]);

	useEffect(() => {
		const contentChangedHandler = Liferay.on(
			CONTENT_CHANGED_EVENT,
			({data}: {data?: string}) => {
				const page = getPage(data);

				if (
					page &&
					page.externalReferenceCode !==
						config.layoutExternalReferenceCode
				) {
					return;
				}

				dispatch(updateLayoutData());
			}
		);

		return () => {
			contentChangedHandler.detach();
		};
	}, [dispatch]);

	return (
		<AIAssistantTriggerButton
			chatbotExternalReferenceCode={EDIT_PAGE_CHATBOT_ERC}
			containerId={AI_ASSISTANT_CONTAINER_ID}
			context={{
				layoutExternalReferenceCode: config.layoutExternalReferenceCode,
				layoutType: config.layoutType,
				siteExternalReferenceCode: config.siteExternalReferenceCode,
			}}
			expanded
			getContext={() => ({
				segmentsExperienceId: selectSegmentsExperienceId(getState()),
				selectedItemIds: activeItemIdsRef.current,
			})}
			greeting={Liferay.Language.get('hi-i-can-help-you-edit-this-page')}
			hideLabel
			instructionDefinitionScope=""
			presentation="dropdown"
			size="sm"
			triggerId={AI_ASSISTANT_TRIGGER_ID}
		/>
	);
}
