"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  ShieldOff,
  Trash2,
  Crown,
  Mail,
  Users,
  UserPlus,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminUserWithRole } from "@/lib/types/admin.types";
import { setAdminRole, inviteAdmin, deleteAdminUser } from "@/actions/admin.actions";

interface AdminsClientProps {
  users: AdminUserWithRole[];
  currentClerkId: string;
}

export function AdminsClient({ users: initialUsers, currentClerkId }: AdminsClientProps) {
  const t = useTranslations("admins");

  const [users, setUsers] = useState(initialUsers);

  // Role toggle
  const [isPending, startTransition] = useTransition();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AdminUserWithRole | null>(null);
  const [isDeleting, startDelete] = useTransition();

  // Invite
  const [email, setEmail] = useState("");
  const [isInviting, startInviting] = useTransition();
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const adminCount = users.filter((u) => u.isAdmin).length;
  const userCount = users.filter((u) => !u.isAdmin).length;

  function handleToggleRole(clerkId: string, currentIsAdmin: boolean) {
    setRoleError(null);
    setActioningId(clerkId);
    startTransition(async () => {
      const result = await setAdminRole(clerkId, !currentIsAdmin);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.clerkId === clerkId ? { ...u, isAdmin: !currentIsAdmin } : u))
        );
      } else {
        setRoleError(result.error);
      }
      setActioningId(null);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startDelete(async () => {
      const result = await deleteAdminUser(deleteTarget.clerkId);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.clerkId !== deleteTarget.clerkId));
      }
      setDeleteTarget(null);
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

  const displayName = (u: AdminUserWithRole) =>
    u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : u.email;

  const initials = (u: AdminUserWithRole) =>
    (`${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`).toUpperCase() ||
    u.email[0]?.toUpperCase() ||
    "?";

  return (
    <div className="space-y-5">
      {/* ── Users Card ── */}
      <Card className="overflow-hidden">
        {/* Card header with stats */}
        <div className="bg-muted/40 border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{t("tableTitle")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
              {adminCount === 1 ? t("adminCount", { count: adminCount }) : t("adminCountPlural", { count: adminCount })}
            </span>
            <span className="bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full">
              {userCount === 1 ? t("userCount", { count: userCount }) : t("userCountPlural", { count: userCount })}
            </span>
          </div>
        </div>

        {roleError && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-2.5">
            <p className="text-sm text-destructive">{roleError}</p>
          </div>
        )}

        <div className="divide-y">
          {users.map((user) => {
            const isSelf = user.clerkId === currentClerkId;
            const isActioning = actioningId === user.clerkId && isPending;
            const canDemote = user.isAdmin && !user.isMaster && !isSelf;
            const canDelete = !user.isMaster && !isSelf;

            return (
              <div
                key={user.clerkId}
                className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${
                  user.isMaster ? "bg-primary/5" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                    <AvatarImage src={user.imageUrl} alt={displayName(user)} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {initials(user)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isMaster && (
                    <span className="absolute -top-1 -end-1 bg-amber-400 rounded-full p-0.5 shadow">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{displayName(user)}</p>
                    {user.isMaster && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs py-0 px-1.5 gap-1"
                      >
                        <Crown className="h-2.5 w-2.5" />
                        {t("masterAdmin")}
                      </Badge>
                    )}
                    {isSelf && !user.isMaster && (
                      <Badge variant="outline" className="text-xs py-0 px-1.5 text-muted-foreground">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>

                {/* Role + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={user.isAdmin ? "default" : "secondary"}
                    className={user.isAdmin ? "bg-primary/90" : ""}
                  >
                    {user.isAdmin ? t("roleAdmin") : t("roleUser")}
                  </Badge>

                  {/* Promote / Demote */}
                  {!user.isMaster && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isActioning || (isSelf && user.isAdmin)}
                      onClick={() => handleToggleRole(user.clerkId, user.isAdmin)}
                      className={
                        user.isAdmin && canDemote
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-primary hover:text-primary"
                      }
                    >
                      {user.isAdmin ? (
                        <ShieldOff className="me-1.5 h-3.5 w-3.5" />
                      ) : (
                        <ShieldCheck className="me-1.5 h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {isActioning ? "..." : user.isAdmin ? t("demote") : t("promote")}
                      </span>
                    </Button>
                  )}

                  {/* Delete */}
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Invite Card ── */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 border-b pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">{t("inviteTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">{t("inviteDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs font-medium">
                {t("inviteEmail")}
              </Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="ps-9"
                />
              </div>
            </div>

            {inviteMsg && (
              <>
                <Separator />
                <p
                  className={`text-sm ${
                    inviteMsg.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {inviteMsg.text}
                </p>
              </>
            )}

            <Button type="submit" disabled={isInviting} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {isInviting ? t("inviting") : t("inviteBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-center">{t("deleteConfirmTitle")}</DialogTitle>
            <DialogDescription className="text-center">
              {deleteTarget &&
                t("deleteConfirmDesc", { name: displayName(deleteTarget) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
