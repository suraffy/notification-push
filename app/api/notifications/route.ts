import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const validTypes = ["System", "Customer", "Internal"];
const validDeliveryMethods = ["InApp", "Email", "Text"];

export async function POST(req: Request) {
  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { userId, type, deliveryMethod, title, message } = requestBody;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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

    const notification = await prisma.notification.create({
      data: { userId, type, deliveryMethod, title, message },
    });

    const io = (global as any).io;
    if (io && userId && deliveryMethod === "InApp") {
      io.to(userId.toString()).emit("new_notification", notification);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    if (deliveryMethod === "Email") {
      try {
        await sendEmail(user.email, title, message);
        return NextResponse.json(
          {
            notificationId: notification.id,
            receiver: user.email,
            subject: title,
            body: message,
          },
          { status: 201 }
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 }
        );
      }
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
