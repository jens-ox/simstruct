#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'
import dprint from 'dprint-node'
import { FlattenVisitor } from './visitors/flatten.js'
import { parseFile } from './utils/swc.js'
import { comparator } from './utils/comparator.js'
import { getFilePart } from './utils/getFilePart.js'
import { Candidate } from './types.js'
import { toHtml } from './toHtml.js'

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
  const candidates: Candidate[] = []
  for (const file of files) {
    const visitor = new FlattenVisitor()
    const offset = await parseFile(file, visitor)
    visitor.fixOffsets(offset)
    candidates.push(...visitor.comparableStatements.map((item) => ({ file: file.name, item })))
  }

  const matches = comparator(candidates, files).map((m) =>
    m.map((d) => ({
      ...d,
      snippet: dprint.format(
        'input.tsx',
        getFilePart(
          files.find((f) => f.name === d.file),
          d
        )
      )
    }))
  )

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
