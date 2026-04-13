import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function BookingForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: '', date: '', guests: 1 });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/#packages?destination=${form.destination}&date=${form.date}&guests=${form.guests}`);
  };

  return (
    <section className="bg-white shadow-xl rounded-2xl max-w-4xl mx-auto -mt-12 relative z-20 p-6">
      <h2 className="text-xl font-semibold text-blue-primary mb-4">Plan Your Safari</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Destination</label>
          <select
            name="destination"
            value={form.destination}
            onChange={handleChange}
            className="w-full border border-gray-mid rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-light"
          >
            <option value="">Any</option>
            <option>Maasai Mara</option>
            <option>Amboseli</option>
            <option>Samburu</option>
            <option>Tsavo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Travel Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-mid rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-light"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Guests</label>
          <input
            type="number"
            name="guests"
            value={form.guests}
            onChange={handleChange}
            min={1}
            max={20}
            className="w-full border border-gray-mid rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-light"
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">Search</Button>
      </form>
    </section>
  );
}
