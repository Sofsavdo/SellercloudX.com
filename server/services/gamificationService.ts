// Gamification Service
// Achievement system, Leaderboards, Rewards va bonuses

import { db } from '../db';
import { sql } from 'drizzle-orm';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'sales' | 'referral' | 'product' | 'social' | 'milestone';
  requirement: {
    type: string;
    value: number;
  };
}

interface LeaderboardEntry {
  partnerId: string;
  partnerName: string;
  totalPoints: number;
  rank: number;
  achievements: number;
  tier: string;
}

// Get achievements
export async function getAchievements(partnerId: string) {
  console.log(`🏆 Getting achievements for partner ${partnerId}`);
  
  try {
    // Get partner stats
    const [stats] = await db.all(
      `SELECT 
         COUNT(DISTINCT p.id) as total_products,
         COUNT(DISTINCT o.id) as total_orders,
         SUM(o.total_amount) as total_revenue,
         COUNT(DISTINCT r.id) as total_referrals
       FROM partners p
       LEFT JOIN products pr ON p.id = pr.partner_id
       LEFT JOIN orders o ON p.id = o.partner_id
       LEFT JOIN referrals r ON p.id = r.referrer_partner_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [partnerId]
    );
    
    const achievements: Achievement[] = [];
    
    // Sales achievements
    if (stats.total_orders >= 100) {
      achievements.push({
        id: 'sales_100',
        name: '100 ta Buyurtma',
        description: '100 ta buyurtma yetkazib berdingiz!',
        icon: '🎯',
        points: 100,
        category: 'sales',
        requirement: { type: 'orders', value: 100 }
      });
    }
    
    if (stats.total_revenue >= 10000000) {
      achievements.push({
        id: 'revenue_10m',
        name: '10M Aylanma',
        description: '10 million so\'m aylanma!',
        icon: '💰',
        points: 200,
        category: 'sales',
        requirement: { type: 'revenue', value: 10000000 }
      });
    }
    
    // Referral achievements
    if (stats.total_referrals >= 10) {
      achievements.push({
        id: 'referral_10',
        name: '10 ta Referral',
        description: '10 ta hamkorni taklif qildingiz!',
        icon: '👥',
        points: 150,
        category: 'referral',
        requirement: { type: 'referrals', value: 10 }
      });
    }
    
    // Product achievements
    if (stats.total_products >= 50) {
      achievements.push({
        id: 'products_50',
        name: '50 ta Mahsulot',
        description: '50 ta mahsulot qo\'shdingiz!',
        icon: '📦',
        points: 75,
        category: 'product',
        requirement: { type: 'products', value: 50 }
      });
    }
    
    return achievements;
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return [];
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  console.log(`🏅 Getting leaderboard (top ${limit})`);
  
  try {
    const leaderboard = await db.all(
      `SELECT 
         p.id as partner_id,
         p.business_name as partner_name,
         COALESCE(SUM(a.points), 0) as total_points,
         COUNT(DISTINCT a.id) as achievements_count,
         p.pricing_tier as tier
       FROM partners p
       LEFT JOIN achievements a ON p.id = a.partner_id
       WHERE p.approved = 1
       GROUP BY p.id, p.business_name, p.pricing_tier
       ORDER BY total_points DESC
       LIMIT ?`,
      [limit]
    );
    
    return leaderboard.map((entry, index) => ({
      partnerId: entry.partner_id,
      partnerName: entry.partner_name,
      totalPoints: entry.total_points || 0,
      rank: index + 1,
      achievements: entry.achievements_count || 0,
      tier: entry.tier || 'free_starter'
    }));
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return [];
  }
}

// Award achievement
export async function awardAchievement(partnerId: string, achievementId: string) {
  console.log(`🎖️ Awarding achievement ${achievementId} to partner ${partnerId}`);
  
  try {
    // Check if already awarded
    const existing = await db.get(
      `SELECT id FROM achievements WHERE partner_id = ? AND achievement_id = ?`,
      [partnerId, achievementId]
    );
    
    if (existing) {
      return { success: false, message: 'Achievement already awarded' };
    }
    
    // Award achievement
    await db.run(
      `INSERT INTO achievements (partner_id, achievement_id, awarded_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [partnerId, achievementId]
    );
    
    return { success: true, message: 'Achievement awarded' };
  } catch (error: any) {
    console.error('Award achievement error:', error);
    return { success: false, message: error.message };
  }
}

// Get rewards
export async function getRewards(partnerId: string) {
  console.log(`🎁 Getting rewards for partner ${partnerId}`);
  
  try {
    const [points] = await db.all(
      `SELECT COALESCE(SUM(points), 0) as total_points
       FROM achievements a
       JOIN achievement_definitions ad ON a.achievement_id = ad.id
       WHERE a.partner_id = ?`,
      [partnerId]
    );
    
    const totalPoints = points?.total_points || 0;
    
    // Calculate available rewards
    const rewards = [
      {
        id: 'discount_10',
        name: '10% Chegirma',
        description: 'Keyingi to\'lovda 10% chegirma',
        pointsRequired: 100,
        available: totalPoints >= 100
      },
      {
        id: 'free_month',
        name: '1 Oy Bepul',
        description: '1 oy bepul tarif',
        pointsRequired: 500,
        available: totalPoints >= 500
      },
      {
        id: 'premium_features',
        name: 'Premium Xususiyatlar',
        description: '1 oy premium xususiyatlar',
        pointsRequired: 300,
        available: totalPoints >= 300
      }
    ];
    
    return {
      totalPoints,
      rewards: rewards.filter(r => r.available),
      allRewards: rewards
    };
  } catch (error: any) {
    console.error('Get rewards error:', error);
    return { totalPoints: 0, rewards: [], allRewards: [] };
  }
}

export default {
  getAchievements,
  getLeaderboard,
  awardAchievement,
  getRewards
};

