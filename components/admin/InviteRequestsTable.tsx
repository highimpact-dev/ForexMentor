"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { formatCodeForDisplay } from "@/lib/inviteCodeGenerator";

type Status = "pending" | "approved" | "rejected" | "flagged";

export function InviteRequestsTable() {
  const [selectedStatus, setSelectedStatus] = useState<Status | "all">("pending");
  const [processingId, setProcessingId] = useState<Id<"inviteRequests"> | null>(
    null
  );

  const requests = useQuery(
    api.inviteRequests.getAllRequests,
    selectedStatus === "all" ? {} : { status: selectedStatus }
  );
  const createCode = useMutation(api.inviteCodes.createInviteCode);
  const approveRequest = useMutation(api.inviteRequests.approveRequest);
  const rejectRequest = useMutation(api.inviteRequests.rejectRequest);

  const handleApprove = async (requestId: Id<"inviteRequests">) => {
    setProcessingId(requestId);
    try {
      // Create invite code for this request
      await createCode({ requestId });
      // Note: createCode already updates the request status to approved
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: Id<"inviteRequests">) => {
    const reason = prompt(
      "Enter reason for rejection (will be shown to user):"
    );
    if (!reason) return;

    setProcessingId(requestId);
    try {
      await rejectRequest({ requestId, adminNotes: reason });
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  if (!requests) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  const statusBadge = (status: Status) => {
    const styles = {
      pending: "bg-yellow-600/20 text-yellow-600 border-yellow-600/30",
      approved: "bg-green-600/20 text-green-600 border-green-600/30",
      rejected: "bg-red-600/20 text-red-600 border-red-600/30",
      flagged: "bg-orange-600/20 text-orange-600 border-orange-600/30",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatExperience = (exp: string) => {
    const labels: Record<string, string> = {
      never: "Beginner",
      less_than_3_months: "< 3 months",
      "3_to_12_months": "3-12 months",
      "1_plus_years": "1+ years",
    };
    return labels[exp] || exp;
  };

  const formatChallenge = (challenge: string) => {
    const labels: Record<string, string> = {
      emotional_decisions: "Emotional Decisions",
      lack_of_discipline: "Lack of Discipline",
      no_accountability: "No Accountability",
      information_overload: "Information Overload",
    };
    return labels[challenge] || challenge;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Invite Requests
          </h3>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status | "all")}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Experience
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Challenge
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Motivation
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
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {request.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatExperience(request.tradingExperience)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatChallenge(request.primaryChallenge)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground max-w-xs truncate">
                      {request.motivation}
                    </p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(request.status)}</td>
                  <td className="px-4 py-3">
                    {request.status === "approved" && request.inviteCodeId ? (
                      <span className="text-xs text-green-600 font-mono">
                        Code sent
                      </span>
                    ) : request.status === "pending" ||
                      request.status === "flagged" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="p-1.5 rounded bg-green-600/20 text-green-600 hover:bg-green-600/30 disabled:opacity-50"
                          title="Approve and send invite code"
                        >
                          {processingId === request._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={processingId === request._id}
                          className="p-1.5 rounded bg-red-600/20 text-red-600 hover:bg-red-600/30 disabled:opacity-50"
                          title="Reject request"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {request.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
