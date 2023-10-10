#!/usr/bin/env node

import { readFile } from 'fs/promises'
import { glob } from 'glob'
import { FlattenVisitor } from './visitors/flatten.js'
import { parseFile } from './utils/swc.js'
import { comparator } from './utils/comparator.js'
import { getFilePart } from './utils/getFilePart.js'

// as long as top level await doesn't work everywhere
;(async () => {
  const paths = await glob('**/*.{js,jsx,ts,tsx,mjs,cjs}', { nodir: true })

  const files = await Promise.all(
    paths.map(async (name) => {
      const content = (await readFile(name)).toString()
      return { name, content }
    })
  )

  const candidates = (
    await Promise.all(
      files.map(async (file) => {
        const visitor = new FlattenVisitor()
        const offset = await parseFile(file, visitor)
        visitor.fixOffsets(offset)
        return visitor.comparableStatements.map((item) => ({ file: file.name, item }))
      })
    )
  ).flat()

  const matches = comparator(candidates, files)

  const parsedMatches = matches.map((m) =>
    m.map((d) => ({
      ...d,
      snippet: getFilePart(
        files.find((f) => f.name === d.file),
        d
      )
    }))
  )

  console.log(JSON.stringify(parsedMatches, null, 2))
})()
