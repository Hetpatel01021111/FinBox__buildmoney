import { seedTransactions } from "@/actions/seed";

// This is a development-only endpoint for seeding the database
export async function GET() {
  try {
    console.log("Starting database seed...");
    const result = await seedTransactions();
    console.log("Seed result:", result);
    return Response.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}