import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; notificationId: string } }
) {
  try {
    const { userId, notificationId } = params;

    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found or doesn't belong to the user" },
        { status: 404 }
      );
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully", notificationId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
