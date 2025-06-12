import * as fs from 'fs';
import * as path from 'path';

const generateProgressBarSVGs = (): void => {
  const colors = {
    yellow: '#ffc107',
    red: '#dc3545',
    green: '#28a745',
    background: '#e9ecef',
  } as const;

  const dimensions = { width: 100, height: 16, borderRadius: 4 } as const;
  const outputDir = path.join('dist', 'res');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const createSVG = (percentage: number, color: string): string => {
    const progressWidth = (percentage / 100) * dimensions.width;
    return `<svg width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${dimensions.width}" height="${dimensions.height}" rx="${dimensions.borderRadius}" ry="${dimensions.borderRadius}" fill="${colors.background}"/>
  <!-- Progress fill -->
  ${percentage > 0 ? `<rect width="${progressWidth}" height="${dimensions.height}" rx="${dimensions.borderRadius}" ry="${dimensions.borderRadius}" fill="${color}"/>` : ''}
</svg>`;
  };

  const colorEntries = Object.entries(colors).filter(
    ([name]) => name !== 'background',
  );
  const percentages = Array.from({ length: 101 }, (_, i) => i);

  const allFiles = colorEntries.flatMap(([colorName, colorValue]) =>
    percentages.map((percentage) => ({
      content: createSVG(percentage, colorValue),
      filename: `progress-${colorName}-${percentage.toString().padStart(3, '0')}.svg`,
      colorName,
    })),
  );

  // Write all files and collect stats
  const stats = allFiles
    .map(({ content, filename, colorName }) => {
      fs.writeFileSync(path.join(outputDir, filename), content);
      return colorName;
    })
    .reduce(
      (acc, colorName) => ({ ...acc, [colorName]: (acc[colorName] || 0) + 1 }),
      {} as Record<string, number>,
    );

  // Log results
  Object.entries(stats).forEach(([colorName, count]) =>
    console.log(`Generated ${colorName} progress bars (${count} files)`),
  );

  console.log(`\nTotal files created: ${allFiles.length} SVG files`);
  console.log(`Output directory: ${outputDir}`);
};

generateProgressBarSVGs();
