import os
import shutil
import markdown
import frontmatter
from jinja2 import Environment, FileSystemLoader

# Set up Jinja2 environment
env = Environment(loader=FileSystemLoader("templates"))

# Define paths
CONTENT_DIR = "content"
OUTPUT_DIR = "site"


def buildContent():
    # Ensure output directory exists and clean it
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)  # Remove old site files
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    guides = []  # Store guide metadata for index

    def process_markdown(md_path, output_html_path):
        with open(md_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)

        title = post.get("title", os.path.basename(md_path).replace(".md", ""))
        date = post.get("date", "Unknown")
        author = post.get("author", "Unknown")
        draft = post.get("draft", False)
        template_name = post.get("template", "guide")

        if draft is True:
            return

        url = os.path.relpath(output_html_path, OUTPUT_DIR).replace("\\", "/")  # Convert to relative URL

        # Initialize Markdown with Table of Contents extension
        md = markdown.Markdown(extensions=["fenced_code", "codehilite", "toc"])

        # Convert Markdown to HTML
        html_content = md.convert(post.content)

        # Extract the Table of Contents separately
        toc_html = md.toc  # This gives us a separate TOC HTML block

        # Store guide info for index
        if title != "Homepage":
            guides.append({"title": title, "url": url})

        # Get template
        template = env.get_template(f"{template_name}.html")

        # Render guide page
        page_html = template.render(title=title, content=html_content, author=author, date=date, guides=guides, toc=toc_html)
        with open(output_html_path, "w", encoding="utf-8") as f:
            f.write(page_html)

    # Process each Markdown file
    for root, _, files in os.walk(CONTENT_DIR):
        relative_path = os.path.relpath(root, CONTENT_DIR)
        output_dir = os.path.join(OUTPUT_DIR, relative_path)
        os.makedirs(output_dir, exist_ok=True)

        for file in files:
            if file.endswith(".md"):
                md_path = os.path.join(root, file)
                html_filename = file.replace(".md", ".html")
                output_html_path = os.path.join(output_dir, html_filename)
                process_markdown(md_path, output_html_path)


if __name__ == "__main__":
    buildContent()
