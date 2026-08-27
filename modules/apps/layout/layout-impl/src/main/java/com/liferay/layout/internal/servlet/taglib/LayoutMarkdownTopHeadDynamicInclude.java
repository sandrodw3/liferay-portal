/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.internal.servlet.taglib;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.servlet.taglib.BaseDynamicInclude;
import com.liferay.portal.kernel.servlet.taglib.DynamicInclude;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * Advertises the Markdown representation of a content page, so that an agent
 * that already fetched the HTML can find it. This is the same mechanism used to
 * declare a canonical URL or an alternate language.
 *
 * @author Sandro Chinea
 */
@Component(service = DynamicInclude.class)
public class LayoutMarkdownTopHeadDynamicInclude extends BaseDynamicInclude {

	@Override
	public void include(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse, String dynamicIncludeKey)
		throws IOException {

		ThemeDisplay themeDisplay =
			(ThemeDisplay)httpServletRequest.getAttribute(
				WebKeys.THEME_DISPLAY);

		if (themeDisplay == null) {
			return;
		}

		Layout layout = themeDisplay.getLayout();

		if ((layout == null) || !layout.isTypeContent()) {
			return;
		}

		String markdownURL = _getMarkdownURL(layout, themeDisplay);

		if (Validator.isNull(markdownURL)) {
			return;
		}

		PrintWriter printWriter = httpServletResponse.getWriter();

		printWriter.print("<link href=\"");
		printWriter.print(markdownURL);
		printWriter.println("\" rel=\"alternate\" type=\"text/markdown\" />");
	}

	@Override
	public void register(DynamicIncludeRegistry dynamicIncludeRegistry) {
		dynamicIncludeRegistry.register(
			"/html/common/themes/top_head.jsp#post");
	}

	private String _getMarkdownURL(Layout layout, ThemeDisplay themeDisplay) {
		try {
			String layoutRelativeURL = _portal.getLayoutRelativeURL(
				layout, themeDisplay);

			if (Validator.isNull(layoutRelativeURL)) {
				return null;
			}

			return themeDisplay.getPortalURL() + layoutRelativeURL + ".md";
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					"Unable to get the Markdown URL for PLID " +
						layout.getPlid(),
					exception);
			}

			return null;
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		LayoutMarkdownTopHeadDynamicInclude.class);

	@Reference
	private Portal _portal;

}