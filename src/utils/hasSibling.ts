import { Comparable, Options } from '../types.js'
import { isMatch } from './isMatch.js'

export const hasSibling = (needle?: Comparable, haystack?: Array<Comparable | undefined>): boolean => {
  if (!needle || !haystack) return true
  return haystack.some((compare) => isMatch(needle, compare))
}

export const siblingGroups = (
  group1?: Array<Comparable | undefined>,
  group2?: Array<Comparable | undefined>,
  options: Options = { checkNames: false }
) => {
  if (!group1 && !group2) return true
  if (!group1 || !group2) return false
  if (group1.length !== group2.length) return false
  return group1.every((e) => hasSibling(e, group2), options) && group2.every((e) => hasSibling(e, group1), options)
}

export const proxyMatch = (
  entries: Array<
    | [Comparable?, Comparable?]
    | [Array<Comparable | undefined>?, Array<Comparable | undefined>?]
    | [boolean?, boolean?]
    | [string?, string?]
  >,
  options: Options = { checkNames: false }
) =>
  entries.every((e) => {
    if (e[0] === undefined && e[1] === undefined) return true
    if (e[0] === undefined || e[1] === undefined) return false
    if (Array.isArray(e[0])) return siblingGroups(e[0], e[1] as Array<Comparable | undefined>, options)
    if (typeof e[0] === 'boolean' || typeof e[0] === 'string') return e[0] === e[1]

    return isMatch(e[0], e[1] as Comparable, options)
  })
