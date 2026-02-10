// Placeholder route for single-user retrieval
// TODO: implement using prisma and proper public/private fields + auth
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  return new Response(
    JSON.stringify({ message: `Placeholder: return user ${id} (not implemented)` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
