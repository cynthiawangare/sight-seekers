import { formatCurrency, formatDate } from '../../utils/formatters';

export default function BookingSummary({ pkg, startDate, guests }) {
  const total = pkg ? pkg.price_cents * guests : 0;

  return (
    <div className="bg-gray-light rounded-xl p-5 text-sm">
      <h3 className="font-semibold text-blue-primary text-base mb-4">Booking Summary</h3>
      {pkg && (
        <>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Package</span>
            <span className="font-medium">{pkg.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Duration</span>
            <span>{pkg.duration_days} days</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Start Date</span>
            <span>{startDate ? formatDate(startDate) : '—'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Guests</span>
            <span>{guests}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Price/person</span>
            <span>{formatCurrency(pkg.price_cents)}</span>
          </div>
          <div className="border-t border-gray-mid mt-3 pt-3 flex justify-between font-semibold text-blue-primary">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
