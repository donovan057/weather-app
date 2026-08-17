import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Paris';

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json({ error: 'Ville introuvable' }, { status: 404 });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData.current) {
      return NextResponse.json({ error: 'Données météo indisponibles' }, { status: 500 });
    }

    return NextResponse.json({
      location: { name, country },
      current: weatherData.current,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur lors de la récupération de la météo' }, { status: 500 });
  }
}