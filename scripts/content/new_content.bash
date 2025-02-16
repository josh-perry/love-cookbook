if [[ -n "$1" ]]; then

	file_path=$1
else
	echo "No file name."
	exit 1
fi

if [[ -n "$2" ]]; then
	author="$2"
else
	author="Jhon Doe"
fi

cat >$file_path <<EOF
---
author: "$2"
date: $(date "+%H:%M:%S")
template: guide
---
EOF
