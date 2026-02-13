"use client";

import { useEffect, useState } from "react";
import { Card, Empty, Spin, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddEventModal from "@/components/addEventModal";
import Image from "next/image";

/**
 * My Events page - displays user's created and registered events
 */
export default function MyEventsClient() {
  type EventSummary = {
    id: string;
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    locationCity: string;
    locationAddress: string;
    price: string;
    createdAt: string;
    imageUrls?: string[];
  };

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>({});

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "Date TBD";
    }

    const sameDay = startDate.toDateString() === endDate.toDateString();
    const startLabel = startDate.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const endLabel = endDate.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return sameDay ? `${startLabel} - ${endLabel}` : `${startLabel} - ${endDate.toLocaleString()}`;
  };

  const extractS3Key = (value: string) => {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      try {
        const parsed = new URL(value);
        return parsed.pathname.replace(/^\//, "");
      } catch {
        return value.replace(/^\//, "");
      }
    }

    return value.replace(/^\//, "");
  };

  const isAbsoluteUrl = (value: string) =>
    value.startsWith("http://") || value.startsWith("https://");

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/event", { method: "GET" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load events");
        }

        if (isMounted) {
          setEvents(Array.isArray(data?.events) ? data.events : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load events");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPresignedImages = async () => {
      const urls = events
        .flatMap((event) => event.imageUrls || [])
        .filter((url) => typeof url === "string" && url.trim().length > 0);

      if (urls.length === 0) {
        return;
      }

      const uniqueUrls = Array.from(new Set(urls));

      const entries = await Promise.all(
        uniqueUrls.map(async (originalUrl) => {
          try {
            const key = extractS3Key(originalUrl);
            const response = await fetch(`/api/get-image?key=${encodeURIComponent(key)}`);
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data?.error || "Failed to load image");
            }

            return [originalUrl, data?.url || originalUrl] as const;
          } catch {
            return [originalUrl, originalUrl] as const;
          }
        }),
      );

      if (isMounted) {
        setPresignedUrls((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    };

    loadPresignedImages();

    return () => {
      isMounted = false;
    };
  }, [events]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <AddEventModal open={showModal} setOpen={setShowModal} />
      <Card
        title="My Events"
        style={{ marginBottom: 24 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
            Create Event
          </Button>
        }
      >
        {errorMessage ? (
          <Empty description={errorMessage} />
        ) : events.length === 0 ? (
          <Empty description="No events yet. Create one to get started!" />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {events.map((event) => (
              <Card key={event.id} hoverable style={{ borderRadius: 12 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {event.imageUrls?.[0] &&
                    isAbsoluteUrl(presignedUrls[event.imageUrls[0]] || event.imageUrls[0]) ? (
                    <Image
                      src={presignedUrls[event.imageUrls[0]] || event.imageUrls[0]}
                      alt={event.title}
                      width={96}
                      height={96}
                      style={{
                        borderRadius: 10,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b7280",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        flexShrink: 0,
                      }}
                    >
                      No Image
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}>
                      {formatDateRange(event.startDateTime, event.endDateTime)}
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}>
                      {event.locationAddress}, {event.locationCity}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {event.price === "0" ? "Free" : `Price: ${event.price}`}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
