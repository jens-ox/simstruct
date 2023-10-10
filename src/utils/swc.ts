import { Options, Compiler, parse } from '@swc/core'
import { Visitor } from '@swc/core/Visitor.js'
import { File } from '../types.js'

const swcOptions: Options = {
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true
    },
    target: 'esnext',
    loose: false,
    minify: {
      compress: false,
      mangle: false
    }
  },
  minify: false,
  isModule: true
}

export const parseFile = async (file: File, visitor: Visitor): Promise<number> => {
  const compiler = new Compiler()

  const offset = (await parse('')).span.end

  try {
    await compiler.transform(file.content, {
      ...swcOptions,
      filename: file.name,
      plugin: (n) => visitor.visitProgram(n)
    })
  } catch (error) {
    console.error(error)
  }

  return offset
}
