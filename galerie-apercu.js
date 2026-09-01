/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — GALERIE-APERCU.JS
   Affiche un aperçu (6 médias max) de la galerie sur l'accueil,
   avec un lien vers la galerie complète.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('apercuGalerieContainer');
  if (!container) return;

  const { data: medias, error } = await sbClient
    .from('galerie')
    .select('id, type, fichier_url, legende')
    .order('date_ajout', { ascending: false })
    .limit(6);

  if (error || !medias || medias.length === 0) {
    container.closest('section').hidden = true;
    return;
  }

  medias.forEach(m => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4';

    const mediaHtml = m.type === 'video'
      ? `<video class="ld-gallery-media" src="${m.fichier_url}" muted loop playsinline preload="metadata" controls></video>`
      : `<img src="${m.fichier_url}" alt="${m.legende || ''}">`;

    col.innerHTML = `
      <div class="ld-gallery-card">
        ${mediaHtml}
        <div class="ld-gallery-overlay"><span>${m.legende || ''}</span></div>
      </div>
      ${m.legende ? `<p class="ld-gallery-caption">${m.legende}</p>` : ''}
    `;
    container.appendChild(col);
  });

});
