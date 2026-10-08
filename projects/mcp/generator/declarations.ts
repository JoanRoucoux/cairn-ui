import ts from 'typescript';

import type {
  ConstantExport,
  Declaration,
  FunctionExport,
  Input,
  Member,
  Output,
  Service,
  TypeExport,
} from '../src/manifest.ts';
import { asObject, optional, stringProperty } from './ast.ts';
import type { Report } from './report.ts';
import { constArrayValues, formatSignature, formatType, literalsOf } from './types.ts';

export type EntryExports = {
  declarations: Declaration[];
  services: Service[];
  functions: FunctionExport[];
  constants: ConstantExport[];
  types: TypeExport[];
};

type Docs = { description: string; examples: string[] };

/**
 * Reads the public surface of one entry point from its `index.ts`. A symbol tagged `@internal` is
 * exported for a sibling entry, not for applications, and stays out.
 */
export function readEntryExports(program: ts.Program, indexFile: string, report: Report): EntryExports {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(indexFile);
  const result: EntryExports = { declarations: [], services: [], functions: [], constants: [], types: [] };
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  const exports = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : [];

  if (!exports.length) {
    report(indexFile, 'is missing or exports nothing');
  }

  for (const exported of exports) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const node = symbol.declarations?.[0];
    const name = exported.name;
    const docs = readDocs(checker, symbol);

    if (symbol.getJsDocTags(checker).some((tag) => tag.name === 'internal')) {
      continue;
    } else if (node && ts.isClassDeclaration(node)) {
      readClass(checker, node, name, docs, result, report);
    } else if (node && ts.isFunctionDeclaration(node)) {
      result.functions.push(readFunction(checker, node, name, docs, report));
    } else if (node && ts.isVariableDeclaration(node)) {
      result.constants.push(readConstant(checker, node, name, docs));
    } else if (node && (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node))) {
      result.types.push(readType(checker, node, name, docs));
    } else {
      report(indexFile, `exports ${name}, which the manifest cannot describe`);
    }
  }

  return result;
}

function readClass(
  checker: ts.TypeChecker,
  node: ts.ClassDeclaration,
  name: string,
  docs: Docs,
  result: EntryExports,
  report: Report,
): void {
  const file = node.getSourceFile().fileName;
  const decorator = angularDecorator(node);

  if (!decorator) {
    report(file, `${name} is exported but is neither a component, a directive nor an injectable`);

    return;
  }

  if (!docs.description) {
    report(file, `${name} has no JSDoc description`);
  }

  if (!docs.examples.length) {
    report(file, `${name} has no @example`);
  }

  const { kind, metadata } = decorator;

  if (kind === 'Injectable') {
    result.services.push({
      className: name,
      ...optional('providedIn', stringProperty(metadata, 'providedIn')),
      ...docs,
      members: readMembers(checker, node),
    });

    return;
  }

  const selector = stringProperty(metadata, 'selector');

  if (!selector) {
    report(file, `${name} has no static selector`);
  }

  result.declarations.push({
    kind: kind === 'Component' ? 'component' : 'directive',
    className: name,
    selector: selector ?? '',
    ...optional('exportAs', stringProperty(metadata, 'exportAs')),
    ...docs,
    ...readSignals(checker, node),
    slots: readSlots(stringProperty(metadata, 'template')),
  });
}

const DECORATORS = new Set(['Component', 'Directive', 'Injectable']);

function angularDecorator(
  node: ts.ClassDeclaration,
): { kind: 'Component' | 'Directive' | 'Injectable'; metadata?: ts.ObjectLiteralExpression } | undefined {
  for (const decorator of ts.getDecorators(node) ?? []) {
    const call = decorator.expression;

    if (ts.isCallExpression(call) && DECORATORS.has(call.expression.getText())) {
      return {
        kind: call.expression.getText() as 'Component' | 'Directive' | 'Injectable',
        ...optional('metadata', asObject(call.arguments[0])),
      };
    }
  }

  return undefined;
}

const SIGNAL_FACTORIES = new Set(['input', 'input.required', 'model', 'model.required', 'output']);

