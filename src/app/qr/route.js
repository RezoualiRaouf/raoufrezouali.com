// app/qr/route.js
export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for');
  const ua = req.headers.get('user-agent');
  // log to DB, Vercel KV, or even append to a JSON file
  console.log({ time: new Date(), ip, ua });
  return Response.redirect('https://raoufrezouali.com', 302);
}