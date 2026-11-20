---
paths:
  - "src/lib/supabase.ts"
  - "src/lib/compte*"
  - "src/components/compte/**"
  - "src/routes/{Connexion,Inscription,Profil,Coffre,Admin,MotDePasse,Evaluation}*"
  - "supabase/**"
  - ".env*"
---

# Comptes professeurs (Supabase) — phase 1

Seul backend du site : **Supabase** (Postgres + Auth + Row Level Security), projet `qklnpxofjsxyubdyyrgl`
(région Europe, offre gratuite). Cours, générateurs ET feuilles d'exercices restent PUBLICS (décision de
l'utilisateur, après mise en service : ses élèves préparent leurs évaluations avec les feuilles
d'exercices) ; seuls le panneau des évaluations / examens (`/evaluation`), le coffre, le profil et
l'administration sont derrière la connexion.
Aucune donnée d'élève. Phase 2 (pas faite) : carnet de matière vue (classes rattachées aux écoles).
Plus tard (pas fait) : partage entre collègues.

## Décisions de l'utilisateur

- Inscription UNIQUEMENT avec un code d'invitation généré par l'administrateur (l'utilisateur).
- Identifiant = e-mail + mot de passe ; « mot de passe oublié » par e-mail (flux Supabase).
- Profil : nom affiché sur les copies + une ou plusieurs écoles (nom, adresse), une par défaut.
- Panneau : école par défaut pré-remplie, liste déroulante s'il y en a plusieurs ; elle alimente le
  cartouche (surtitre, adresse), la copie Word et l'examen ; le nom du professeur vient du profil.
- Coffre : les `PlanDocument` (JSON tel quel) sont stockés dans le compte ; import en un clic des
  enregistrements du navigateur (`evaluationLocal.ts::lirePlansEnregistres`, clé
  `math-belgium-evaluations-enregistrees` ; ils ne sont pas effacés).
- `/admin` : générer des codes (usage unique, expiration, note), révoquer, voir qui les a utilisés,
  lister les professeurs, désactiver / réactiver.

## Configuration

- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (clé **publishable** `sb_publishable_…`, nouveau nom de
  la clé « anon » ; acceptée par supabase-js 2.118 — vérifié contre le vrai projet : requêtes reçues,
  erreurs PGRST et non 401). Valeurs PUBLIQUES versionnées dans **`.env.production`** (lu par Vite au
  build de production : rien à régler dans Vercel). `.env.example` sans valeurs ; `.env.local` (non
  suivi) pour le développement. **Jamais** de clé `service_role` / `sb_secret_…` dans le dépôt ni le
  client : toute la sécurité vient du RLS.
- Sans ces variables (`npm run dev`, ou build sans `.env.production`) : `supabaseConfigure()` faux →
  en-tête inchangé (aucun lien de compte), pages réservées « Connexion indisponible (configuration
  manquante) », `/admin` garde l'ancien mot de passe `lib/adminAuth.ts` + le panneau des évaluations.
- `@supabase/supabase-js` version EXACTE (2.118.0), chargé par `import()` dynamique : jamais dans le
  paquet principal ; une page de cours ne le télécharge que si une session est stockée
  (`localStorage['math-belgium-auth']`, `jetonStockePresent`) ou si l'URL porte des jetons d'e-mail.

## Schéma (`supabase/migrations/0001_comptes.sql`, UN fichier collable dans l'éditeur SQL)

| Table | Colonnes | RLS |
| --- | --- | --- |
| `profils` | `id` (= `auth.users.id`, cascade), `nom_affiche`, `est_admin` (faux), `actif` (vrai), dates | lecture : le sien (même désactivé) ou admin ; modification : `nom_affiche` SEUL (droit de colonne), le sien, actif ; pas d'insert/delete client |
| `ecoles` | `proprietaire` (défaut `auth.uid()`), `nom`, `adresse`, `par_defaut` (index unique partiel : une par professeur) | les siennes, compte actif |
| `invitations` | `code` (A–Z0–9, unique), `cree_par`, `expire_le`, `note`, `utilise_par`, `utilise_par_email`, `utilise_le`, `revoque` | lecture admin ; écriture par les fonctions seulement |
| `plans` | `proprietaire`, `type` (`exercice`/`evaluation`/`examen`/`remediation`), `titre`, `contenu` jsonb (objet, ≤ 2 Mo), dates | les siens, compte actif |

`anon` n'a AUCUN droit sur les tables. Compte désactivé (`actif = false`) : plus rien (lecture
comprise) sauf son propre profil (pour afficher « Compte désactivé »). L'admin NE voit PAS les plans ni
les écoles des professeurs. Toutes les fonctions SECURITY DEFINER ont `set search_path = ''`.

