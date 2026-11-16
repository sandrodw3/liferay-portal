/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	AIAssistantTriggerButton,
	CONTENT_CHANGED_EVENT,
} from '@liferay/ai-hub-cell-js-components-web';
import React, {useEffect} from 'react';

import {
	CHATBOT_ERCS,
	GENERATE_TEMPLATE_TRIGGER_ID,
	TemplateType,
	getGreeting,
} from './aiAssistant';

const TABS: Record<string, TemplateType> = {
	'display-page-templates': 'display-page-template',
	'master-layouts': 'master',
	'page-templates': 'page-template',
};

function getTemplate(
	data: string | undefined
): {siteExternalReferenceCode?: string} | null {
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

type Props = {
	portletNamespace: string;
	siteExternalReferenceCode: string;
	tabs1: string;
};

export default function LayoutPageTemplateAIAssistantTriggerButton({
	portletNamespace,
	siteExternalReferenceCode,
	tabs1,
}: Props) {
	useEffect(() => {
		const contentChangedHandler = Liferay.on(
			CONTENT_CHANGED_EVENT,
			({data}: {data?: string}) => {
				const template = getTemplate(data);

				if (
					template &&
					template.siteExternalReferenceCode !==
						siteExternalReferenceCode
				) {
					return;
				}

				Liferay.Portlet.refresh(`#p_p_id${portletNamespace}`);
			}
		);

		return () => {
			contentChangedHandler.detach();
		};
	}, [portletNamespace, siteExternalReferenceCode]);

	const type = TABS[tabs1];

	if (!type) {
		return null;
	}

	return (
		<AIAssistantTriggerButton
			chatbotExternalReferenceCode={CHATBOT_ERCS[type]}
			context={{siteExternalReferenceCode}}
			expanded
			greeting={getGreeting(type)}
			hideLabel
			instructionDefinitionScope=""
			presentation="dropdown"
			pushContainer="#main-content"
			triggerId={GENERATE_TEMPLATE_TRIGGER_ID}
		/>
	);
}
