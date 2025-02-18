import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    const usedIds = new Set();

    const getId = () => {
        let id;
        do {
            id = Math.floor(Math.random() * 1000);
        } while (usedIds.has(id));
        usedIds.add(id);
        return id;
    }

    eleventyConfig.addPairedShortcode("love", (content, width = 600, height = 450) => {
        const id = getId();

        content = content
            .replace(/(\r\n){2,}/g, '\r\n')
            .replace(/`/g, '\\`')

        // Note: No indenting to prevent rendering as code block.
        return `
<iframe id="love-iframe-${id}" src="/assets/love/love-js" width="${width}" height="${height}"></iframe>
<script>
const iframe_${id} = document.getElementById('love-iframe-${id}');
iframe_${id}.addEventListener('load', function() {
iframe_${id}.contentWindow.postMessage({lua: \`love.window.setMode(${width}, ${height}) ${content}\`}, '*');
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