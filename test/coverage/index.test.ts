import path from 'path';
// noinspection ES6PreferShortImport
import { getParserForFile } from '../../src/coverage/index.js';
import { CloverParser } from '../../src/coverage/clover-parser.js';
import { CoberturaParser } from '../../src/coverage/cobertura-parser.js';
import { JacocoParser } from '../../src/coverage/jacoco-parser.js';
import { LcovParser } from '../../src/coverage/lcov-parser.js';
import { LlvmCovParser } from '../../src/coverage/llvm-cov-parser.js';

describe('getParserForFile', () => {
  it('should return a clover-parser for a clover.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'clover.xml');
    const parser = await getParserForFile(filePath);
    expect(parser).toBeInstanceOf(CloverParser);
  });

  it('should return a cobertura-parser for a cobertura.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'cobertura.xml');
    const parser = await getParserForFile(filePath);
    expect(parser).toBeInstanceOf(CoberturaParser);
  });

  it('should return a jacoco-parser for a jacoco.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'jacoco.xml');
    const parser = await getParserForFile(filePath);
    expect(parser).toBeInstanceOf(JacocoParser);
  });

  it('should return a lcov-parser for a jacoco.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'lcov.info');
    const parser = await getParserForFile(filePath);
    expect(parser).toBeInstanceOf(LcovParser);
  });

  it('should return a llvm-cov-parser for a llvm-cov.json file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'llvm-cov.json');
    const parser = await getParserForFile(filePath);
    expect(parser).toBeInstanceOf(LlvmCovParser);
  });
});
