import dprint from 'dprint-node'

import { Candidate, File } from '../types.js'
import { FlattenVisitor } from '../visitors/flatten.js'
import { comparator } from './comparator.js'
import { parseFile } from './swc.js'
import { getFilePart } from './getFilePart.js'

export const getCandidates = async (files: File[]): Promise<Candidate[]> => {
  const candidates: Candidate[] = []
  for (const file of files) {
    const visitor = new FlattenVisitor()
    const offset = await parseFile(file, visitor)
    visitor.fixOffsets(offset)
    candidates.push(...visitor.comparableStatements.map((item) => ({ file: file.name, item })))
  }

  return candidates
}

const format = (fileName: string, snippet: string) => {
  let formatted = snippet
  try {
    formatted = dprint.format(fileName, snippet)
  } catch (_) {
    console.warn('could not format snippet:')
    console.warn(snippet)
  }

  return formatted
}

export const getMatches = (candidates: Candidate[], files: File[]) =>
  comparator(candidates, files).map((m) =>
    m.map((d) => ({
      ...d,
      snippet: format(
        d.file,
        getFilePart(
          files.find((f) => f.name === d.file),
          d
        )
      )
    }))
  )
