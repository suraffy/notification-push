import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const updatedNotifications = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    if (updatedNotifications.count === 0) {
      return NextResponse.json(
        { message: "No unread notifications found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "All notifications marked as read" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
