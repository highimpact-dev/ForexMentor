"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Key, CheckCircle, Clock } from "lucide-react";

export function InviteStats() {
  const requestStats = useQuery(api.inviteRequests.getRequestStats);
  const codeStats = useQuery(api.inviteCodes.getCodeStats);

  if (!requestStats || !codeStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Requests",
      value: requestStats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "Pending Review",
      value: requestStats.pending + requestStats.flagged,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
    {
      title: "Active Codes",
      value: codeStats.activeCodes,
      icon: Key,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      title: "Total Signups",
      value: codeStats.totalUses,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
