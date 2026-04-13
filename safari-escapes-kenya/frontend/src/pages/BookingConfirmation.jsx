import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard');
  }, []);
  return null;
}
