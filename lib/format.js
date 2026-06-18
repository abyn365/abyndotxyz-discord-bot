export function formatLocation(location) {
  if (!location) return 'Unknown location';
  return `**${location.city}, ${location.country}**\n${location.timezone || 'Unknown timezone'} • ${location.latitude}, ${location.longitude}`;
}

export function formatWeather(weather) {
  if (!weather) return 'Weather data is unavailable.';
  const temp = weather.temperature ?? weather.current?.temperature_2m ?? weather.current_weather?.temperature;
  const summary = weather.weatherDescription || weather.description || weather.current?.weather_code || 'current conditions';
  return `**${weather.city}, ${weather.country}**\n${temp ?? '—'}°C • ${summary}\nTimezone: ${weather.timezone || '—'}`;
}

export function formatDiscordStatus(status) {
  if (!status) return 'Discord status is unavailable.';
  const activity = status.activity ? `${status.activity.name}${status.activity.details ? ` — ${status.activity.details}` : ''}` : 'No current activity';
  const spotify = status.spotify ? `🎧 ${status.spotify.song} — ${status.spotify.artist}` : 'Spotify inactive';
  return `**Status:** ${status.status || 'unknown'} (${status.activeDevice || 'no active device'})\n**Activity:** ${activity}\n**Spotify:** ${spotify}`;
}
