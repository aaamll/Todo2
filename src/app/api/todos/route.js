import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Define CORS headers properly
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight (OPTIONS) request properly
export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers });
}


export async function GET(req) {
  const { data, error } = await supabase.from('todos').select('*');
  return new Response(
    JSON.stringify(error ? { error: error.message } : data),
    { status: error ? 500 : 200, headers }
  );
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { 
      status: 400, 
      headers 
    });
  }

  // Delete the todo from Supabase
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers 
    });
  }

  return new Response(JSON.stringify({ message: "Todo deleted successfully" }), { 
    status: 200, 
    headers 
  });
}





export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.text) {
      return new Response(JSON.stringify({ error: "Missing 'text' field" }), {
        status: 400, headers
      });
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: body.text }])
      .select();

    return new Response(JSON.stringify(error ? { error: error.message } : data), {
      status: error ? 500 : 201, headers
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers
    });
  }
}
