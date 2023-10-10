import { TsTemplateLiteralType } from '@swc/core'
import { Comparable, Options } from '../types.js'
import { proxyMatch, siblingGroups } from './hasSibling.js'

const stringsMatch = (a: string, b: string) => a.replace(/^\s+|\s+$/g, '') === b.replace(/^\s+|\s+$/g, '')

/**
 * Check whether or not one statement is a duplicate of another.
 *
 * Todo:
 * - BlockStatement
 * -
 *
 * @param base base statement
 * @param candidate comparison statement
 * @param options options for the matching logic
 * @returns whether or not the two statements are duplicates
 */
export const isMatch = (
  base?: Comparable,
  candidate?: Comparable,
  options: Options = { checkNames: false }
): boolean => {
  // undefined checks
  if (base === undefined && candidate === undefined) return true
  if (base === undefined || candidate === undefined) return false

  // null checks
  if (base === null && candidate === null) return true
  if (base === null || candidate === null) return false

  if (base.type !== candidate.type) return false

  let c
  switch (base.type) {
    case 'Constructor':
      c = candidate as typeof base
      return proxyMatch([
        [base.key, c.key],
        [base.body, c.body],
        [base.params, c.params]
      ])
    case 'Parameter':
      c = candidate as typeof base
      return proxyMatch([
        [base.pat, c.pat],
        [base.decorators, c.decorators]
      ])
    case 'FunctionExpression':
      c = candidate as typeof base
      if (!isMatch(base.identifier, c.identifier)) return false
      if (!isMatch(base.body, c.body)) return false
      if (!isMatch(base.typeParameters, c.typeParameters)) return false
      if (!isMatch(base.returnType, c.returnType)) return false
      if (!siblingGroups(base.decorators, c.decorators)) return false
      return siblingGroups(base.params, c.params)
    case 'ArrowFunctionExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.generator, c.generator],
        [base.params, c.params],
        [base.body, c.body]
      ])
    case 'OptionalChainingExpression':
      c = candidate as typeof base
      return isMatch(base.base, c.base)
    case 'Identifier':
      c = candidate as typeof base
      if (options.checkNames && base.value !== c.value) return false
      if ('typeAnnotation' in base && 'typeAnnotation' in c) {
        return isMatch(base.typeAnnotation, c.typeAnnotation)
      }
      return true
    case 'TemplateElement':
      c = candidate as typeof base
      return base.tail === c.tail && base.cooked === c.cooked
    case 'VariableDeclaration':
      c = candidate as typeof base
      return siblingGroups(base.declarations, c.declarations)
    case 'VariableDeclarator':
      c = candidate as typeof base
      return proxyMatch([
        [base.id, c.id],
        [base.init, c.init]
      ])
    case 'AwaitExpression':
      c = candidate as typeof base
      return isMatch(base.argument, c.argument)
    case 'CallExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.callee, c.callee],
        [base.arguments.map((e) => e.expression), c.arguments.map((e) => e.expression)]
      ])
    case 'TsModuleBlock':
      c = candidate as typeof base
      return siblingGroups(base.body, c.body)
    case 'TsModuleDeclaration':
      c = candidate as typeof base
      return isMatch(base.id, c.id) && isMatch(base.body, c.body)
    case 'TsLiteralType':
      c = candidate as typeof base
      return isMatch(base.literal, c.literal)
    case 'TsNonNullExpression':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression)
    case 'TsInterfaceDeclaration':
      c = candidate as typeof base
      if (!isMatch(base.id, c.id)) return false
      if (!isMatch(base.body, c.body)) return false
      return siblingGroups(base.extends, c.extends)
    case 'ClassDeclaration':
      c = candidate as typeof base
      return proxyMatch([
        [base.identifier, c.identifier],
        [base.decorators, c.decorators],
        [base.body, c.body],
        [base.typeParams, c.typeParams],
        [base.superTypeParams, c.superTypeParams],
        [base.implements, c.implements]
      ])
    case 'TsInterfaceBody':
      c = candidate as typeof base
      return siblingGroups(base.body, c.body)
    case 'TsPropertySignature':
      c = candidate as typeof base
      if (base.optional !== c.optional) return false
      return isMatch(base.typeAnnotation, c.typeAnnotation)
    case 'TsTypeAnnotation':
      c = candidate as typeof base
      return isMatch(base.typeAnnotation, c.typeAnnotation)
    case 'TsTypeReference':
      c = candidate as typeof base
      if (!isMatch(base.typeName, c.typeName, { checkNames: true })) return false
      return isMatch(base.typeParams, c.typeParams)
    case 'TsTypeQuery':
      c = candidate as typeof base
      if (!isMatch(base.exprName, c.exprName)) return false
      return isMatch(base.typeArguments, c.typeArguments)
    case 'TsIndexedAccessType':
      c = candidate as typeof base
      return isMatch(base.objectType, c.objectType) && isMatch(base.indexType, c.indexType)
    case 'TsQualifiedName':
      c = candidate as typeof base
      return isMatch(base.left, c.left, { checkNames: true }) && isMatch(base.right, c.right, { checkNames: true })
    case 'TsKeywordType':
      c = candidate as typeof base
      return base.kind === c.kind
    case 'TsTypeParameterInstantiation':
      c = candidate as typeof base
      return siblingGroups(base.params, c.params)
    case 'TsAsExpression':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression) && isMatch(base.typeAnnotation, c.typeAnnotation)
    case 'TsIntersectionType':
      c = candidate as typeof base
      return siblingGroups(base.types, c.types)
    case 'TsTypeLiteral':
      c = candidate as typeof base
      return siblingGroups(base.members, c.members)
    case 'TsFunctionType':
      c = candidate as typeof base
      return proxyMatch([
        [base.params, c.params],
        [base.typeParams, c.typeParams],
        [base.typeAnnotation, c.typeAnnotation]
      ])
    case 'TsUnionType':
      c = candidate as typeof base
      return siblingGroups(base.types, c.types)
    case 'TsTypeAliasDeclaration':
      c = candidate as typeof base
      return (
        isMatch(base.id, c.id) &&
        isMatch(base.typeParams, c.typeParams) &&
        isMatch(base.typeAnnotation, c.typeAnnotation)
      )
    case 'TsExpressionWithTypeArguments':
      c = candidate as typeof base
      if (!isMatch(base.expression, c.expression, { checkNames: true })) return false
      return isMatch(base.typeArguments, c.typeArguments)
    case 'ExpressionStatement':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression)
    case 'StringLiteral':
      c = candidate as typeof base
      return stringsMatch(base.value, c.value)
    case 'BlockStatement':
      c = candidate as typeof base
      return siblingGroups(base.stmts, c.stmts)
    case 'ReturnStatement':
      c = candidate as typeof base
      return isMatch(base.argument, c.argument)
    case 'LabeledStatement':
      c = candidate as typeof base
      return isMatch(base.body, c.body)
    case 'ArrayExpression':
      c = candidate as typeof base
      return proxyMatch([[base.elements.map((e) => e?.expression), c.elements.map((e) => e?.expression)]])
    case 'ObjectExpression':
      c = candidate as typeof base
      return siblingGroups(base.properties, c.properties)
    case 'NewExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.callee, c.callee],
        [base.arguments?.map((a) => a.expression), c.arguments?.map((a) => a.expression)],
        [base.typeArguments, c.typeArguments]
      ])
    case 'SpreadElement':
      return isMatch(base.arguments, (candidate as typeof base).arguments)
    case 'RestElement':
      c = candidate as typeof base
      if (!isMatch(base.typeAnnotation, c.typeAnnotation)) return false
      return isMatch(base.argument, c.argument)
    case 'KeyValueProperty':
    case 'AssignmentProperty':
      c = candidate as typeof base
      if (!isMatch(base.key, c.key, { checkNames: true })) return false
      return isMatch(base.value, c.value)
    case 'Computed':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression)
    case 'GetterProperty':
      c = candidate as typeof base
      return isMatch(base.body, c.body)
    case 'SetterProperty':
      c = candidate as typeof base
      return isMatch(base.body, c.body)
    case 'MethodProperty':
      c = candidate as typeof base
      return proxyMatch([
        [base.async, c.async],
        [base.generator, c.generator],
        [base.body, c.body]
      ])
    case 'ClassProperty':
      c = candidate as typeof base
      return proxyMatch([
        [base.key, c.key],
        [base.typeAnnotation, c.typeAnnotation],
        [base.accessibility, c.accessibility],
        [base.decorators, c.decorators]
      ])
    case 'ClassMethod':
      c = candidate as typeof base
      return proxyMatch([
        [base.key, c.key],
        [base.function.body, c.function.body],
        [base.function.params, c.function.params],
        [base.function.decorators, c.function.decorators],
        [base.function.typeParameters, c.function.typeParameters],
        [base.function.returnType, c.function.returnType]
      ])
    case 'MemberExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.property, c.property],
        [base.object, c.object]
      ])
    case 'NumericLiteral':
      c = candidate as typeof base
      return base.value === c.value
    case 'RegExpLiteral':
      c = candidate as typeof base
      return stringsMatch(base.pattern, c.pattern) && stringsMatch(base.flags, c.flags)
    case 'ArrayPattern':
      c = candidate as typeof base
      return proxyMatch([
        [base.optional, c.optional],
        [base.elements, c.elements]
      ])
    case 'ForOfStatement':
      c = candidate as typeof base
      return proxyMatch([
        [base.left, c.left],
        [base.right, c.right],
        [base.body, c.body]
      ])
    case 'ThrowStatement':
      c = candidate as typeof base
      return isMatch(base.argument, c.argument)
    case 'SwitchStatement':
      c = candidate as typeof base
      return proxyMatch([
        [base.discriminant, c.discriminant],
        [base.cases, c.cases]
      ])
    case 'SwitchCase':
      c = candidate as typeof base
      if (!isMatch(base.test, c.test)) return false
      return siblingGroups(base.consequent, c.consequent)
    case 'ObjectPattern':
      c = candidate as typeof base
      return proxyMatch([
        [base.optional, c.optional],
        [base.properties, c.properties],
        [base.typeAnnotation, c.typeAnnotation]
      ])
    case 'KeyValuePatternProperty':
      c = candidate as typeof base
      return proxyMatch([
        [base.key, c.key],
        [base.value, c.value]
      ])
    case 'AssignmentPatternProperty':
      c = candidate as typeof base
      return isMatch(base.key, c.key)
    case 'IfStatement':
      c = candidate as typeof base
      return proxyMatch([
        [base.test, c.test],
        [base.consequent, c.consequent],
        [base.alternate, c.alternate]
      ])
    case 'BooleanLiteral':
      c = candidate as typeof base
      return base.value === c.value
    case 'UnaryExpression':
      c = candidate as typeof base
      if (base.operator !== c.operator) return false
      return isMatch(base.argument, c.argument)
    case 'BinaryExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.operator, c.operator],
        [base.left, c.left],
        [base.right, c.right]
      ])
    case 'JSXElement':
      c = candidate as typeof base
      return proxyMatch([
        [base.opening, c.opening],
        [base.closing, c.closing],
        [base.children, c.children]
      ])
    case 'JSXOpeningElement':
      c = candidate as typeof base
      return proxyMatch([
        [base.selfClosing, c.selfClosing],
        [base.name, c.name],
        [base.attributes, c.attributes]
      ])
    case 'JSXClosingElement':
      c = candidate as typeof base
      return isMatch(base.name, c.name)
    case 'JSXText':
      c = candidate as typeof base
      return stringsMatch(base.value, c.value)
    case 'JSXAttribute':
      c = candidate as typeof base
      return proxyMatch([
        [base.name, c.name],
        [base.value, c.value]
      ])
    case 'JSXFragment':
      c = candidate as typeof base
      if (!isMatch(base.opening, c.opening)) return false
      if (!isMatch(base.closing, c.closing)) return false
      return siblingGroups(base.children, c.children)
    case 'JSXMemberExpression':
      c = candidate as typeof base
      return isMatch(base.object, c.object) && isMatch(base.property && c.property)
    case 'ParenthesisExpression':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression)
    case 'ConditionalExpression':
      c = candidate as typeof base
      return (
        isMatch(base.test, c.test) && isMatch(base.consequent, c.consequent) && isMatch(base.alternate, c.alternate)
      )
    case 'JSXExpressionContainer':
      c = candidate as typeof base
      return isMatch(base.expression, c.expression)
    case 'TemplateLiteral':
      // SWC uses type: "TemplateLiteral" for both `TemplateLiteral` and `TsTemplateLiteralType`, so we have to distinguish between them here.
      c = candidate as typeof base
      if ('expressions' in base && 'expressions' in c) {
        return proxyMatch([
          [base.expressions, c.expressions],
          [base.quasis, c.quasis]
        ])
      } else {
        return proxyMatch([
          [(base as TsTemplateLiteralType).types, (c as TsTemplateLiteralType).types],
          [(base as TsTemplateLiteralType).quasis, (c as TsTemplateLiteralType).quasis]
        ])
      }
    case 'AssignmentExpression':
      c = candidate as typeof base
      return proxyMatch([
        [base.operator, c.operator],
        [base.left, c.left],
        [base.right, c.right]
      ])
    case 'YieldExpression':
      c = candidate as typeof base
      return base.delegate === c.delegate && isMatch(base.argument, c.argument)
    case 'SuperPropExpression':
      c = candidate as typeof base
      return isMatch(base.obj, c.obj) && isMatch(base.property, c.property)
    case 'TryStatement':
      c = candidate as typeof base
      return isMatch(base.block, c.block) && isMatch(base.handler, c.handler) && isMatch(base.finalizer, c.finalizer)
    case 'WhileStatement':
      c = candidate as typeof base
      return isMatch(base.test, c.test) && isMatch(base.body, c.body)
    case 'CatchClause':
      c = candidate as typeof base
      return isMatch(base.param, c.param) && isMatch(base.body, c.body)
    case 'Super':
    case 'Import':
    case 'EmptyStatement':
    case 'DebuggerStatement':
    case 'BreakStatement':
    case 'JSXEmptyExpression':
    case 'JSXOpeningFragment':
    case 'JSXClosingFragment':
    case 'ThisExpression':
    case 'NullLiteral':
    case 'ContinueStatement':
      // these are always the same
      return true
    case 'WithStatement':
      // we forbid these
      return false
    default:
      console.warn('unknown type found: ', base.type, JSON.stringify(base))
      return false
  }
}
