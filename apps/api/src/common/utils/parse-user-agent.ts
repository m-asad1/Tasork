/**
 * Deliberately minimal — good enough to render "Chrome on Windows" in the
 * Active Sessions UI (Deliverable 51) without pulling in a full UA-parsing
 * dependency for a cosmetic label.
 */
export function parseUserAgentLabel(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown device';

  const browser = /edg\//i.test(userAgent)
    ? 'Edge'
    : /chrome\//i.test(userAgent)
      ? 'Chrome'
      : /firefox\//i.test(userAgent)
        ? 'Firefox'
        : /safari\//i.test(userAgent) && !/chrome/i.test(userAgent)
          ? 'Safari'
          : 'Browser';

  const os = /windows/i.test(userAgent)
    ? 'Windows'
    : /mac os/i.test(userAgent)
      ? 'macOS'
      : /android/i.test(userAgent)
        ? 'Android'
        : /iphone|ipad/i.test(userAgent)
          ? 'iOS'
          : /linux/i.test(userAgent)
            ? 'Linux'
            : 'an unknown OS';

  return `${browser} on ${os}`;
}
