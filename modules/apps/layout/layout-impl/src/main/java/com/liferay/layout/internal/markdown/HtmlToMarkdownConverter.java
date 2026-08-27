/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.internal.markdown;

import com.liferay.petra.string.CharPool;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.SetUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;

import java.util.List;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;

/**
 * @author Sandro Chinea
 */
public class HtmlToMarkdownConverter {

	public String convert(String html) {
		if (Validator.isNull(html)) {
			return StringPool.BLANK;
		}

		Document document = Jsoup.parseBodyFragment(html);

		StringBundler sb = new StringBundler();

		_appendChildNodes(document.body(), sb);

		return _normalize(sb.toString());
	}

	private void _appendChildNodes(Node node, StringBundler sb) {
		for (Node childNode : node.childNodes()) {
			_appendNode(childNode, sb);
		}
	}

	private void _appendHeading(Element element, StringBundler sb) {
		if (Validator.isNull(element.text())) {
			return;
		}

		String tagName = element.tagName();

		sb.append("\n\n");
		sb.append(_HEADING_PREFIXES[_getLevel(tagName) - 1]);

		_headingDepth++;

		_appendChildNodes(element, sb);

		_headingDepth--;

		sb.append(StringPool.NEW_LINE);
	}

	private void _appendLink(Element element, StringBundler sb) {
		if (Validator.isNull(element.text())) {
			return;
		}

		String href = element.attr("href");

		if (Validator.isNull(href) || href.equals(StringPool.POUND)) {
			_appendChildNodes(element, sb);

			return;
		}

		sb.append(StringPool.OPEN_BRACKET);

		_appendChildNodes(element, sb);

		sb.append("](");
		sb.append(href);
		sb.append(StringPool.CLOSE_PARENTHESIS);
	}

	private void _appendListItem(Element element, StringBundler sb) {
		sb.append(StringPool.NEW_LINE);

		for (int i = 1; i < _listDepth; i++) {
			sb.append("  ");
		}

		sb.append("- ");

		_appendChildNodes(element, sb);
	}

	private void _appendNode(Node node, StringBundler sb) {
		if (node instanceof TextNode) {
			TextNode textNode = (TextNode)node;

			String text = StringUtil.replace(
				textNode.getWholeText(), new char[] {'\n', '\r', '\t'},
				new String[] {
					StringPool.SPACE, StringPool.SPACE, StringPool.SPACE
				});

			if (!Validator.isBlank(text)) {
				sb.append(text);
			}

			return;
		}

		if (!(node instanceof Element)) {
			return;
		}

		Element element = (Element)node;

		String tagName = element.tagName();

		if (_ignoredTagNames.contains(tagName)) {
			return;
		}

		if (_headingTagNames.contains(tagName)) {
			_appendHeading(element, sb);

			return;
		}

		if (tagName.equals("a")) {
			_appendLink(element, sb);

			return;
		}

		if (tagName.equals("blockquote")) {
			sb.append("\n\n> ");

			_appendChildNodes(element, sb);

			sb.append(StringPool.NEW_LINE);

			return;
		}

		if (tagName.equals("br")) {
			sb.append(StringPool.NEW_LINE);

			return;
		}

		if (tagName.equals("code")) {
			sb.append(StringPool.GRAVE_ACCENT);

			_appendChildNodes(element, sb);

			sb.append(StringPool.GRAVE_ACCENT);

			return;
		}

		if (tagName.equals("hr")) {
			sb.append("\n\n---\n");

			return;
		}

		if (tagName.equals("img")) {
			String src = element.attr("src");

			if (Validator.isNull(src) || src.startsWith("data:")) {
				return;
			}

			sb.append("![");
			sb.append(element.attr("alt"));
			sb.append("](");
			sb.append(src);
			sb.append(StringPool.CLOSE_PARENTHESIS);

			return;
		}

		if (tagName.equals("li")) {
			_appendListItem(element, sb);

			return;
		}

		if (tagName.equals("ol") || tagName.equals("ul")) {
			if (_listDepth == 0) {
				sb.append(StringPool.NEW_LINE);
			}

			_listDepth++;

			_appendChildNodes(element, sb);

			_listDepth--;

			if (_listDepth == 0) {
				sb.append(StringPool.NEW_LINE);
			}

			return;
		}

		if (tagName.equals("pre")) {
			sb.append("\n\n```\n");
			sb.append(element.text());
			sb.append("\n```\n");

			return;
		}

		if (tagName.equals("table")) {
			_appendTable(element, sb);

			return;
		}

		if (tagName.equals("b") || tagName.equals("strong")) {
			sb.append("**");

			_appendChildNodes(element, sb);

			sb.append("**");

			return;
		}

		if (tagName.equals("em") || tagName.equals("i")) {
			sb.append(StringPool.UNDERLINE);

			_appendChildNodes(element, sb);

			sb.append(StringPool.UNDERLINE);

			return;
		}

		if (_blockTagNames.contains(tagName)) {
			if (_headingDepth > 0) {
				_appendChildNodes(element, sb);

				return;
			}

			sb.append(StringPool.NEW_LINE);

			_appendChildNodes(element, sb);

			sb.append(StringPool.NEW_LINE);

			return;
		}

		_appendChildNodes(element, sb);
	}

	private void _appendTable(Element element, StringBundler sb) {
		sb.append(StringPool.NEW_LINE);

		boolean firstRow = true;

		for (Element rowElement : element.select("tr")) {
			List<Element> cellElements = rowElement.select("td, th");

			if (cellElements.isEmpty()) {
				continue;
			}

			sb.append(StringPool.NEW_LINE);

			for (Element cellElement : cellElements) {
				sb.append("| ");
				sb.append(
					StringUtil.replace(
						cellElement.text(), CharPool.PIPE, "\\|"));
				sb.append(StringPool.SPACE);
			}

			sb.append(StringPool.PIPE);

			if (firstRow) {
				sb.append(StringPool.NEW_LINE);

				for (int i = 0; i < cellElements.size(); i++) {
					sb.append("| --- ");
				}

				sb.append(StringPool.PIPE);

				firstRow = false;
			}
		}

		sb.append(StringPool.NEW_LINE);
	}

	private int _getLevel(String tagName) {
		return GetterUtil.getInteger(tagName.substring(1), 1);
	}

	private String _normalize(String markdown) {
		markdown = markdown.replaceAll("[ \t\u00a0]+", StringPool.SPACE);
		markdown = markdown.replaceAll(" *\n", StringPool.NEW_LINE);
		markdown = markdown.replaceAll("\n +(?![-*] )", StringPool.NEW_LINE);
		markdown = markdown.replaceAll("\n{3,}", "\n\n");

		return markdown.trim();
	}

	private static final String[] _HEADING_PREFIXES = {
		"# ", "## ", "### ", "#### ", "##### ", "###### "
	};

	private static final Set<String> _blockTagNames = SetUtil.fromArray(
		"address", "article", "aside", "div", "dl", "fieldset", "figcaption",
		"figure", "footer", "header", "main", "nav", "p", "section");
	private static final Set<String> _headingTagNames = SetUtil.fromArray(
		"h1", "h2", "h3", "h4", "h5", "h6");
	private static final Set<String> _ignoredTagNames = SetUtil.fromArray(
		"button", "iframe", "noscript", "script", "style", "svg", "template");

	private int _headingDepth;
	private int _listDepth;

}