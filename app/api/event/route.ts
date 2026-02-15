import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isAuthError } from "@/lib/api-middleware";

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
		const authResult = await requireOrganizer();
		if (isAuthError(authResult)) return authResult.error;
		const { session } = authResult;

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

		// Validate and parse totalTickets
		const totalTickets = parseInt(body.totalTickets, 10);
		if (!Number.isInteger(totalTickets) || totalTickets <= 0) {
			return NextResponse.json(
				{ error: "totalTickets must be a positive integer" },
				{ status: 400 },
			);
		}

		// Validate and parse price
		const price = parseFloat(body.price);
		if (!Number.isFinite(price) || price < 0) {
			return NextResponse.json(
				{ error: "price must be a valid non-negative number" },
				{ status: 400 },
			);
		}

		const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
		const tags = Array.isArray(body.tags) ? body.tags : [];

		// Check for duplicate slug
		const existingEvent = await prisma.event.findUnique({
			where: { slug: body.slug },
		});

		if (existingEvent) {
			return NextResponse.json(
				{ error: `Event with slug "${body.slug}" already exists` },
				{ status: 409 },
			);
		}

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
				totalTickets,
				price,
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


