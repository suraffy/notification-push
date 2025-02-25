import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextApiResponse } from "next";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const validTypes = ["System", "Customer", "Internal"];
const validDeliveryMethods = ["InApp", "Email", "Text"];

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const { userId, type, deliveryMethod, title, message } = await req.json();

    // Validate type and deliveryMethod
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 }
      );
    }

    if (!validDeliveryMethods.includes(deliveryMethod)) {
      return NextResponse.json(
        { error: "Invalid delivery method" },
        { status: 400 }
      );
    }

    // Create a new notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        deliveryMethod,
        title,
        message,
      },
    });

    // Get the global io instance
    const io = (global as any).io;
    if (io) {
      console.log(`Sending notification to room: ${userId}`);
      io.to(userId).emit("new_notification", notification);
    } else {
      console.error("Socket.IO instance not found.");
    }

    // Fetch the user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }, // Only get the email
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send an email if the delivery method is "Email"
    if (deliveryMethod === "Email") {
      await sendEmail(user.email, title, message);
      return NextResponse.json(
        {
          notificationId: notification.id,
          recipientEmail: user.email,
          subject: title,
          message: message,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
