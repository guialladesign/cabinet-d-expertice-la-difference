/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — FORMATIONS.JS
   Charge le calendrier des formations actives depuis Supabase
   pour l'afficher sur la page d'accueil.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const tbody = document.getElementById('formationsTableBody');
  const emptyState = document.getElementById('formationsEmpty');
  if (!tbody) return;

  const { data: formations, error } = await sbClient
    .from('formations')
    .select('code, titre, lieu, date_debut, date_fin')
    .eq('actif', true)
    .order('date_debut', { ascending: true });

  if (error || !formations || formations.length === 0) {
    emptyState.hidden = false;
    return;
  }

  formations.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="ld-code">${f.code}</span></td>
      <td>${f.titre}</td>
      <td><i class="fa-solid fa-location-dot"></i> ${f.lieu}</td>
      <td>${formatPlage(f.date_debut, f.date_fin)}</td>
      <td class="text-end"><a href="compte.html?formation=${f.code}" class="btn ld-btn-mini">S'inscrire</a></td>
    `;
    tbody.appendChild(tr);
  });

  function formatPlage(debut, fin) {
    if (!debut) return '';
    const optsJourMois = { day: '2-digit', month: 'short' };
    const optsComplet = { day: '2-digit', month: 'short', year: 'numeric' };

    const dDebut = new Date(debut + 'T00:00:00');
    const dFin = fin ? new Date(fin + 'T00:00:00') : null;

    if (!dFin || debut === fin) {
      return dDebut.toLocaleDateString('fr-FR', optsComplet);
    }
    return `${dDebut.toLocaleDateString('fr-FR', optsJourMois)} – ${dFin.toLocaleDateString('fr-FR', optsComplet)}`;
  }

});
