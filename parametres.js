/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PARAMETRES.JS
   Charge la bannière (photo/vidéo) et l'image "À propos"
   depuis Supabase, si elles ont été modifiées via l'admin.
   Une copie est mémorisée dans le navigateur (localStorage)
   pour s'afficher instantanément dès l'ouverture de la page,
   sans attendre la réponse de Supabase (évite le "flash" de
   l'ancienne image par défaut).
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const heroMedia = document.getElementById('heroMedia');
  const aboutImage = document.getElementById('aboutImage');
  if (!heroMedia && !aboutImage) return;

  const CLE_CACHE = 'ld_parametres_media_cache';

  const lireCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CLE_CACHE) || '{}');
    } catch {
      return {};
    }
  };

  const ecrireCache = (data) => {
    try {
      localStorage.setItem(CLE_CACHE, JSON.stringify(data));
    } catch {
      // Stockage indisponible (navigation privée, quota...) : sans conséquence.
    }
  };

  const appliquerHero = (valeur, type) => {
    const cible = document.getElementById('heroMedia');
    if (!cible || !valeur) return;

    if (type === 'video') {
      if (cible.tagName === 'VIDEO') {
        if (cible.currentSrc !== valeur) cible.src = valeur;
        return;
      }
      const video = document.createElement('video');
      video.className = 'ld-hero-bg ld-hero-bg-video';
      video.id = 'heroMedia';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = valeur;
      cible.replaceWith(video);
    } else {
      cible.style.backgroundImage = `url('${valeur}')`;
    }
  };

  const appliquerAbout = (valeur, type) => {
    const cible = document.getElementById('aboutImage');
    if (!cible || !valeur) return;

    if (type === 'video') {
      if (cible.tagName === 'VIDEO') {
        if (cible.currentSrc !== valeur) cible.src = valeur;
        return;
      }
      const video = document.createElement('video');
      video.className = cible.className;
      video.id = 'aboutImage';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = valeur;
      cible.replaceWith(video);
    } else {
      cible.src = valeur;
    }
  };

  /* ---------- 1. Affichage immédiat depuis le cache local ---------- */
  const cache = lireCache();
  if (cache.hero_media) appliquerHero(cache.hero_media.valeur, cache.hero_media.type);
  if (cache.about_image) appliquerAbout(cache.about_image.valeur, cache.about_image.type);

  /* ---------- 2. Vérification auprès de Supabase (met à jour si besoin) ---------- */
  const { data: parametres, error } = await sbClient
    .from('parametres_site')
    .select('cle, valeur, type');

  if (error || !parametres) return;

  const hero = parametres.find(p => p.cle === 'hero_media');
  const about = parametres.find(p => p.cle === 'about_image');
  const nouveauCache = {};

  if (hero) {
    appliquerHero(hero.valeur, hero.type);
    nouveauCache.hero_media = { valeur: hero.valeur, type: hero.type };
  }
  if (about) {
    appliquerAbout(about.valeur, about.type);
    nouveauCache.about_image = { valeur: about.valeur, type: about.type };
  }

  ecrireCache(nouveauCache);

});
