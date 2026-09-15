/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — CATALOGUE.JS
   Charge le catalogue des formations et des conseils-assistance
   depuis Supabase (indépendant du calendrier avec dates).
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const corpsFormations = document.getElementById('catalogueFormationsBody');
  const videFormations = document.getElementById('catalogueFormationsEmpty');
  const corpsConseils = document.getElementById('catalogueConseilsBody');
  const videConseils = document.getElementById('catalogueConseilsEmpty');
  if (!corpsFormations) return;

  const { data: entrees, error } = await sbClient
    .from('catalogue')
    .select('type, code, theme')
    .eq('actif', true)
    .order('ordre', { ascending: true });

  if (error || !entrees) return;

  const formations = entrees.filter(e => e.type === 'formation');
  const conseils = entrees.filter(e => e.type === 'conseil');

  const remplirTableau = (liste, corps, videEl) => {
    if (liste.length === 0) {
      videEl.hidden = false;
      return;
    }
    liste.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="ld-code">${e.code}</span></td>
        <td>${e.theme}</td>
      `;
      corps.appendChild(tr);
    });
  };

  remplirTableau(formations, corpsFormations, videFormations);
  remplirTableau(conseils, corpsConseils, videConseils);

});
