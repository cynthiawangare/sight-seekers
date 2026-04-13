export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export function isValidPhone(phone) {
  // Kenyan format: 254XXXXXXXXX (12 digits)
  return /^254[17]\d{8}$/.test(phone);
}
