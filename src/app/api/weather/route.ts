import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    let latitude: number;
    let longitude: number;
    let name = "Ma position";
    let country = "";

    // Si on reçoit des coordonnées GPS
    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);

      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
        );
        const geoData = await geoRes.json();
        name = geoData.city || geoData.locality || "Position actuelle";
        country = geoData.countryName || "";
      } catch {
        name = "Position actuelle";
      }
    } else {
      // Sinon recherche par nom de ville
      const targetCity = city || "Paris";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=fr`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json(
          { error: "Ville introuvable" },
          { status: 404 },
        );
      }

      latitude = geoData.results[0].latitude;
      longitude = geoData.results[0].longitude;
      name = geoData.results[0].name;
      country = geoData.results[0].country || "";
    }

    // Récupération météo : Actuelle + 24h + 7 jours
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`,
    );
    const weatherData = await weatherRes.json();

    if (!weatherData.current) {
      return NextResponse.json(
        { error: "Données météo indisponibles" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      location: { name, country, lat: latitude, lon: longitude },
      current: weatherData.current,
      hourly: weatherData.hourly,
      daily: weatherData.daily,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}
