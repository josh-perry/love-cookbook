import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    const usedIds = new Set();

    eleventyConfig.addPairedShortcode("love", (content, width = 600, height = 450) => {
        let id;
        do {
            id = Math.floor(Math.random() * 1000);
        } while (usedIds.has(id));
        usedIds.add(id);

        // Note: No indenting to prevent rendering as code block.
        return `
<iframe id="love-iframe-${id}" src="/assets/love-js" width="${width}" height="${height}"></iframe>
<script>
const iframe_${id} = document.getElementById('love-iframe-${id}');
iframe_${id}.addEventListener('load', function() {
console.log('iframe loaded');
iframe_${id}.contentWindow.postMessage({lua: \`love.window.setMode(${width}, ${height})${content.replace(/`/g, '\\`')}\`}, '*');
});
</script>
        `;
    });

    return {
        pathPrefix: "/love-cookbook",
        dir: {
            input: "content",
            includes: "../templates",
            output: "build",
        },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
}