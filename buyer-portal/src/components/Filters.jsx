export default function Filters({ category, city, setCategory, setCity, cities }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-4 py-2 rounded border"
      >
        <option value="">All Categories</option>
        <option value="Recyclable">Recyclable</option>
        <option value="Organic">Organic</option>
        <option value="Construction">Construction</option>
      </select>

      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="px-4 py-2 rounded border"
      >
        <option value="">All Cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