**Inscription** : `signUp({ email, password, options: { data: { code_invitation, nom_affiche },
emailRedirectTo } })` → déclencheur `inscription_par_invitation` (after insert on `auth.users`) : code
absent / inconnu / révoqué / utilisé / expiré → exception → l'insertion est annulée et `signUp` échoue
(GoTrue renvoie « Database error saving new user », 500, `unexpected_failure` — le message SQL précis ne
remonte pas). Sinon le code est marqué utilisé (`for update` : deux inscriptions simultanées ne peuvent
pas réussir) et le profil créé. Le site appelle d'abord `verifier_code_invitation(code)` (anon, renvoie
`valide`/`inconnu`/`utilise`/`expire`/`revoque`) pour un message clair. Codes : 12 symboles parmi 32
(sans 0/O/1/I), `gen_random_uuid` (aucune extension) ; le site retire espaces et tirets et met en
majuscules (`normaliserCodeInvitation` = `public.normaliser_code`).

RPC : `definir_ecole_par_defaut(p_ecole)`, `supprimer_mon_compte()` (plans, écoles, profil, puis
`auth.users` ; refusé au DERNIER admin actif), `admin_generer_codes(p_nombre 1–50, p_expire_le,
p_note)`, `admin_revoquer_code(p_id)` (non utilisé seulement), `admin_lister_invitations()` (avec nom /
e-mail de l'utilisateur), `admin_lister_professeurs()` (inscription, dernière connexion, nombre de plans
et d'écoles), `admin_definir_actif(p_id, p_actif)` (jamais soi-même). Toutes vérifient `est_admin()`.

Partage plus tard : table `partages (plan_id, destinataire, droit)` + politique SELECT AJOUTÉE sur
`plans`. Phase 2 : `classes (ecole_id → ecoles.id, …)`.

## Code

- `lib/supabase.ts` : `supabaseConfigure`, `chargerSupabase` (singleton ; flux « implicit » : le lien
  d'e-mail marche sur un autre appareil), `jetonStockePresent`, `jetonsDansUrl`. Faux client de test :
  `window.__MB_FAUX_SUPABASE__`, lu SEULEMENT si `import.meta.env.DEV`.
- `lib/compteValidation.ts` (PUR) : validations (mot de passe ≥ 8, e-mail, nom, école, titre),
  `messageErreur` (erreurs Supabase → français), `typeDuPlan`, `routeDuPlan`, `ecoleParDefaut`,
  `cartoucheDepuisCompte`, `retourSur` (retour interne seulement), `plansLocauxAImporter` (sans doublon).
- `lib/compteDonnees.ts` : une fonction par opération (client injecté), `ErreurCompte` au message traduit.
- `lib/compteContexte.tsx` : `CompteProvider` (autour des routes, `App.tsx`), `useCompte({ demarrer })`,
  états `indisponible` / `inactif` / `chargement` / `anonyme` / `connecte`. Jamais d'appel Supabase dans le
  rappel `onAuthStateChange` (verrou de supabase-js) : `setTimeout`. Après `signIn`, attendre
  `etat === 'connecte'` avant de naviguer (sinon la garde voit encore `anonyme`).
- `components/compte/PageReservee.tsx` : `PageCompte` (cadre + `usePageNonIndexee`), `PageReservee`
  (garde : sans session → `/connexion?retour=…`, désactivé → message, `admin`), `MessageIndisponible`.
  `Champ.tsx` : label, aide, erreur reliée (`aria-describedby`, `aria-invalid`), « Afficher » le mot de
  passe ; jamais de filtre de frappe ni de champ numérique (règle CLAUDE.md). `MenuCompte.tsx` : en-tête.
- Routes : `/connexion` (`?oubli=1` : lien de réinitialisation → `/mot-de-passe`), `/inscription`
  (`?code=` pré-rempli), `/mot-de-passe`, `/profil`, `/coffre`, `/evaluation` (panneau évaluations /
  examens pour tous les professeurs), `/admin` (`AdminComptes`). `/exercice` et `/…/exercices` sont
  PUBLIQUES (pas de `PageReservee`) : sans session, cartouche par défaut et enregistrements dans le
  navigateur ; connecté, école/nom et coffre comme sur `/evaluation`. Aucune n'est pré-rendue (`scripts/routes.mjs` ne liste que l'accueil et les chapitres) ;
  toutes `noindex`.
- Panneau (`EvaluationGeneratorPanel`) : connecté → `cartouche` (école choisie + `nom_affiche`) dans
  `EnTeteEvaluation` et appliqué à tout rendu (`rendrePlan`, même un plan rechargé ; changer d'école
  re-rend les documents avec les mêmes graines) ; enregistrer / lister / supprimer via le coffre ;
  `?plan=<id>` charge un plan du coffre ; bouton d'import des enregistrements locaux. Sans session :
  stockage du navigateur, comme avant. L'historique anti-doublon reste local (par appareil).
- Cartouche : `entrainement/export/cartouche.ts` (`CARTOUCHE_DEFAUT` = anciennes constantes
  « Collège Saint-Pierre… M. Hamwi », repli sans cartouche → documents IDENTIQUES à avant) ; utilisé
  par la copie, le corrigé, l'examen (HTML) et le Word. L'aménagée, la grille et la feuille d'exercices
  n'impriment pas d'école (inchangé) ; la feuille d'exercices et son aménagée impriment le NOM du
  professeur en en-tête et en pied de page (« M. Hamwi » sans session). Connecté sans école : rien à la place de l'école (jamais l'école
  d'un autre professeur).

## Mise en service (guide détaillé pour l'utilisateur : rapport du chantier, `MISE-EN-SERVICE.md`)

1. SQL Editor → coller TOUT `0001_comptes.sql` → Run (relançable sans danger).
2. Authentication → URL Configuration : Site URL `https://math-belgium.vercel.app` ; Redirect URLs
   `https://math-belgium.vercel.app/**` et `http://localhost:5173/**`.
3. Authentication → Providers → Email : garder « Confirm email » ; longueur minimale 8.
4. Premier code : `insert into public.invitations (code, note, expire_le) values ('PREMIERCODE1',
   'Compte administrateur', now() + interval '7 days');` → s'inscrire sur `/inscription` → confirmer
   l'e-mail → `update public.profils set est_admin = true where id = (select id from auth.users where
   email = '…');`. Ensuite les codes se génèrent depuis `/admin`.

## Limites de l'offre gratuite

- Projet **mis en veille après une semaine sans activité** : le réveiller depuis le tableau de bord
  (le site affiche « Serveur injoignable… réessaie dans une minute »). Les données sont conservées.
- **E-mails intégrés très limités** (quelques e-mails par heure, pour tout le projet) : confirmation
  d'inscription et mot de passe oublié peuvent être refusés (« Trop de demandes… »). Prévoir un SMTP
  (Authentication → Emails → SMTP Settings : Brevo, Resend…) dès qu'il y a plusieurs collègues.
- 500 Mo de base, 50 000 utilisateurs actifs par mois : sans objet ici (un plan ≈ quelques Ko).

## Vérifications faites / à refaire

- Postgres 16 local + faux schéma `auth` (rôles anon/authenticated/supabase_auth_admin, `auth.uid()`
  par `request.jwt.claim.sub`, droits par défaut Supabase) : migration exécutée deux fois, 72
  vérifications (inscription refusée / acceptée, RLS de chaque table, désactivation, admin, suppression).
- Playwright contre un build `NODE_ENV=development vite build --mode test` (le serveur de dev sert trop
  de modules pour le panneau : `ERR_INSUFFICIENT_RESOURCES`) avec un faux client injecté.
- À tester contre le VRAI projet après exécution du SQL : voir le rapport du chantier (déclencheur sur
  `auth.users` et message de `signUp`, `delete from auth.users` dans `supprimer_mon_compte` avec le rôle
  `postgres` de Supabase, e-mails, redirections).
