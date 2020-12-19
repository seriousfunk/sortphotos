# Sortphotos

NodeJS script for organizing photos into a Date folder structure (e.g. YYYY/MM-Month, YYYY_MM)

## Options

- -s, --source <source> : Source Directory (Use quotes if directory contains spaces and leave off trailing slash.)
- -d, --destination <destination> : Destination Directory (Use quotes if directory contains spaces and leave off trailing slash.)
- -r, --recursive : Recurse subdirectories
- -f, --folder <format> : Folder Format (YYYY_MM | YYYY_MM_DD | YYYY/MM | YYYY/MM-MON | YYYY/MM-Month), Default: YYYY/MM-Month
- -l, --log [log_file] : Log file, including path, Default: ./logs/sortphotos-YYYY-MM-DD-HHmmss.log
- -x, --dry-run : Write to screen and log what would happen but do not do anything

## Feature Suggestions

- Rename photos according to EXIF attributes.
- Option to sort photos into Albums (i.e. named folders) based on frequency of photos shot in close time proximity to one another

## Machine Learning Wish List

- Use Google Photo or other ML library to rename photos according to meta-data describing the photo (e.g. face recognition name of person, location based on GPS coordinates, etc.)
