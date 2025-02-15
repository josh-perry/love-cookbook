import time

from to_html import buildContent
from copy_assets import copyAssetsToSite
from utils import secondsToStr

build_start = time.time()

# Convert all markdown files in /content/ to html files
# see /scripts/to_html.py
print("Building all content...")
buildContent()
print("Content was succesfully built.")

print()

print("Copying assets to site/styles...")
copyAssetsToSite()
print("Succesfully copied assets to site directory.")

build_end = time.time()

build_time = secondsToStr(build_end - build_start)
print()
print(f"Took {build_time} seconds")
