"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import User from "@/lib/models/User.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";

interface SyncUserParams {
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export async function syncUser(
  params: SyncUserParams
): Promise<ActionResult<{ userId: string }>> {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: params.clerkId },
      {
        $set: {
          email: params.email,
          username: params.username || "",
          firstName: params.firstName || "",
          lastName: params.lastName || "",
          imageUrl: params.imageUrl || "",
        },
        $setOnInsert: {
          clerkId: params.clerkId,
          pollsCreated: 0,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return ok({ userId: user._id.toString() });
  } catch (error) {
    console.error("syncUser error:", error);
    return err("Failed to sync user");
  }
}

export async function getUserByClerkId(
  clerkId: string
): Promise<ActionResult<{
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  pollsCreated: number;
} | null>> {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId }).lean();
    if (!user) return ok(null);

    return ok({
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      pollsCreated: user.pollsCreated,
    });
  } catch (error) {
    console.error("getUserByClerkId error:", error);
    return err("Failed to get user");
  }
}

export async function deleteUserByClerkId(
  clerkId: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    await connectToDatabase();
    await User.findOneAndDelete({ clerkId });
    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteUserByClerkId error:", error);
    return err("Failed to delete user");
  }
}
