/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PROFIL-DG.JS
   Charge et affiche tous les profils d'experts depuis Supabase,
   avec la totalité de leurs badges/certifications (0, 1 ou plusieurs).
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('expertsContainer');
  const empty = document.getElementById('expertsEmpty');
  if (!container) return;

  const { data: experts, error } = await sbClient
    .from('experts')
    .select('id, nom, grade, bio, photo_url')
    .eq('actif', true)
    .order('ordre', { ascending: true });

  if (error || !experts || experts.length === 0) {
    empty.hidden = false;
    return;
  }

  const { data: badges } = await sbClient
    .from('expert_badges')
    .select('expert_id, titre, badge_url')
    .order('ordre', { ascending: true });

  experts.forEach(e => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const photoHtml = e.photo_url
      ? `<img src="${e.photo_url}" alt="${e.nom}">`
      : `<i class="fa-solid fa-user-tie"></i>`;

    const badgesDeCetExpert = (badges || []).filter(b => b.expert_id === e.id);
    const badgesHtml = badgesDeCetExpert.length
      ? `<div class="ld-expert-badges">
          ${badgesDeCetExpert.map(b => `
            <div class="ld-expert-badge-item">
              <img src="${b.badge_url}" alt="${b.titre}">
              <span>${b.titre}</span>
            </div>
          `).join('')}
        </div>`
      : '';

    col.innerHTML = `
      <div class="ld-expert-card">
        <div class="ld-expert-avatar ${e.photo_url ? 'ld-expert-avatar-photo' : ''}">
          ${photoHtml}
        </div>
        <h3 class="ld-expert-nom">${e.nom}</h3>
        ${e.grade ? `<p class="ld-expert-grade">${e.grade}</p>` : ''}
        ${e.bio ? `<p class="ld-expert-bio">${e.bio}</p>` : ''}
        ${badgesHtml}
      </div>
    `;
    container.appendChild(col);
  });

});
