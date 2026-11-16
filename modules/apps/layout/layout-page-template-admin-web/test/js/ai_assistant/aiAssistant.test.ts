/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {AIAssistant} from '@liferay/ai-hub-cell-js-components-web';

import {generateWithAI} from '../../../src/main/resources/META-INF/resources/js/ai_assistant/aiAssistant';

jest.mock('@liferay/ai-hub-cell-js-components-web', () => ({
	AIAssistant: {open: jest.fn()},
}));

describe('generateWithAI', () => {
	beforeEach(() => {
		(AIAssistant.open as jest.Mock).mockClear();
	});

	it('opens the chatbot of the template type with its destination', () => {
		generateWithAI({
			action: 'generateWithAI',
			displayPageTemplateFolderExternalReferenceCode: 'folder-erc',
			siteExternalReferenceCode: 'site-erc',
			type: 'display-page-template',
		});

		expect(AIAssistant.open).toHaveBeenCalledWith(
			expect.objectContaining({
				chatbotExternalReferenceCode:
					'L_GENERATE_DISPLAY_PAGE_TEMPLATE_CHATBOT',
				context: {
					displayPageTemplateFolderExternalReferenceCode:
						'folder-erc',
					siteExternalReferenceCode: 'site-erc',
				},
				initialMessage: 'generate-display-page-template',
			})
		);
	});

	it('opens the master chatbot for masters', () => {
		generateWithAI({
			action: 'generateWithAI',
			siteExternalReferenceCode: 'site-erc',
			type: 'master',
		});

		expect(AIAssistant.open).toHaveBeenCalledWith(
			expect.objectContaining({
				chatbotExternalReferenceCode: 'L_GENERATE_MASTER_CHATBOT',
				context: {siteExternalReferenceCode: 'site-erc'},
			})
		);
	});
});
