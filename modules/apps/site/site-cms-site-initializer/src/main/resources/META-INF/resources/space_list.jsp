<%--
/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
SpaceListDisplayContext spaceListDisplayContext = (SpaceListDisplayContext)request.getAttribute(SpaceListDisplayContext.class.getName());
%>

<div class="align-items-center d-flex space-list-fragment">
	<div class="space-list-title">
		<clay:icon
			className="text-secondary"
			symbol="box-container"
		/>

		<span class="mx-2 space-list-title-text text-black text-weight-semi-bold"><liferay-ui:message key="space" /></span>
	</div>

	<div class="mx-4 space-list-name">
		<react:component
			module="{SpaceSticker} from site-cms-site-initializer"
			props="<%= spaceListDisplayContext.getReactData() %>"
		/>
	</div>
</div>