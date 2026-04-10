// src/components/i18n/translation.js
import { useCallback, useEffect, useState } from "react";
import { TableI18nKey } from "./i18nKey.js";
import { dictionaries } from "./languages.js";

// 浏览器环境安全探测
function getBrowserLanguage() {
	if (typeof window === "undefined") return "en";
	const lang = navigator.language || navigator.userLanguage;
	if (!lang) return "en";

	// 1. 精确匹配 (例如 zh-CN -> zh_CN)
	const normalizedLang = lang.replace("-", "_");
	const exactMatch = Object.keys(dictionaries).find(
		(k) => k.toLowerCase() === normalizedLang.toLowerCase(),
	);
	if (exactMatch) return exactMatch;

	// 2. 前缀匹配 (例如 zh-HK 匹配到 zh_CN 或 zh_TW，es-MX 匹配到 es)
	const prefix = lang.split("-")[0];
	const prefixMatch = Object.keys(dictionaries).find((k) =>
		k.startsWith(prefix),
	);
	if (prefixMatch) return prefixMatch;

	return "en";
}

export function useTableTranslation(langProp = "auto") {
	// 默认使用传入的语言，若为 auto 则在 SSR 阶段先回退到 en 避免 Hydration 报错
	const [activeLang, setActiveLang] = useState(() =>
		langProp === "auto" ? "en" : dictionaries[langProp] ? langProp : "en",
	);

	useEffect(() => {
		if (langProp === "auto") {
			setActiveLang(getBrowserLanguage());
		} else {
			setActiveLang(dictionaries[langProp] ? langProp : "en");
		}
	}, [langProp]);

	const t = useCallback(
		(key, params = {}) => {
			const dict = dictionaries[activeLang] || dictionaries.en;
			let str = dict[key] || dictionaries.en[key] || key;

			// 简单的模板字符串替换逻辑
			Object.keys(params).forEach((p) => {
				str = str.replace(`{${p}}`, params[p]);
			});
			return str;
		},
		[activeLang],
	);

	return { t, activeLang };
}

export { TableI18nKey };
