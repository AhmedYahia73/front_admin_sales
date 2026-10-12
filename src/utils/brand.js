import keetoLogo from '@/assets/keeto-logo.png';
import systegoLogo from '@/assets/systego-logo.jpg';

function resolveProjectBrand() {
  const explicitProject = (
    import.meta.env.project ||
    import.meta.env.PROJECT ||
    import.meta.env.VITE_PROJECT ||
    ''
  )
    .toString()
    .toLowerCase()
    .trim();

  if (explicitProject === 'keeto' || explicitProject === 'systego') {
    return explicitProject;
  }

  const apiUrl = (import.meta.env.VITE_API_BASE_URL || '').toLowerCase();
  const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';

  if (host.includes('systego') || (!host.includes('keeto') && apiUrl.includes('systego'))) {
    return 'systego';
  }

  return 'keeto';
}

const activeBrand = resolveProjectBrand();

export const isKeeto = activeBrand === 'keeto';
export const isSystego = activeBrand === 'systego';

export const brandConfig = {
  key: isKeeto ? 'keeto' : 'systego',
  name: isKeeto ? 'Keeto' : 'Systego',
  appTitle: isKeeto ? 'Keeto Sales' : 'Systego Sales',
  logo: isKeeto ? keetoLogo : systegoLogo,
  logoClassName: isKeeto ? 'w-36 h-16 object-contain' : 'w-20 h-20 object-contain',
  logoAlt: isKeeto ? 'Keeto Logo' : 'Company Logo',
  emailPlaceholder: isKeeto ? 'name@keeto.net' : 'name@systego.net',
  favicon: isKeeto ? '/keeto-favicon.svg' : '/systego-favicon.svg',
  overviewCardClass: isKeeto
    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-zinc-950 border border-yellow-300/60 transition-transform hover:scale-[1.02] min-h-full'
    : 'bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white border border-red-400/50 transition-transform hover:scale-[1.02] min-h-full',
  overviewIconWrapperClass: isKeeto
    ? 'bg-black/10 p-4 rounded-full mb-4 shadow-inner'
    : 'bg-white/20 p-4 rounded-full mb-4 shadow-inner',
  overviewIconClass: isKeeto ? 'h-8 w-8 text-zinc-950' : 'h-8 w-8 text-white',
  overviewLabelClass: isKeeto
    ? 'text-sm font-semibold uppercase tracking-wider text-zinc-900 text-center'
    : 'text-sm font-semibold uppercase tracking-wider text-red-100 text-center',
};

export function applyBrandTheme(roleSuffix = '') {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-brand', brandConfig.key);
  document.title = roleSuffix
    ? `${brandConfig.appTitle} - ${roleSuffix}`
    : brandConfig.appTitle;

  const iconLinks = document.querySelectorAll("link[rel*='icon']");
  if (isSystego) {
    iconLinks.forEach((link) => {
      if (link.getAttribute('rel') === 'apple-touch-icon') {
        link.setAttribute('href', '/systego-favicon.svg');
      } else {
        link.setAttribute('type', 'image/svg+xml');
        link.setAttribute('href', '/systego-favicon.svg');
      }
    });
  } else {
    iconLinks.forEach((link) => {
      if (link.getAttribute('type') === 'image/svg+xml') {
        link.setAttribute('href', '/keeto-favicon.svg');
      }
    });
  }
}
