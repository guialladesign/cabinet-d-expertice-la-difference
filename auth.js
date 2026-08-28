/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — AUTH.JS
   Gère la connexion, la création de compte, et l'inscription
   automatique à une formation si l'utilisateur venait du
   bouton "S'inscrire" du calendrier.
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

  /* ---------- Bascule entre les onglets Connexion / Création / Invité ---------- */
  const tabs = document.querySelectorAll('.ld-auth-tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const guestForm = document.getElementById('guestForm');

  const forms = { login: loginForm, signup: signupForm, guest: guestForm };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.entries(forms).forEach(([key, form]) => {
        form.hidden = key !== tab.dataset.tab;
      });
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

      // Récupère la fiche participant liée à ce compte
      const { data: participant } = await sbClient
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Récupère l'identifiant de la formation à partir de son code
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
    const telephone = document.getElementById('signupTelephone').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    const { data, error } = await sbClient.auth.signUp({ email, password });

    if (error) {
      feedback.textContent = "Impossible de créer le compte : " + error.message;
      feedback.classList.add('error');
      return;
    }

    // Si la confirmation par email est activée sur Supabase, data.user existe
    // mais la session n'est pas encore active tant que l'email n'est pas confirmé.
    if (data.user && !data.session) {
      feedback.textContent = 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.';
      feedback.classList.add('success');
      return;
    }

    // Crée la fiche participant liée à ce compte
    if (data.user) {
      await sbClient.from('participants').insert({
        user_id: data.user.id,
        nom,
        telephone,
        email
      });
    }

    feedback.textContent = 'Compte créé avec succès, redirection…';
    feedback.classList.add('success');
    await inscrireSiFormationEnAttente();
  });

  /* ---------- Formulaire d'inscription rapide (sans compte) ---------- */
 
      // Crée la fiche participant "invité" (user_id reste NULL)
      const { data: participant, error: participantError } = await sbClient
        .from('participants')
        .insert({ nom, telephone, email })
        .select('id')
        .single();

      if (participantError) throw participantError;

      // Récupère l'identifiant de la formation à partir de son code
      const { data: formation, error: formationError } = await sbClient
        .from('formations')
        .select('id')
        .eq('code', formationCode)
        .single();

      if (formationError) throw formationError;

      const { error: inscriptionError } = await sbClient
        .from('inscriptions')
        .insert({ participant_id: participant.id, formation_id: formation.id });

      if (inscriptionError) throw inscriptionError;

      feedback.textContent = `Merci ${nom} ! Votre inscription à la formation ${formationCode} a bien été enregistrée.`;
      feedback.classList.add('success');
      guestForm.reset();
    } catch (err) {
      feedback.textContent = "Erreur : " + err.message;
      feedback.classList.add('error');
    }
  });

});
