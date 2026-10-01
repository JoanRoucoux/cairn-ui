import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const libDir = join(dirname(expect.getState().testPath ?? ''), 'lib');

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return sources(path);
    }
    return /\.(ts|html)$/.test(entry.name) && !/\.(spec|stories)\.ts$/.test(entry.name) && !/fixtures/.test(entry.name)
      ? [path]
      : [];
  });

const NOT_A_CLASS = /(ui-[a-z-]+-|--ramp-)$/;

describe('Tailwind class literals', () => {
  it('never glue a class token to an interpolation, which the scanner of a consumer build cannot see', () => {
    const offenders = sources(libDir).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          [...line.matchAll(/[A-Za-z0-9\])%-]\$\{/g)]
            .filter((match) => !NOT_A_CLASS.test(line.slice(0, match.index + 1)))
            .map(() => `${file.slice(libDir.length + 1)}:${index + 1}: ${line.trim()}`),
        ),
    );

    expect(offenders).toEqual([]);
  });
});
