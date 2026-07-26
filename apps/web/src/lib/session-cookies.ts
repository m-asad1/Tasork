export function setSessionCookies(role: string) {
  // Set a non-httpOnly cookie so middleware can read it
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  document.cookie = `tasork_session=authenticated; expires=${expires}; path=/; SameSite=Lax`;
  document.cookie = `tasork_role=${role}; expires=${expires}; path=/; SameSite=Lax`;
}

export function clearSessionCookies() {
  document.cookie = 'tasork_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
  document.cookie = 'tasork_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
}