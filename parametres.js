/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PARAMETRES.JS
   Charge la bannière (photo/vidéo) et l'image "À propos"
   depuis Supabase, si elles ont été modifiées via l'admin.
   Si aucune valeur n'est trouvée, le HTML garde son image
   par défaut (déjà présente dans index.html).
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const heroMedia = document.getElementById('heroMedia');
  const aboutImage = document.getElementById('aboutImage');
  if (!heroMedia && !aboutImage) return;

  const { data: parametres, error } = await sbClient
    .from('parametres_site')
    .select('cle, valeur, type');

  if (error || !parametres) return;

  const hero = parametres.find(p => p.cle === 'hero_media');
  const about = parametres.find(p => p.cle === 'about_image');

  /* ---------- Bannière : photo ou vidéo ---------- */
  if (hero && heroMedia) {
    if (hero.type === 'video') {
      const video = document.createElement('video');
      video.className = 'ld-hero-bg ld-hero-bg-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = hero.valeur;
      heroMedia.replaceWith(video);
      video.id = 'heroMedia';
    } else {
      heroMedia.style.backgroundImage = `url('${hero.valeur}')`;
    }
  }

  /* ---------- Média À propos : photo ou vidéo ---------- */
  if (about && aboutImage) {
    if (about.type === 'video') {
      const video = document.createElement('video');
      video.className = aboutImage.className;
      video.id = 'aboutImage';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = about.valeur;
      aboutImage.replaceWith(video);
    } else {
      aboutImage.src = about.valeur;
    }
  }

});
