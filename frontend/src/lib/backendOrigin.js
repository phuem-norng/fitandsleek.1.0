function parseOrigin(input) {
    try {
        return new URL(input);
    } catch {
        return null;
    }
}

function normalizeConfiguredOrigin() {
    const configured =
           import.meta.env.VITE_BACKEND_ORIGIN || import.meta.env.VITE_API_BASE_URL;

    const parsed = parseOrigin(configured);
    if (!parsed) {
           return null; // or handle the error as needed
    }

    return `${parsed.protocol}//${parsed.host}`;
}

export function resolveBackendOrigin() {
    const configuredOrigin = normalizeConfiguredOrigin();
    return configuredOrigin;
}

export function resolveApiBaseUrl() {
    return `${resolveBackendOrigin()}/api`;
}
