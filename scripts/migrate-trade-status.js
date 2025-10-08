const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTradeStatus() {
  try {
    console.log('Starting trade status migration...');
    
    // Get all trades with CLOSED status
    const closedTrades = await prisma.trade.findMany({
      where: {
        status: 'CLOSED'
      }
    });
    
    console.log(`Found ${closedTrades.length} trades with CLOSED status`);
    
    for (const trade of closedTrades) {
      let newStatus = 'OPEN'; // Default to OPEN if no close date
      
      if (trade.closeDate) {
        // Determine WIN/LOSS based on net return
        if (trade.netReturn !== null) {
          newStatus = trade.netReturn >= 0 ? 'WIN' : 'LOSS';
        } else {
          // If no net return calculated, try to calculate it
          if (trade.avgBuy && trade.avgSell && trade.size) {
            const netReturn = trade.side === 'LONG'
              ? (trade.avgSell - trade.avgBuy) * trade.size
              : (trade.avgBuy - trade.avgSell) * trade.size;
            newStatus = netReturn >= 0 ? 'WIN' : 'LOSS';
          } else {
            // If we can't determine, default to LOSS for closed trades
            newStatus = 'LOSS';
          }
        }
      }
      
      await prisma.trade.update({
        where: { id: trade.id },
        data: { status: newStatus }
      });
      
      console.log(`Updated trade ${trade.tradeId} to ${newStatus}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTradeStatus();
