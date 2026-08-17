'use client';

import { useState, useEffect } from 'react';
import { Search, Wind, Droplets, CloudSun } from 'lucide-react';

export default function Home() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
      if (!res.ok) throw new Error('Ville introuvable');
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Paris');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      fetchWeather(search);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700">
        
        {/* Formulaire de recherche */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium transition"
          >
            Chercher
          </button>
        </form>

        {/* Chargement / Erreur */}
        {loading && <p className="text-center text-slate-400 py-8">Chargement de la météo...</p>}
        {error && <p className="text-center text-red-400 py-8">{error}</p>}

        {/* Affichage des métriques */}
        {!loading && !error && data && (
          <div className="text-center">
            <h1 className="text-3xl font-bold">{data.location.name}</h1>
            <p className="text-slate-400 text-sm">{data.location.country}</p>

            <div className="my-6 flex justify-center items-center gap-4">
              <CloudSun className="w-16 h-16 text-yellow-400" />
              <span className="text-5xl font-extrabold">
                {Math.round(data.current.temperature_2m)}°C
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl">
                <Droplets className="text-blue-400 w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-slate-400">Humidité</p>
                  <p className="font-semibold">{data.current.relative_humidity_2m}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl">
                <Wind className="text-slate-300 w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-slate-400">Vent</p>
                  <p className="font-semibold">{Math.round(data.current.wind_speed_10m)} km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}