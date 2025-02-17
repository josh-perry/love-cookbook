export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets"); 

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