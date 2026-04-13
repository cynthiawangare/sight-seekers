import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [filters, setFilters] = useState({
    travelDate: null,
    tourType: '',
    travelers: 2,
    country: 'Kenya',
  });

  const [pendingBooking, setPendingBooking] = useState(null);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ travelDate: null, tourType: '', travelers: 2, country: 'Kenya' });
  };

  return (
    <BookingContext.Provider
      value={{ filters, updateFilters, clearFilters, pendingBooking, setPendingBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}

export default BookingContext;