function readSignals(checker: ts.TypeChecker, node: ts.ClassDeclaration): { inputs: Input[]; outputs: Output[] } {
  const inputs: Input[] = [];
  const outputs: Output[] = [];

  for (const member of node.members) {
    if (!ts.isPropertyDeclaration(member) || !isPublic(member)) {
      continue;
    }

    const call = member.initializer;

    if (!call || !ts.isCallExpression(call) || !SIGNAL_FACTORIES.has(call.expression.getText())) {
      continue;
    }

    const factory = call.expression.getText();
    const required = factory.endsWith('.required');
    const [first, second] = call.arguments;
    const options = required || factory === 'output' ? first : second;
    const name = stringProperty(asObject(options), 'alias') ?? (member.name as ts.Identifier).text;
    const description = readDocs(checker, checker.getSymbolAtLocation(member.name) as ts.Symbol).description;
    const type = signalValueType(checker, member, call.typeArguments?.[0]);

    if (factory === 'output') {
      outputs.push({ name, type, ...optional('description', description) });
    } else {
      const fallback = required || !first || first.getText() === 'undefined' ? undefined : first.getText();

      inputs.push({
        name,
        type,
        required,
        ...optional('default', fallback),
        twoWay: factory.startsWith('model'),
        ...optional('description', description),
      });
    }
  }

  return { inputs, outputs };
}

/** The `T` of `InputSignal<T>`, `ModelSignal<T>` or `OutputEmitterRef<T>`: what a consumer binds. */
function signalValueType(checker: ts.TypeChecker, member: ts.PropertyDeclaration, typeNode?: ts.TypeNode): string {
  const [value] = checker.getTypeArguments(checker.getTypeAtLocation(member) as ts.TypeReference);

  return formatType(checker, value as ts.Type, member, typeNode);
}

function readMembers(checker: ts.TypeChecker, node: ts.ClassDeclaration): Member[] {
  const members: Member[] = [];

  for (const member of node.members) {
    if (!(ts.isMethodDeclaration(member) || ts.isPropertyDeclaration(member)) || !isPublic(member)) {
      continue;
    }

    const symbol = checker.getSymbolAtLocation(member.name) as ts.Symbol;
    const type = checker.getTypeOfSymbolAtLocation(symbol, member);
    const signature = ts.isMethodDeclaration(member)
      ? `${symbol.name}${formatSignature(checker, checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0] as ts.Signature, member)}`
      : `${symbol.name}: ${formatType(checker, type, member, member.type)}`;

    members.push({ name: symbol.name, signature, ...optional('description', readDocs(checker, symbol).description) });
  }

  return members;
}

function readFunction(
  checker: ts.TypeChecker,
  node: ts.FunctionDeclaration,
  name: string,
  docs: Docs,
  report: Report,
): FunctionExport {
  if (!docs.description) {
    report(node.getSourceFile().fileName, `${name} has no JSDoc description`);
  }

  const signature = checker.getSignatureFromDeclaration(node) as ts.Signature;

  return { name, signature: `${name}${formatSignature(checker, signature, node)}`, ...docs };
}

function readConstant(checker: ts.TypeChecker, node: ts.VariableDeclaration, name: string, docs: Docs): ConstantExport {
  const values = constArrayValues(node.initializer);
  const type = values
    ? `readonly ${typeof values[0] === 'number' ? 'number' : 'string'}[]`
    : formatType(checker, checker.getTypeAtLocation(node), node, node.type);

  return { name, type, ...optional('values', values), ...optional('description', docs.description) };
}

function readType(
  checker: ts.TypeChecker,
  node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration,
  name: string,
  docs: Docs,
): TypeExport {
  const type = ts.isTypeAliasDeclaration(node)
    ? (literalsOf(checker, node.type)?.join(' | ') ?? node.type.getText())
    : `{ ${node.members.map((member) => member.getText()).join(' ')} }`;

  return { name, type, ...optional('description', docs.description) };
}

/** `select` of each `<ng-content>` in an inline template, `*` for the default slot. */
export function readSlots(template: string | undefined): string[] {
  const slots = new Set<string>();

  for (const match of (template ?? '').matchAll(/<ng-content(?:\s+select="([^"]*)")?\s*\/?>/g)) {
    slots.add(match[1] ?? '*');
  }

  return [...slots];
}

function readDocs(checker: ts.TypeChecker, symbol: ts.Symbol): Docs {
  const description = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const examples = symbol
    .getJsDocTags(checker)
    .filter((tag) => tag.name === 'example')
    .map((tag) => ts.displayPartsToString(tag.text).trim())
    .filter(Boolean);

  return { description, examples };
}

function isPublic(member: ts.ClassElement): boolean {
  const flags = ts.getCombinedModifierFlags(member as ts.Declaration);

  return (
    !(flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) &&
    !ts.isPrivateIdentifier(member.name as ts.Node)
  );
}
