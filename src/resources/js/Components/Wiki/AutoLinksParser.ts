import AutolinkParser = toastui.AutolinkParser;
import route from "ziggy-js";

const DOMAIN = "(?:[w-]+.)*[A-Za-z0-9-]+.[A-Za-z0-9-]+";
const PATH = "[^<\\s]*[^<?!.,:*_?~\\s]";
const EMAIL = "[\\w.+-]+@(?:[\\w-]+\\.)+[\\w-]+";

function trimUnmatchedTrailingParens(source: string) {
    const trailingParen = /\)+$/.exec(source);
    if (trailingParen) {
        let count = 0;
        for (const ch of source) {
            if (ch === "(") {
                if (count < 0) {
                    count = 1;
                } else {
                    count += 1;
                }
            } else if (ch === ")") {
                count -= 1;
            }
        }

        if (count < 0) {
            const trimCount = Math.min(-count, trailingParen[0].length);
            return source.substring(0, source.length - trimCount);
        }
    }
    return source;
}

function trimTrailingEntity(source: string) {
    return source.replace(/&[A-Za-z0-9]+;$/, "");
}

interface LinkInfo {
    text: string;
    url: string;
    range: [number, number];
}

function parseEmailLink(source: string): LinkInfo[] {
    const reEmailLink = new RegExp(EMAIL, "g");
    const result: LinkInfo[] = [];
    let m;
    while ((m = reEmailLink.exec(source))) {
        const text = m[0];
        if (!/[_-]+$/.test(text)) {
            result.push({
                text,
                range: [m.index, m.index + text.length - 1],
                url: `mailto:${text}`,
            });
        }
    }

    return result;
}

function parseUrlLink(source: string): LinkInfo[] {
    const reWwwAutolink = new RegExp(`(www|https?://).${DOMAIN}${PATH}`, "g");
    const result: LinkInfo[] = [];
    let m;

    while ((m = reWwwAutolink.exec(source))) {
        const text = trimTrailingEntity(trimUnmatchedTrailingParens(m[0]));
        const scheme = m[1] === "www" ? "http://" : "";
        result.push({
            text,
            range: [m.index, m.index + text.length - 1],
            url: `${scheme}${text}`,
        });
    }

    return result;
}

function parseSciKiPageLink(source: string): LinkInfo[] {
    const rePageLink = new RegExp("<@([A-Za-z0-9_-]+)>", "g");
    const result: LinkInfo[] = [];
    let m;

    while ((m = rePageLink.exec(source))) {
        result.push({
            text: m[1],
            range: [m.index, m.index + m[0].length - 1],
            url: route("wiki.show", m[1]),
        });
    }

    return result;
}

const AutoLinksParser: AutolinkParser = (source: string) => {
    return [
        ...parseUrlLink(source),
        ...parseEmailLink(source),
        ...parseSciKiPageLink(source),
    ].sort((a, b) => a.range[0] - b.range[0]);
};

export default AutoLinksParser;
