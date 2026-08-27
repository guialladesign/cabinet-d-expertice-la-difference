/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — GALERIE.JS
   Charge les photos/vidéos ajoutées depuis l'espace admin
   et les affiche dans la galerie de la page d'accueil.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('galleryContainer');
  const emptyState = document.getElementById('galleryEmpty');
  if (!container) return; // Sécurité si le script est chargé sur une autre page

  const labels = {
    formations: 'Formation',
    conseils_assistance: 'Conseils-Assistance',
    etudes_socio_eco: 'Études socio-économiques'
  };

  const { data: medias, error } = await sbClient
    .from('galerie')
    .select('id, type, categorie, fichier_url, legende')
    .order('date_ajout', { ascending: false });

  if (error || !medias || medias.length === 0) {
    emptyState.hidden = false;
    return;
  }

  medias.forEach(m => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-3 ld-gallery-item';
    col.dataset.cat = m.categorie;

    const legende = m.legende || labels[m.categorie] || '';

    const mediaHtml = m.type === 'video'
      ? `<video class="ld-gallery-media" src="${m.fichier_url}" muted loop playsinline preload="metadata" controls></video>`
      : `<img src="${m.fichier_url}" alt="${legende}">`;

    col.innerHTML = `
      <div class="ld-gallery-card">
        ${mediaHtml}
        <div class="ld-gallery-overlay"><span>${legende}</span></div>
      </div>
      <p class="ld-gallery-caption">${legende}</p>
    `;
    container.appendChild(col);
  });

  initGalleryFilters();

  /* ---------- Filtres (interrogent le DOM à chaque clic, donc
     fonctionnent même si les médias viennent d'être ajoutés) ---------- */
  function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.ld-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.ld-gallery-item').forEach(item => {
          const match = filter === 'all' || item.dataset.cat === filter;
          item.classList.toggle('hidden', !match);
        });
      });
    });
  }

});
