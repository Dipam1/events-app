import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const events = await prisma.event.findMany({
			orderBy: { createdAt: "desc" },
			take: 10,
		});

		return NextResponse.json({ events });
	} catch (error) {
		console.error("Error fetching latest events:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized - valid session required" },
				{ status: 401 },
			);
		}

		if (session.user.role !== "ORGANIZER") {
			return NextResponse.json(
				{ error: "Only organizers can create events" },
				{ status: 403 },
			);
		}

		const body = await req.json();
		const requiredFields = [
			"slug",
			"title",
			"description",
			"startDateTime",
			"endDateTime",
			"locationAddress",
			"locationCity",
			"locationZip",
			"totalTickets",
			"price",
			"type",
		];

		for (const field of requiredFields) {
			if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
				return NextResponse.json(
					{ error: `Missing required field: ${field}` },
					{ status: 400 },
				);
			}
		}

		const startDate = new Date(body.startDateTime);
		const endDate = new Date(body.endDateTime);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			return NextResponse.json(
				{ error: "Invalid startDateTime or endDateTime" },
				{ status: 400 },
			);
		}

		const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
		const tags = Array.isArray(body.tags) ? body.tags : [];

		const event = await prisma.event.create({
			data: {
				organizerUserId: session.user.id,
				slug: body.slug,
				title: body.title,
				description: body.description,
				startDateTime: startDate,
				endDateTime: endDate,
				locationAddress: body.locationAddress,
				locationCity: body.locationCity,
				locationZip: body.locationZip,
				totalTickets: Number(body.totalTickets),
				price: body.price,
				type: body.type,
				imageUrls,
				tags,
			},
		});

		return NextResponse.json({ success: true, event });
	} catch (error) {
		console.error("Error creating event:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}


