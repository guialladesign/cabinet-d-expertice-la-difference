/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PROFIL-DG.JS
   Charge et affiche tous les profils d'experts depuis Supabase.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('expertsContainer');
  const empty = document.getElementById('expertsEmpty');
  if (!container) return;

  const { data: experts, error } = await sbClient
    .from('experts')
    .select('id, nom, grade, bio, photo_url, badge_url')
    .eq('actif', true)
    .order('ordre', { ascending: true });

  if (error || !experts || experts.length === 0) {
    empty.hidden = false;
    return;
  }

  experts.forEach(e => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const photoHtml = e.photo_url
      ? `<img src="${e.photo_url}" alt="${e.nom}">`
      : `<i class="fa-solid fa-user-tie"></i>`;

    const badgeHtml = e.badge_url
      ? `<img src="${e.badge_url}" alt="Badge / certification de ${e.nom}" class="ld-expert-badge">`
      : '';

    col.innerHTML = `
      <div class="ld-expert-card">
        <div class="ld-expert-avatar ${e.photo_url ? 'ld-expert-avatar-photo' : ''}">
          ${photoHtml}
        </div>
        <h3 class="ld-expert-nom">${e.nom}</h3>
        ${e.grade ? `<p class="ld-expert-grade">${e.grade}</p>` : ''}
        ${e.bio ? `<p class="ld-expert-bio">${e.bio}</p>` : ''}
        ${badgeHtml}
      </div>
    `;
    container.appendChild(col);
  });

});
