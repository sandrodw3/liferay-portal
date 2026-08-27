/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.internal.servlet.filter;

import com.liferay.layout.internal.markdown.LayoutMarkdownRenderer;
import com.liferay.layout.util.LayoutServiceContextHelper;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.LayoutConstants;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.service.permission.LayoutPermission;
import com.liferay.portal.kernel.servlet.BaseFilter;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * Serves the Markdown representation of a content page at
 * <code>&lt;friendly-url&gt;.md</code>. The format is decided by the requested
 * URL, never by the user agent, and the page is always rendered as the guest
 * user so that the response is safe to cache.
 *
 * @author Sandro Chinea
 */
@Component(
	property = {
		"dispatcher=FORWARD", "dispatcher=REQUEST", "servlet-context-name=",
		"servlet-filter-name=Layout Markdown Filter", "url-pattern=/*"
	},
	service = Filter.class
)
public class LayoutMarkdownFilter extends BaseFilter {

	@Override
	public boolean isFilterEnabled(
		HttpServletRequest httpServletRequest,
		HttpServletResponse httpServletResponse) {

		String requestURI = httpServletRequest.getRequestURI();

		if (Validator.isNull(requestURI) ||
			!requestURI.endsWith(_MARKDOWN_EXTENSION)) {

			return false;
		}

		return true;
	}

	@Override
	protected Log getLog() {
		return _log;
	}

	@Override
	protected void processFilter(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse, FilterChain filterChain)
		throws Exception {

		Layout layout = _fetchLayout(httpServletRequest);

		if (layout == null) {
			processFilter(
				LayoutMarkdownFilter.class.getName(), httpServletRequest,
				httpServletResponse, filterChain);

			return;
		}

		User guestUser = _userLocalService.getGuestUser(layout.getCompanyId());

		try (AutoCloseable autoCloseable =
				_layoutServiceContextHelper.getServiceContextAutoCloseable(
					layout, guestUser)) {

			if (!_layoutPermission.contains(
					PermissionThreadLocal.getPermissionChecker(), layout,
					ActionKeys.VIEW)) {

				httpServletResponse.sendError(HttpServletResponse.SC_NOT_FOUND);

				return;
			}

			ServiceContext serviceContext =
				ServiceContextThreadLocal.getServiceContext();

			ThemeDisplay themeDisplay = serviceContext.getThemeDisplay();

			String markdown = _layoutMarkdownRenderer.render(
				themeDisplay.getRequest(), themeDisplay.getResponse(), layout,
				themeDisplay.getLocale(), _getCanonicalURL(httpServletRequest));

			_write(httpServletResponse, markdown);
		}
	}

	private Layout _fetchLayout(HttpServletRequest httpServletRequest) {
		String friendlyURL = _getFriendlyURL(httpServletRequest);

		if (Validator.isNull(friendlyURL)) {
			return null;
		}

		long plid = _portal.getPlidFromFriendlyURL(
			CompanyThreadLocal.getCompanyId(), friendlyURL);

		if (plid == LayoutConstants.DEFAULT_PLID) {
			return null;
		}

		Layout layout = _layoutLocalService.fetchLayout(plid);

		if ((layout == null) || !layout.isTypeContent() ||
			!layout.isPublished()) {

			return null;
		}

		return layout;
	}

	private String _getCanonicalURL(HttpServletRequest httpServletRequest) {
		String requestURL = String.valueOf(httpServletRequest.getRequestURL());

		return StringUtil.removeSubstring(requestURL, _MARKDOWN_EXTENSION);
	}

	private String _getFriendlyURL(HttpServletRequest httpServletRequest) {
		String requestURI = httpServletRequest.getRequestURI();

		String pathContext = _portal.getPathContext();

		if (Validator.isNotNull(pathContext) &&
			requestURI.startsWith(pathContext)) {

			requestURI = requestURI.substring(pathContext.length());
		}

		return requestURI.substring(
			0, requestURI.length() - _MARKDOWN_EXTENSION.length());
	}

	private void _write(
			HttpServletResponse httpServletResponse, String markdown)
		throws IOException {

		httpServletResponse.setContentType("text/markdown; charset=UTF-8");

		httpServletResponse.setHeader(
			"x-markdown-tokens", String.valueOf(markdown.length() / 4));

		PrintWriter printWriter = httpServletResponse.getWriter();

		printWriter.write(markdown);

		printWriter.flush();
	}

	private static final String _MARKDOWN_EXTENSION = ".md";

	private static final Log _log = LogFactoryUtil.getLog(
		LayoutMarkdownFilter.class);

	@Reference
	private LayoutLocalService _layoutLocalService;

	@Reference
	private LayoutMarkdownRenderer _layoutMarkdownRenderer;

	@Reference
	private LayoutPermission _layoutPermission;

	@Reference
	private LayoutServiceContextHelper _layoutServiceContextHelper;

	@Reference
	private Portal _portal;

	@Reference
	private UserLocalService _userLocalService;

}