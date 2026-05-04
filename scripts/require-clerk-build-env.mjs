const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();

if (!key || !key.startsWith("pk_")) {
  console.error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be set before building a Clerk frontend.");
  process.exit(1);
}
