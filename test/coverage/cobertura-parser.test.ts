import { promises as fs } from 'fs';
import path from 'path';
import { CoberturaParser } from '../../src/coverage/cobertura-parser.js';

describe('CoberturaParser', () => {
  it('should correctly parse a file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'cobertura.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new CoberturaParser();
    const result = await parser.parse(fileContent);

    expect(result).toEqual({
      overall: {
        lines: {
          total: 370,
          covered: 315,
        },
        branches: {
          total: 0,
          covered: 0,
        },
        methods: {
          total: 0,
          covered: 0,
        },
        statements: {
          total: 370,
          covered: 315,
        },
      },
      details: [
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/api_client.rb',
          lines: {
            total: 139,
            covered: 87,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 139,
            covered: 87,
          },
          uncoveredLines: [
            57, 75, 77, 84, 137, 138, 139, 142, 144, 166, 167, 169, 170, 171,
            172, 173, 175, 177, 178, 179, 182, 183, 184, 187, 188, 189, 190,
            194, 199, 235, 237, 254, 256, 258, 260, 263, 266, 272, 273, 276,
            277, 278, 294, 330, 345, 353, 355, 357, 359, 361, 364, 366,
          ],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/api_error.rb',
          lines: {
            total: 11,
            covered: 11,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 11,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/authenticator.rb',
          lines: {
            total: 20,
            covered: 20,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 20,
            covered: 20,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/client_credentials_authenticator.rb',
          lines: {
            total: 18,
            covered: 18,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 18,
            covered: 18,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/no_auth_authenticator.rb',
          lines: {
            total: 9,
            covered: 9,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 9,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/o_auth_authenticator.rb',
          lines: {
            total: 28,
            covered: 28,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 28,
            covered: 28,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/open_id.rb',
          lines: {
            total: 21,
            covered: 21,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 21,
            covered: 21,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/personal_access_token_authenticator.rb',
          lines: {
            total: 10,
            covered: 10,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 10,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/auth/web_token_authenticator.rb',
          lines: {
            total: 45,
            covered: 43,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 45,
            covered: 43,
          },
          uncoveredLines: [65, 67],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/configuration.rb',
          lines: {
            total: 32,
            covered: 31,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 32,
            covered: 31,
          },
          uncoveredLines: [176],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/utils/url_util.rb',
          lines: {
            total: 9,
            covered: 9,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 9,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/zitadel.rb',
          lines: {
            total: 25,
            covered: 25,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 25,
            covered: 25,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-ruby/lib/zitadel/client/zitadel_error.rb',
          lines: {
            total: 3,
            covered: 3,
          },
          methods: {
            total: 0,
            covered: 0,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 3,
            covered: 3,
          },
          uncoveredLines: [],
        },
      ],
    });
  });
});
