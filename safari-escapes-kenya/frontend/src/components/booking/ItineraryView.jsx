export default function ItineraryView({ pkg }) {
  if (!pkg?.itinerary?.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-blue-primary mb-4">Itinerary</h3>
      <ol className="relative border-l border-blue-light ml-3">
        {pkg.itinerary.map((day, i) => (
          <li key={i} className="mb-6 ml-6">
            <span className="absolute -left-3 w-6 h-6 bg-blue-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {i + 1}
            </span>
            <h4 className="font-semibold text-blue-primary">Day {i + 1}: {day.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{day.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
