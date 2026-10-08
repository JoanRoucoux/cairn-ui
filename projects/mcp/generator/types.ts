import ts from 'typescript';

const PRINT_FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

/**
 * Prints a type the way a consumer writes it. When the source names it (`input<ButtonVariant>()`)
 * and it is a union of literals, the literals are spelled out in declaration order:
 * `'primary' | 'outline'` tells a reader which values exist, `ButtonVariant` sends them looking.
 */
export function formatType(checker: ts.TypeChecker, type: ts.Type, node: ts.Node, typeNode?: ts.TypeNode): string {
  const literals = typeNode && literalsOf(checker, typeNode);

  return literals ? literals.join(' | ') : clean(checker.typeToString(type, node, PRINT_FLAGS));
}

export function formatSignature(checker: ts.TypeChecker, signature: ts.Signature, node: ts.Node): string {
  return clean(checker.signatureToString(signature, node, PRINT_FLAGS));
}

/**
 * The literals a type node stands for, in source order, following aliases and `(typeof X)[number]`
 * over an `as const` array. `undefined` as soon as one member is not a literal.
 */
export function literalsOf(checker: ts.TypeChecker, node: ts.TypeNode): string[] | undefined {
  if (ts.isParenthesizedTypeNode(node)) {
    return literalsOf(checker, node.type);
  }

  if (ts.isLiteralTypeNode(node) || node.kind === ts.SyntaxKind.UndefinedKeyword) {
    return [node.getText()];
  }

  if (ts.isUnionTypeNode(node)) {
    const members = node.types.map((member) => literalsOf(checker, member));

    return members.every(Boolean) ? (members as string[][]).flat() : undefined;
  }

  if (ts.isTypeReferenceNode(node)) {
    const alias = resolve(checker, node.typeName)?.declarations?.find(ts.isTypeAliasDeclaration);

    return alias && literalsOf(checker, alias.type);
  }

  if (ts.isIndexedAccessTypeNode(node) && ts.isParenthesizedTypeNode(node.objectType)) {
    const query = node.objectType.type;
    const constant = ts.isTypeQueryNode(query) ? resolve(checker, query.exprName)?.valueDeclaration : undefined;
    const values = constant && ts.isVariableDeclaration(constant) ? constArrayValues(constant.initializer) : undefined;

    return values?.map((value) => (typeof value === 'string' ? `'${value}'` : String(value)));
  }

  return undefined;
}

/** Members of `[...] as const` when every one is a string or number literal. */
export function constArrayValues(initializer: ts.Expression | undefined): (string | number)[] | undefined {
  if (!initializer || !ts.isAsExpression(initializer) || !ts.isArrayLiteralExpression(initializer.expression)) {
    return undefined;
  }

  const values = initializer.expression.elements.map((element) =>
    ts.isStringLiteral(element) ? element.text : ts.isNumericLiteral(element) ? Number(element.text) : undefined,
  );

  return values.length && values.every((value) => value !== undefined) ? (values as (string | number)[]) : undefined;
}

function resolve(checker: ts.TypeChecker, name: ts.EntityName): ts.Symbol | undefined {
  const symbol = checker.getSymbolAtLocation(name);

  return symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

/** Drops the `import("...").` qualifier the checker adds to a type the file never imported. */
function clean(text: string): string {
  return text.replace(/import\("[^"]*"\)\./g, '');
}
