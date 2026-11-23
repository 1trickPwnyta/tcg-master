import $ from "jquery";

const symbolMap = new Map<string, string>([
    [ "⚪", "colorless.png" ],
    [ "👊", "fighting.png" ],
    [ "🔥", "fire.png" ],
    [ "🍃", "grass.png" ],
    [ "⚡️", "lightning.png" ],
    [ "👁️", "psychic.png" ],
    [ "💧", "water.png" ]
]);

const symbolPattern = new RegExp(`[${Array.from(symbolMap.keys()).join("")}]`);

function addEnergySymbols(root: Node) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
        const tag = node.parentElement?.tagName;
        if (tag !== "SCRIPT" && tag !== "STYLE") {
            textNodes.push(node);
        }
    }

    textNodes.filter(n => n.nodeValue).forEach(textNode => {
        if (!symbolPattern.test(textNode.nodeValue!)) return;

        const span = $("<span>");
        let html = textNode.nodeValue!;
        Array.from(symbolMap.entries()).forEach(e => {
            html = html.replaceAll(e[0], `<img src="/energy-symbols/${e[1]}" alt="${e[0]}" class="energy-icon" />`);
        });
        span.html(html);
        textNode.parentElement?.replaceChild(span[0], textNode);
    });
}

const observer = new MutationObserver(mutations => {
    observer.disconnect();

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                addEnergySymbols(node);
            } else if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
                addEnergySymbols(node.parentNode);
            }
        });
    });

    observe();
});

function observe() {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

observe();
