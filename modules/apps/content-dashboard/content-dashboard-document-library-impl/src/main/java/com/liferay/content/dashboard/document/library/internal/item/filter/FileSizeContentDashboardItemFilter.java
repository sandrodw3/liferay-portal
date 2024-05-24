/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.content.dashboard.document.library.internal.item.filter;

import com.liferay.content.dashboard.item.filter.ContentDashboardItemFilter;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItem;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItemBuilder;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItemListBuilder;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.search.filter.BooleanFilter;
import com.liferay.portal.kernel.search.filter.Filter;
import com.liferay.portal.kernel.util.HttpComponentsUtil;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.TextFormatter;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import javax.portlet.PortletResponse;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Cristina González
 */
public class FileSizeContentDashboardItemFilter
	implements ContentDashboardItemFilter {

	public FileSizeContentDashboardItemFilter(
		HttpServletRequest httpServletRequest, Language language,
		Portal portal) {

		_httpServletRequest = httpServletRequest;
		_language = language;
		_portal = portal;
	}

	@Override
	public DropdownItem getDropdownItem() {
		return DropdownItemBuilder.setDropdownItems(
			DropdownItemListBuilder.add(
				dropdownItem -> {
					dropdownItem.setActive(_isSelected("small"));
					dropdownItem.setHref(_getURL("small"));
					dropdownItem.setLabel(_getLabel("small"));
				}
			).add(
				dropdownItem -> {
					dropdownItem.setActive(_isSelected("medium"));
					dropdownItem.setHref(_getURL("medium"));
					dropdownItem.setLabel(_getLabel("medium"));
				}
			).add(
				dropdownItem -> {
					dropdownItem.setActive(_isSelected("large"));
					dropdownItem.setHref(_getURL("large"));
					dropdownItem.setLabel(_getLabel("large"));
				}
			).build()
		).setLabel(
			_language.get(_httpServletRequest, "size")
		).setType(
			"contextual"
		).build();
	}

	@Override
	public Filter getFilter() {
		List<String> parameterValues = getParameterValues();

		if (ListUtil.isEmpty(parameterValues)) {
			return null;
		}

		String type = parameterValues.get(0);

		BooleanFilter booleanFilter = new BooleanFilter();

		if (Objects.equals(type, "small")) {
			booleanFilter.addRangeTerm("size_sortable", 0, _SMALL_SIZE);
		}
		else if (Objects.equals(type, "medium")) {
			booleanFilter.addRangeTerm(
				"size_sortable", _SMALL_SIZE + 1, _MID_SIZE);
		}
		else if (Objects.equals(type, "large")) {
			booleanFilter.addRangeTerm(
				"size_sortable", _MID_SIZE + 1, Long.MAX_VALUE);
		}

		return booleanFilter;
	}

	@Override
	public String getIcon() {
		return null;
	}

	@Override
	public String getLabel(Locale locale) {
		return _language.get(locale, "filter-by-size");
	}

	@Override
	public String getName() {
		return "file-size";
	}

	@Override
	public String getParameterLabel(Locale locale) {
		return _language.get(locale, "size");
	}

	@Override
	public String getParameterName() {
		return "fileSize";
	}

	@Override
	public List<String> getParameterValues() {
		return Arrays.asList(
			ParamUtil.getStringValues(_httpServletRequest, getParameterName()));
	}

	@Override
	public Type getType() {
		return Type.SUBMENU;
	}

	@Override
	public String getURL() {
		return null;
	}

	private String _getLabel(String sizeType) {
		if (Objects.equals(sizeType, "small")) {
			return StringBundler.concat(
				_language.get(_httpServletRequest, sizeType), StringPool.BLANK,
				StringPool.OPEN_PARENTHESIS, StringPool.LESS_THAN_OR_EQUAL,
				TextFormatter.formatStorageSize(
					_SMALL_SIZE, _httpServletRequest.getLocale()),
				StringPool.CLOSE_PARENTHESIS);
		}

		if (Objects.equals(sizeType, "medium")) {
			return StringBundler.concat(
				_language.get(_httpServletRequest, sizeType), StringPool.BLANK,
				StringPool.OPEN_PARENTHESIS,
				TextFormatter.formatStorageSize(
					_SMALL_SIZE, _httpServletRequest.getLocale()),
				StringPool.LESS_THAN_OR_EQUAL,
				TextFormatter.formatStorageSize(
					_MID_SIZE, _httpServletRequest.getLocale()),
				StringPool.CLOSE_PARENTHESIS);
		}

		return StringBundler.concat(
			_language.get(_httpServletRequest, sizeType), StringPool.BLANK,
			StringPool.OPEN_PARENTHESIS, StringPool.GREATER_THAN,
			TextFormatter.formatStorageSize(
				_MID_SIZE, _httpServletRequest.getLocale()),
			StringPool.CLOSE_PARENTHESIS);
	}

	private String _getURL(String type) {
		PortletResponse portletResponse =
			(PortletResponse)_httpServletRequest.getAttribute(
				JavaConstants.JAVAX_PORTLET_RESPONSE);

		String url = HttpComponentsUtil.removeParameter(
			_portal.getCurrentCompleteURL(_httpServletRequest),
			portletResponse.getNamespace() + getParameterName());

		return HttpComponentsUtil.addParameter(
			url, portletResponse.getNamespace() + getParameterName(), type);
	}

	private boolean _isSelected(String type) {
		List<String> parameterValues = getParameterValues();

		if (ListUtil.isEmpty(parameterValues)) {
			return false;
		}

		return Objects.equals(parameterValues.get(0), type);
	}

	private static final long _MID_SIZE = 1024 * 1024;

	private static final long _SMALL_SIZE = 150 * 1024;

	private final HttpServletRequest _httpServletRequest;
	private final Language _language;
	private final Portal _portal;

}