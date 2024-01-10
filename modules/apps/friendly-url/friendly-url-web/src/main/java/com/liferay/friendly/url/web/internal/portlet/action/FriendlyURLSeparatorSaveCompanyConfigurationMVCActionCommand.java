/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.friendly.url.web.internal.portlet.action;

import com.liferay.configuration.admin.constants.ConfigurationAdminPortletKeys;
import com.liferay.friendly.url.configuration.manager.FriendlyURLSeparatorConfigurationManager;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.LayoutFriendlyURLException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.portlet.FriendlyURLResolver;
import com.liferay.portal.kernel.portlet.FriendlyURLResolverRegistryUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCActionCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCActionCommand;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.service.LayoutFriendlyURLLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.FriendlyURLNormalizer;
import com.liferay.portal.kernel.util.HttpComponentsUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.service.impl.LayoutLocalServiceHelper;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletException;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mikel Lorza
 */
@Component(
	property = {
		"javax.portlet.name=" + ConfigurationAdminPortletKeys.INSTANCE_SETTINGS,
		"mvc.command.name=/instance_settings/friendly_url_separator_save_company_configuration"
	},
	service = MVCActionCommand.class
)
public class FriendlyURLSeparatorSaveCompanyConfigurationMVCActionCommand
	extends BaseMVCActionCommand {

	@Override
	protected void doProcessAction(
			ActionRequest actionRequest, ActionResponse actionResponse)
		throws Exception {

		ThemeDisplay themeDisplay = (ThemeDisplay)actionRequest.getAttribute(
			WebKeys.THEME_DISPLAY);

		PermissionChecker permissionChecker =
			themeDisplay.getPermissionChecker();

		if (!permissionChecker.isCompanyAdmin(themeDisplay.getCompanyId())) {
			PrincipalException principalException =
				new PrincipalException.MustBeCompanyAdmin(
					permissionChecker.getUserId());

			throw new PortletException(principalException);
		}

		JSONArray fieldValidationErrorsJSONArray =
			_jsonFactory.createJSONArray();

		String friendlyURLSeparators = _getFriendlyURLSeparators(
			actionRequest, themeDisplay, fieldValidationErrorsJSONArray);

		if (fieldValidationErrorsJSONArray.length() == 0) {
			_friendlyURLSeparatorConfigurationManager.
				updateFriendlyURLSeparatorCompanyConfiguration(
					themeDisplay.getCompanyId(), friendlyURLSeparators);

			addSuccessMessage(actionRequest, actionResponse);
		}
		else {
			hideDefaultSuccessMessage(actionRequest);
		}

		sendRedirect(
			actionRequest, actionResponse,
			_getRedirect(
				actionRequest, fieldValidationErrorsJSONArray, themeDisplay));
	}

	private String _getFriendlyURLSeparators(
		ActionRequest actionRequest, ThemeDisplay themeDisplay,
		JSONArray fieldValidationErrorsJSONArray) {

		JSONArray jsonArray = _jsonFactory.createJSONArray();

		List<String> urlSeparators = new ArrayList<>();

		for (FriendlyURLResolver friendlyURLResolver :
				FriendlyURLResolverRegistryUtil.
					getFriendlyURLResolversAsCollection()) {

			if (!friendlyURLResolver.isURLSeparatorConfigurable()) {
				continue;
			}

			jsonArray.put(
				() -> {
					String urlSeparator = ParamUtil.getString(
						actionRequest, friendlyURLResolver.getKey());

					if (Validator.isNull(urlSeparator)) {
						fieldValidationErrorsJSONArray.put(
							JSONUtil.put(
								friendlyURLResolver.getKey(),
								_language.get(
									themeDisplay.getLocale(),
									"friendly-url-separator-error-can-not-be-" +
										"empty")));

						return null;
					}

					urlSeparator =
						_friendlyURLNormalizer.normalizeWithPeriodsAndSlashes(
							urlSeparator);

					if (!urlSeparator.startsWith(StringPool.SLASH)) {
						urlSeparator = StringPool.SLASH + urlSeparator;
					}

					if (!urlSeparator.endsWith(StringPool.SLASH)) {
						urlSeparator = urlSeparator + StringPool.SLASH;
					}

					if (urlSeparators.contains(urlSeparator)) {
						fieldValidationErrorsJSONArray.put(
							JSONUtil.put(
								friendlyURLResolver.getKey(),
								_language.get(
									themeDisplay.getLocale(),
									"friendly-url-separator-error-other-" +
										"asset-type-may-use-this-prefix")));

						return null;
					}

					urlSeparators.add(urlSeparator);

					_validateURLSeparator(
						themeDisplay.getCompanyId(),
						friendlyURLResolver.getKey(), themeDisplay.getLocale(),
						urlSeparator, fieldValidationErrorsJSONArray);

					if (fieldValidationErrorsJSONArray.length() > 0) {
						return null;
					}

					return JSONUtil.put(
						"key", friendlyURLResolver.getKey()
					).put(
						"urlSeparator", urlSeparator
					);
				});
		}

		return jsonArray.toString();
	}

	private String _getRedirect(
		ActionRequest actionRequest, JSONArray fieldValidationErrorsJSONArray,
		ThemeDisplay themeDisplay) {

		String redirect = ParamUtil.getString(actionRequest, "redirect");

		if (Validator.isNull(redirect)) {
			return redirect;
		}

		String namespace = _portal.getPortletNamespace(themeDisplay.getPpid());

		redirect = HttpComponentsUtil.removeParameter(
			redirect, namespace + "errors");

		boolean validSeparators = false;

		if (fieldValidationErrorsJSONArray.length() == 0) {
			validSeparators = true;
		}

		if (!validSeparators) {
			redirect = HttpComponentsUtil.addParameter(
				redirect, namespace + "errors",
				JSONUtil.put(
					"errorMessage",
					_language.get(
						themeDisplay.getLocale(),
						"friendly-url-separator-error-changes-could-not-be-" +
							"save-due-to-some-errors")
				).put(
					"fields", fieldValidationErrorsJSONArray
				).toString());
		}

		for (FriendlyURLResolver friendlyURLResolver :
				FriendlyURLResolverRegistryUtil.
					getFriendlyURLResolversAsCollection()) {

			if (!friendlyURLResolver.isURLSeparatorConfigurable()) {
				continue;
			}

			redirect = HttpComponentsUtil.removeParameter(
				redirect, namespace + friendlyURLResolver.getKey());

			if (!validSeparators) {
				redirect = HttpComponentsUtil.addParameter(
					redirect, namespace + friendlyURLResolver.getKey(),
					ParamUtil.getString(
						actionRequest, friendlyURLResolver.getKey()));
			}
		}

		return redirect;
	}

	private void _validateURLSeparator(
		long companyId, String key, Locale locale, String urlSeparator,
		JSONArray validationErrorsJSONArray) {

		if (urlSeparator.length() < 3) {
			validationErrorsJSONArray.put(
				JSONUtil.put(
					key,
					_language.get(
						locale, "friendly-url-separator-error-too-short")));

			return;
		}

		if (urlSeparator.length() > 255) {
			validationErrorsJSONArray.put(
				JSONUtil.put(
					key,
					_language.get(
						locale, "friendly-url-separator-error-too-long")));

			return;
		}

		String friendlyURL = urlSeparator.substring(
			0, urlSeparator.length() - 1);

		try {
			_layoutLocalServiceHelper.validateFriendlyURLKeyword(friendlyURL);
		}
		catch (LayoutFriendlyURLException layoutFriendlyURLException) {
			FriendlyURLResolver friendlyURLResolver =
				FriendlyURLResolverRegistryUtil.getFriendlyURLResolver(
					layoutFriendlyURLException.getKeywordConflict() +
						StringPool.SLASH);

			if ((friendlyURLResolver == null) ||
				!Objects.equals(friendlyURLResolver.getKey(), key)) {

				validationErrorsJSONArray.put(
					JSONUtil.put(
						key,
						_language.get(
							locale,
							"friendly-url-separator-error-other-asset-type-" +
								"may-use-this-prefix")));
			}
		}

		int layoutFriendlyURLCountContainsURLSeparator =
			_layoutFriendlyURLLocalService.getLayoutFriendlyURLsCount(
				companyId, urlSeparator, false);

		int layoutFriendlyURLCountExactMatch =
			_layoutFriendlyURLLocalService.getLayoutFriendlyURLsCount(
				companyId, friendlyURL, true);

		if ((layoutFriendlyURLCountContainsURLSeparator > 0) ||
			(layoutFriendlyURLCountExactMatch > 0)) {

			validationErrorsJSONArray.put(
				JSONUtil.put(
					key,
					_language.get(
						locale,
						"friendly-url-separator-error-other-asset-type-may-" +
							"use-this-prefix")));
		}
	}

	@Reference
	private FriendlyURLNormalizer _friendlyURLNormalizer;

	@Reference
	private FriendlyURLSeparatorConfigurationManager
		_friendlyURLSeparatorConfigurationManager;

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private Language _language;

	@Reference
	private LayoutFriendlyURLLocalService _layoutFriendlyURLLocalService;

	@Reference
	private LayoutLocalServiceHelper _layoutLocalServiceHelper;

	@Reference
	private Portal _portal;

}