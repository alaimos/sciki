export const pluginRegex = /^@([A-Za-z0-9]+):([A-Za-z0-9\-_/]+)$/s;

export function resolvePage(page: string): string {
    if (!page.startsWith("@")) return `./Pages/${page}`;
    const match = page.match(pluginRegex);
    if (!match) throw new Error("Syntax error");
    const plugin = match[1];
    const path = match[2].replace(/^\//, "");
    return `Modules/${plugin}/Pages/${path}`;
}

export function resolveWikiPlugin(name: string): string {
    if (name.startsWith("Plugins/")) {
        return `./../../Components/Wiki/${name}`;
    }
    if (!name.startsWith("@")) {
        return `./../../Components/Wiki/Html`;
    }
    const match = name.match(pluginRegex);
    if (!match) throw new Error("Syntax error");
    const plugin = match[1];
    const path = match[2].replace(/^\//, "");
    return `./../../Modules/${plugin}/WikiPlugins/${path}`;
}
