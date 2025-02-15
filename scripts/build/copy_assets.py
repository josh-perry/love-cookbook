import os
import shutil


def copyAllFilesFromDir(source_dir, destination_dir):
    os.makedirs(destination_dir, exist_ok=True)

    for filename in os.listdir(source_dir):
        source_file = os.path.join(source_dir, filename)
        if os.path.isfile(source_file):
            destination_file = os.path.join(destination_dir, filename)
            shutil.copy(source_file, destination_file)


def copyAssetsToSite():
    shutil.copytree("styles", "site/styles", dirs_exist_ok=True)
    shutil.copytree("assets", "site/assets", dirs_exist_ok=True)
    copyAllFilesFromDir("common", "site")


if __name__ == "__main__":
    copyAssetsToSite()
