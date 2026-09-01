/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — AUTH.JS
   Gère la connexion et la création de compte, et rattache
   automatiquement l'utilisateur à une formation s'il venait
   du bouton "S'inscrire" du calendrier.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Lecture du paramètre ?formation=CODE dans l'URL ---------- */
  const params = new URLSearchParams(window.location.search);
  const formationCode = params.get('formation');

  if (formationCode) {
    const contextEl = document.getElementById('authContext');
    const contextFormationEl = document.getElementById('authContextFormation');
    contextFormationEl.textContent = formationCode;
    contextEl.hidden = false;
  }

  /* ---------- Bascule entre les onglets Connexion / Création ---------- */
  const tabs = document.querySelectorAll('.ld-auth-tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.tab === 'login') {
        loginForm.hidden = false;
        signupForm.hidden = true;
      } else {
        loginForm.hidden = true;
        signupForm.hidden = false;
      }
    });
  });

  /* ---------- Rattache l'utilisateur connecté à une formation ---------- */
  const inscrireSiFormationEnAttente = async () => {
    if (!formationCode) {
      window.location.href = 'espace-membre.html';
      return;
    }

    try {
      const { data: { user } } = await sbClient.auth.getUser();
      if (!user) return;

      const { data: participant } = await sbClient
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: formation } = await sbClient
        .from('formations')
        .select('id')
        .eq('code', formationCode)
        .single();

      if (participant && formation) {
        await sbClient.from('inscriptions').insert({
          participant_id: participant.id,
          formation_id: formation.id
        });
      }
    } catch (err) {
      console.error('Erreur lors du rattachement à la formation :', err);
    } finally {
      window.location.href = 'espace-membre.html';
    }
  };

  /* ---------- Formulaire de connexion ---------- */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('loginFeedback');
    feedback.textContent = 'Connexion en cours…';
    feedback.className = 'ld-auth-feedback';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { error } = await sbClient.auth.signInWithPassword({ email, password });

    if (error) {
      feedback.textContent = 'Email ou mot de passe incorrect.';
      feedback.classList.add('error');
      return;
    }

    feedback.textContent = 'Connexion réussie, redirection…';
    feedback.classList.add('success');
    await inscrireSiFormationEnAttente();
  });

  /* ---------- Formulaire de création de compte ---------- */
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('signupFeedback');
    feedback.textContent = 'Création du compte en cours…';
    feedback.className = 'ld-auth-feedback';

    const nom = document.getElementById('signupNom').value.trim();

    // Indicatif + numéro combinés dans un seul champ téléphone stocké en base
    const indicatifSelect = document.getElementById('signupIndicatif');
    const indicatif = indicatifSelect.value === 'autre' ? '' : indicatifSelect.value;
    const numero = document.getElementById('signupTelephone').value.trim();
    const telephone = indicatif ? `${indicatif} ${numero}` : numero;

    const email = document.getElementById('signupEmail').value.trim();
    const ville = document.getElementById('signupVille').value.trim();
    const pays = document.getElementById('signupPays').value.trim();
    const structure = document.getElementById('signupStructure').value.trim();
    const password = document.getElementById('signupPassword').value;

    const { data, error } = await sbClient.auth.signUp({ email, password });

    if (error) {
      feedback.textContent = "Impossible de créer le compte : " + error.message;
      feedback.classList.add('error');
      return;
    }

    if (data.user && !data.session) {
      feedback.textContent = 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.';
      feedback.classList.add('success');
      return;
    }

    if (data.user) {
      await sbClient.from('participants').insert({
        user_id: data.user.id,
        nom,
        telephone,
        email,
        ville,
        pays,
        structure
      });
    }

    feedback.textContent = 'Compte créé avec succès, redirection…';
    feedback.classList.add('success');
    await inscrireSiFormationEnAttente();
  });

});
