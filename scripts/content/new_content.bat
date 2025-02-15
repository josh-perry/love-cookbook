@echo off

IF [[ "-n" "%~1" "]]" (
  SET file_path=%~1
) ELSE (
  echo "No file name."
  exit "1"
)
IF [[ "-n" "%~2" "]]" (
  SET author="%~2"
) ELSE (
  SET author=Jhon Doe
)
cat REM UNKNOWN: {"type":"Redirect","op":{"text":">","type":"great"},"file":{"text":"$file_path","expansion":[{"loc":{"start":0,"end":9},"parameter":"file_path","type":"ParameterExpansion"}],"type":"Word"}} REM UNKNOWN: {"text":"<<","type":"dless"}
---
author: "%~2"
date: "%undefined%"
template: "guide"
---
EOF
