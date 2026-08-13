/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — DASHBOARD.JS
   Charge les formations et attestations du participant connecté.
   Redirige vers compte.html si personne n'est connecté.
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const welcomeMessage = document.getElementById('welcomeMessage');
  const loadingMessage = document.getElementById('loadingMessage');
  const dashboardContent = document.getElementById('dashboardContent');
  const logoutBtn = document.getElementById('logoutBtn');

  /* ---------- Vérifie la session ---------- */
  const { data: { user } } = await sbClient.auth.getUser();

  if (!user) {
    window.location.href = 'compte.html';
    return;
  }

  /* ---------- Récupère (ou crée) la fiche participant ---------- */
  let { data: participant } = await sbClient
    .from('participants')
    .select('id, nom')
    .eq('user_id', user.id)
    .single();

  if (!participant) {
    const { data: newParticipant } = await sbClient
      .from('participants')
      .insert({ user_id: user.id, nom: user.email, email: user.email })
      .select('id, nom')
      .single();
    participant = newParticipant;
  }

  welcomeMessage.textContent = participant?.nom ? `Bonjour, ${participant.nom}` : 'Bienvenue';
  loadingMessage.hidden = true;
  dashboardContent.hidden = false;

  /* ---------- Charge les formations (inscriptions + jointure) ---------- */
  const { data: inscriptions } = await sbClient
    .from('inscriptions')
    .select('id, statut, date_inscription, formations ( code, titre, lieu, date_debut, date_fin )')
    .eq('participant_id', participant.id)
    .order('date_inscription', { ascending: false });

  const formationsList = document.getElementById('formationsList');
  const formationsEmpty = document.getElementById('formationsEmpty');

  if (!inscriptions || inscriptions.length === 0) {
    formationsEmpty.hidden = false;
  } else {
    inscriptions.forEach(insc => {
      const f = insc.formations;
      if (!f) return;

      const statutLabel = {
        en_attente: 'En attente de confirmation',
        confirme: 'Confirmée',
        annule: 'Annulée'
      }[insc.statut] || insc.statut;

      const statutClass = {
        en_attente: 'ld-badge-warning',
        confirme: 'ld-badge-success',
        annule: 'ld-badge-muted'
      }[insc.statut] || '';

      const card = document.createElement('div');
      card.className = 'ld-dashboard-card';
      card.innerHTML = `
        <div class="ld-dashboard-card-header">
          <span class="ld-code">${f.code}</span>
          <span class="ld-badge ${statutClass}">${statutLabel}</span>
        </div>
        <h3>${f.titre}</h3>
        <p><i class="fa-solid fa-location-dot"></i> ${f.lieu} &nbsp;·&nbsp; ${formatDateRange(f.date_debut, f.date_fin)}</p>
      `;
      formationsList.appendChild(card);
    });
  }

  /* ---------- Charge les attestations ---------- */
  const { data: attestations } = await sbClient
    .from('attestations')
    .select('id, fichier_url, date_delivrance, formations ( code, titre )')
    .eq('participant_id', participant.id)
    .order('date_delivrance', { ascending: false });

  const attestationsList = document.getElementById('attestationsList');
  const attestationsEmpty = document.getElementById('attestationsEmpty');

  if (!attestations || attestations.length === 0) {
    attestationsEmpty.hidden = false;
  } else {
    attestations.forEach(att => {
      const f = att.formations;
      const card = document.createElement('div');
      card.className = 'ld-dashboard-card';
      card.innerHTML = `
        <div class="ld-dashboard-card-header">
          <span class="ld-code">${f ? f.code : ''}</span>
        </div>
        <h3>${f ? f.titre : 'Attestation'}</h3>
        <p>Délivrée le ${formatDate(att.date_delivrance)}</p>
        <a href="${att.fichier_url}" target="_blank" rel="noopener" class="btn ld-btn-mini">
          <i class="fa-solid fa-download"></i> Télécharger
        </a>
      `;
      attestationsList.appendChild(card);
    });
  }

  /* ---------- Déconnexion ---------- */
  logoutBtn.addEventListener('click', async () => {
    await sbClient.auth.signOut();
    window.location.href = 'index.html';
  });

  /* ---------- Utilitaires de formatage de dates ---------- */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatDateRange(start, end) {
    if (!start) return '';
    const startD = new Date(start);
    const endD = end ? new Date(end) : null;
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    if (!endD || start === end) return startD.toLocaleDateString('fr-FR', opts);
    return `${startD.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – ${endD.toLocaleDateString('fr-FR', opts)}`;
  }

});
