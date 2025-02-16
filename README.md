<!-- Copy this if you need: LÖVE -->
# LÖVE cookbook
This is the repository for the LÖVE cookbook project.

## Developing
#### Install Python dependencies
```bash
pip install markdown Jinja2 setuptools python-frontmatter
```

#### Create content (Windows)
```bash
scripts/content/new_content.bat <AUTHOR>
```

#### Create content (Linux / MacOS)
```bash
scripts/content/new_content.bash <AUTHOR>
```

#### Build the website
```bash
python scripts/build/build.py
```

#### Serve the website
```bash
cd site
python -m http.server 8000
```

## Credits
- Nykenik24:
    - Made build scripts for website.
    - Made markdown to html script.
    - Made general website structure.
