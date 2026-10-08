import ts from 'typescript';

/** Unwraps `{...} satisfies T`, `{...} as T` and parentheses down to an object literal. */
export function asObject(node: ts.Expression | undefined): ts.ObjectLiteralExpression | undefined {
  let current = node;

  while (
    current &&
    (ts.isSatisfiesExpression(current) || ts.isAsExpression(current) || ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }

  return current && ts.isObjectLiteralExpression(current) ? current : undefined;
}

/** The value of a `name: value` property of an object literal. */
export function initializer(object: ts.ObjectLiteralExpression | undefined, name: string): ts.Expression | undefined {
  const property = object?.properties.find(
    (candidate): candidate is ts.PropertyAssignment =>
      ts.isPropertyAssignment(candidate) && propertyName(candidate) === name,
  );

  return property?.initializer;
}

export function objectProperty(
  object: ts.ObjectLiteralExpression | undefined,
  name: string,
): ts.ObjectLiteralExpression | undefined {
  return asObject(initializer(object, name));
}

/** A string literal property of an object literal, `undefined` when absent or computed. */
export function stringProperty(object: ts.ObjectLiteralExpression | undefined, name: string): string | undefined {
  const value = initializer(object, name);

  return value && ts.isStringLiteralLike(value) ? value.text : undefined;
}

/** The key of a property, quoted (`'aria-label'`) or not. */
export function propertyName(property: ts.ObjectLiteralElementLike): string | undefined {
  const name = property.name;

  return name && (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) ? name.text : undefined;
}

/** Spreads `{ [key]: value }` only when the value is set, since the manifest omits absent fields. */
export function optional<K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> {
  return (value === undefined || value === '' ? {} : { [key]: value }) as Partial<Record<K, V>>;
}
