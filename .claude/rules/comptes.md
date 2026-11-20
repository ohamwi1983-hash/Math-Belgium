---
paths:
  - "src/lib/supabase.ts"
  - "src/lib/compte*"
  - "src/components/compte/**"
  - "src/routes/{Connexion,Inscription,Profil,Coffre,Admin,MotDePasse,Evaluation,Carnet}*"
  - "src/lib/carnet*"
  - "src/components/carnet/**"
  - "supabase/**"
  - ".env*"
---

# Comptes professeurs (Supabase) — phase 1

Seul backend du site : **Supabase** (Postgres + Auth + Row Level Security), projet `qklnpxofjsxyubdyyrgl`
(région Europe, offre gratuite). Cours, générateurs ET feuilles d'exercices restent PUBLICS (décision de
l'utilisateur, après mise en service : ses élèves préparent leurs évaluations avec les feuilles
d'exercices) ; seuls le panneau des évaluations / examens (`/evaluation`), le coffre, le profil et
l'administration sont derrière la connexion.
Aucune donnée d'élève. Phase 2 (faite, section « Phase 2 » en fin de fichier) : carnet de matière vue (`/carnet`).
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
`plans`. Phase 2 : `classes`, `seances`, `carnet_reglages` (`0002_carnet.sql`, voir plus bas).

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
  n'impriment pas d'école (inchangé). Connecté sans école : rien à la place de l'école (jamais l'école
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

## Phase 2 — carnet de matière vue (`/carnet`, `supabase/migrations/0002_carnet.sql`)

Décisions de l'utilisateur : carnet rattaché au compte, page réservée (`PageReservee`), AUCUNE donnée
d'élève (classes « 5e B » et séances seulement) ; partage entre collègues plus tard.

**Schéma** (`0002_carnet.sql`, idempotent, à coller APRÈS 0001 dans SQL Editor → Run ; résultat
attendu « Success. No rows returned ») :

