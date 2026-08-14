/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — ADMIN.JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  const loginSection = document.getElementById('adminLoginSection');
  const deniedSection = document.getElementById('adminDeniedSection');
  const dashboardSection = document.getElementById('adminDashboard');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginForm = document.getElementById('adminLoginForm');
  const loginFeedback = document.getElementById('adminLoginFeedback');

  /* ---------- Vérifie si l'utilisateur connecté est admin ---------- */
  const checkAdminAccess = async () => {
    const { data: { user } } = await sbClient.auth.getUser();

    if (!user) {
      loginSection.hidden = false;
      deniedSection.hidden = true;
      dashboardSection.hidden = true;
      logoutBtn.hidden = true;
      return;
    }

    const { data: adminRow } = await sbClient
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    logoutBtn.hidden = false;

    if (!adminRow) {
      loginSection.hidden = true;
      deniedSection.hidden = false;
      dashboardSection.hidden = true;
      return;
    }

    loginSection.hidden = true;
    deniedSection.hidden = true;
    dashboardSection.hidden = false;
    loadDashboard();
  };

  /* ---------- Connexion ---------- */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginFeedback.textContent = 'Connexion en cours…';
    loginFeedback.className = 'ld-auth-feedback';

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const { error } = await sbClient.auth.signInWithPassword({ email, password });

    if (error) {
      loginFeedback.textContent = 'Email ou mot de passe incorrect.';
      loginFeedback.classList.add('error');
      return;
    }

    await checkAdminAccess();
  });

  /* ---------- Déconnexion ---------- */
  logoutBtn.addEventListener('click', async () => {
    await sbClient.auth.signOut();
    window.location.reload();
  });

  /* ---------- Chargement du tableau de bord ---------- */
  const loadDashboard = async () => {
    await Promise.all([
      loadInscriptions(),
      loadParticipantsAndFormationsOptions(),
      loadGalerieAdmin(),
      loadParametresAdmin()
    ]);
  };

  /* ---------- Liste des inscriptions ---------- */
  const loadInscriptions = async () => {
    const tbody = document.getElementById('inscriptionsTableBody');
    const empty = document.getElementById('inscriptionsEmpty');
    tbody.innerHTML = '';

    const { data: inscriptions, error } = await sbClient
      .from('inscriptions')
      .select('id, statut, participants ( nom, email ), formations ( code, titre )')
      .order('date_inscription', { ascending: false });

    if (error || !inscriptions || inscriptions.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    inscriptions.forEach(insc => {
      const p = insc.participants;
      const f = insc.formations;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p ? p.nom : '—'}</td>
        <td>${p ? p.email : '—'}</td>
        <td><span class="ld-code">${f ? f.code : ''}</span> ${f ? f.titre : ''}</td>
        <td>
          <select class="form-select form-select-sm ld-input ld-status-select" data-id="${insc.id}">
            <option value="en_attente" ${insc.statut === 'en_attente' ? 'selected' : ''}>En attente</option>
            <option value="confirme" ${insc.statut === 'confirme' ? 'selected' : ''}>Confirmée</option>
            <option value="annule" ${insc.statut === 'annule' ? 'selected' : ''}>Annulée</option>
          </select>
        </td>
        <td class="text-end">
          <button class="btn ld-btn-mini ld-save-status" data-id="${insc.id}" type="button">Enregistrer</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.ld-save-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const select = document.querySelector(`.ld-status-select[data-id="${id}"]`);
        const nouveauStatut = select.value;

        btn.textContent = '...';
        const { error } = await sbClient
          .from('inscriptions')
          .update({ statut: nouveauStatut })
          .eq('id', id);

        btn.textContent = error ? 'Erreur' : 'Enregistré ✓';
        setTimeout(() => { btn.textContent = 'Enregistrer'; }, 2000);
      });
    });
  };

  /* ---------- Remplit les menus déroulants du formulaire attestation ---------- */
  const loadParticipantsAndFormationsOptions = async () => {
    const participantSelect = document.getElementById('attestationParticipant');
    const formationSelect = document.getElementById('attestationFormation');

    const { data: participants } = await sbClient
      .from('participants')
      .select('id, nom, email')
      .order('nom', { ascending: true });

    (participants || []).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nom} (${p.email})`;
      participantSelect.appendChild(opt);
    });

    const { data: formations } = await sbClient
      .from('formations')
      .select('id, code, titre')
      .order('date_debut', { ascending: false });

    (formations || []).forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.code} — ${f.titre}`;
      formationSelect.appendChild(opt);
    });
  };

  /* ---------- Ajout d'une attestation ---------- */
  document.getElementById('attestationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('attestationFeedback');
    feedback.textContent = 'Enregistrement…';
    feedback.className = 'ld-auth-feedback';

    const participant_id = document.getElementById('attestationParticipant').value;
    const formation_id = document.getElementById('attestationFormation').value;
    const fichier_url = document.getElementById('attestationUrl').value.trim();
    const date_delivrance = document.getElementById('attestationDate').value;

    const { error } = await sbClient.from('attestations').insert({
      participant_id, formation_id, fichier_url, date_delivrance
    });

    if (error) {
      feedback.textContent = "Erreur : " + error.message;
      feedback.classList.add('error');
      return;
    }

    feedback.textContent = 'Attestation ajoutée avec succès.';
    feedback.classList.add('success');
    e.target.reset();
  });

  /* ---------- Galerie : liste des médias déjà en ligne ---------- */
  const loadGalerieAdmin = async () => {
    const list = document.getElementById('galerieAdminList');
    const empty = document.getElementById('galerieAdminEmpty');
    list.innerHTML = '';

    const { data: medias, error } = await sbClient
      .from('galerie')
      .select('id, type, categorie, fichier_url, legende')
      .order('date_ajout', { ascending: false });

    if (error || !medias || medias.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    medias.forEach(m => {
      const col = document.createElement('div');
      col.className = 'col-6 col-lg-3';
      const previewHtml = m.type === 'video'
        ? `<video src="${m.fichier_url}" muted preload="metadata" class="ld-admin-media-preview"></video>`
        : `<img src="${m.fichier_url}" alt="${m.legende || ''}" class="ld-admin-media-preview">`;

      col.innerHTML = `
        <div class="ld-admin-media-card">
          ${previewHtml}
          <p class="ld-admin-media-cat">${m.categorie}</p>
          <button class="btn ld-btn-mini ld-delete-media" data-id="${m.id}" type="button">
            <i class="fa-solid fa-trash"></i> Supprimer
          </button>
        </div>
      `;
      list.appendChild(col);
    });

    document.querySelectorAll('.ld-delete-media').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Supprimer ce média de la galerie ?')) return;
        const id = btn.dataset.id;
        btn.textContent = '...';
        const { error } = await sbClient.from('galerie').delete().eq('id', id);
        if (!error) loadGalerieAdmin();
      });
    });
  };

  /* ---------- Galerie : ajout d'un nouveau média ---------- */
  document.getElementById('galerieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('galerieFeedback');
    const submitBtn = document.getElementById('galerieSubmitBtn');
    const fileInput = document.getElementById('galerieFile');
    const file = fileInput.files[0];

    if (!file) return;

    feedback.textContent = 'Téléversement en cours…';
    feedback.className = 'ld-auth-feedback';
    submitBtn.disabled = true;

    const categorie = document.getElementById('galerieCategorie').value;
    const legende = document.getElementById('galerieLegende').value.trim();
    const type = file.type.startsWith('video') ? 'video' : 'photo';

    // Nom de fichier unique pour éviter les conflits
    const cheminFichier = `${categorie}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await sbClient.storage
      .from('galerie')
      .upload(cheminFichier, file);

    if (uploadError) {
      feedback.textContent = "Erreur d'envoi : " + uploadError.message;
      feedback.classList.add('error');
      submitBtn.disabled = false;
      return;
    }

    const { data: publicUrlData } = sbClient.storage
      .from('galerie')
      .getPublicUrl(cheminFichier);

    const { error: insertError } = await sbClient.from('galerie').insert({
      type,
      categorie,
      fichier_url: publicUrlData.publicUrl,
      legende
    });

    submitBtn.disabled = false;

    if (insertError) {
      feedback.textContent = "Erreur d'enregistrement : " + insertError.message;
      feedback.classList.add('error');
      return;
    }

    feedback.textContent = 'Média ajouté à la galerie avec succès.';
    feedback.classList.add('success');
    e.target.reset();
    loadGalerieAdmin();
  });

  /* =========================================================
     PARAMÈTRES DU SITE : bannière + image "À propos"
     ========================================================= */

  const loadParametresAdmin = async () => {
    const { data: parametres } = await sbClient
      .from('parametres_site')
      .select('cle, valeur, type');

    if (!parametres) return;

    const hero = parametres.find(p => p.cle === 'hero_media');
    const about = parametres.find(p => p.cle === 'about_image');

    const heroPreview = document.getElementById('heroCurrentPreview');
    if (hero) {
      heroPreview.innerHTML = hero.type === 'video'
        ? `<video src="${hero.valeur}" muted preload="metadata" class="ld-param-preview-media"></video>`
        : `<img src="${hero.valeur}" alt="Bannière actuelle" class="ld-param-preview-media">`;
    }

    const aboutPreview = document.getElementById('aboutCurrentPreview');
    if (about) {
      aboutPreview.innerHTML = `<img src="${about.valeur}" alt="Image À propos actuelle" class="ld-param-preview-media">`;
    }
  };

  const enregistrerParametre = async (cle, fichier, type) => {
    const chemin = `site/${cle}-${Date.now()}-${fichier.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await sbClient.storage
      .from('galerie')
      .upload(chemin, fichier);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = sbClient.storage
      .from('galerie')
      .getPublicUrl(chemin);

    const { error: updateError } = await sbClient
      .from('parametres_site')
      .update({ valeur: publicUrlData.publicUrl, type, date_modification: new Date().toISOString() })
      .eq('cle', cle);

    if (updateError) throw updateError;
  };

  /* ---------- Formulaire bannière ---------- */
  document.getElementById('heroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('heroFeedback');
    const submitBtn = document.getElementById('heroSubmitBtn');
    const file = document.getElementById('heroFile').files[0];
    if (!file) return;

    feedback.textContent = 'Téléversement en cours…';
    feedback.className = 'ld-auth-feedback';
    submitBtn.disabled = true;

    const type = file.type.startsWith('video') ? 'video' : 'photo';

    try {
      await enregistrerParametre('hero_media', file, type);
      feedback.textContent = 'Bannière mise à jour avec succès.';
      feedback.classList.add('success');
      e.target.reset();
      loadParametresAdmin();
    } catch (err) {
      feedback.textContent = 'Erreur : ' + err.message;
      feedback.classList.add('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- Formulaire image À propos ---------- */
  document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('aboutFeedback');
    const submitBtn = document.getElementById('aboutSubmitBtn');
    const file = document.getElementById('aboutFile').files[0];
    if (!file) return;

    feedback.textContent = 'Téléversement en cours…';
    feedback.className = 'ld-auth-feedback';
    submitBtn.disabled = true;

    try {
      await enregistrerParametre('about_image', file, 'photo');
      feedback.textContent = 'Photo mise à jour avec succès.';
      feedback.classList.add('success');
      e.target.reset();
      loadParametresAdmin();
    } catch (err) {
      feedback.textContent = 'Erreur : ' + err.message;
      feedback.classList.add('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- Démarrage ---------- */
  checkAdminAccess();

});
