<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/dynamic_include/init.jsp" %>

<%
Group scopeGroup = themeDisplay.getScopeGroup();
%>

<li class="control-menu-nav-item">
	<react:component
		module="{LayoutAIAssistantTriggerButton} from layout-admin-web"
		props='<%=
			HashMapBuilder.<String, Object>put(
				"portletNamespace", portletDisplay.getNamespace()
			).put(
				"siteExternalReferenceCode", scopeGroup.getExternalReferenceCode()
			).build()
		%>'
	/>
</li>