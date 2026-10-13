import ts from 'typescript';

import type { DocsArg, DocsPage } from '../src/manifest.ts';
import { asObject, initializer, objectProperty, propertyName, stringProperty } from './ast.ts';
import { docsUrl, splitDescription } from './markdown.ts';
import type { Report } from './report.ts';

/**
 * Reads the Docs page of a CSF3 stories file: its title, the component description and the
 * description of every `argType`. Returns `undefined` when the meta cannot be read statically.
 */
export function readDocsPage(file: string, source: string, storybookUrl: string, report: Report): DocsPage | undefined {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const meta = findMeta(sourceFile);

  if (!meta) {
    report(file, 'has no default export the generator can read as a story meta');

    return undefined;
  }

  const title = stringProperty(meta, 'title');
  const description = descriptionOf(meta);

  if (!title) {
    report(file, 'has no static title');
  }

  if (description === undefined) {
    report(file, 'has no static parameters.docs.description.component');
  }

  if (!title || description === undefined) {
    return undefined;
  }

  return {
    title,
    url: docsUrl(storybookUrl, title),
    ...splitDescription(description, file, report),
    args: readArgs(objectProperty(meta, 'argTypes'), file, report),
  };
}

function findMeta(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  const exported = sourceFile.statements.find(ts.isExportAssignment)?.expression;

  if (!exported) {
    return undefined;
  }

  if (!ts.isIdentifier(exported)) {
    return asObject(exported);
  }

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (declaration.name.getText() === exported.text && declaration.initializer) {
          return asObject(declaration.initializer);
        }
      }
    }
  }

  return undefined;
}

function descriptionOf(meta: ts.ObjectLiteralExpression): string | undefined {
  const description = objectProperty(objectProperty(objectProperty(meta, 'parameters'), 'docs'), 'description');

  return stringProperty(description, 'component');
}

function readArgs(argTypes: ts.ObjectLiteralExpression | undefined, file: string, report: Report): DocsArg[] {
  const args: DocsArg[] = [];

  for (const property of argTypes?.properties ?? []) {
    const name = propertyName(property);
    const value = ts.isPropertyAssignment(property) ? asObject(property.initializer) : undefined;
    const description = stringProperty(value, 'description');

    if (name && description) {
      args.push({ name, description });
    } else if (!isHidden(value)) {
      report(file, `argType "${name ?? property.getText()}" has no static description`);
    }
  }

  return args;
}

/** `table: { disable: true }` keeps an argType, typically an action, out of the Docs table. */
function isHidden(argType: ts.ObjectLiteralExpression | undefined): boolean {
  return initializer(objectProperty(argType, 'table'), 'disable')?.kind === ts.SyntaxKind.TrueKeyword;
}
