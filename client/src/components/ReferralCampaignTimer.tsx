// Referral Campaign Timer - Animatsiyali taymer va olov effekti
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock, Target, Gift } from 'lucide-react';

interface CampaignTimerProps {
  endDate: number; // Unix timestamp
  targetReferrals: number;
  currentReferrals: number;
  bonusAmount: number;
  campaignName: string;
}

export function ReferralCampaignTimer({
  endDate,
  targetReferrals,
  currentReferrals,
  bonusAmount,
  campaignName
}: CampaignTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const end = endDate * 1000; // Convert to milliseconds
      const diff = Math.max(0, end - now);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        total: diff
      });

      // Urgent mode: less than 24 hours
      setIsUrgent(diff < 24 * 60 * 60 * 1000);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const progress = Math.min(100, (currentReferrals / targetReferrals) * 100);
  const isCompleted = currentReferrals >= targetReferrals;
  const isExpired = timeLeft.total === 0;

  return (
    <Card className={`relative overflow-hidden ${isUrgent ? 'border-orange-500 border-2 animate-pulse' : 'border-purple-200'}`}>
      {/* Olov effekti (urgent mode) */}
      {isUrgent && !isExpired && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/20 via-red-500/10 to-transparent animate-pulse" />
          <div className="absolute top-2 right-2">
            <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
          </div>
        </div>
      )}

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            {campaignName}
          </h3>
          {isUrgent && !isExpired && (
            <Badge variant="destructive" className="animate-pulse">
              <Flame className="w-3 h-3 mr-1" />
              Shoshilinch!
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              ✅ G'olib bo'ldingiz!
            </Badge>
          )}
          {isExpired && (
            <Badge variant="secondary">
              Tugadi
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentReferrals} / {targetReferrals}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : isUrgent ? 'bg-orange-500' : 'bg-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        {!isExpired && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className={`text-center p-3 rounded-lg ${isUrgent ? 'bg-orange-100 border-2 border-orange-500' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`}>
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Kun</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isUrgent ? 'bg-orange-100 border-2 border-orange-500' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Soat</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isUrgent ? 'bg-orange-100 border-2 border-orange-500' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Daqiqa</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isUrgent ? 'bg-orange-100 border-2 border-orange-500 animate-pulse' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Soniya</div>
            </div>
          </div>
        )}

        {/* Bonus Info */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Qolgan:</span>
            <span className="text-sm font-bold text-purple-600">
              {Math.max(0, targetReferrals - currentReferrals)} ta taklif
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-600">
              ${bonusAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

