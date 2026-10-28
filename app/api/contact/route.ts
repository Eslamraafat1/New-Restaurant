/** DEMO endpoint: the message is validated and discarded. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; email?: string; message?: string } | null;
  if (!body?.name || !body.email || !body.message) {
    return Response.json({ error: "name, email and message are required" }, { status: 422 });
  }
  return Response.json({ ok: true, demo: true });
}
