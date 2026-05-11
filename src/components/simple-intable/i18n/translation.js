// src/components/i18n/translation.js
import { useCallback, useEffect, useState } from "react";
import { TableI18nKey } from "./i18nKey.js";
import { dictionaries } from "./languages.js";

// Browser environment safety detection
function getBrowserLanguage() {
	if (typeof window === "undefined") return "en";
	const lang = navigator.language || navigator.userLanguage;
	if (!lang) return "en";

	// 1. Exact match (e.g., zh-CN -> zh_CN)
	const normalizedLang = lang.replace("-", "_");
	const exactMatch = Object.keys(dictionaries).find(
		(k) => k.toLowerCase() === normalizedLang.toLowerCase(),
	);
	if (exactMatch) return exactMatch;

	// 2. Prefix match (e.g., zh-HK matches zh_CN or zh_TW, es-MX matches es)
	const prefix = lang.split("-")[0];
	const prefixMatch = Object.keys(dictionaries).find((k) =>
		k.startsWith(prefix),
	);
	if (prefixMatch) return prefixMatch;

	return "en";
}

export function useTableTranslation(langProp = "auto") {
	// Defaults to the passed-in language; if "auto", fall back to "en" during SSR to avoid Hydration errors
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

			// Simple template string replacement logic
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
