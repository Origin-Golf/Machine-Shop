import { query } from '@/lib/db';

// Creates a new machine given a machine JSON object.
export async function POST (request) {
    
    // Gets the body of the request which contains a 'machine' object
    let body = await request.json();

    // The request:
    const jobs = await query ({
        // The SQL query:
        query: `INSERT INTO jobs (id, machine, op, notes, state, log, starter) 
        VALUES (${body.job.id}, '${body.job.machine}', '${body.job.op}', '${body.job.notes}', ${body.job.state}, ${body.job.log}, '${body.job.starter}')`,
        values: [],
    })

    // Returns a JSON representation of the query.
    return new Response(JSON.stringify(jobs));
}