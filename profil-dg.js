/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PROFIL-DG.JS
   Charge et affiche tous les profils d'experts depuis Supabase.
   Chaque badge devient un vrai "domaine d'expertise" : titre,
   badge (image) et liste de compétences à puces.
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
    .select('expert_id, titre, badge_url, competences')
    .order('ordre', { ascending: true });

  experts.forEach(e => {
    const col = document.createElement('div');
    col.className = 'col-12 col-lg-6';

    const photoHtml = e.photo_url
      ? `<img src="${e.photo_url}" alt="${e.nom}">`
      : `<i class="fa-solid fa-user-tie"></i>`;

    const domainesDeCetExpert = (badges || []).filter(b => b.expert_id === e.id);

    const domainesHtml = domainesDeCetExpert.length
      ? `<div class="ld-domaines-wrapper">
          <p class="ld-domaines-titre-section">Domaines d'expertise</p>
          ${domainesDeCetExpert.map(d => {
            const listeCompetences = (d.competences || '')
              .split('\n')
              .map(ligne => ligne.trim())
              .filter(ligne => ligne.length > 0);

            const listeHtml = listeCompetences.length
              ? `<ul class="ld-domaine-liste">${listeCompetences.map(c => `<li>${c}</li>`).join('')}</ul>`
              : '';

            return `
              <div class="ld-domaine-block">
                <h4 class="ld-domaine-titre">${d.titre}</h4>
                <div class="ld-domaine-row">
                  <img src="${d.badge_url}" alt="${d.titre}" class="ld-domaine-badge-img">
                  ${listeHtml}
                </div>
              </div>
            `;
          }).join('')}
        </div>`
      : '';

    col.innerHTML = `
      <div class="ld-expert-card ld-expert-card-large">
        <div class="ld-expert-avatar ${e.photo_url ? 'ld-expert-avatar-photo' : ''}">
          ${photoHtml}
        </div>
        <h3 class="ld-expert-nom">${e.nom}</h3>
        ${e.grade ? `<p class="ld-expert-grade">${e.grade}</p>` : ''}
        ${e.bio ? `<p class="ld-expert-bio">${e.bio}</p>` : ''}
        ${domainesHtml}
      </div>
    `;
    container.appendChild(col);
  });

});
