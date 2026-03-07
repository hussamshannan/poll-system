"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldOff, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminUserWithRole } from "@/lib/types/admin.types";
import { setAdminRole, inviteAdmin } from "@/actions/admin.actions";

interface AdminsClientProps {
  users: AdminUserWithRole[];
  currentClerkId: string;
}

export function AdminsClient({ users: initialUsers, currentClerkId }: AdminsClientProps) {
  const t = useTranslations("admins");
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [isInviting, startInviting] = useTransition();
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleToggleRole(clerkId: string, currentIsAdmin: boolean) {
    setRoleError(null);
    setActioningId(clerkId);
    startTransition(async () => {
      const result = await setAdminRole(clerkId, !currentIsAdmin);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.clerkId === clerkId ? { ...u, isAdmin: !currentIsAdmin } : u
          )
        );
      } else {
        setRoleError(result.error);
      }
      setActioningId(null);
    });
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg(null);
    startInviting(async () => {
      const result = await inviteAdmin(email);
      if (result.success) {
        setInviteMsg({ type: "success", text: t("inviteSuccess", { email }) });
        setEmail("");
      } else {
        setInviteMsg({ type: "error", text: result.error || t("inviteError") });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("tableTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {roleError && (
            <p className="px-6 pb-3 text-sm text-destructive">{roleError}</p>
          )}
          <div className="divide-y">
            {users.map((user) => {
              const initials =
                `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() ||
                user.email[0]?.toUpperCase() ||
                "?";
              const isSelf = user.clerkId === currentClerkId;
              const isActioning = actioningId === user.clerkId && isPending;

              return (
                <div
                  key={user.clerkId}
                  className="flex items-center justify-between gap-4 px-6 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user.imageUrl} alt={user.email} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName || user.lastName
                          ? `${user.firstName} ${user.lastName}`.trim()
                          : user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? t("roleAdmin") : t("roleUser")}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActioning || (isSelf && user.isAdmin)}
                      onClick={() => handleToggleRole(user.clerkId, user.isAdmin)}
                    >
                      {user.isAdmin ? (
                        <ShieldOff className="me-1.5 h-3.5 w-3.5" />
                      ) : (
                        <ShieldCheck className="me-1.5 h-3.5 w-3.5" />
                      )}
                      {isActioning
                        ? "..."
                        : user.isAdmin
                        ? t("demote")
                        : t("promote")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("inviteTitle")}</CardTitle>
          <CardDescription>{t("inviteDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">{t("inviteEmail")}</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <Button type="submit" disabled={isInviting} className="shrink-0">
              <Mail className="me-2 h-4 w-4" />
              {isInviting ? t("inviting") : t("inviteBtn")}
            </Button>
          </form>
          {inviteMsg && (
            <p
              className={`mt-3 text-sm ${
                inviteMsg.type === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {inviteMsg.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
