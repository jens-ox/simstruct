import { Duplication, File } from '../types.js'

export const getFilePart = (file: File | undefined, match: Duplication) =>
  file === undefined ? '' : file.content.substring(match.start - 1, match.end - 1)
