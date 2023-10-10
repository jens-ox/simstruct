import { Statement, TsType, VariableDeclaration } from '@swc/core'
import { Visitor } from '@swc/core/Visitor.js'
import { Comparable } from '../types.js'

/**
 * This visitor extracts all statements that we want to be able to compare.
 *
 * TODO:
 * - ForOfStatement
 */
export class FlattenVisitor extends Visitor {
  comparableStatements: Comparable[] = []

  fixOffsets(offset: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.comparableStatements = this.comparableStatements.map((c: any) => ({
      ...c,
      span: {
        ...c.span,
        start: c.span.start - offset,
        end: c.span.end - offset
      }
    }))
  }

  visitStatement(stmt: Statement): Statement {
    this.comparableStatements.push(stmt)
    super.visitStatement(stmt)
    return stmt
  }

  visitVariableDeclaration(n: VariableDeclaration): VariableDeclaration {
    this.comparableStatements.push(n)
    super.visitVariableDeclaration(n)
    return n
  }

  visitTsType(n: TsType): TsType {
    return n
  }
}
