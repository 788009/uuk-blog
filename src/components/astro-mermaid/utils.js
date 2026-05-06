const HTML_ENTITIES = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export function escapeHtml(text) {
	return String(text).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

export function sanitizeJsonForScript(jsonStr) {
	return String(jsonStr).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");
}

export function validateConfig(obj, path = "mermaidConfig") {
	if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return;

	const dangerous = ["__proto__", "constructor", "prototype"];
	for (const key of Object.getOwnPropertyNames(obj)) {
		if (dangerous.includes(key)) {
			throw new Error(`astro-mermaid: "${key}" is not allowed in ${path}`);
		}
		if (typeof obj[key] === "object" && obj[key] !== null) {
			validateConfig(obj[key], `${path}.${key}`);
		}
	}
}

const ALLOWED_TAG_NAMES = new Set([
	"b",
	"i",
	"u",
	"em",
	"strong",
	"br",
	"hr",
	"sub",
	"sup",
	"span",
	"div",
	"code",
	"pre",
	"img",
	"a",
	"p",
	"ul",
	"ol",
	"li",
]);

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img", "input", "meta", "link"]);

export function serializeHastChildren(children) {
	let result = "";
	for (const child of children) {
		if (child.type === "text") {
			result += child.value;
		} else if (child.type === "element") {
			const tagName = child.tagName;

			if (!ALLOWED_TAG_NAMES.has(tagName)) {
				if (child.children?.length > 0)
					result += serializeHastChildren(child.children);
				continue;
			}

			result += `<${tagName}`;

			if (child.properties) {
				for (const [key, value] of Object.entries(child.properties)) {
					if (key !== "className") {
						result += ` ${key}="${escapeHtml(value)}"`;
					} else if (Array.isArray(value)) {
						result += ` class="${escapeHtml(value.join(" "))}"`;
					}
				}
			}

			if (SELF_CLOSING_TAGS.has(tagName)) {
				result += "/>";
			} else {
				result += ">";
				if (child.children?.length > 0)
					result += serializeHastChildren(child.children);
				result += `</${tagName}>`;
			}
		}
	}
	return result;
}
