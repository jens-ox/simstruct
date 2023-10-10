import { HasSpan } from '@swc/core'
import { Candidate, Duplication, DuplicationMatrix, File } from '../types.js'
import { isMatch } from './isMatch.js'
import { getFilePart } from './getFilePart.js'

const isSame = (m1: Duplication, m2: Duplication) => m1.file === m2.file && m1.start === m2.start && m1.end === m2.end

const isAdjacent = (m1: Duplication, m2: Duplication, files: File[]): boolean => {
  // adjacent code has to be in the same file
  if (m1.file !== m2.file) return false

  // adjacent code has to be in ascending order
  if (m2.start < m1.end) return false

  // between adjacent code only whitespace can exist
  const file = files.find((f) => f.name === m1.file)

  // this won't happen
  if (!file) return false

  const filePart = getFilePart(file, { file: m1.file, start: m1.end, end: m2.start })

  return filePart.replace(/^\s+|\s+$/g, '') === ''
}

const merge = (m1: Duplication, m2: Duplication): Duplication => {
  const newStart = Math.min(m1.start, m2.start)
  const newEnd = Math.max(m1.end, m2.end)
  return {
    file: m1.file,
    start: newStart,
    end: newEnd
  }
}

const groupsAdjacent = (mg1: Duplication[], mg2: Duplication[], files: File[]) =>
  mg1.every((m1) => mg2.some((m2) => isAdjacent(m1, m2, files)))

const mergeAdjacent = (mg1: Duplication[], mg2: Duplication[], files: File[]): Duplication[] =>
  mg1.map((m1) => {
    // find adjacent
    const m2 = mg2.find((candidate) => isAdjacent(m1, candidate, files))

    // this won't happen
    if (!m2) return m1

    return merge(m1, m2)
  })

/**
 * From a list of available blocks, get a list of matches per block.
 * @param candidates list of all available blocks
 * @returns array of arrays - one array per candidate that contains its matches
 */
export const comparator = (candidates: Candidate[], files: File[], threshold?: number): DuplicationMatrix => {
  let matches: DuplicationMatrix = candidates.map((base, i) => [
    {
      file: base.file,
      start: (base.item as HasSpan).span.start,
      end: (base.item as HasSpan).span.end
    },
    ...candidates
      .filter((compare, j) => {
        if (i === j) return false
        if (base.item.type !== compare.item.type) return false
        const match = isMatch(base.item, compare.item)
        return match
      })
      .map((c) => ({ file: c.file, start: (c.item as HasSpan).span.start, end: (c.item as HasSpan).span.end }))
  ])

  // remove self-detects
  matches = matches.map((mg) => mg.filter((m, i, self) => i === self.findIndex((m2) => isSame(m, m2))))

  // filter out non-duplicate entries
  matches = matches.filter((m) => m.length > 1)

  // filter out permutations
  // filter out all entries where another duplication array exists where every entry has a matching sibling entry in the first duplication array
  matches = matches.filter(
    (mg1, i, self) => i === self.findIndex((mg2) => mg2.every((m1) => mg1.some((m2) => isSame(m1, m2))))
  )

  // merge adjacent matches
  let hasAdjacent = true
  while (hasAdjacent) {
    const adjacent1Index = matches.findIndex((mg1, i, self) =>
      self.some((mg2, j) => i !== j && groupsAdjacent(mg1, mg2, files))
    )
    hasAdjacent = adjacent1Index !== -1

    if (!hasAdjacent) break

    // merge adjacent groups
    const adjacent1 = matches[adjacent1Index]
    const adjacent2Index = matches.findIndex((mg, i) => i !== adjacent1Index && groupsAdjacent(adjacent1, mg, files))

    // this won't happen
    if (adjacent2Index === -1) break
    const adjacent2 = matches[adjacent2Index]

    const merged = mergeAdjacent(adjacent1, adjacent2, files)

    // remove both adjacent elements and add merged
    matches = [...matches.filter((_, index) => index !== adjacent1Index && index !== adjacent2Index), merged]
  }

  // filter out short stuff
  return matches.filter((mg) => mg[0].end - mg[0].start >= (threshold ?? 100))
}
