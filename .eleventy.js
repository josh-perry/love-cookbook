export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets"); 

    return {
        dir: {
            input: "content",
            includes: "../templates",
            output: "build",
        },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
}