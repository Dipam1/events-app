'use client'

import { Card, Empty, Spin } from 'antd'

/**
 * My Events page - displays user's created and registered events
 * TODO: Implement fetching and displaying user events
 */
export default function MyEventsPage() {
  // TODO: Add useEffect to fetch user events
  const isLoading = false;
  const events: never[] = [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title="My Events" style={{ marginBottom: 24 }}>
        {events.length === 0 ? (
          <Empty description="No events yet. Create one to get started!" />
        ) : (
          // TODO: Render events list/grid
          <div>Events will be listed here</div>
        )}
      </Card>
    </div>
  );
}