#!/usr/bin/env node

import { glob } from 'glob'

// as long as top level await doesn't work everywhere
;(async () => {
  const files = await glob('**/*.{js,jsx,ts,tsx,mjs,cjs}')

  console.log(files)
})()
