/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.content.page.editor.web.internal.portlet.action;

import com.liferay.layout.content.page.editor.constants.ContentPageEditorPortletKeys;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.LayoutTypePortlet;
import com.liferay.portal.kernel.model.Portlet;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.PortletIdCodec;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.WebKeys;

import java.io.IOException;

import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Jürgen Kappler
 */
@Component(
	property = {
		"javax.portlet.name=" + ContentPageEditorPortletKeys.CONTENT_PAGE_EDITOR_PORTLET,
		"mvc.command.name=/layout_content_page_editor/get_master_layout_noninstanciable_portlets"
	},
	service = MVCResourceCommand.class
)
public class GetMasterLayoutNoninstanciablePortletsMVCResourceCommand
	extends BaseMVCResourceCommand {

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws IOException {

		long masterLayoutPlid = ParamUtil.getLong(
			resourceRequest, "masterLayoutPlid");

		try {
			JSONPortletResponseUtil.writeJSON(
				resourceRequest, resourceResponse,
				_getMasterLayoutNoninstanciablePortletsJSONArray(
					masterLayoutPlid));
		}
		catch (Exception exception) {
			_log.error("Unable to get portlets", exception);

			ThemeDisplay themeDisplay =
				(ThemeDisplay)resourceRequest.getAttribute(
					WebKeys.THEME_DISPLAY);

			JSONPortletResponseUtil.writeJSON(
				resourceRequest, resourceResponse,
				JSONUtil.put(
					"error",
					_language.get(
						themeDisplay.getRequest(),
						"an-unexpected-error-occurred")));
		}
	}

	private JSONArray _getMasterLayoutNoninstanciablePortletsJSONArray(
		long masterLayoutPlid) {

		JSONArray jsonArray = _jsonFactory.createJSONArray();

		Layout masterLayout = _layoutLocalService.fetchLayout(masterLayoutPlid);

		if (masterLayout == null) {
			return jsonArray;
		}

		LayoutTypePortlet masterLayoutTypePortlet =
			(LayoutTypePortlet)masterLayout.getLayoutType();

		for (Portlet layoutPortlet : masterLayoutTypePortlet.getPortlets()) {
			if (!layoutPortlet.isInstanceable()) {
				String decodedPortletName = PortletIdCodec.decodePortletName(
					layoutPortlet.getPortletId());

				jsonArray.put(decodedPortletName);
			}
		}

		return jsonArray;
	}

	private static final Log _log = LogFactoryUtil.getLog(
		GetMasterLayoutNoninstanciablePortletsMVCResourceCommand.class);

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private Language _language;

	@Reference
	private LayoutLocalService _layoutLocalService;

}