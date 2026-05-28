import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Search, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface KVK {
  name: string;
  address: string;
  phone?: string | null;
  distance?: string;
  lat?: number;
  lng?: number;
}

export function KVKFinder({ onBack }: { onBack: () => void }) {
  const [kvks, setKvks] = useState<KVK[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  const fetchKVKs = async (lat: number, lon: number, city: string, state: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), city, state });
      const res = await fetch(`/api/gemini/kvk?${queryParams}`);
      if (!res.ok) throw new Error('Failed to find KVKs');
      
      const data = await res.json();
      if (data.kvks && Array.isArray(data.kvks)) {
        setKvks(data.kvks);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not locate nearby KVKs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const locateUser = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geocodeRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geocodeData = await geocodeRes.json();
          const city = geocodeData.city || geocodeData.locality || '';
          const state = geocodeData.principalSubdivision || '';
          
          if (city || state) {
            setLocationName(`${city}${city && state ? ', ' : ''}${state}`);
          } else {
            setLocationName('Your Location');
          }
          
          await fetchKVKs(latitude, longitude, city, state);
        } catch (e) {
          setError("Failed to determine city/state.");
          setLoading(false);
        }
      },
      (err) => {
        setError("Location permission denied. Please enable location services.");
        setLoading(false);
      }
    );
  };

  const getDirectionsUrl = (kvk: KVK) => {
    if (kvk.lat && kvk.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${kvk.lat},${kvk.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kvk.name + ' ' + kvk.address)}`;
  };

  const getContactSearchUrl = (kvk: KVK) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${kvk.name} ${kvk.address} phone`)}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto flex flex-col pt-4"
    >
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[var(--surface-soft)] rounded-full transition-colors text-[var(--text-secondary)]"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Nearby KVK Finder</h2>
          <p className="text-[var(--text-secondary)] text-sm">Krishi Vigyan Kendra (Agricultural Science Centre)</p>
        </div>
      </div>

      <div className="bg-[var(--surface-soft)] rounded-[var(--radius-lg)] p-6 border border-[var(--border-subtle)] shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text" 
              readOnly
              value={locationName || 'Detecting your location...'}
              className="w-full bg-white border border-[var(--border-subtle)] rounded-[var(--radius-md)] py-3 pl-12 pr-4 text-[var(--text-primary)] font-medium outline-none"
              placeholder="Your Location"
            />
          </div>
          <button 
            onClick={locateUser}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-[var(--brand-primary)] text-white font-medium rounded-[var(--radius-md)] flex items-center justify-center gap-2 hover:bg-[#188c45] active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 whitespace-nowrap shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Find Nearest KVKs
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-[var(--radius-md)] flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {kvks.length > 0 && (
        <div className="space-y-4 pb-12">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-[var(--text-primary)]">Centers found near {locationName || 'you'}:</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              AI can estimate nearby centers, but contact details should be verified through maps or an official directory before visiting.
            </p>
          </div>
          {kvks.map((kvk, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
              
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[var(--brand-deep)] mb-1">{kvk.name}</h4>
                  <p className="text-[var(--text-secondary)] mb-3 text-sm flex items-start gap-1">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--text-muted)]" />
                    {kvk.address}
                  </p>
                  {kvk.distance && (
                    <span className="inline-block bg-[var(--brand-light)] text-[var(--brand-primary)] text-xs font-bold px-2 py-1 rounded-md mb-4">
                      {kvk.distance} away
                    </span>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 min-w-[140px] border-t md:border-t-0 md:border-l border-[var(--border-subtle)] pt-4 md:pt-0 md:pl-5">
                  <a 
                    href={getContactSearchUrl(kvk)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[var(--surface-soft)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] py-2.5 px-3 rounded-md flex items-center justify-center gap-2 transition-colors focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    aria-label={`Search contact details for ${kvk.name}`}
                  >
                    <Search className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-xs sm:text-sm font-semibold">Search Contact</span>
                  </a>
                  
                  <a 
                    href={getDirectionsUrl(kvk)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[var(--brand-primary)] hover:bg-[#188c45] text-white py-2.5 px-3 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-primary)] outline-none"
                    aria-label={`Get directions to ${kvk.name}`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-semibold">Directions</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {kvks.length === 0 && !loading && !error && locationName && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No Krishi Vigyan Kendras found nearby.</p>
        </div>
      )}
    </motion.div>
  );
}
