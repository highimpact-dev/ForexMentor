"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gift, Share2, Trophy } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function ReferralStats() {
  const { user } = useUser();
  const userId = user?.id;

  const myInviteCode = useQuery(
    api.userProfiles.getMyInviteCode,
    userId ? {} : "skip"
  );

  const referralStats = useQuery(
    api.userProfiles.getReferralStats,
    userId ? { userId } : "skip"
  );

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    userId ? { userId } : "skip"
  );

  if (!userId || !myInviteCode || !referralStats || !userProfile) {
    return null;
  }

  const formatCode = (code: string) => {
    return code.match(/.{1,4}/g)?.join("-") || code;
  };

  const expiryDate = new Date(myInviteCode.expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Invite Code Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Your Invite Code
          </CardTitle>
          <CardDescription>
            Share this code with friends and earn 10 bonus trades for each person who joins!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border-2 border-purple-200 dark:border-purple-800">
            <p className="text-sm text-muted-foreground mb-2">Your Code</p>
            <p className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 tracking-wider">
              {formatCode(myInviteCode.code)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
              <p className="text-muted-foreground">Uses Remaining</p>
              <p className="text-2xl font-bold text-foreground">
                {myInviteCode.usesRemaining}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
              <p className="text-muted-foreground">Expires</p>
              <p className="text-sm font-semibold text-foreground">{expiryDate}</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Reward:</strong> Get 10 bonus trades for each friend who signs up with your code!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Friends who joined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Trades</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userProfile.bonusTradeAllowance}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {referralStats.totalBonusTrades}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trades earned from referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      {referralStats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              People who joined using your invite code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referralStats.referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex flex-col">
                    <p className="font-medium text-sm">{referral.referredUserEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.isProcessed ? (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{referral.rewardAmount} trades
                      </span>
                    ) : (
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
