/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.internal.markdown;

import com.liferay.fragment.constants.FragmentEntryLinkConstants;
import com.liferay.fragment.model.FragmentEntryLink;
import com.liferay.fragment.renderer.DefaultFragmentRendererContext;
import com.liferay.fragment.renderer.FragmentRendererController;
import com.liferay.fragment.service.FragmentEntryLinkLocalService;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructure;
import com.liferay.layout.page.template.service.LayoutPageTemplateStructureLocalService;
import com.liferay.layout.util.structure.FragmentStyledLayoutStructureItem;
import com.liferay.layout.util.structure.LayoutStructure;
import com.liferay.layout.util.structure.LayoutStructureItem;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.RenderLayoutContentThreadLocal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.segments.service.SegmentsExperienceLocalService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Sandro Chinea
 */
@Component(service = LayoutMarkdownRenderer.class)
public class LayoutMarkdownRenderer {

	public String render(
		HttpServletRequest httpServletRequest,
		HttpServletResponse httpServletResponse, Layout layout, Locale locale,
		String canonicalURL) {

		LayoutPageTemplateStructure layoutPageTemplateStructure =
			_layoutPageTemplateStructureLocalService.
				fetchLayoutPageTemplateStructure(
					layout.getGroupId(), layout.getPlid());

		if (layoutPageTemplateStructure == null) {
			return StringPool.BLANK;
		}

		long segmentsExperienceId =
			_segmentsExperienceLocalService.fetchDefaultSegmentsExperienceId(
				layout.getPlid());

		String data = layoutPageTemplateStructure.getData(segmentsExperienceId);

		if (Validator.isNull(data)) {
			return StringPool.BLANK;
		}

		StringBundler sb = new StringBundler();

		_appendFrontMatter(sb, layout, locale, canonicalURL);

		boolean renderLayoutContent =
			RenderLayoutContentThreadLocal.isRenderLayoutContent();

		try {
			RenderLayoutContentThreadLocal.setRenderLayoutContent(true);

			LayoutStructure layoutStructure = LayoutStructure.of(data);

			_appendLayoutStructureItem(
				sb, httpServletRequest, httpServletResponse, layoutStructure,
				layoutStructure.getMainItemId(), locale);
		}
		finally {
			RenderLayoutContentThreadLocal.setRenderLayoutContent(
				renderLayoutContent);
		}

		return sb.toString();
	}

	private void _appendFrontMatter(
		StringBundler sb, Layout layout, Locale locale, String canonicalURL) {

		sb.append("---\ntitle: ");
		sb.append(layout.getName(locale));

		String description = layout.getDescription(locale);

		if (Validator.isNotNull(description)) {
			sb.append("\ndescription: ");
			sb.append(description);
		}

		sb.append("\nurl: ");
		sb.append(canonicalURL);
		sb.append("\nlocale: ");
		sb.append(LocaleUtil.toW3cLanguageId(locale));
		sb.append("\n---\n");
	}

	private void _appendLayoutStructureItem(
		StringBundler sb, HttpServletRequest httpServletRequest,
		HttpServletResponse httpServletResponse,
		LayoutStructure layoutStructure, String itemId, Locale locale) {

		LayoutStructureItem layoutStructureItem =
			layoutStructure.getLayoutStructureItem(itemId);

		if (layoutStructureItem == null) {
			return;
		}

		if (layoutStructureItem instanceof FragmentStyledLayoutStructureItem) {
			String markdown = _renderFragment(
				httpServletRequest, httpServletResponse,
				(FragmentStyledLayoutStructureItem)layoutStructureItem, locale);

			if (Validator.isNotNull(markdown)) {
				sb.append("\n");
				sb.append(markdown);
				sb.append("\n");
			}
		}

		for (String childItemId : layoutStructureItem.getChildrenItemIds()) {
			_appendLayoutStructureItem(
				sb, httpServletRequest, httpServletResponse, layoutStructure,
				childItemId, locale);
		}
	}

	private String _renderFragment(
		HttpServletRequest httpServletRequest,
		HttpServletResponse httpServletResponse,
		FragmentStyledLayoutStructureItem fragmentStyledLayoutStructureItem,
		Locale locale) {

		FragmentEntryLink fragmentEntryLink =
			_fragmentEntryLinkLocalService.fetchFragmentEntryLink(
				fragmentStyledLayoutStructureItem.getFragmentEntryLinkId());

		if (fragmentEntryLink == null) {
			return StringPool.BLANK;
		}

		DefaultFragmentRendererContext defaultFragmentRendererContext =
			new DefaultFragmentRendererContext(fragmentEntryLink);

		defaultFragmentRendererContext.setLocale(locale);
		defaultFragmentRendererContext.setMode(
			FragmentEntryLinkConstants.INDEX);

		try {
			HtmlToMarkdownConverter htmlToMarkdownConverter =
				new HtmlToMarkdownConverter();

			return htmlToMarkdownConverter.convert(
				_fragmentRendererController.render(
					defaultFragmentRendererContext, httpServletRequest,
					httpServletResponse));
		}
		catch (Exception exception) {
			if (_log.isWarnEnabled()) {
				_log.warn(
					"Unable to render fragment entry link " +
						fragmentEntryLink.getFragmentEntryLinkId(),
					exception);
			}

			return StringPool.BLANK;
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		LayoutMarkdownRenderer.class);

	@Reference
	private FragmentEntryLinkLocalService _fragmentEntryLinkLocalService;

	@Reference
	private FragmentRendererController _fragmentRendererController;

	@Reference
	private LayoutPageTemplateStructureLocalService
		_layoutPageTemplateStructureLocalService;

	@Reference
	private SegmentsExperienceLocalService _segmentsExperienceLocalService;

}