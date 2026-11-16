/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {AIAssistant} from '@liferay/ai-hub-cell-js-components-web';

export const GENERATE_TEMPLATE_TRIGGER_ID =
	'layoutPageTemplateAIAssistantTrigger';

export const TEMPLATE_TYPES = [
	'display-page-template',
	'master',
	'page-template',
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const CHATBOT_ERCS: Record<TemplateType, string> = {
	'display-page-template': 'L_GENERATE_DISPLAY_PAGE_TEMPLATE_CHATBOT',
	'master': 'L_GENERATE_MASTER_CHATBOT',
	'page-template': 'L_GENERATE_PAGE_TEMPLATE_CHATBOT',
};

export function getGreeting(type: TemplateType) {
	if (type === 'display-page-template') {
		return Liferay.Language.get(
			'hi-i-can-help-you-generate-display-page-templates'
		);
	}

	if (type === 'master') {
		return Liferay.Language.get('hi-i-can-help-you-generate-masters');
	}

	return Liferay.Language.get('hi-i-can-help-you-generate-page-templates');
}

function getInitialMessage(type: TemplateType) {
	if (type === 'display-page-template') {
		return Liferay.Language.get('generate-display-page-template');
	}

	if (type === 'master') {
		return Liferay.Language.get('generate-master');
	}

	return Liferay.Language.get('generate-page-template');
}

export function generateWithAI({
	action: _action,
	type,
	...context
}: {
	type: TemplateType;
	[key: string]: string;
}) {
	AIAssistant.open({
		anchorId: GENERATE_TEMPLATE_TRIGGER_ID,
		chatbotExternalReferenceCode: CHATBOT_ERCS[type],
		context,
		expanded: true,
		greeting: getGreeting(type),
		initialMessage: getInitialMessage(type),
		instructionDefinitionScope: '',
		presentation: 'dropdown',
		pushContainer: '#main-content',
		triggerId: GENERATE_TEMPLATE_TRIGGER_ID,
	});
}
