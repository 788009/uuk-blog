import { getEntry } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { siteConfig } from "../config";

export interface BreadcrumbItem {
	label: string;
	url: string;
}

export async function getBreadcrumbs(
	pathname: string,
): Promise<BreadcrumbItem[]> {
	if (!siteConfig.breadcrumb) return [];
	const config = siteConfig.breadcrumb;

	const cleanPath = pathname.split("?")[0];
	const normalizedPath = cleanPath.replace(/\/+/g, "/").replace(/\/$/, "");
	const segments = normalizedPath.split("/").filter(Boolean);
	const breadcrumbs: BreadcrumbItem[] = [];

	// 1. Handle root node (visible unless showHome is explicitly false)
	if (config.showHome !== false) {
		const rootLabel = config.mapping?.["/"] || i18n(I18nKey.home);
		breadcrumbs.push({
			label: rootLabel,
			url: "/",
		});
	}

	// 2. Handle subsequent levels
	let currentUrl = "/";
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		currentUrl += `${segment}/`;

		// Priority 1: Custom mapping
		if (config.mapping?.[currentUrl]) {
			breadcrumbs.push({ label: config.mapping[currentUrl], url: currentUrl });
			continue;
		}

		let foundTitle: string | undefined;

		// Priority 2: Collection Entry Title (Dynamic fetch)
		if (i > 0) {
			//biome-ignore lint/suspicious/noExplicitAny: reason
			const collectionName = segments[0] as any;
			const slug = segments.slice(1, i + 1).join("/");
			try {
				const entry = await getEntry(collectionName, slug);
				if (entry?.data && "title" in entry.data) {
					//biome-ignore lint/suspicious/noExplicitAny: reason
					foundTitle = (entry.data as any).title;
				}
			} catch (_e) {}
		}

		// Priority 3: Fallback route name
		const fallbackLabel =
			foundTitle ||
			segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

		breadcrumbs.push({
			label: fallbackLabel,
			url: currentUrl,
		});
	}

	return breadcrumbs;
}
