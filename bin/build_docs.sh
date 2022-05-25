#!/bin/bash
echo "---
title: API reference
editLink: true
---" > docs/api.md
npx jsdoc2md dist/Cache.js >> docs/api.md
npx jsdoc2md dist/Validator.js >> docs/api.md
cp readme.md docs/index.md
npx vitepress build docs