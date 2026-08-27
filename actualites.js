/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — ACTUALITES.JS
   Charge les actualités actives depuis Supabase et construit
   le carrousel Bootstrap sur la page d'accueil.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const wrapper = document.getElementById('actualitesWrapper');
  const inner = document.getElementById('actualitesInner');
  const indicators = document.getElementById('actualitesIndicators');
  if (!wrapper) return;

  const { data: actualites, error } = await sbClient
    .from('actualites')
    .select('id, titre, extrait, image_url, lien_externe, date_publication')
    .eq('actif', true)
    .order('date_publication', { ascending: false });

  if (error || !actualites || actualites.length === 0) return; // Section reste masquée si aucune actualité

  actualites.forEach((a, index) => {
    const lienHtml = a.lien_externe
      ? `<a href="${a.lien_externe}" target="_blank" rel="noopener" class="btn ld-btn-primary btn-sm mt-2">En savoir plus</a>`
      : '';

    const slide = document.createElement('div');
    slide.className = `carousel-item${index === 0 ? ' active' : ''}`;
    slide.innerHTML = `
      <div class="ld-actu-slide" style="background-image:url('${a.image_url}');">
        <div class="ld-actu-overlay"></div>
        <div class="container ld-actu-content">
          <p class="ld-eyebrow" style="color:var(--ld-green-light);">${formatDateActu(a.date_publication)}</p>
          <h2 class="ld-actu-title">${a.titre}</h2>
          ${a.extrait ? `<p class="ld-actu-extrait">${a.extrait}</p>` : ''}
          ${lienHtml}
        </div>
      </div>
    `;
    inner.appendChild(slide);

    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.bsTarget = '#actualitesCarousel';
    indicator.dataset.bsSlideTo = index;
    if (index === 0) { indicator.classList.add('active'); indicator.setAttribute('aria-current', 'true'); }
    indicator.setAttribute('aria-label', `Actualité ${index + 1}`);
    indicators.appendChild(indicator);
  });

  wrapper.hidden = false;

  function formatDateActu(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

});
