import bcrypt from "bcryptjs";
import postgres from "postgres";
import {payments, bills, users} from "../../lib/placeholder-data";

const sql = postgres(process.env.POSTGRES_URL!, {ssl:"require"});

async function seedUsers(){
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL, 
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );
    `;

    const insertedUsers = await Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return sql`
                INSERT INTO users(id, name, email, password)
                VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
                ON CONFLICT (id) DO NOTHING;
            `;
        }),
    );

    return insertedUsers;
}

async function seedPayments(){
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
        CREATE TABLE IF NOT EXISTS payments (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            vendor VARCHAR(255) NOT NULL,
            amount INT NOT NULL,
            created_at TIMESTAMP NOT NULL
        );
    `;

    const insertedPayments = await Promise.all(
        payments.map(
            (payment) => sql`
                INSERT INTO payments (id, category, vendor, amount, created_at)
                VALUES (${payment.id}, ${payment.category}, ${payment.vendor}, ${payment.amount}, ${payment.created_at})
                ON CONFLICT (id) DO NOTHING;
            `,
        ),
    );

    return insertedPayments;
}

async function seedBills(){
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
        CREATE TABLE IF NOT EXISTS bills (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            vendor VARCHAR(255) NOT NULL,
            amount INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL
        );
    `;

    const insertedBills = await Promise.all(
        bills.map(
            (bill) => sql`
                INSERT INTO bills (id, category, vendor, amount, status, created_at)
                VALUES (${bill.id}, ${bill.category}, ${bill.vendor}, ${bill.amount}, ${bill.status}, ${bill.created_at})
                ON CONFLICT (id) DO NOTHING;
            `,
        ),
    );
    return insertedBills;
}

export async function GET(){
    try{
        const result = await sql.begin((sql) => [
            seedUsers(),
            seedPayments(),
            seedBills(),
        ]);

        return Response.json({message:"Database seeded successfully"});
    } catch(error){
        return Response.json({error}, {status: 500});
    }
}