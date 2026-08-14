/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — PROFIL-DG.JS
   Remplace l'avatar générique par la vraie photo du DG
   si elle a été ajoutée depuis l'espace admin.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('dgPhotoContainer');
  if (!container) return;

  const { data, error } = await sbClient
    .from('parametres_site')
    .select('valeur')
    .eq('cle', 'dg_photo')
    .maybeSingle();

  if (error || !data) return; // Aucune photo ajoutée : on garde l'avatar générique

  container.innerHTML = `<img src="${data.valeur}" alt="Photo de BOUGMA Armel">`;
  container.classList.add('ld-profile-avatar-photo');

});
