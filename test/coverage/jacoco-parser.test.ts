import { promises as fs } from 'fs';
import path from 'path';
import { JacocoParser } from '../../src/coverage/jacoco-parser.js';

describe('JacocoParser', () => {
  it('should correctly parse a file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'jacoco.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new JacocoParser();
    const result = await parser.parse(fileContent);

    expect(result).toEqual({
      overall: {
        lines: {
          covered: 328,
          total: 519,
        },
        branches: {
          covered: 88,
          total: 218,
        },
        methods: {
          covered: 81,
          total: 110,
        },
        statements: {
          covered: 1432,
          total: 2278,
        },
      },
      details: [
        {
          file: 'com/zitadel/utils/URLUtil.java',
          lines: {
            covered: 3,
            total: 5,
          },
          branches: {
            covered: 4,
            total: 4,
          },
          methods: {
            covered: 1,
            total: 1,
          },
          statements: {
            covered: 16,
            total: 22,
          },
          uncoveredLines: [19, 20],
        },
        {
          file: 'com/zitadel/utils/KeyUtil.java',
          lines: {
            covered: 11,
            total: 11,
          },
          branches: {
            covered: 1,
            total: 2,
          },
          methods: {
            covered: 1,
            total: 1,
          },
          statements: {
            covered: 48,
            total: 48,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/utils/StringUtil.java',
          lines: {
            covered: 0,
            total: 8,
          },
          branches: {
            covered: 0,
            total: 4,
          },
          methods: {
            covered: 0,
            total: 1,
          },
          statements: {
            covered: 0,
            total: 35,
          },
          uncoveredLines: [20, 21, 22, 25, 26, 27, 28, 30],
        },
        {
          file: 'com/zitadel/Zitadel.java',
          lines: {
            covered: 22,
            total: 22,
          },
          branches: {
            covered: 1,
            total: 2,
          },
          methods: {
            covered: 6,
            total: 6,
          },
          statements: {
            covered: 116,
            total: 116,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/Configuration.java',
          lines: {
            covered: 0,
            total: 5,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 0,
            total: 4,
          },
          statements: {
            covered: 0,
            total: 13,
          },
          uncoveredLines: [3, 5, 14, 25, 26],
        },
        {
          file: 'com/zitadel/RFC3339DateFormat.java',
          lines: {
            covered: 7,
            total: 11,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 2,
            total: 6,
          },
          statements: {
            covered: 26,
            total: 50,
          },
          uncoveredLines: [27, 32, 37, 43],
        },
        {
          file: 'com/zitadel/Pair.java',
          lines: {
            covered: 15,
            total: 17,
          },
          branches: {
            covered: 3,
            total: 6,
          },
          methods: {
            covered: 6,
            total: 6,
          },
          statements: {
            covered: 41,
            total: 45,
          },
          uncoveredLines: [18, 30],
        },
        {
          file: 'com/zitadel/BaseApi.java',
          lines: {
            covered: 3,
            total: 13,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 1,
            total: 7,
          },
          statements: {
            covered: 6,
            total: 58,
          },
          uncoveredLines: [27, 28, 42, 43, 56, 57, 73, 74, 89, 106],
        },
        {
          file: 'com/zitadel/ApiClient.java',
          lines: {
            covered: 124,
            total: 261,
          },
          branches: {
            covered: 61,
            total: 172,
          },
          methods: {
            covered: 21,
            total: 32,
          },
          statements: {
            covered: 612,
            total: 1239,
          },
          uncoveredLines: [
            87, 88, 106, 107, 118, 119, 131, 142, 143, 153, 164, 165, 175, 186,
            188, 190, 192, 193, 194, 195, 197, 198, 199, 217, 235, 236, 237,
            239, 240, 241, 242, 243, 245, 246, 247, 248, 249, 250, 251, 254,
            255, 256, 257, 258, 260, 262, 288, 295, 315, 327, 328, 359, 360,
            373, 392, 393, 395, 396, 397, 398, 399, 400, 401, 402, 404, 405,
            406, 407, 408, 409, 410, 411, 412, 415, 416, 417, 418, 419, 420,
            421, 422, 423, 425, 426, 427, 428, 430, 448, 453, 455, 462, 466,
            467, 469, 479, 481, 482, 483, 484, 485, 490, 491, 492, 493, 494,
            498, 499, 500, 501, 503, 504, 505, 507, 508, 510, 513, 514, 554,
            563, 564, 565, 566, 567, 568, 570, 572, 573, 575, 579, 580, 599,
            650, 662, 663, 682, 690, 691,
          ],
        },
        {
          file: 'com/zitadel/Version.java',
          lines: {
            covered: 0,
            total: 1,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 0,
            total: 1,
          },
          statements: {
            covered: 0,
            total: 3,
          },
          uncoveredLines: [3],
        },
        {
          file: 'com/zitadel/ApiException.java',
          lines: {
            covered: 8,
            total: 8,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 4,
            total: 4,
          },
          statements: {
            covered: 24,
            total: 24,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/ZitadelException.java',
          lines: {
            covered: 2,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 1,
            total: 2,
          },
          statements: {
            covered: 4,
            total: 9,
          },
          uncoveredLines: [12, 13],
        },
        {
          file: 'com/zitadel/auth/PersonalAccessTokenAuthenticator.java',
          lines: {
            covered: 4,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          statements: {
            covered: 14,
            total: 14,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/auth/OpenId.java',
          lines: {
            covered: 22,
            total: 28,
          },
          branches: {
            covered: 7,
            total: 10,
          },
          methods: {
            covered: 4,
            total: 4,
          },
          statements: {
            covered: 92,
            total: 113,
          },
          uncoveredLines: [30, 43, 44, 57, 62, 63],
        },
        {
          file: 'com/zitadel/auth/Authenticator.java',
          lines: {
            covered: 4,
            total: 4,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 2,
            total: 2,
          },
          statements: {
            covered: 10,
            total: 10,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/auth/OAuthAuthenticator.java',
          lines: {
            covered: 35,
            total: 38,
          },
          branches: {
            covered: 6,
            total: 8,
          },
          methods: {
            covered: 8,
            total: 8,
          },
          statements: {
            covered: 127,
            total: 140,
          },
          uncoveredLines: [57, 102, 103],
        },
        {
          file: 'com/zitadel/auth/NoAuthAuthenticator.java',
          lines: {
            covered: 5,
            total: 5,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 3,
            total: 3,
          },
          statements: {
            covered: 11,
            total: 11,
          },
          uncoveredLines: [],
        },
        {
          file: 'com/zitadel/auth/WebTokenAuthenticator.java',
          lines: {
            covered: 50,
            total: 61,
          },
          branches: {
            covered: 5,
            total: 10,
          },
          methods: {
            covered: 13,
            total: 14,
          },
          statements: {
            covered: 221,
            total: 264,
          },
          uncoveredLines: [94, 95, 96, 100, 107, 113, 114, 115, 147, 175, 176],
        },
        {
          file: 'com/zitadel/auth/ClientCredentialsAuthenticator.java',
          lines: {
            covered: 13,
            total: 13,
          },
          branches: {
            covered: 0,
            total: 0,
          },
          methods: {
            covered: 6,
            total: 6,
          },
          statements: {
            covered: 64,
            total: 64,
          },
          uncoveredLines: [],
        },
      ],
    });
  });
});
