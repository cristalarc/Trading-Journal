import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.journalEntry.deleteMany();
  await prisma.timeframeConfig.deleteMany();
  await prisma.patternConfig.deleteMany();
  await prisma.tooltipConfig.deleteMany();

  // Seed TimeframeConfigs
  const timeframes = [
    { name: 'Hourly', displayOrder: 1 },
    { name: 'Daily', displayOrder: 2 },
    { name: 'Weekly', displayOrder: 3 },
    { name: 'Monthly', displayOrder: 4 },
  ];

  for (const timeframe of timeframes) {
    await prisma.timeframeConfig.create({
      data: timeframe,
    });
  }

  // Seed PatternConfigs
  const patterns = [
    { name: 'Cup & Handle', description: 'A bullish continuation pattern that resembles a cup and handle', displayOrder: 1 },
    { name: 'Head & Shoulders', description: 'A bearish reversal pattern with three peaks', displayOrder: 2 },
    { name: 'Double Bottom', description: 'A bullish reversal pattern with two equal lows', displayOrder: 3 },
    { name: 'Double Top', description: 'A bearish reversal pattern with two equal highs', displayOrder: 4 },
    { name: 'Ascending Triangle', description: 'A bullish continuation pattern with rising lower trendline', displayOrder: 5 },
    { name: 'Descending Triangle', description: 'A bearish continuation pattern with falling upper trendline', displayOrder: 6 },
    { name: 'Flag', description: 'A continuation pattern that forms after a strong move', displayOrder: 7 },
    { name: 'Pennant', description: 'A continuation pattern that forms after a strong move', displayOrder: 8 },
    { name: 'Breakout', description: 'Price movement beyond a defined support or resistance level', displayOrder: 9 },
  ];

  for (const pattern of patterns) {
    await prisma.patternConfig.create({
      data: pattern,
    });
  }

  // Seed TooltipConfigs
  const tooltips = [
    {
      key: 'direction',
      text: 'Indicates expected price movement: Bullish (up) or Bearish (down)',
      maxLength: 50,
    },
    {
      key: 'sentiment',
      text: 'Overall market feeling based on your analysis',
      maxLength: 50,
    },
  ];

  for (const tooltip of tooltips) {
    await prisma.tooltipConfig.create({
      data: tooltip,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 