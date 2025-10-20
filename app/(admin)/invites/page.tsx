"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InviteRequestsTable } from "@/components/admin/InviteRequestsTable";
import { InviteCodesTable } from "@/components/admin/InviteCodesTable";
import { InviteStats } from "@/components/admin/InviteStats";
import { EmailTester } from "@/components/admin/EmailTester";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminInvitesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Invite System Management
        </h1>
        <p className="text-muted-foreground">
          Manage invite requests, codes, and monitor system security
        </p>
      </div>

      <InviteStats />

      <Tabs defaultValue="requests" className="mt-8">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="requests">Invite Requests</TabsTrigger>
          <TabsTrigger value="codes">Invite Codes</TabsTrigger>
          <TabsTrigger value="email-testing">Email Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <InviteRequestsTable />
        </TabsContent>

        <TabsContent value="codes" className="mt-6">
          <InviteCodesTable />
        </TabsContent>

        <TabsContent value="email-testing" className="mt-6">
          <EmailTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
