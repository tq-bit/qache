#!/bin/bash
npx jsdoc2md dist/Cache.js > docs/api.md
npx jsdoc2md dist/Validator.js >> docs/api.md
cp readme.md docs/index.md
npx vitepress build docs