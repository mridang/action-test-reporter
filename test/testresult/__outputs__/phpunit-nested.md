![Tests passed successfully](https://img.shields.io/badge/tests-33%20passed-success)


|Report|Passed|Failed|Skipped|Time|
|:---|---:|---:|---:|---:|
|[__fixtures__/phpunit-nested.xml](#user-content-r0)|33 ✅|||91ms|
## ✅ <a id="user-content-r0" href="#user-content-r0">__fixtures__/phpunit-nested.xml</a>
**33** tests were completed in **91ms** with **33** passed, **0** failed and **0** skipped.

|Test suite|Passed|Failed|Skipped|Time|
|:---|---:|---:|---:|---:|
|[Mridang\PHPUnitReporters\Tests\CoverageMetricsTest](#user-content-r0s0)|8 ✅|||21ms|
|[Mridang\PHPUnitReporters\Tests\CoverageNodeTest](#user-content-r0s1)|9 ✅|||12ms|
|[Mridang\PHPUnitReporters\Tests\CoverageReportTest](#user-content-r0s2)|4 ✅|||9ms|
|[Mridang\PHPUnitReporters\Tests\FileCoverageTest](#user-content-r0s3)|3 ✅|||4ms|
|[Mridang\PHPUnitReporters\Tests\JestReporterTest](#user-content-r0s4)|9 ✅|||45ms|
### ✅ <a id="user-content-r0s0" href="#user-content-r0s0">Mridang\PHPUnitReporters\Tests\CoverageMetricsTest</a>
```
Mridang.PHPUnitReporters.Tests.CoverageMetricsTest
  ✅ testConstructorSetsProperties
  ✅ testGetPercentageCalculatesCorrectly
  ✅ testGetPercentageReturnsZeroWhenTotalIsZero
  ✅ testGetPercentageHandlesFullCoverage
  ✅ testZeroCreatesZeroInitializedInstance
  ✅ testAddCombinesMetrics
  ✅ testAddDoesNotMutateOriginal
  ✅ testAddWithZero
```
### ✅ <a id="user-content-r0s1" href="#user-content-r0s1">Mridang\PHPUnitReporters\Tests\CoverageNodeTest</a>
```
Mridang.PHPUnitReporters.Tests.CoverageNodeTest
  ✅ testGetDepthReturnsZeroForRoot
  ✅ testGetDepthReturnsCorrectDepthForNestedNodes
  ✅ testAggregateFromChildrenSumsMetricsCorrectly
  ✅ testAggregateFromChildrenRecursivelyAggregatesNestedNodes
  ✅ testBuildTreeCreatesCorrectHierarchy
  ✅ testBuildTreeAggregatesMetricsToRoot
  ✅ testBuildTreeHandlesSingleFile
  ✅ testBuildTreeHandlesMultipleDirectoryLevels
  ✅ testBuildTreeHandlesEmptyArray
```
### ✅ <a id="user-content-r0s2" href="#user-content-r0s2">Mridang\PHPUnitReporters\Tests\CoverageReportTest</a>
```
Mridang.PHPUnitReporters.Tests.CoverageReportTest
  ✅ testConstructorThrowsExceptionForNonExistentFile
  ✅ testConstructorThrowsExceptionForInvalidXml
  ✅ testGetFilesReturnsCorrectData
  ✅ testGetTotalCoverageReturnsCorrectData
```
### ✅ <a id="user-content-r0s3" href="#user-content-r0s3">Mridang\PHPUnitReporters\Tests\FileCoverageTest</a>
```
Mridang.PHPUnitReporters.Tests.FileCoverageTest
  ✅ testConstructorSetsAllProperties
  ✅ testConstructorDefaultsUncoveredLinesToEmptyArray
  ✅ testIsImmutable
```
### ✅ <a id="user-content-r0s4" href="#user-content-r0s4">Mridang\PHPUnitReporters\Tests\JestReporterTest</a>
```
Mridang.PHPUnitReporters.Tests.JestReporterTest
  ✅ testCoverageSummaryDisplaysHeaders
  ✅ testCoverageSummaryDisplaysAllFilesSummaryRow
  ✅ testCoverageSummaryDisplaysDirectoryStructure
  ✅ testCoverageSummaryDisplaysFiles
  ✅ testCoverageSummaryDisplaysFilePercentages
  ✅ testCoverageSummaryDisplaysUncoveredLineRanges
  ✅ testCoverageSummaryHandlesMissingReportFile
  ✅ testUncoveredLinesTruncatedWithEllipsisWhenExceedingTerminalWidth
  ✅ testUncoveredLinesNotTruncatedWhenTerminalWidthSufficient
```