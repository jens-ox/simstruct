#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'
import { toHtml } from './toHtml.js'
import { getCandidates, getMatches } from './utils/candidates.js'

// as long as top level await doesn't work everywhere
;(async () => {
  const outDir = join(process.cwd(), '.simstruct')
  const paths = await glob('**/*.{js,jsx,ts,tsx,mjs,cjs}', { nodir: true })

  const files = await Promise.all(
    paths.map(async (name) => {
      const content = (await readFile(name)).toString()
      return { name, content }
    })
  )

  // step through files to get correct offsets
  const candidates = await getCandidates(files)

  const matches = getMatches(candidates, files)

  // report results by writing them to disk
  try {
    await mkdir(outDir, { recursive: true })
  } catch (_) {
    console.log('output directory already exists')
  }

  await writeFile(join(outDir, 'out.json'), JSON.stringify(matches, null, 2))
  await writeFile(join(outDir, 'out.html'), toHtml(matches))

  console.log('results written to .simstruct')
})()
