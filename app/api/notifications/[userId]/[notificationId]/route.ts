import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; notificationId: string } }
) {
  try {
    const { userId, notificationId } = params;

    const deletedNotification = await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    if (deletedNotification.count === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
