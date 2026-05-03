import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const email = req.headers.get("cf-access-authenticated-user-email")?.trim();
	if (!email) {
		return NextResponse.json(
			{ error: "Not authenticated with Cloudflare Access." },
			{ status: 401 },
		);
	}

	let body: { message_text?: string };
	try {
		body = (await req.json()) as { message_text?: string };
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}

	const apiBase =
		process.env.DBA_API_URL?.trim() ||
		(process.env.NODE_ENV === "production"
			? "https://dba-api.anthony-6b4.workers.dev"
			: "http://localhost:8787");

	let res: Response;
	try {
		res = await fetch(`${apiBase}/api/vault/message`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Cf-Access-Authenticated-User-Email": email,
			},
			body: JSON.stringify({
				message_text: typeof body.message_text === "string" ? body.message_text : "",
			}),
			cache: "no-store",
		});
	} catch {
		return NextResponse.json({ error: "Vault API unreachable." }, { status: 503 });
	}

	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	return NextResponse.json(data, { status: res.status });
}
