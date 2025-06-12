import { promises as fs } from 'fs';
import path from 'path';
import { LcovParser } from '../../src/coverage/lcov-parser.js';

describe('LcovParser', () => {
  it('should correctly parse a file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'lcov.info');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new LcovParser();
    const result = await parser.parse(fileContent);

    expect(result).toEqual({
      overall: {
        lines: {
          total: 4999,
          covered: 531,
        },
        statements: {
          total: 4999,
          covered: 531,
        },
        methods: {
          total: 2186,
          covered: 200,
        },
        branches: {
          total: 3756,
          covered: 209,
        },
      },
      details: [
        {
          file: 'src/api-exception.ts',
          lines: {
            total: 6,
            covered: 6,
          },
          methods: {
            total: 4,
            covered: 4,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 6,
            covered: 6,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/configuration.ts',
          lines: {
            total: 6,
            covered: 6,
          },
          methods: {
            total: 5,
            covered: 5,
          },
          branches: {
            total: 4,
            covered: 3,
          },
          statements: {
            total: 6,
            covered: 6,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/index.ts',
          lines: {
            total: 18,
            covered: 17,
          },
          methods: {
            total: 4,
            covered: 4,
          },
          branches: {
            total: 2,
            covered: 1,
          },
          statements: {
            total: 18,
            covered: 17,
          },
          uncoveredLines: [46],
        },
        {
          file: 'src/runtime.ts',
          lines: {
            total: 68,
            covered: 37,
          },
          methods: {
            total: 22,
            covered: 11,
          },
          branches: {
            total: 38,
            covered: 19,
          },
          statements: {
            total: 68,
            covered: 37,
          },
          uncoveredLines: [
            49, 70, 110, 131, 132, 133, 138, 154, 157, 160, 165, 168, 171, 225,
            226, 227, 245, 246, 247, 248, 250, 252, 253, 254, 256, 257, 260,
            261, 263, 267, 268,
          ],
        },
        {
          file: 'src/version.ts',
          lines: {
            total: 1,
            covered: 1,
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
            total: 1,
            covered: 1,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/zitadel-exception.ts',
          lines: {
            total: 4,
            covered: 4,
          },
          methods: {
            total: 2,
            covered: 2,
          },
          branches: {
            total: 1,
            covered: 1,
          },
          statements: {
            total: 4,
            covered: 4,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/apis/ActionServiceApi.ts',
          lines: {
            total: 137,
            covered: 1,
          },
          methods: {
            total: 30,
            covered: 0,
          },
          branches: {
            total: 52,
            covered: 0,
          },
          statements: {
            total: 137,
            covered: 1,
          },
          uncoveredLines: [
            109, 110, 116, 118, 120, 122, 123, 124, 126, 127, 130, 138, 146,
            147, 155, 156, 162, 164, 166, 167, 168, 170, 171, 174, 181, 189,
            190, 198, 199, 205, 207, 209, 210, 211, 213, 214, 217, 224, 232,
            233, 241, 243, 245, 246, 247, 249, 250, 253, 260, 268, 269, 277,
            279, 281, 282, 283, 285, 286, 289, 296, 304, 305, 313, 315, 317,
            318, 319, 321, 322, 325, 332, 340, 341, 349, 351, 352, 355, 356,
            359, 360, 363, 364, 367, 369, 370, 371, 373, 374, 377, 384, 392,
            393, 401, 402, 408, 410, 412, 414, 415, 416, 418, 419, 422, 430,
            438, 439, 447, 448, 454, 456, 458, 460, 461, 462, 464, 465, 468,
            476, 484, 485, 493, 494, 500, 501, 507, 509, 511, 513, 514, 515,
            517, 518, 521, 529, 537, 538,
          ],
        },
        {
          file: 'src/apis/FeatureServiceApi.ts',
          lines: {
            total: 156,
            covered: 0,
          },
          methods: {
            total: 36,
            covered: 0,
          },
          branches: {
            total: 60,
            covered: 0,
          },
          statements: {
            total: 156,
            covered: 0,
          },
          uncoveredLines: [
            115, 117, 118, 121, 123, 124, 125, 127, 128, 131, 138, 146, 147,
            155, 156, 162, 164, 165, 168, 170, 171, 172, 174, 175, 178, 185,
            193, 194, 202, 204, 206, 207, 208, 210, 211, 214, 221, 229, 230,
            238, 239, 245, 247, 248, 251, 253, 254, 255, 257, 258, 261, 268,
            276, 277, 285, 287, 289, 290, 291, 293, 294, 297, 304, 312, 313,
            321, 322, 328, 330, 332, 333, 334, 336, 337, 340, 347, 355, 356,
            364, 366, 368, 369, 370, 372, 373, 376, 383, 391, 392, 400, 401,
            407, 409, 411, 412, 413, 415, 416, 419, 426, 434, 435, 443, 444,
            450, 452, 454, 456, 457, 458, 460, 461, 464, 472, 480, 481, 489,
            490, 496, 498, 500, 501, 502, 504, 505, 508, 515, 523, 524, 532,
            533, 539, 541, 543, 545, 546, 547, 549, 550, 553, 561, 569, 570,
            578, 579, 585, 587, 589, 590, 591, 593, 594, 597, 604, 612, 613,
          ],
        },
        {
          file: 'src/apis/IdentityProviderServiceApi.ts',
          lines: {
            total: 13,
            covered: 0,
          },
          methods: {
            total: 3,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 13,
            covered: 0,
          },
          uncoveredLines: [42, 43, 49, 51, 53, 54, 55, 57, 58, 61, 68, 76, 77],
        },
        {
          file: 'src/apis/OIDCServiceApi.ts',
          lines: {
            total: 58,
            covered: 0,
          },
          methods: {
            total: 11,
            covered: 0,
          },
          branches: {
            total: 22,
            covered: 0,
          },
          statements: {
            total: 58,
            covered: 0,
          },
          uncoveredLines: [
            68, 69, 75, 76, 82, 84, 86, 88, 89, 90, 92, 93, 96, 104, 112, 113,
            121, 122, 128, 129, 135, 137, 139, 141, 142, 143, 145, 146, 149,
            157, 165, 166, 174, 175, 181, 183, 185, 186, 187, 189, 190, 193,
            200, 208, 209, 217, 218, 224, 226, 228, 229, 230, 232, 233, 236,
            243, 251, 252,
          ],
        },
        {
          file: 'src/apis/OrganizationServiceApi.ts',
          lines: {
            total: 28,
            covered: 0,
          },
          methods: {
            total: 6,
            covered: 0,
          },
          branches: {
            total: 10,
            covered: 0,
          },
          statements: {
            total: 28,
            covered: 0,
          },
          uncoveredLines: [
            55, 56, 62, 64, 66, 68, 69, 70, 72, 73, 76, 84, 92, 93, 101, 102,
            108, 110, 112, 114, 115, 116, 118, 119, 122, 130, 138, 139,
          ],
        },
        {
          file: 'src/apis/SAMLServiceApi.ts',
          lines: {
            total: 29,
            covered: 0,
          },
          methods: {
            total: 6,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 29,
            covered: 0,
          },
          uncoveredLines: [
            53, 54, 60, 61, 67, 69, 71, 73, 74, 75, 77, 78, 81, 89, 97, 98, 106,
            107, 113, 115, 117, 118, 119, 121, 122, 125, 132, 140, 141,
          ],
        },
        {
          file: 'src/apis/SessionServiceApi.ts',
          lines: {
            total: 75,
            covered: 67,
          },
          methods: {
            total: 15,
            covered: 15,
          },
          branches: {
            total: 28,
            covered: 20,
          },
          statements: {
            total: 75,
            covered: 67,
          },
          uncoveredLines: [86, 132, 139, 185, 194, 232, 278, 285],
        },
        {
          file: 'src/apis/SettingsServiceApi.ts',
          lines: {
            total: 164,
            covered: 11,
          },
          methods: {
            total: 33,
            covered: 3,
          },
          branches: {
            total: 73,
            covered: 4,
          },
          statements: {
            total: 164,
            covered: 11,
          },
          uncoveredLines: [
            119, 121, 122, 125, 126, 129, 130, 133, 134, 137, 138, 141, 142,
            145, 147, 148, 149, 151, 152, 155, 162, 170, 171, 179, 181, 182,
            185, 186, 189, 191, 192, 193, 195, 196, 199, 206, 214, 215, 223,
            225, 226, 229, 230, 233, 235, 236, 237, 239, 240, 243, 250, 258,
            259, 303, 305, 306, 309, 310, 313, 315, 316, 317, 319, 320, 323,
            330, 338, 339, 347, 349, 350, 353, 354, 357, 359, 360, 361, 363,
            364, 367, 374, 382, 383, 391, 393, 394, 397, 398, 401, 403, 404,
            405, 407, 408, 411, 418, 426, 427, 435, 437, 438, 441, 442, 445,
            447, 448, 449, 451, 452, 455, 462, 470, 471, 479, 481, 482, 485,
            486, 489, 491, 492, 493, 495, 496, 499, 506, 514, 515, 523, 525,
            527, 528, 529, 531, 532, 535, 542, 550, 551, 559, 560, 566, 568,
            570, 572, 573, 574, 576, 577, 580, 588, 596, 597,
          ],
        },
        {
          file: 'src/apis/UserServiceApi.ts',
          lines: {
            total: 673,
            covered: 66,
          },
          methods: {
            total: 135,
            covered: 15,
          },
          branches: {
            total: 256,
            covered: 20,
          },
          statements: {
            total: 673,
            covered: 66,
          },
          uncoveredLines: [
            454, 499, 500, 506, 507, 513, 515, 517, 519, 520, 521, 523, 524,
            527, 535, 543, 544, 552, 553, 559, 561, 563, 564, 565, 567, 568,
            571, 578, 586, 587, 595, 596, 602, 604, 606, 607, 608, 610, 611,
            614, 621, 629, 630, 638, 639, 645, 646, 652, 654, 656, 658, 659,
            660, 662, 663, 666, 674, 682, 683, 691, 692, 698, 699, 705, 707,
            709, 711, 712, 713, 715, 716, 719, 727, 735, 736, 744, 745, 751,
            753, 755, 756, 757, 759, 760, 763, 770, 778, 779, 788, 831, 873,
            874, 880, 882, 884, 885, 886, 888, 889, 892, 899, 907, 908, 914,
            915, 921, 923, 924, 927, 928, 931, 933, 934, 935, 937, 938, 941,
            948, 954, 955, 963, 964, 970, 972, 973, 976, 977, 980, 982, 983,
            984, 986, 987, 990, 997, 1005, 1006, 1014, 1015, 1021, 1022, 1028,
            1030, 1032, 1034, 1035, 1036, 1038, 1039, 1042, 1050, 1058, 1059,
            1067, 1068, 1074, 1076, 1078, 1079, 1080, 1082, 1083, 1086, 1093,
            1101, 1102, 1111, 1156, 1157, 1163, 1165, 1167, 1168, 1169, 1171,
            1172, 1175, 1182, 1190, 1191, 1199, 1200, 1206, 1207, 1213, 1215,
            1217, 1219, 1220, 1221, 1223, 1224, 1227, 1235, 1243, 1244, 1252,
            1253, 1259, 1261, 1263, 1264, 1265, 1267, 1268, 1271, 1278, 1286,
            1287, 1295, 1296, 1302, 1303, 1309, 1311, 1313, 1315, 1316, 1317,
            1319, 1320, 1323, 1331, 1339, 1340, 1348, 1349, 1355, 1357, 1359,
            1360, 1361, 1363, 1364, 1367, 1374, 1382, 1383, 1391, 1392, 1398,
            1399, 1405, 1407, 1409, 1411, 1412, 1413, 1415, 1416, 1419, 1427,
            1435, 1436, 1444, 1445, 1451, 1452, 1458, 1459, 1465, 1467, 1469,
            1470, 1471, 1473, 1474, 1477, 1484, 1492, 1493, 1501, 1502, 1508,
            1510, 1512, 1513, 1514, 1516, 1517, 1520, 1527, 1535, 1536, 1544,
            1545, 1551, 1553, 1555, 1556, 1557, 1559, 1560, 1563, 1570, 1578,
            1579, 1587, 1588, 1594, 1595, 1601, 1603, 1605, 1606, 1607, 1609,
            1610, 1613, 1620, 1628, 1629, 1637, 1638, 1644, 1646, 1648, 1649,
            1650, 1652, 1653, 1656, 1663, 1671, 1672, 1680, 1681, 1687, 1689,
            1691, 1692, 1693, 1695, 1696, 1699, 1706, 1714, 1715, 1723, 1724,
            1730, 1731, 1737, 1739, 1741, 1742, 1743, 1745, 1746, 1749, 1756,
            1764, 1765, 1773, 1774, 1780, 1781, 1787, 1789, 1791, 1793, 1794,
            1795, 1797, 1798, 1801, 1809, 1817, 1818, 1826, 1827, 1833, 1835,
            1837, 1838, 1839, 1841, 1842, 1845, 1852, 1860, 1861, 1869, 1870,
            1876, 1877, 1883, 1885, 1887, 1889, 1890, 1891, 1893, 1894, 1897,
            1905, 1913, 1914, 1922, 1923, 1929, 1930, 1936, 1938, 1940, 1942,
            1943, 1944, 1946, 1947, 1950, 1958, 1966, 1967, 1975, 1976, 1982,
            1983, 1989, 1991, 1993, 1995, 1996, 1997, 1999, 2000, 2003, 2011,
            2019, 2020, 2028, 2029, 2035, 2036, 2042, 2044, 2046, 2048, 2049,
            2050, 2052, 2053, 2056, 2064, 2072, 2073, 2081, 2082, 2088, 2089,
            2095, 2097, 2099, 2101, 2102, 2103, 2105, 2106, 2109, 2117, 2125,
            2126, 2134, 2135, 2141, 2142, 2148, 2150, 2152, 2154, 2155, 2156,
            2158, 2159, 2162, 2170, 2178, 2179, 2187, 2188, 2194, 2196, 2198,
            2200, 2201, 2202, 2204, 2205, 2208, 2216, 2224, 2225, 2233, 2234,
            2240, 2242, 2244, 2245, 2246, 2248, 2249, 2252, 2259, 2267, 2268,
            2277, 2284, 2329, 2330, 2336, 2337, 2343, 2345, 2347, 2349, 2350,
            2351, 2353, 2354, 2357, 2365, 2373, 2374, 2382, 2383, 2389, 2390,
            2396, 2398, 2400, 2402, 2403, 2404, 2406, 2407, 2410, 2418, 2426,
            2427, 2435, 2436, 2442, 2443, 2449, 2450, 2456, 2458, 2460, 2462,
            2463, 2464, 2466, 2467, 2470, 2478, 2486, 2487, 2495, 2496, 2502,
            2503, 2509, 2511, 2513, 2515, 2516, 2517, 2519, 2520, 2523, 2531,
            2539, 2540, 2548, 2549, 2555, 2556, 2562, 2564, 2566, 2568, 2569,
            2570, 2572, 2573, 2576, 2584, 2592, 2593, 2601, 2602, 2608, 2609,
            2615, 2616, 2622, 2624, 2626, 2628, 2629, 2630, 2632, 2633, 2636,
            2644, 2652, 2653,
          ],
        },
        {
          file: 'src/apis/WebKeyServiceApi.ts',
          lines: {
            total: 51,
            covered: 0,
          },
          methods: {
            total: 12,
            covered: 0,
          },
          branches: {
            total: 19,
            covered: 0,
          },
          statements: {
            total: 51,
            covered: 0,
          },
          uncoveredLines: [
            62, 63, 69, 71, 73, 74, 75, 77, 78, 81, 88, 96, 97, 105, 106, 112,
            114, 116, 118, 119, 120, 122, 123, 126, 134, 142, 143, 151, 152,
            158, 160, 162, 163, 164, 166, 167, 170, 177, 185, 186, 194, 196,
            198, 199, 200, 202, 203, 206, 213, 221, 222,
          ],
        },
        {
          file: 'src/auth/authenticator.ts',
          lines: {
            total: 2,
            covered: 2,
          },
          methods: {
            total: 2,
            covered: 2,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 2,
            covered: 2,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/client-credentials-authenticator-builder.ts',
          lines: {
            total: 5,
            covered: 5,
          },
          methods: {
            total: 2,
            covered: 2,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 5,
            covered: 5,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/client-credentials-authenticator.ts',
          lines: {
            total: 8,
            covered: 8,
          },
          methods: {
            total: 3,
            covered: 3,
          },
          branches: {
            total: 1,
            covered: 0,
          },
          statements: {
            total: 8,
            covered: 8,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/noauth-authenticator.ts',
          lines: {
            total: 2,
            covered: 2,
          },
          methods: {
            total: 2,
            covered: 2,
          },
          branches: {
            total: 1,
            covered: 1,
          },
          statements: {
            total: 2,
            covered: 2,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/oauth-authenticator-builder.ts',
          lines: {
            total: 6,
            covered: 6,
          },
          methods: {
            total: 3,
            covered: 3,
          },
          branches: {
            total: 3,
            covered: 2,
          },
          statements: {
            total: 6,
            covered: 6,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/oauth-authenticator.ts',
          lines: {
            total: 18,
            covered: 17,
          },
          methods: {
            total: 3,
            covered: 3,
          },
          branches: {
            total: 7,
            covered: 5,
          },
          statements: {
            total: 18,
            covered: 17,
          },
          uncoveredLines: [51],
        },
        {
          file: 'src/auth/openid.ts',
          lines: {
            total: 28,
            covered: 15,
          },
          methods: {
            total: 9,
            covered: 6,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 28,
            covered: 15,
          },
          uncoveredLines: [
            23, 47, 56, 73, 96, 97, 99, 111, 112, 116, 129, 130, 132,
          ],
        },
        {
          file: 'src/auth/personal-access-authenticator.ts',
          lines: {
            total: 3,
            covered: 3,
          },
          methods: {
            total: 2,
            covered: 2,
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
        {
          file: 'src/auth/webtoken-authenticator-builder.ts',
          lines: {
            total: 15,
            covered: 15,
          },
          methods: {
            total: 5,
            covered: 5,
          },
          branches: {
            total: 0,
            covered: 0,
          },
          statements: {
            total: 15,
            covered: 15,
          },
          uncoveredLines: [],
        },
        {
          file: 'src/auth/webtoken-authenticator.ts',
          lines: {
            total: 47,
            covered: 42,
          },
          methods: {
            total: 6,
            covered: 6,
          },
          branches: {
            total: 17,
            covered: 12,
          },
          statements: {
            total: 47,
            covered: 42,
          },
          uncoveredLines: [82, 131, 133, 137, 232],
        },
        {
          file: 'src/models/ActionServiceBetaCondition.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [81, 85, 89, 90, 92, 102, 106, 107, 110],
        },
        {
          file: 'src/models/ActionServiceBetaCreateTargetResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/ActionServiceBetaDeleteTargetResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [36, 40, 44, 45, 47, 54, 58, 59, 62],
        },
        {
          file: 'src/models/ActionServiceBetaEventExecution.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/ActionServiceBetaExecution.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [60, 64, 68, 69, 71, 81, 85, 86, 89],
        },
        {
          file: 'src/models/ActionServiceBetaFunctionExecution.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaGetTargetResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/ActionServiceBetaInTargetIDsFilter.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaListExecutionFunctionsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaListExecutionMethodsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaListExecutionServicesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaListExecutionsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/ActionServiceBetaListTargetsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/ActionServiceBetaPaginationRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [50, 54, 58, 59, 61, 70, 74, 75, 78],
        },
        {
          file: 'src/models/ActionServiceBetaPaginationResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/ActionServiceBetaRESTCall.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaRESTWebhook.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaRequestExecution.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/ActionServiceBetaResponseExecution.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/ActionServiceBetaSetExecutionResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/ActionServiceBetaTarget.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 27,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [104, 108, 112, 113, 115, 131, 135, 136, 139],
        },
        {
          file: 'src/models/ActionServiceBetaTargetFieldName.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [36, 37, 38, 39, 43, 47, 51, 55, 59],
        },
        {
          file: 'src/models/ActionServiceBetaTargetNameFilter.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [50, 54, 58, 59, 61, 69, 73, 74, 77],
        },
        {
          file: 'src/models/ActionServiceBetaTargetSearchFilter.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/ActionServiceBetaTextFilterMethod.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/ActionServiceBetaUpdateTargetResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/ActionServiceCreateTargetRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [80, 84, 88, 89, 91, 103, 107, 108, 111],
        },
        {
          file: 'src/models/ActionServiceListTargetsRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [70, 74, 78, 79, 81, 90, 94, 95, 98],
        },
        {
          file: 'src/models/ActionServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/ActionServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/ActionServiceSetExecutionRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/ActionServiceUpdateTargetRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 17,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [92, 96, 100, 101, 103, 116, 120, 121, 124],
        },
        {
          file: 'src/models/FeatureServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/FeatureServiceFeatureFlag.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [50, 54, 58, 59, 61, 69, 73, 74, 77],
        },
        {
          file: 'src/models/FeatureServiceGetInstanceFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 33,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [147, 151, 155, 156, 158, 179, 183, 184, 187],
        },
        {
          file: 'src/models/FeatureServiceGetOrganizationFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceGetSystemFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 27,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [129, 133, 137, 138, 140, 158, 162, 163, 166],
        },
        {
          file: 'src/models/FeatureServiceGetUserFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceImprovedPerformance.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [40, 41, 42, 43, 47, 51, 55, 59, 63],
        },
        {
          file: 'src/models/FeatureServiceImprovedPerformanceFeatureFlag.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [57, 61, 65, 66, 68, 76, 80, 81, 84],
        },
        {
          file: 'src/models/FeatureServiceLoginV2.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/FeatureServiceLoginV2FeatureFlag.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/FeatureServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/FeatureServiceResetInstanceFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceResetOrganizationFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceResetSystemFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceResetUserFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/FeatureServiceSetInstanceFeaturesRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 33,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [127, 131, 135, 136, 138, 158, 162, 163, 166],
        },
        {
          file: 'src/models/FeatureServiceSetInstanceFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceSetOrganizationFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceSetSystemFeaturesRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 27,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [109, 113, 117, 118, 120, 137, 141, 142, 145],
        },
        {
          file: 'src/models/FeatureServiceSetSystemFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceSetUserFeaturesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/FeatureServiceSource.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [34, 35, 36, 37, 41, 45, 49, 53, 57],
        },
        {
          file: 'src/models/IdentityProviderServiceAppleConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [52, 56, 60, 61, 63, 73, 77, 78, 81],
        },
        {
          file: 'src/models/IdentityProviderServiceAutoLinkingOption.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/IdentityProviderServiceAzureADConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [62, 66, 70, 71, 73, 83, 87, 88, 91],
        },
        {
          file: 'src/models/IdentityProviderServiceAzureADTenant.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/IdentityProviderServiceAzureADTenantType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [30, 31, 32, 33, 37, 41, 45, 49, 53],
        },
        {
          file: 'src/models/IdentityProviderServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/IdentityProviderServiceGenericOIDCConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 75, 79, 80, 83],
        },
        {
          file: 'src/models/IdentityProviderServiceGetIDPByIDResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/IdentityProviderServiceGitHubConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/IdentityProviderServiceGitHubEnterpriseServerConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [58, 62, 66, 67, 69, 80, 84, 85, 88],
        },
        {
          file: 'src/models/IdentityProviderServiceGitLabConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/IdentityProviderServiceGitLabSelfHostedConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/IdentityProviderServiceGoogleConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/IdentityProviderServiceIDP.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [95, 99, 103, 104, 106, 118, 122, 123, 126],
        },
        {
          file: 'src/models/IdentityProviderServiceIDPConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 29,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [198, 202, 206, 207, 209, 228, 232, 233, 236],
        },
        {
          file: 'src/models/IdentityProviderServiceIDPState.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [32, 33, 34, 35, 39, 43, 47, 51, 55],
        },
        {
          file: 'src/models/IdentityProviderServiceIDPType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [40, 41, 42, 43, 47, 51, 55, 59, 63],
        },
        {
          file: 'src/models/IdentityProviderServiceJWTConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [52, 56, 60, 61, 63, 73, 77, 78, 81],
        },
        {
          file: 'src/models/IdentityProviderServiceLDAPAttributes.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 31,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [112, 116, 120, 121, 123, 143, 147, 148, 151],
        },
        {
          file: 'src/models/IdentityProviderServiceLDAPConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 23,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [96, 100, 104, 105, 107, 123, 127, 128, 131],
        },
        {
          file: 'src/models/IdentityProviderServiceOAuthConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [66, 70, 74, 75, 77, 89, 93, 94, 97],
        },
        {
          file: 'src/models/IdentityProviderServiceOptions.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [72, 76, 80, 81, 83, 94, 98, 99, 102],
        },
        {
          file: 'src/models/IdentityProviderServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/IdentityProviderServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/IdentityProviderServiceSAMLBinding.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/IdentityProviderServiceSAMLConfig.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [84, 88, 92, 93, 95, 107, 111, 112, 115],
        },
        {
          file: 'src/models/IdentityProviderServiceSAMLNameIDFormat.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/OIDCServiceAuthRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 27,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [96, 100, 104, 105, 107, 123, 127, 128, 131],
        },
        {
          file: 'src/models/OIDCServiceAuthorizationError.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/OIDCServiceAuthorizeOrDenyDeviceAuthorizationRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/OIDCServiceCreateCallbackRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/OIDCServiceCreateCallbackResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/OIDCServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/OIDCServiceDeviceAuthorizationRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [58, 62, 66, 67, 69, 80, 84, 85, 88],
        },
        {
          file: 'src/models/OIDCServiceErrorReason.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [44, 45, 46, 47, 51, 55, 59, 63, 67],
        },
        {
          file: 'src/models/OIDCServiceGetAuthRequestResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/OIDCServiceGetDeviceAuthorizationRequestResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/OIDCServicePrompt.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [33, 34, 35, 36, 40, 44, 48, 52, 56],
        },
        {
          file: 'src/models/OIDCServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/OIDCServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/OIDCServiceSession.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/OrganizationServiceAddHumanUserRequest.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 31,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [
            152, 153, 154, 158, 162, 163, 165, 182, 186, 187, 190,
          ],
        },
        {
          file: 'src/models/OrganizationServiceAddOrganizationRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 10,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [48, 49, 53, 57, 58, 60, 68, 72, 73, 76],
        },
        {
          file: 'src/models/OrganizationServiceAddOrganizationRequestAdmin.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/OrganizationServiceAddOrganizationResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [61, 65, 69, 70, 72, 81, 85, 86, 89],
        },
        {
          file: 'src/models/OrganizationServiceAddOrganizationResponseCreatedAdmin.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/OrganizationServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/OrganizationServiceGender.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/OrganizationServiceHashedPassword.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [40, 41, 45, 49, 50, 52, 60, 64, 65, 68],
        },
        {
          file: 'src/models/OrganizationServiceIDPLink.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/OrganizationServiceListDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/OrganizationServiceListOrganizationsRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [70, 74, 78, 79, 81, 90, 94, 95, 98],
        },
        {
          file: 'src/models/OrganizationServiceListOrganizationsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [70, 74, 78, 79, 81, 90, 94, 95, 98],
        },
        {
          file: 'src/models/OrganizationServiceListQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationDomainQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationFieldName.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [29, 30, 31, 32, 36, 40, 44, 48, 52],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationIDQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationState.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/OrganizationServiceOrganizationStateQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [44, 48, 52, 53, 55, 62, 66, 67, 70],
        },
        {
          file: 'src/models/OrganizationServicePassword.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [40, 41, 45, 49, 50, 52, 60, 64, 65, 68],
        },
        {
          file: 'src/models/OrganizationServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/OrganizationServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/OrganizationServiceSearchQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [87, 91, 95, 96, 98, 109, 113, 114, 117],
        },
        {
          file: 'src/models/OrganizationServiceSendEmailVerificationCode.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [37, 41, 45, 46, 48, 55, 59, 60, 63],
        },
        {
          file: 'src/models/OrganizationServiceSetHumanEmail.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 12,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [60, 61, 65, 69, 70, 72, 82, 86, 87, 90],
        },
        {
          file: 'src/models/OrganizationServiceSetHumanPhone.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [52, 56, 60, 61, 63, 73, 77, 78, 81],
        },
        {
          file: 'src/models/OrganizationServiceSetHumanProfile.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 17,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [74, 75, 76, 80, 84, 85, 87, 99, 103, 104, 107],
        },
        {
          file: 'src/models/OrganizationServiceSetMetadataEntry.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [40, 41, 42, 46, 50, 51, 53, 61, 65, 66, 69],
        },
        {
          file: 'src/models/OrganizationServiceTextQueryMethod.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/SAMLServiceAuthorizationError.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [50, 54, 58, 59, 61, 69, 73, 74, 77],
        },
        {
          file: 'src/models/SAMLServiceCreateResponseRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SAMLServiceCreateResponseResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [67, 71, 75, 76, 78, 88, 92, 93, 96],
        },
        {
          file: 'src/models/SAMLServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/SAMLServiceErrorReason.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/SAMLServiceGetSAMLRequestResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/SAMLServicePostResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/SAMLServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/SAMLServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SAMLServiceSAMLRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 17,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [64, 68, 72, 73, 75, 87, 91, 92, 95],
        },
        {
          file: 'src/models/SAMLServiceSession.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/SessionServiceChallenges.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SessionServiceChallengesWebAuthN.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceCheckIDPIntent.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 67],
        },
        {
          file: 'src/models/SessionServiceCheckOTP.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 60],
        },
        {
          file: 'src/models/SessionServiceCheckPassword.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 60],
        },
        {
          file: 'src/models/SessionServiceCheckTOTP.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 60],
        },
        {
          file: 'src/models/SessionServiceCheckUser.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 64],
        },
        {
          file: 'src/models/SessionServiceCheckWebAuthN.ts',
          lines: {
            total: 10,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 6,
            covered: 1,
          },
          statements: {
            total: 10,
            covered: 3,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 61],
        },
        {
          file: 'src/models/SessionServiceChecks.ts',
          lines: {
            total: 9,
            covered: 4,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 17,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 4,
          },
          uncoveredLines: [113, 117, 121, 122, 124],
        },
        {
          file: 'src/models/SessionServiceCreateSessionRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [80, 84, 88, 89, 91, 107],
        },
        {
          file: 'src/models/SessionServiceCreateSessionResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 4,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [67, 76, 88, 92, 93, 96],
        },
        {
          file: 'src/models/SessionServiceCreationDateQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [50, 54, 58, 59, 61, 69, 73, 74, 77],
        },
        {
          file: 'src/models/SessionServiceCreatorQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceDeleteSessionRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 57],
        },
        {
          file: 'src/models/SessionServiceDeleteSessionResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [42, 51, 60, 64, 65, 68],
        },
        {
          file: 'src/models/SessionServiceDetails.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 15,
            covered: 4,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [56, 65, 77, 81, 82, 85],
        },
        {
          file: 'src/models/SessionServiceFactors.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 17,
            covered: 7,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [113, 122, 137, 141, 142, 145],
        },
        {
          file: 'src/models/SessionServiceGetSessionResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [42, 51, 60, 64, 65, 68],
        },
        {
          file: 'src/models/SessionServiceIDsQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceIntentFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceListDetails.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [46, 55, 66, 70, 71, 74],
        },
        {
          file: 'src/models/SessionServiceListQuery.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 74],
        },
        {
          file: 'src/models/SessionServiceListSessionsRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [70, 74, 78, 79, 81, 95],
        },
        {
          file: 'src/models/SessionServiceListSessionsResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 2,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [55, 64, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SessionServiceOTPEmailSendCode.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [37, 41, 45, 46, 48, 55, 59, 60, 63],
        },
        {
          file: 'src/models/SessionServiceOTPFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServicePasswordFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/SessionServiceRequestChallenges.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [68, 72, 76, 77, 79, 96],
        },
        {
          file: 'src/models/SessionServiceRequestChallengesOTPEmail.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/SessionServiceRequestChallengesOTPSMS.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceRequestChallengesWebAuthN.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [50, 51, 52, 56, 60, 61, 63, 71, 75, 76, 79],
        },
        {
          file: 'src/models/SessionServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SessionServiceSearchQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [94, 98, 102, 103, 105, 116, 120, 121, 124],
        },
        {
          file: 'src/models/SessionServiceSession.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 25,
            covered: 8,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [91, 100, 116, 120, 121, 124],
        },
        {
          file: 'src/models/SessionServiceSessionFieldName.ts',
          lines: {
            total: 10,
            covered: 2,
          },
          methods: {
            total: 5,
            covered: 1,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 2,
          },
          uncoveredLines: [29, 30, 31, 32, 36, 40, 44, 52],
        },
        {
          file: 'src/models/SessionServiceSetSessionRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [73, 77, 81, 82, 84, 100],
        },
        {
          file: 'src/models/SessionServiceSetSessionResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [61, 70, 81, 85, 86, 89],
        },
        {
          file: 'src/models/SessionServiceTOTPFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceTimestampQueryMethod.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [32, 33, 34, 35, 39, 43, 47, 51, 55],
        },
        {
          file: 'src/models/SessionServiceUserAgent.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 13,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [60, 64, 68, 69, 71, 89],
        },
        {
          file: 'src/models/SessionServiceUserAgentHeaderValues.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [37, 41, 45, 46, 48, 55, 59, 60, 63],
        },
        {
          file: 'src/models/SessionServiceUserAgentQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [36, 40, 44, 45, 47, 54, 58, 59, 62],
        },
        {
          file: 'src/models/SessionServiceUserFactor.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 15,
            covered: 5,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [58, 67, 80, 84, 85, 88],
        },
        {
          file: 'src/models/SessionServiceUserIDQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/SessionServiceUserVerificationRequirement.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/SessionServiceWebAuthNFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/SettingsServiceAutoLinkingOption.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/SettingsServiceBrandingSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 17,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [94, 98, 102, 103, 105, 118, 122, 123, 126],
        },
        {
          file: 'src/models/SettingsServiceDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 77, 81, 82, 85],
        },
        {
          file: 'src/models/SettingsServiceDomainSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [62, 66, 70, 71, 73, 83, 87, 88, 91],
        },
        {
          file: 'src/models/SettingsServiceEmbeddedIframeSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/SettingsServiceGetActiveIdentityProvidersResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetBrandingSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetDomainSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetGeneralSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [46, 55, 66, 70, 71, 74],
        },
        {
          file: 'src/models/SettingsServiceGetLegalAndSupportSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetLockoutSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetLoginSettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetPasswordComplexitySettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetPasswordExpirySettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceGetSecuritySettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceIdentityProvider.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [69, 73, 77, 78, 80, 90, 94, 95, 98],
        },
        {
          file: 'src/models/SettingsServiceIdentityProviderType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [40, 41, 42, 43, 47, 51, 55, 59, 63],
        },
        {
          file: 'src/models/SettingsServiceLegalAndSupportSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 19,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [86, 90, 94, 95, 97, 111, 115, 116, 119],
        },
        {
          file: 'src/models/SettingsServiceListDetails.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/SettingsServiceLockoutSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/SettingsServiceLoginSettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 47,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [179, 183, 187, 188, 190, 216, 220, 221, 224],
        },
        {
          file: 'src/models/SettingsServiceMultiFactorType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [29, 30, 31, 32, 36, 40, 44, 48, 52],
        },
        {
          file: 'src/models/SettingsServiceOptions.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [72, 76, 80, 81, 83, 94, 98, 99, 102],
        },
        {
          file: 'src/models/SettingsServicePasskeysType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [29, 30, 31, 32, 36, 40, 44, 48, 52],
        },
        {
          file: 'src/models/SettingsServicePasswordComplexitySettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [74, 78, 82, 83, 85, 97, 101, 102, 105],
        },
        {
          file: 'src/models/SettingsServicePasswordExpirySettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/SettingsServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/SettingsServiceResourceOwnerType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [30, 31, 32, 33, 37, 41, 45, 49, 53],
        },
        {
          file: 'src/models/SettingsServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/SettingsServiceSecondFactorType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [32, 33, 34, 35, 39, 43, 47, 51, 55],
        },
        {
          file: 'src/models/SettingsServiceSecuritySettings.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/SettingsServiceSetSecuritySettingsRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/SettingsServiceSetSecuritySettingsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/SettingsServiceTheme.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 15,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [64, 68, 72, 73, 75, 87, 91, 92, 95],
        },
        {
          file: 'src/models/SettingsServiceThemeMode.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/UserServiceAccessTokenType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [29, 30, 31, 32, 36, 40, 44, 48, 52],
        },
        {
          file: 'src/models/UserServiceAddHumanUserRequest.ts',
          lines: {
            total: 11,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 31,
            covered: 2,
          },
          statements: {
            total: 11,
            covered: 3,
          },
          uncoveredLines: [152, 153, 154, 158, 162, 163, 165, 187],
        },
        {
          file: 'src/models/UserServiceAddHumanUserResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 4,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [60, 69, 81, 85, 86, 89],
        },
        {
          file: 'src/models/UserServiceAddIDPLinkRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceAddIDPLinkResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceAddOTPEmailResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceAddOTPSMSResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceAndQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceAuthFactor.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [73, 77, 81, 82, 84, 95, 99, 100, 103],
        },
        {
          file: 'src/models/UserServiceAuthFactorState.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/UserServiceAuthFactorU2F.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceAuthenticationMethodType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/UserServiceCreateInviteCodeRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceCreateInviteCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceCreatePasskeyRegistrationLinkRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceCreatePasskeyRegistrationLinkResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceDeactivateUserResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceDeleteUserResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [42, 51, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceDetails.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 15,
            covered: 5,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [56, 65, 77, 81, 82, 85],
        },
        {
          file: 'src/models/UserServiceDisplayNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceEmailQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceFirstNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceGender.ts',
          lines: {
            total: 10,
            covered: 4,
          },
          methods: {
            total: 5,
            covered: 3,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 4,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 54],
        },
        {
          file: 'src/models/UserServiceGetUserByIDResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 2,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [55, 64, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceHashedPassword.ts',
          lines: {
            total: 10,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 8,
            covered: 1,
          },
          statements: {
            total: 10,
            covered: 3,
          },
          uncoveredLines: [40, 41, 45, 49, 50, 52, 68],
        },
        {
          file: 'src/models/UserServiceHumanEmail.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [40, 49, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceHumanMFAInitSkippedResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceHumanPhone.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 2,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [40, 49, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceHumanProfile.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 17,
            covered: 7,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [80, 89, 104, 108, 109, 112],
        },
        {
          file: 'src/models/UserServiceHumanUser.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 29,
            covered: 12,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [125, 134, 153, 157, 158, 161],
        },
        {
          file: 'src/models/UserServiceIDPInformation.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 17,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [92, 96, 100, 101, 103, 116, 120, 121, 124],
        },
        {
          file: 'src/models/UserServiceIDPIntent.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/UserServiceIDPLDAPAccessInformation.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceIDPLink.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 66, 70, 71, 74],
        },
        {
          file: 'src/models/UserServiceIDPOAuthAccessInformation.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceIDPSAMLAccessInformation.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceInUserEmailsQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceInUserIDQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceLDAPCredentials.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceLastNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceListAuthenticationFactorsResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceListAuthenticationMethodTypesResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceListDetails.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [46, 55, 66, 70, 71, 74],
        },
        {
          file: 'src/models/UserServiceListIDPLinksRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceListIDPLinksResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceListPasskeysResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [55, 59, 63, 64, 66, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceListQuery.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [46, 50, 54, 55, 57, 74],
        },
        {
          file: 'src/models/UserServiceListUsersRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [70, 74, 78, 79, 81, 95],
        },
        {
          file: 'src/models/UserServiceListUsersResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [70, 79, 90, 94, 95, 98],
        },
        {
          file: 'src/models/UserServiceLockUserResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceLoginNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceMachineUser.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 4,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [62, 71, 83, 87, 88, 91],
        },
        {
          file: 'src/models/UserServiceNickNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceNotQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceNotificationType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [30, 31, 32, 33, 37, 41, 45, 49, 53],
        },
        {
          file: 'src/models/UserServiceOrQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceOrganization.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 7,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 67],
        },
        {
          file: 'src/models/UserServiceOrganizationIdQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/UserServicePasskey.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/UserServicePasskeyAuthenticator.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [30, 31, 32, 33, 37, 41, 45, 49, 53],
        },
        {
          file: 'src/models/UserServicePasskeyRegistrationCode.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [40, 41, 42, 46, 50, 51, 53, 61, 65, 66, 69],
        },
        {
          file: 'src/models/UserServicePassword.ts',
          lines: {
            total: 10,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 8,
            covered: 1,
          },
          statements: {
            total: 10,
            covered: 3,
          },
          uncoveredLines: [40, 41, 45, 49, 50, 52, 68],
        },
        {
          file: 'src/models/UserServicePasswordResetRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServicePasswordResetResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServicePhoneQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/UserServiceReactivateUserResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRedirectURLs.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceRegisterPasskeyRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [63, 67, 71, 72, 74, 83, 87, 88, 91],
        },
        {
          file: 'src/models/UserServiceRegisterPasskeyResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceRegisterTOTPResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceRegisterU2FRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceRegisterU2FResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceRemoveIDPLinkResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemoveOTPEmailResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemoveOTPSMSResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemovePasskeyResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemovePhoneResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemoveTOTPResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceRemoveU2FResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceResendEmailCodeRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceResendEmailCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceResendInviteCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceResendPhoneCodeRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/UserServiceResendPhoneCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceRetrieveIdentityProviderIntentRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/UserServiceRetrieveIdentityProviderIntentResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [74, 78, 82, 83, 85, 95, 99, 100, 103],
        },
        {
          file: 'src/models/UserServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceSearchQuery.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 35,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [237, 241, 245, 246, 248, 270, 274, 275, 278],
        },
        {
          file: 'src/models/UserServiceSendEmailCodeRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceSendEmailCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceSendEmailVerificationCode.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 5,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [37, 41, 45, 46, 48, 63],
        },
        {
          file: 'src/models/UserServiceSendInviteCode.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [44, 48, 52, 53, 55, 63, 67, 68, 71],
        },
        {
          file: 'src/models/UserServiceSendPasskeyRegistrationLink.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [37, 41, 45, 46, 48, 55, 59, 60, 63],
        },
        {
          file: 'src/models/UserServiceSendPasswordResetLink.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [53, 57, 61, 62, 64, 72, 76, 77, 80],
        },
        {
          file: 'src/models/UserServiceSetEmailRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 12,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [60, 61, 65, 69, 70, 72, 82, 86, 87, 90],
        },
        {
          file: 'src/models/UserServiceSetEmailResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceSetHumanEmail.ts',
          lines: {
            total: 10,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 12,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 3,
          },
          uncoveredLines: [60, 61, 65, 69, 70, 72, 87],
        },
        {
          file: 'src/models/UserServiceSetHumanPhone.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 11,
            covered: 1,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [52, 56, 60, 61, 63, 81],
        },
        {
          file: 'src/models/UserServiceSetHumanProfile.ts',
          lines: {
            total: 11,
            covered: 4,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 17,
            covered: 1,
          },
          statements: {
            total: 11,
            covered: 4,
          },
          uncoveredLines: [74, 75, 76, 80, 84, 85, 87],
        },
        {
          file: 'src/models/UserServiceSetMetadataEntry.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [40, 41, 42, 46, 50, 51, 53, 61, 65, 66, 69],
        },
        {
          file: 'src/models/UserServiceSetPassword.ts',
          lines: {
            total: 11,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 13,
            covered: 1,
          },
          statements: {
            total: 11,
            covered: 3,
          },
          uncoveredLines: [67, 68, 69, 73, 77, 78, 80, 98],
        },
        {
          file: 'src/models/UserServiceSetPasswordRequest.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [54, 55, 56, 60, 64, 65, 67, 76, 80, 81, 84],
        },
        {
          file: 'src/models/UserServiceSetPasswordResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceSetPhoneRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 12,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [52, 53, 57, 61, 62, 64, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceSetPhoneResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [48, 52, 56, 57, 59, 67, 71, 72, 75],
        },
        {
          file: 'src/models/UserServiceStartIdentityProviderIntentRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [61, 65, 69, 70, 72, 81, 85, 86, 89],
        },
        {
          file: 'src/models/UserServiceStartIdentityProviderIntentResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [67, 71, 75, 76, 78, 88, 92, 93, 96],
        },
        {
          file: 'src/models/UserServiceStateQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [44, 45, 49, 53, 54, 56, 63, 67, 68, 71],
        },
        {
          file: 'src/models/UserServiceTextQueryMethod.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/UserServiceType.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [30, 31, 32, 33, 37, 41, 45, 49, 53],
        },
        {
          file: 'src/models/UserServiceTypeQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [44, 45, 49, 53, 54, 56, 63, 67, 68, 71],
        },
        {
          file: 'src/models/UserServiceUnlockUserResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceUpdateHumanUserRequest.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [87, 91, 95, 96, 98, 114],
        },
        {
          file: 'src/models/UserServiceUpdateHumanUserResponse.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 9,
            covered: 3,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [54, 63, 74, 78, 79, 82],
        },
        {
          file: 'src/models/UserServiceUser.ts',
          lines: {
            total: 9,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 19,
            covered: 10,
          },
          statements: {
            total: 9,
            covered: 3,
          },
          uncoveredLines: [105, 114, 130, 134, 135, 138],
        },
        {
          file: 'src/models/UserServiceUserFieldName.ts',
          lines: {
            total: 10,
            covered: 2,
          },
          methods: {
            total: 5,
            covered: 1,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 2,
          },
          uncoveredLines: [37, 38, 39, 40, 44, 48, 52, 60],
        },
        {
          file: 'src/models/UserServiceUserNameQuery.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 8,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [50, 51, 55, 59, 60, 62, 70, 74, 75, 78],
        },
        {
          file: 'src/models/UserServiceUserState.ts',
          lines: {
            total: 10,
            covered: 3,
          },
          methods: {
            total: 5,
            covered: 2,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 3,
          },
          uncoveredLines: [33, 34, 35, 36, 40, 52, 56],
        },
        {
          file: 'src/models/UserServiceVerifyEmailRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/UserServiceVerifyEmailResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceVerifyInviteCodeRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/UserServiceVerifyInviteCodeResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceVerifyPasskeyRegistrationRequest.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [40, 41, 42, 46, 50, 51, 53, 61, 65, 66, 69],
        },
        {
          file: 'src/models/UserServiceVerifyPasskeyRegistrationResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceVerifyPhoneRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/UserServiceVerifyPhoneResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceVerifyTOTPRegistrationRequest.ts',
          lines: {
            total: 10,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 6,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 0,
          },
          uncoveredLines: [34, 35, 39, 43, 44, 46, 53, 57, 58, 61],
        },
        {
          file: 'src/models/UserServiceVerifyTOTPRegistrationResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/UserServiceVerifyU2FRegistrationRequest.ts',
          lines: {
            total: 11,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 11,
            covered: 0,
          },
          uncoveredLines: [40, 41, 42, 46, 50, 51, 53, 61, 65, 66, 69],
        },
        {
          file: 'src/models/UserServiceVerifyU2FRegistrationResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/WebKeyServiceBetaActivateWebKeyResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [34, 38, 42, 43, 45, 52, 56, 57, 60],
        },
        {
          file: 'src/models/WebKeyServiceBetaCreateWebKeyResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/WebKeyServiceBetaDeleteWebKeyResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [36, 40, 44, 45, 47, 54, 58, 59, 62],
        },
        {
          file: 'src/models/WebKeyServiceBetaECDSA.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [44, 48, 52, 53, 55, 62, 66, 67, 70],
        },
        {
          file: 'src/models/WebKeyServiceBetaECDSACurve.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/WebKeyServiceBetaListWebKeysResponse.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [42, 46, 50, 51, 53, 60, 64, 65, 68],
        },
        {
          file: 'src/models/WebKeyServiceBetaRSA.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [57, 61, 65, 66, 68, 76, 80, 81, 84],
        },
        {
          file: 'src/models/WebKeyServiceBetaRSABits.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/WebKeyServiceBetaRSAHasher.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [31, 32, 33, 34, 38, 42, 46, 50, 54],
        },
        {
          file: 'src/models/WebKeyServiceBetaState.ts',
          lines: {
            total: 10,
            covered: 1,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 2,
            covered: 0,
          },
          statements: {
            total: 10,
            covered: 1,
          },
          uncoveredLines: [35, 36, 37, 38, 42, 46, 50, 54, 58],
        },
        {
          file: 'src/models/WebKeyServiceBetaWebKey.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 21,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [92, 96, 100, 101, 103, 116, 120, 121, 124],
        },
        {
          file: 'src/models/WebKeyServiceCreateWebKeyRequest.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 9,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [61, 65, 69, 70, 72, 81, 85, 86, 89],
        },
        {
          file: 'src/models/WebKeyServiceProtobufAny.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 5,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [35, 39, 43, 44, 46, 54, 58, 59, 62],
        },
        {
          file: 'src/models/WebKeyServiceRpcStatus.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 11,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [54, 58, 62, 63, 65, 74, 78, 79, 82],
        },
        {
          file: 'src/models/Zitadelobjectv2Organization.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 7,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [40, 44, 48, 49, 51, 59, 63, 64, 67],
        },
        {
          file: 'src/models/Zitadelorgv2Organization.ts',
          lines: {
            total: 9,
            covered: 0,
          },
          methods: {
            total: 5,
            covered: 0,
          },
          branches: {
            total: 13,
            covered: 0,
          },
          statements: {
            total: 9,
            covered: 0,
          },
          uncoveredLines: [75, 79, 83, 84, 86, 97, 101, 102, 105],
        },
      ],
    });
  });
});
