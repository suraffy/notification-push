import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function POST(req: Request) {
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

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
