import { promises as fs } from 'fs';
import path from 'path';
import { CloverParser } from '../../src/coverage/clover-parser.js';

describe('CloverParser', () => {
  it('should correctly parse a file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'clover.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new CloverParser();
    const result = await parser.parse(fileContent);

    expect(result).toEqual({
      overall: {
        statements: {
          covered: 225,
          total: 371,
        },
        lines: {
          covered: 225,
          total: 371,
        },
        methods: {
          covered: 54,
          total: 75,
        },
        branches: {
          covered: 0,
          total: 0,
        },
      },
      details: [
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/ApiException.php',
          statements: {
            covered: 6,
            total: 6,
          },
          lines: {
            covered: 6,
            total: 6,
          },
          methods: {
            covered: 4,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/Authenticator.php',
          statements: {
            covered: 2,
            total: 2,
          },
          lines: {
            covered: 2,
            total: 2,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/ClientCredentialsAuthenticator.php',
          statements: {
            covered: 12,
            total: 12,
          },
          lines: {
            covered: 12,
            total: 12,
          },
          methods: {
            covered: 4,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/ClientCredentialsAuthenticatorBuilder.php',
          statements: {
            covered: 7,
            total: 7,
          },
          lines: {
            covered: 7,
            total: 7,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/JwtBearer.php',
          statements: {
            covered: 2,
            total: 2,
          },
          lines: {
            covered: 2,
            total: 2,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/NoAuthAuthenticator.php',
          statements: {
            covered: 2,
            total: 2,
          },
          lines: {
            covered: 2,
            total: 2,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/OAuthAuthenticator.php',
          statements: {
            covered: 14,
            total: 15,
          },
          lines: {
            covered: 14,
            total: 15,
          },
          methods: {
            covered: 2,
            total: 3,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [85],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/OAuthAuthenticatorBuilder.php',
          statements: {
            covered: 3,
            total: 3,
          },
          lines: {
            covered: 3,
            total: 3,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/OpenId.php',
          statements: {
            covered: 20,
            total: 24,
          },
          lines: {
            covered: 20,
            total: 24,
          },
          methods: {
            covered: 5,
            total: 8,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [42, 63, 84, 89],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/PersonalAccessAuthenticator.php',
          statements: {
            covered: 2,
            total: 2,
          },
          lines: {
            covered: 2,
            total: 2,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/WebTokenAuthenticator.php',
          statements: {
            covered: 30,
            total: 33,
          },
          lines: {
            covered: 30,
            total: 33,
          },
          methods: {
            covered: 4,
            total: 5,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [96, 101, 108],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Auth/WebTokenAuthenticatorBuilder.php',
          statements: {
            covered: 20,
            total: 20,
          },
          lines: {
            covered: 20,
            total: 20,
          },
          methods: {
            covered: 5,
            total: 5,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Configuration.php',
          statements: {
            covered: 18,
            total: 24,
          },
          lines: {
            covered: 18,
            total: 24,
          },
          methods: {
            covered: 13,
            total: 16,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [66, 68, 69, 72, 83, 85, 224, 226, 227],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/ObjectSerializer.php',
          statements: {
            covered: 67,
            total: 199,
          },
          lines: {
            covered: 67,
            total: 199,
          },
          methods: {
            covered: 1,
            total: 14,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [
            32, 34, 55, 60, 76, 77, 78, 79, 88, 89, 94, 126, 128, 162, 169, 170,
            173, 174, 179, 180, 183, 184, 186, 187, 189, 191, 193, 196, 199,
            202, 203, 206, 207, 210, 211, 215, 217, 232, 240, 241, 242, 243,
            244, 245, 246, 257, 259, 260, 263, 277, 279, 282, 284, 285, 286,
            287, 288, 289, 302, 304, 305, 306, 309, 322, 324, 325, 327, 347,
            354, 366, 367, 368, 369, 370, 371, 372, 373, 374, 377, 381, 382,
            384, 385, 398, 402, 405, 410, 416, 417, 418, 420, 422, 425, 426,
            427, 429, 431, 443, 444, 451, 457, 458, 459, 469, 474, 495, 497,
            498, 501, 513, 515, 516, 518, 543, 544, 545, 546, 547, 548, 550,
            553, 554, 555, 557, 558, 559, 560, 561, 562, 563, 564, 566, 568,
            569, 570, 571, 572, 574, 579,
          ],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Version.php',
          statements: {
            covered: 0,
            total: 0,
          },
          lines: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 0,
            total: 0,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/Zitadel.php',
          statements: {
            covered: 20,
            total: 20,
          },
          lines: {
            covered: 20,
            total: 20,
          },
          methods: {
            covered: 4,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
        {
          file: '/Users/mridang/Code/zitadel/client-php/lib/ZitadelException.php',
          statements: {
            covered: 0,
            total: 0,
          },
          lines: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 0,
            total: 0,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          uncoveredLines: [],
        },
      ],
    });
  });
});
