"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Copy, Plus, Loader2, Ban, CheckCircle } from "lucide-react";
import { formatCodeForDisplay } from "@/lib/inviteCodeGenerator";

export function InviteCodesTable() {
  const [isCreating, setIsCreating] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const codes = useQuery(api.inviteCodes.getAllCodes, { includeInactive: true });
  const createCode = useMutation(api.inviteCodes.createInviteCode);
  const bulkCreate = useMutation(api.inviteCodes.bulkCreateCodes);
  const deactivate = useMutation(api.inviteCodes.deactivateCode);
  const reactivate = useMutation(api.inviteCodes.reactivateCode);

  const handleCreateSingle = async () => {
    setIsCreating(true);
    try {
      await createCode({});
    } catch (error) {
      console.error("Error creating code:", error);
      alert("Failed to create invite code");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBulkCreate = async () => {
    if (bulkCount < 1 || bulkCount > 100) {
      alert("Please enter a number between 1 and 100");
      return;
    }

    setIsCreating(true);
    try {
      await bulkCreate({ count: bulkCount });
    } catch (error) {
      console.error("Error creating codes:", error);
      alert("Failed to create invite codes");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const handleToggleActive = async (
    codeId: Id<"inviteCodes">,
    isActive: boolean
  ) => {
    try {
      if (isActive) {
        await deactivate({ codeId });
      } else {
        await reactivate({ codeId });
      }
    } catch (error) {
      console.error("Error toggling code:", error);
      alert(error instanceof Error ? error.message : "Failed to toggle code");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: number) => Date.now() > expiresAt;

  if (!codes) {
    return <div className="text-center py-8">Loading codes...</div>;
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Invite Codes
          </h3>
          <button
            onClick={handleCreateSingle}
            disabled={isCreating}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Code
          </button>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
          <label className="text-sm text-foreground">Bulk create:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={bulkCount}
            onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-1.5 rounded bg-background border border-border text-foreground text-sm"
          />
          <button
            onClick={handleBulkCreate}
            disabled={isCreating}
            className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
          <span className="text-xs text-muted-foreground">
            (max 100 codes at once)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Usage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Expires
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No invite codes yet
                </td>
              </tr>
            ) : (
              codes.map((code) => {
                const expired = isExpired(code.expiresAt);
                return (
                  <tr key={code._id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold text-foreground">
                          {formatCodeForDisplay(code.code)}
                        </code>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1 hover:bg-muted rounded"
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (code.currentUses / code.maxUses) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {code.currentUses}/{code.maxUses}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatDate(code.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      {expired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600/20 text-red-600 border border-red-600/30">
                          Expired
                        </span>
                      ) : code.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/20 text-green-600 border border-green-600/30">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600/20 text-gray-600 border border-gray-600/30">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!expired && (
                        <button
                          onClick={() =>
                            handleToggleActive(code._id, code.isActive)
                          }
                          className={`text-xs px-2 py-1 rounded ${
                            code.isActive
                              ? "bg-red-600/20 text-red-600 hover:bg-red-600/30"
                              : "bg-green-600/20 text-green-600 hover:bg-green-600/30"
                          }`}
                        >
                          {code.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
