"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Wind,
  Droplets,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Navigation,
  Star,
  X,
  Umbrella,
} from "lucide-react";

// Fonction d'icône & libellé selon le code météo WMO
const getWeatherDetails = (code: number) => {
  if (code === 0)
    return { label: "Ensoleillé", Icon: Sun, color: "text-yellow-400" };
  if ([1, 2, 3].includes(code))
    return { label: "Nuageux", Icon: CloudSun, color: "text-yellow-300" };
  if ([45, 48].includes(code))
    return { label: "Brouillard", Icon: CloudFog, color: "text-slate-400" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Pluie", Icon: CloudRain, color: "text-blue-400" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Neige", Icon: CloudSnow, color: "text-cyan-200" };
  if ([95, 96, 99].includes(code))
    return { label: "Orage", Icon: CloudLightning, color: "text-purple-400" };
  return { label: "Ciel couvert", Icon: Cloud, color: "text-slate-300" };
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Chargement des favoris depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Sauvegarde des favoris dans localStorage
  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    localStorage.setItem("weather_favorites", JSON.stringify(newFavs));
  };

  const toggleFavorite = (cityName: string) => {
    if (favorites.includes(cityName)) {
      saveFavorites(favorites.filter((f) => f !== cityName));
    } else {
      saveFavorites([...favorites, cityName]);
    }
  };

  // Chargement météo par nom de ville
  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(cityName)}`,
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Erreur");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Impossible de charger la météo");
    } finally {
      setLoading(false);
    }
  };

  // Chargement météo par GPS
  const fetchWeatherByGPS = () => {
    if (!navigator.geolocation) {
      fetchWeather("Paris");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}`,
          );
          const result = await res.json();
          if (!res.ok || result.error)
            throw new Error(result.error || "Erreur");
          setData(result);
        } catch (err: any) {
          setError(err.message || "Erreur GPS");
        } finally {
          setLoading(false);
        }
      },
      () => {
        // En cas de refus du GPS, fallback sur Paris
        fetchWeather("Paris");
      },
      { timeout: 7000 },
    );
  };

  // Détection GPS au premier chargement
  useEffect(() => {
    fetchWeatherByGPS();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) fetchWeather(search);
  };

  const currentDetails = data?.current
    ? getWeatherDetails(data.current.weather_code)
    : null;
  const CurrentIcon = currentDetails?.Icon || CloudSun;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Barre de recherche + Bouton GPS */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
          </div>

          <button
            type="button"
            onClick={fetchWeatherByGPS}
            title="Utiliser ma position GPS"
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 p-3 rounded-2xl border border-slate-700 transition shadow-lg"
          >
            <Navigation className="w-5 h-5" />
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl font-medium transition shadow-lg"
          >
            Chercher
          </button>
        </form>

        {/* Liste des villes favorites */}
        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 mr-1">Favoris :</span>
            {favorites.map((fav) => (
              <span
                key={fav}
                className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-sm px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-700 transition"
              >
                <button
                  onClick={() => fetchWeather(fav)}
                  className="font-medium text-slate-200"
                >
                  {fav}
                </button>
                <button
                  onClick={() => toggleFavorite(fav)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* États Chargement / Erreur */}
        {loading && (
          <p className="text-center text-slate-400 py-12">
            Chargement des données météo...
          </p>
        )}
        {error && <p className="text-center text-red-400 py-12">{error}</p>}

        {/* Contenu principal météo */}
        {!loading && !error && data?.current && (
          <div className="space-y-6">
            {/* Carte météo actuelle */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold">
                    {data.location.name}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {data.location.country}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(data.location.name)}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition"
                  title="Ajouter aux favoris"
                >
                  <Star
                    className={`w-6 h-6 ${
                      favorites.includes(data.location.name)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-400"
                    }`}
                  />
                </button>
              </div>

              <div className="my-6 flex items-center justify-between">
                <div>
                  <div className="text-6xl font-black">
                    {Math.round(data.current.temperature_2m)}°C
                  </div>
                  <p className="text-slate-300 mt-1 font-medium">
                    {currentDetails?.label}
                  </p>
                </div>
                <CurrentIcon className={`w-24 h-24 ${currentDetails?.color}`} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/60">
                <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-2xl">
                  <Droplets className="text-blue-400 w-6 h-6" />
                  <div>
                    <p className="text-xs text-slate-400">Humidité</p>
                    <p className="font-bold">
                      {data.current.relative_humidity_2m}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-2xl">
                  <Wind className="text-slate-300 w-6 h-6" />
                  <div>
                    <p className="text-xs text-slate-400">Vent</p>
                    <p className="font-bold">
                      {Math.round(data.current.wind_speed_10m)} km/h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider heure par heure (24h) */}
            {data.hourly?.time && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-lg font-bold mb-4 text-slate-200">
                  Prochaines 24 heures
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                  {data.hourly.time
                    .slice(0, 24)
                    .map((timeStr: string, idx: number) => {
                      const hour = new Date(timeStr).getHours();
                      const temp = Math.round(data.hourly.temperature_2m[idx]);
                      const code = data.hourly.weather_code[idx];
                      const rain =
                        data.hourly.precipitation_probability?.[idx] ?? 0;
                      const { Icon, color } = getWeatherDetails(code);

                      return (
                        <div
                          key={timeStr}
                          className="flex-shrink-0 flex flex-col items-center bg-slate-700/30 p-3.5 rounded-2xl border border-slate-700/50 min-w-[75px]"
                        >
                          <span className="text-xs text-slate-400 font-medium">
                            {hour}h00
                          </span>
                          <Icon className={`w-7 h-7 my-2 ${color}`} />
                          <span className="font-bold text-sm">{temp}°C</span>
                          {rain > 0 && (
                            <span className="text-[10px] text-blue-400 flex items-center gap-0.5 mt-1 font-semibold">
                              <Umbrella className="w-2.5 h-2.5" />
                              {rain}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Prévisions 7 jours */}
            {data.daily?.time && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-lg font-bold mb-4 text-slate-200">
                  Prévisions sur 7 jours
                </h2>
                <div className="space-y-3">
                  {data.daily.time.map((dateStr: string, idx: number) => {
                    const dateObj = new Date(dateStr);
                    const dayName =
                      idx === 0
                        ? "Aujourd'hui"
                        : dateObj.toLocaleDateString("fr-FR", {
                            weekday: "long",
                          });

                    const maxTemp = Math.round(
                      data.daily.temperature_2m_max[idx],
                    );
                    const minTemp = Math.round(
                      data.daily.temperature_2m_min[idx],
                    );
                    const code = data.daily.weather_code[idx];
                    const rain =
                      data.daily.precipitation_probability_max?.[idx] ?? 0;
                    const { Icon, color } = getWeatherDetails(code);

                    return (
                      <div
                        key={dateStr}
                        className="flex items-center justify-between bg-slate-700/30 p-3.5 rounded-2xl border border-slate-700/40"
                      >
                        <span className="font-medium text-sm capitalize w-28 text-slate-200">
                          {dayName}
                        </span>

                        <div className="flex items-center gap-2 w-24">
                          <Icon className={`w-6 h-6 ${color}`} />
                          {rain > 0 && (
                            <span className="text-xs text-blue-400 font-semibold flex items-center gap-0.5">
                              <Umbrella className="w-3 h-3" />
                              {rain}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400 font-medium">
                            {minTemp}°
                          </span>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full w-full" />
                          </div>
                          <span className="font-bold text-white">
                            {maxTemp}°
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