| Table | Colonnes | Contraintes |
| --- | --- | --- |
| `classes` | `proprietaire` (défaut `auth.uid()`), `ecole_id`, `nom` (1–40), `niveau` (levelSlug facultatif), dates | unique `(proprietaire, ecole_id, lower(btrim(nom)))` ; FK COMPOSÉE `(ecole_id, proprietaire) → ecoles (id, proprietaire)` on delete cascade |
| `seances` | `proprietaire`, `classe_id`, `date_seance` (défaut aujourd'hui), `heure_debut` / `heure_fin` (time, nullables), `numero_heure` (1–15, nullable), `niveau` + `chapitre` (slugs), `parties` jsonb, `generateurs` jsonb, `devoir` / `remarque` (≤ 2 000), dates | fin > début, pas de fin sans début ; jsonb = tableau de textes (`tableau_de_textes` : parties ≤ 300 × 200 car., générateurs ≤ 100 × 40) ; FK COMPOSÉE `(classe_id, proprietaire) → classes (id, proprietaire)` on delete cascade |
| `carnet_reglages` | `proprietaire` (clé), `format_horaire` (`plage` / `numero`), `duree_heure` (20–240 min) | une ligne par professeur |

RLS des trois tables : `proprietaire = auth.uid() and est_actif()` (lecture ET écriture, comme `ecoles`
et `plans`) ; `anon` sans aucun droit ; l'admin ne voit pas les carnets. **Cohérence propriétaire par
les clés étrangères composées** (contrainte ajoutée `ecoles_id_proprietaire_uniq unique (id,
proprietaire)`) : puisque le RLS impose `proprietaire = auth.uid()`, une classe ne peut viser qu'une
école à soi, une séance qu'une classe à soi — vérifié par Postgres, sans rien révéler des lignes des
autres. Cascade école → classes → séances ; `supprimer_mon_compte()` (0001) efface toujours tout, sans
modification. Vérifié sur Postgres 16 local (faux schéma `auth`, 0001 puis 0002 exécutés deux fois,
données conservées) : 66 vérifications (lecture / écriture croisées refusées, rattachement à la classe
ou à l'école d'un autre refusé — 23503 —, propriétaire changé refusé — 42501 —, compte désactivé,
`anon`, limites jsonb et textes, cascades, suppression de compte).

**0002 pas encore appliqué** : `carnetDonnees.ts::ErreurCarnet.tableAbsente` (codes PGRST205 / PGRST204 /
42P01 / PGRST202 ou « schema cache ») → la page affiche « Carnet pas encore activé : colle le fichier
0002_carnet.sql… » ; tout le reste du site est inchangé (aucune autre page ne lit ces tables).

**Parties cochées** (`seances.parties`) : `sectionId` (section entière) ou `sectionId/slug` (sous-partie =
bloc `subheading` de premier niveau de la section ; slug du titre sans accents, `-2` en cas de doublon :
stable si on insère une sous-partie ailleurs, à changer avec soin si on renomme un titre). Toutes les
sous-parties cochées → enregistré comme section entière (`normaliserParties`) ; un id inconnu du contenu
est conservé (rien n'est perdu si le cours change). Générateurs proposés = cartes « S'entraîner » du
chapitre (`generateursChapitre`, ids `6gen13`, `gen7`…).

**Code** :
- `lib/carnet.ts` (PUR, testé par esbuild + node, 85 vérifications) : `structureChapitre`,
  `normaliserParties`, `unitesCouvertes`, horaire (`plageTexte` « 08h50 → 09h40 » via
  `examen.ts::heureTexte`, `numeroHeureTexte` « 3e heure », `horaireTexte(s, format)` avec repli sur
  l'autre écriture, `horaireParDefaut` = horaire de la dernière séance de la classe le même jour de la
  semaine, sinon l'heure actuelle arrondie à 5 min + durée), `erreursSeance`, `resoudreSeance` →
  `texteSmartschool` (date, horaire, classe, chapitre, parties avec lien
  `https://math-belgium.vercel.app/{niveau}/{chapitre}#{sectionId}` — ancres = `id` des sections de
  `ChapterPage`, générateurs avec lien, devoir ; la REMARQUE n'est jamais copiée) et `htmlSmartschool`
  (même contenu, liens cliquables si l'éditeur accepte le collage riche), `progressionClasse`
  (première date par unité, reste), `matiereDepuis(seances, date)` (sections ayant au moins une
  sous-partie cochée depuis la date incluse ; un seul niveau, le plus fréquent, les autres signalés).
- `lib/carnetMatiere.ts` (sans dépendance, partagé avec le panneau) : `encoderMatiere` /
  `decoderMatiere` (tolérant) / `urlEvaluationMatiere`.
- `lib/carnetFiche.ts` : fiche A4 HTML autonome ; ouverte par un LIEN `target=_blank` sur une URL blob
  (`#imprimer` → `print()` au chargement, jamais `window.open`) ou téléchargée (nom ASCII
  `seance-6e-a-2026-11-16.html` : un accent dans `download` fait perdre le nom dans Chromium).
- `lib/carnetDonnees.ts` : une fonction par opération (client injecté), `ErreurCarnet`.
- `routes/CarnetPage.tsx` + `components/carnet/` (`GestionClasses`, `FormulaireSeance`, `CarteSeance`,
  `ProgressionClasse`, `EvaluationMatiere`, `outilsCarnet` : presse-papiers avec repli texte à copier à
  la main, classe active mémorisée en `localStorage` par appareil). Sans école : invitation à en
  ajouter une dans `/profil`. Formulaire : date `type="date"`, heures `type="time"`, numéro d'heure en
  liste, jamais de champ numérique libre ; « déjà vu le … » à côté des parties déjà vues par la classe ;
  la case de section coche toutes ses sous-parties (état indéterminé si partiel). Progression : par
  chapitre (ceux du niveau de la classe + ceux des séances), date de la première fois, « reste », et
  pour chaque partie la date dans les AUTRES classes du même niveau.
- Réglage du format d'horaire et de la durée d'une heure : `carnet_reglages` (mémorisé dans le compte).

**Routes et liens** : `/carnet` (réservée, `noindex`, non pré-rendue, lien « Carnet de matière vue »
dans `MenuCompte`). `?chapitre=<niveau>/<chapitre>` ouvre une nouvelle séance sur ce chapitre (classe
du même niveau choisie). Bouton « Carnet » dans `OutilsChapitre` seulement si `useCompte().etat ===
'connecte'` et profil actif — `useCompte()` SANS `demarrer` : un visiteur sans session stockée ne
télécharge ni supabase-js ni le code du carnet (vérifié par Playwright).

**Panneau des évaluations, `?matiere=`** (`EvaluationGeneratorPanel`, effet à côté de `?plan=`) :
`/evaluation?matiere=6e-6h~fonctions-logarithmes:proprietes,limites&depuis=2026-11-01&classe=6e%20A`
règle niveau / heures, coche ces chapitres et met UN exercice sur la première variante disponible
(non exclue faute de calculatrice) de chaque générateur des sections listées ; processus affiché =
celui du premier générateur retenu ; bandeau `.admin-eval-carnet` en tête (« Matière vue en 6e A
depuis le 01/11/2026 : n sections, m générateurs pré-sélectionnés… ») ; les trois paramètres sont
retirés de l'URL. Sans le paramètre, ou sur une page verrouillée (`/…/exercices`) : comportement
inchangé.

**Vérifications** (Playwright sur un build `NODE_ENV=development vite build --mode test` avec des
variables Supabase factices et le faux client `window.__MB_FAUX_SUPABASE__`, iPhone 13 et 1 280 px,
clair et sombre ; 240+ vérifications) : classes (ajout, doublon refusé, renommage, suppression),
séance (création, modification, heure de fin refusée, numéro d'heure), copie Smartschool (presse-papiers
relu), fiche (onglet ouvert, téléchargement), progression, évaluation → `/evaluation` pré-sélectionné
(exercices seulement dans les sections vues), « 0002 non appliqué », sans école, page de cours en
visiteur (aucun bouton, supabase-js non téléchargé) et en professeur (bouton → séance pré-remplie) ;
0 erreur console, `scrollWidth` = largeur.

**Mise en service** : SQL Editor → coller TOUT `0002_carnet.sql` → Run → « Success. No rows returned » ;
recharger `/carnet` (Supabase peut mettre quelques secondes à voir les nouvelles tables). À vérifier
contre le vrai projet : création de classe / séance, refus d'une école d'un autre (impossible depuis le
site, à tester au besoin dans l'éditeur SQL avec deux comptes).

