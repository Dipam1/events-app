// Placeholder route for collection-level user endpoints
// TODO: implement using prisma and authentication as needed
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 10)) : 10;

  return new Response(
    JSON.stringify({ message: `Placeholder: return last ${limit} users (not implemented)` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
