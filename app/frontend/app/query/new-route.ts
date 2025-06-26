import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {ssl: "require"});

async function listPayments(){
    const data = await sql`
        SELECT payments.amount, payments.vendor, payments.category
        FROM payments;
    `;
    return data;
}

export async function GET() {
    try {
        return Response.json(await listPayments());
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}