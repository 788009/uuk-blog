import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

const IMAGE_EXTENSIONS = new Set([
	".png",
	".jpg",
	".jpeg",
	".webp",
	".avif",
	".svg",
	".gif",
]);

// 复制本地图片到 public 目录并返回新路径
function processImagePath(relativePath, filePath) {
	if (
		!relativePath ||
		relativePath.startsWith("http://") ||
		relativePath.startsWith("https://") ||
		relativePath.startsWith("/")
	) {
		return relativePath;
	}

	const ext = path.extname(relativePath).toLowerCase();
	if (!IMAGE_EXTENSIONS.has(ext)) {
		return relativePath;
	}

	const markdownDir = path.dirname(filePath);
	const absoluteImagePath = path.resolve(markdownDir, relativePath);

	if (fs.existsSync(absoluteImagePath)) {
		const imageName = path.basename(relativePath);
		const targetDir = path.resolve("public/_processed_images");
		const targetPath = path.join(targetDir, imageName);

		fs.mkdirSync(targetDir, { recursive: true });
		fs.copyFileSync(absoluteImagePath, targetPath);

		return `/_processed_images/${imageName}`;
	}

	return relativePath;
}

export function rehypeFixHtmlImages() {
	return (tree, file) => {
		visit(tree, "raw", (node) => {
			if (!node.value) return;

			// 1. 处理 <picture> 块：解析深浅图片路径并转为 html.dark 兼容的双 <img> 标签
			if (node.value.includes("<picture")) {
				node.value = node.value.replace(
					/<picture[\s\S]*?<\/picture>/gi,
					(pictureBlock) => {
						const darkMatch = pictureBlock.match(
							/media=["']\(prefers-color-scheme:\s*dark\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
						);
						const lightMatch =
							pictureBlock.match(
								/media=["']\(prefers-color-scheme:\s*light\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
							) || pictureBlock.match(/<img[\s\S]*?src=["']([^"']+)["']/i);
						const altMatch = pictureBlock.match(/alt=["']([^"']*)["']/i);

						if (!darkMatch || !lightMatch) return pictureBlock;

						const darkSrc = processImagePath(darkMatch[1], file.path);
						const lightSrc = processImagePath(lightMatch[1], file.path);
						const altText = altMatch ? altMatch[1] : "";

						return `<img class="block dark:hidden" src="${lightSrc}" alt="${altText}" /><img class="hidden dark:block" src="${darkSrc}" alt="${altText}" />`;
					},
				);
			}

			// 2. 处理剩余独立的 <img ...> 与 <source ...> 标签
			node.value = node.value.replace(
				/<(img|source)\b([^>]*?)>/gi,
				(_, tagName, attributes) => {
					const updatedAttributes = attributes.replace(
						/(src|srcset)=["'](?!https?:\/\/|\/)([^"']+)["']/gi,
						(attrMatch, attrName, relativePath) => {
							const newUrl = processImagePath(relativePath, file.path);
							if (newUrl !== relativePath) {
								return `${attrName}="${newUrl}"`;
							}
							return attrMatch;
						},
					);

					return `<${tagName}${updatedAttributes}>`;
				},
			);
		});
	};
}
