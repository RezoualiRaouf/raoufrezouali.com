export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for');
  const ua = req.headers.get('user-agent');
  console.log({ time: new Date(), ip, ua });

  return Response.redirect(
    'https://raoufrezouali.com/card?src=qr&utm_source=business_card&utm_medium=qr_code&utm_campaign=2026',
    302
  );
}