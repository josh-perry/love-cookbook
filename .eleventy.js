import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets"); 
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

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