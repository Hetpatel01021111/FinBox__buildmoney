import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("No clerk user found");

    user = await db.user.create({
      data: { 
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName + " " + clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return user;
}