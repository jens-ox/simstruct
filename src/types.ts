import {
  ArrowFunctionExpression,
  AssignmentPatternProperty,
  AssignmentProperty,
  BlockStatement,
  CatchClause,
  ClassMember,
  ComputedPropName,
  DebuggerStatement,
  Decorator,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  GetterProperty,
  Import,
  JSXAttribute,
  JSXClosingElement,
  JSXClosingFragment,
  JSXElementChild,
  JSXOpeningElement,
  JSXOpeningFragment,
  KeyValuePatternProperty,
  KeyValueProperty,
  LabeledStatement,
  MethodProperty,
  ModuleItem,
  Param,
  Pattern,
  ReturnStatement,
  SetterProperty,
  SpreadElement,
  Statement,
  Super,
  SwitchCase,
  TemplateElement,
  TsExpressionWithTypeArguments,
  TsInterfaceBody,
  TsInterfaceDeclaration,
  TsNamespaceBody,
  TsParameterProperty,
  TsQualifiedName,
  TsTemplateLiteralType,
  TsType,
  TsTypeAnnotation,
  TsTypeElement,
  TsTypeParameter,
  TsTypeParameterDeclaration,
  TsTypeParameterInstantiation,
  VariableDeclaration,
  VariableDeclarator,
  WithStatement
} from '@swc/core'

/**
 * Generic type of all comparable statements
 */
export type Comparable =
  | ArrowFunctionExpression
  | Expression
  | TemplateElement
  | VariableDeclaration
  | VariableDeclarator
  | Super
  | Import
  | TsInterfaceDeclaration
  | TsInterfaceBody
  | TsTypeElement
  | TsTypeAnnotation
  | TsType
  | TsQualifiedName
  | TsTypeParameterInstantiation
  | ExpressionStatement
  | BlockStatement
  | EmptyStatement
  | DebuggerStatement
  | WithStatement
  | ReturnStatement
  | LabeledStatement
  | Statement
  | SpreadElement
  | KeyValueProperty
  | ComputedPropName
  | AssignmentProperty
  | GetterProperty
  | SetterProperty
  | MethodProperty
  | Pattern
  | KeyValuePatternProperty
  | AssignmentPatternProperty
  | JSXOpeningElement
  | JSXClosingElement
  | JSXOpeningFragment
  | JSXClosingFragment
  | JSXElementChild
  | JSXAttribute
  | CatchClause
  | TsTypeParameterDeclaration
  | TsTemplateLiteralType
  | TsExpressionWithTypeArguments
  | TsNamespaceBody
  | TsParameterProperty
  | Param
  | SwitchCase
  | ClassMember
  | Decorator
  | ModuleItem
  | TsTypeParameter

export type Candidate = {
  file: string
  item: Comparable
}

export interface File {
  name: string
  content: string
}

export type Duplication = {
  file: string
  start: number
  end: number
}

export type DuplicationMatrix = Duplication[][]

export interface Options {
  checkNames?: boolean
}
