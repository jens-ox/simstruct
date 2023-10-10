import { Options, Compiler, parse } from '@swc/core'
import Visitor from '@swc/core/Visitor'
import { File } from '../types'

const swcOptions: Options = {
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true
    },
    target: 'es2022',
    loose: false,
    minify: {
      compress: false,
      mangle: false
    }
  },
  module: {
    type: 'es6'
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
