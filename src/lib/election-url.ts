const ELECTIONS_SUBDOMAIN = process.env.NEXT_PUBLIC_ELECTIONS_SUBDOMAIN?.trim();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.trim();
const ELECTIONS_APP_URL = process.env.NEXT_PUBLIC_ELECTIONS_APP_URL?.trim();

function isIpv4Host(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function supportsSubdomain(hostname: string) {
  return Boolean(hostname) && hostname !== "localhost" && !isIpv4Host(hostname) && hostname.includes(".");
}

function normalizeSubdomain(value: string) {
  return value.replace(/\.+/g, "").trim();
}

function buildSubdomainHost(hostname: string, subdomain: string) {
  return `${subdomain}.${hostname}`;
}

function sanitizeBaseUrl(baseUrl: string, path: string) {
  try {
    const url = new URL(baseUrl);
    url.pathname = path;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return path;
  }
}

export function getElectionPath(path = "/elections") {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getPublicElectionPath(path = "/elections") {
  const normalizedPath = getElectionPath(path);

  if (normalizedPath === "/elections") {
    return "/";
  }

  if (normalizedPath === "/elections/results") {
    return "/results";
  }

  const electionDetailMatch = normalizedPath.match(/^\/elections\/(\d+)$/);
  if (electionDetailMatch) {
    return `/${electionDetailMatch[1]}`;
  }

  const electionResultsMatch = normalizedPath.match(/^\/elections\/(\d+)\/results$/);
  if (electionResultsMatch) {
    return `/${electionResultsMatch[1]}/results`;
  }

  return normalizedPath;
}

export function getInternalElectionPathFromPublicPath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return "/elections";
  }

  if (normalizedPath === "/results") {
    return "/elections/results";
  }

  const electionDetailMatch = normalizedPath.match(/^\/(\d+)$/);
  if (electionDetailMatch) {
    return `/elections/${electionDetailMatch[1]}`;
  }

  const electionResultsMatch = normalizedPath.match(/^\/(\d+)\/results$/);
  if (electionResultsMatch) {
    return `/elections/${electionResultsMatch[1]}/results`;
  }

  return null;
}

export function getElectionUrl(path = "/elections") {
  const normalizedPath = getElectionPath(path);
  const publicPath = getPublicElectionPath(normalizedPath);
  const normalizedSubdomain = ELECTIONS_SUBDOMAIN ? normalizeSubdomain(ELECTIONS_SUBDOMAIN) : "";

  if (ELECTIONS_APP_URL) {
    return sanitizeBaseUrl(ELECTIONS_APP_URL, publicPath);
  }

  if (!normalizedSubdomain || !APP_URL) {
    return normalizedPath;
  }

  try {
    const url = new URL(APP_URL);
    if (!supportsSubdomain(url.hostname)) {
      return normalizedPath;
    }

    url.hostname = buildSubdomainHost(url.hostname, normalizedSubdomain);
    url.pathname = publicPath;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return normalizedPath;
  }
}

export function getMainDomainUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (APP_URL) {
    return sanitizeBaseUrl(APP_URL, normalizedPath);
  }

  if (ELECTIONS_APP_URL) {
    try {
      const electionsUrl = new URL(ELECTIONS_APP_URL);
      if (!normalizedSubdomainFallback()) {
        return normalizedPath;
      }
      const fallbackMainHost = stripConfiguredSubdomain(electionsUrl.hostname, normalizedSubdomainFallback()!);
      electionsUrl.hostname = fallbackMainHost;
      electionsUrl.pathname = normalizedPath;
      electionsUrl.search = "";
      electionsUrl.hash = "";
      return electionsUrl.toString();
    } catch {
      return normalizedPath;
    }
  }

  return normalizedPath;
}

function normalizedSubdomainFallback() {
  return ELECTIONS_SUBDOMAIN ? normalizeSubdomain(ELECTIONS_SUBDOMAIN) : "";
}

function stripConfiguredSubdomain(hostname: string, subdomain: string) {
  const prefix = `${subdomain}.`;
  return hostname.startsWith(prefix) ? hostname.slice(prefix.length) : hostname;
}

export function getConfiguredElectionSubdomain() {
  return normalizedSubdomainFallback();
}

export function getConfiguredElectionAppUrl() {
  if (!ELECTIONS_APP_URL) {
    return "";
  }

  try {
    return new URL(ELECTIONS_APP_URL).toString();
  } catch {
    return "";
  }
}
