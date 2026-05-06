// src/client.js
import { sanitizeJsonForScript } from "./utils.js";

export function getMermaidStyles() {
	return `
    const style = document.createElement('style');
    style.textContent = \`
      pre.mermaid { display: flex; justify-content: center; align-items: center; margin: 2rem 0; padding: 1rem; background-color: transparent; border: none; overflow: auto; min-height: 200px; position: relative; }
      pre.mermaid:not([data-processed]) { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      [page-theme="dark"] pre.mermaid:not([data-processed]) { background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%); background-size: 200% 100%; }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      pre.mermaid[data-processed] { animation: none; background: transparent; min-height: auto; }
      pre.mermaid svg { max-width: 100%; height: auto; }
      @media (prefers-color-scheme: dark) { pre.mermaid[data-processed] { background-color: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; } }
      @media (prefers-color-scheme: light) { pre.mermaid[data-processed] { background-color: rgba(0, 0, 0, 0.02); border-radius: 0.5rem; } }
      [page-theme="dark"] pre.mermaid[data-processed] { background-color: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; }
      [page-theme="light"] pre.mermaid[data-processed] { background-color: rgba(0, 0, 0, 0.02); border-radius: 0.5rem; }
    \`;
    document.head.appendChild(style);
  `;
}

export function getMermaidClientScript(options, iconPacksConfig) {
	const { enableLog, useElk, autoTheme, theme, mermaidConfig } = options;
	const stringifiedConfig = sanitizeJsonForScript(
		JSON.stringify({ startOnLoad: false, theme, ...mermaidConfig }),
	);
	const stringifiedIcons = sanitizeJsonForScript(
		JSON.stringify(iconPacksConfig),
	);

	return `
    const log = ${enableLog} ? (...args) => console.log('[astro-mermaid]', ...args) : () => {};
    const logError = (...args) => console.error('[astro-mermaid]', ...args);
    const hasMermaidDiagrams = () => document.querySelectorAll('pre.mermaid').length > 0;
    
    let mermaidPromise = null;
    
    async function loadMermaid() {
      if (mermaidPromise) return mermaidPromise;
      log('Loading mermaid.js...');
    
      mermaidPromise = import('mermaid').then(async ({ default: mermaid }) => {
        const iconPacks = ${stringifiedIcons};
        if (iconPacks?.length > 0) {
          log('Registering', iconPacks.length, 'icon packs');
          const packs = iconPacks.map(p => ({ name: p.name, loader: () => fetch(p.url).then(r => r.json()) }));
          await mermaid.registerIconPacks(packs);
        }
    
        ${
					useElk
						? `
        try {
          const elkModule = await import("@mermaid-js/layout-elk");
          if (elkModule?.default) {
            log('Registering ELK layouts');
            mermaid.registerLayoutLoaders(elkModule.default);
          }
        } catch (e) {
          log('ELK layout package not found. If you need it, run: pnpm add @mermaid-js/layout-elk');
        }
        `
						: ""
				}
    
        return mermaid;
      }).catch(error => {
        logError('Failed to load mermaid:', error);
        mermaidPromise = null;
        throw error;
      });
      return mermaidPromise;
    }
    
    const defaultConfig = ${stringifiedConfig};
    const themeMap = { 'light': 'default', 'dark': 'dark' };
    
    async function initMermaid() {
      const diagrams = document.querySelectorAll('pre.mermaid');
      if (diagrams.length === 0) return;
    
      const mermaid = await loadMermaid();
      let currentTheme = defaultConfig.theme;
    
      if (${autoTheme}) {
        const dataTheme = document.documentElement.getAttribute('page-theme') || document.body.getAttribute('page-theme');
        currentTheme = themeMap[dataTheme] || defaultConfig.theme;
      }
    
      mermaid.initialize({ ...defaultConfig, theme: currentTheme, gitGraph: { mainBranchName: 'main', showCommitLabel: true, showBranches: true, rotateCommitLabel: true } });
    
      for (const diagram of diagrams) {
        if (diagram.hasAttribute('data-processed')) continue;
        const diagramDefinition = diagram.getAttribute('data-diagram') || diagram.textContent || '';
        diagram.setAttribute('data-diagram', diagramDefinition);
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 11);
    
        try {
          const existingGraph = document.getElementById(id);
          if (existingGraph) existingGraph.remove();
          const { svg } = await mermaid.render(id, diagramDefinition);
          diagram.innerHTML = svg;
          diagram.setAttribute('data-processed', 'true');
        } catch (error) {
          logError('Rendering error:', id, error);
          const errorMsg = error.message ? error.message.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]) : 'Unknown error';
          diagram.innerHTML = \`<div style="color:red; padding:1rem; border:1px solid red; border-radius:0.5rem;"><strong>Error:</strong> \${errorMsg}</div>\`;
          diagram.setAttribute('data-processed', 'true');
        }
      }
    }
    
    if (hasMermaidDiagrams()) initMermaid();
    
    if (${autoTheme}) {
      const observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.type === 'attributes' && m.attributeName === 'page-theme')) {
          document.querySelectorAll('pre.mermaid[data-processed]').forEach(d => d.removeAttribute('data-processed'));
          initMermaid();
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['page-theme'] });
      observer.observe(document.body, { attributes: true, attributeFilter: ['page-theme'] });
    }
    
    document.addEventListener('astro:after-swap', () => { if (hasMermaidDiagrams()) initMermaid(); });
  `;
}
