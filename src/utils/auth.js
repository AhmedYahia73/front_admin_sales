import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_auth_token';

// Robust Base64URL decoder with padding and UTF-8 TextDecoder
export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decodedText = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decodedText);
  } catch (e) {
    console.error('Error decoding JWT payload:', e);
    try {
      const parts = token.split('.');
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }
};

export const setAuthToken = (token) => {
  if (!token) return;
  const isProduction = window.location.protocol === 'https:';

  // 1. Store in Cookies with path: '/' so it is accessible across all routes
  try {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      secure: isProduction,
      path: '/',
      sameSite: 'Lax',
    });
  } catch (e) {
    console.error('Error setting cookie:', e);
  }

  // 2. Store in localStorage as bulletproof fallback
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('token', token);
  } catch (e) {
    console.error('Error setting localStorage token:', e);
  }
};

export const getAuthToken = () => {
  return (
    Cookies.get(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    null
  );
};

export const removeAuthToken = () => {
  try {
    Cookies.remove(TOKEN_KEY, { path: '/' });
  } catch (e) {}
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
  } catch (e) {}
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Global SSO interceptor that extracts ?token=... from URL, saves auth & project, and cleans URL
export const initSsoToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    // Support token in hash if present
    if (!token && window.location.hash && window.location.hash.includes('token=')) {
      const queryIdx = window.location.hash.indexOf('?');
      if (queryIdx !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(queryIdx));
        token = hashParams.get('token');
      }
    }

    if (token) {
      const user = decodeJwtPayload(token);
      if (user) {
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.project_id) {
          const projectData = {
            id: user.project_id,
            name: user.project_name || '',
            logo: user.project_logo || '',
            design: user.project_design || 'design 1',
          };
          localStorage.setItem('project', JSON.stringify(projectData));
        }

        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        return { token, user };
      }
    }
  } catch (err) {
    console.error('SSO Initialization error:', err);
  }

  return null;
};
