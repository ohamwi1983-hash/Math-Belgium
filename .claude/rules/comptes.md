---
paths:
  - "src/lib/supabase.ts"
  - "src/lib/compte*"
  - "src/lib/coffre*"
  - "src/components/compte/**"
  - "src/routes/{Connexion,Inscription,Profil,Coffre,Admin,MotDePasse,Evaluation,Carnet,Exercice,ChapterExercice}*"
  - "src/lib/carnet*"
  - "src/lib/horaire.ts"
  - "src/lib/repartitionProcessus.ts"
  - "src/components/admin/conception/ReglageRepartition.tsx"
  - "src/lib/calendrierFwb.ts"
  - "src/lib/agenda*"
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
Aucune donnée d'élève. Phase 2 (faite, section « Phase 2 » en fin de fichier) : carnet de matière vue (`/carnet`),
puis son horaire de la semaine (`0003_horaire.sql`, sous-section « Horaire de la semaine ») et l'heure
zéro (`0004_heure_zero.sql`, même sous-section), puis l'agenda d'une période (sous-section « Agenda d'une
période », sans migration), puis l'agenda : événements, périodes du bulletin et heures effectives
(`0006_agenda.sql`, sous-section « Événements et bulletin »), puis devoirs, évaluations et texte en rubriques
pour l'agenda scolaire (`0007_devoirs_evaluations.sql`, sous-section « Devoirs, évaluations et texte en rubriques »). Répartition d'EXAMEN Connaître / Appliquer / Transférer (« Préparer
l'examen ») mémorisée dans le profil : `0005_repartition.sql` (section « Répartition mémorisée » en fin
de fichier).
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
| `profils` | `id` (= `auth.users.id`, cascade), `nom_affiche`, `est_admin` (faux), `actif` (vrai), dates ; + `repartition` jsonb (0005) | lecture : le sien (même désactivé) ou admin ; modification : `nom_affiche` (et `repartition` depuis 0005) SEULS (droits de colonne), le sien, actif ; pas d'insert/delete client |
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
- `components/compte/PageReservee.tsx` : `PageCompte` (cadre + `usePageNonIndexee` ; `sansTete` : la page porte son `<h1>`), `EnTeteCompte`, `PageReservee`
  (garde : sans session → `/connexion?retour=…`, désactivé → message, `admin`), `MessageIndisponible`.
  `Champ.tsx` : label, aide, erreur reliée (`aria-describedby`, `aria-invalid`), œil « Afficher le mot de
  passe » dans le champ ; jamais de filtre de frappe ni de champ numérique (règle CLAUDE.md). `MenuCompte.tsx` : en-tête (visiteur : « Professeur » → `/connexion?retour=…` ; connecté : pastille « Mon compte » — voir « Bannière et pages d'accès » en fin de fichier).
- Routes : `/connexion` (`?oubli=1` : lien de réinitialisation → `/mot-de-passe`), `/inscription`
  (`?code=` pré-rempli), `/mot-de-passe`, `/profil`, `/coffre`, `/evaluation` (panneau évaluations /
  examens pour tous les professeurs), `/admin` (`AdminComptes`). `/exercice` et `/…/exercices` sont
  PUBLIQUES (pas de `PageReservee`). **Qui voit quoi** (décision de l'utilisateur, 21/11/2026) :
  professeur connecté (`estConnecteActif(useCompte())`, `useCompte()` SANS `demarrer`) → panneau des
  feuilles d'exercices tel quel (école/nom, coffre) ; visiteur non connecté (élève, ou Supabase non
  configuré) → assistant « Me préparer à l'évaluation » (`components/eleve/AssistantEleve.tsx`, feuille
  d'exercices ou évaluation blanche, voir `.claude/rules/feuilles-evaluations.md`) avec un lien
  discret « Je suis professeur : me connecter » (`/connexion?retour=<page>`, masqué si `indisponible`) ;
  session stockée en cours de lecture (`chargement`) → « Chargement… » (aucune bascule visible).
  L'assistant n'enregistre rien (ni coffre, ni navigateur, ni historique). `/evaluation` reste réservée.
  **« Voir comme un élève »** (décision de l'utilisateur) : lien dans le bandeau du panneau professeur ;
  `?vue=eleve` montre l'assistant au professeur connecté, avec un bandeau « Revenir à ma page ».
  Aucune n'est pré-rendue (`scripts/routes.mjs` ne liste que l'accueil et les chapitres) ;
  toutes `noindex`. Vérifié (Playwright, faux client) : sans compte → assistant sur les deux pages,
  compte simulé → panneau, `/evaluation` sans compte → `/connexion?retour=%2Fevaluation`.
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
dans `MenuCompte`) et ses sous-pages `/carnet/*` (voir « Interface refondue » ci-dessous).
`?chapitre=<niveau>/<chapitre>` ouvre le panneau « Noter une séance » sur ce chapitre (classe
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

### Horaire de la semaine (`supabase/migrations/0003_horaire.sql`, dans `/carnet`)

Décisions de l'utilisateur : grille horaire PAR ÉCOLE (une seule source), heures des pauses et fin des
cours CALCULÉES (jamais saisies), mercredi = heures du matin par défaut (réglable), heures doubles =
UNE séance, congés = calendrier officiel FWB, semaine A / B PLUS TARD (non faite, schéma prêt).

**Schéma 0003** (idempotent, à coller APRÈS 0001 et 0002 ; « Success. No rows returned ») :

| Table | Colonnes | Contraintes |
| --- | --- | --- |
| `horaires_ecoles` | clé `(ecole_id, proprietaire)`, `debut` (time 06:00–20:00, défaut 08:45), `duree_heure` (20–240, défaut 50), `nombre_heures` (1–15, défaut 7), `pauses` jsonb (défaut récréation 20 min après H2 + midi 60 min après H4), `heures_mercredi` (NULL = heures avant midi, 0–nombre), `exceptions` jsonb, dates | `pauses_horaire_valides` (≤ 6 objets `{apres 1…n−1, duree 5–180, type recreation/midi/autre}`, exactement ces clés, une par position, ≤ 1 midi) ; `exceptions_horaire_valides` (≤ 15 `{heure 1…n, debut "HH:MM", fin "HH:MM"}`, fin > début, une par heure) ; `journee_horaire_tient` (fin calculée ≤ 23h59) ; FK COMPOSÉE `(ecole_id, proprietaire) → ecoles` on delete cascade |
| `horaire_cases` | `proprietaire`, `ecole_id`, `jour` (1 = lundi … 5), `heure` (1–15), `classe_id`, `semaine` (NULL ; 'A'/'B' prévu plus tard), dates | unique `(proprietaire, ecole_id, jour, heure, coalesce(semaine,'*'))` ; FK `(ecole_id, proprietaire) → ecoles` et FK `(classe_id, ecole_id, proprietaire) → classes (id, ecole_id, proprietaire)` (contrainte ajoutée `classes_id_ecole_proprietaire_uniq`) : une case ne vise qu'une école à soi ET une classe à soi DE CETTE ÉCOLE ; cascades |
| `seances` | + `numero_heure_fin` (NULL ; 2–15, > `numero_heure`, exige `numero_heure`) | anciennes séances intactes |

Clé `(ecole_id, proprietaire)` et non `ecole_id` seule : viser l'école d'un autre donne 23503, sans
révéler (23505) qu'elle a une grille. Déclencheur `classes_change_ecole_horaire` (SECURITY INVOKER) :
une classe qui change d'école quitte l'horaire de l'ancienne (sinon la FK composée bloquerait la
modification). RLS des deux tables comme 0002 (`proprietaire = auth.uid() and est_actif()`, `anon`
sans droit). `supprimer_mon_compte()` inchangé : tout part en cascade. Vérifié sur Postgres 16 local
(faux schéma `auth`, 0001 + 0002 + données, puis 0003 exécuté TROIS fois sans perte) : 90 vérifications
(lecture / écriture croisées, rattachement à l'école / la classe d'un autre — 23503 —, classe d'une
autre école du même professeur — 23503 —, propriétaire changé — 42501 —, doublons — 23505 —, toutes
les limites — 23514 —, désactivation, `anon`, cascades école / classe / changement d'école,
suppression de compte). Semaine A / B plus tard : 0004 non destructive (référence de la semaine A dans
`carnet_reglages`, règle « une case NULL exclut A et B au même endroit ») + site.

**0003 pas appliqué** : `carnetDonnees.ts::chargerHoraire` renvoie `actif: false` (table absente), les
séances sont lues / écrites SANS `numero_heure_fin` (`listerSeances(c, horaire)`, `ligneSeance`), la
section « Mon horaire » affiche « Horaire pas encore activé : colle le fichier 0003_horaire.sql… » ;
tout le reste du carnet marche comme avant.

**Règles de calcul** (`lib/horaire.ts`, PUR, 116 vérifications esbuild + node dont l'exemple de
l'utilisateur au détail près : 08h45, 09h35, récréation 10h25 → 10h45, 10h45, 11h35, midi 12h25 →
13h25, 13h25, 14h15, 15h05, fin 15h55 ; écoles à 3 heures avant la récréation, 2 / 4 l'après-midi,
45 et 55 min) :
- `journee(g, jour)` : H1 au début des cours ; chaque heure dure `duree_heure` ; la suivante commence
  à la fin de la précédente + la pause placée « après » elle. Heure corrigée à la main (`exceptions`) :
  garde ses heures, les suivantes repartent de SA fin (chevauchement refusé par `erreursGrille`).
  Mercredi : `heuresDuMercredi` = réglage, sinon `apres` du midi, sinon toutes.
- Heures doubles (`creneauxSemaine`) : numéros consécutifs, même école, même classe → un créneau
  « H1–H2 (08h45 → 10h25) », `nbHeures` 2 — à travers une récréation ou une pause « autre », JAMAIS à
  travers le midi (matin et après-midi = deux séances). Une séance enregistrée depuis un créneau porte
  `numero_heure`, `numero_heure_fin`, `heure_debut`, `heure_fin`.
- `creneauxDuJour(date)` : rien les week-ends / congés / vacances FWB ; `creneauPropose` = créneau en
  cours, sinon le plus proche (égalité → celui qui vient de finir), préférence possible (classes du
  niveau du chapitre).
- `seanceDuCreneau` : même classe, même date, numéros qui se recouvrent (sinon plages ; une séance
  sans horaire couvre tous les créneaux de sa classe ce jour-là).
- `creneauxOublies` : de `depuis` (défaut `depuisParDefaut` = 14 derniers jours de classe, aujourd'hui
  compris) à maintenant ; congés exclus ; une case ne compte qu'à partir de son `cree_le` (remplir
  l'horaire aujourd'hui ne crée pas d'oubli rétroactif).
- `heuresRestantes` : de maintenant (créneaux pas encore commencés) au jour choisi inclus, congés
  exclus ; heure double = 2 heures, 1 séance ; `aConfirmer` si une année au calendrier inconnu.
- `chevauchements` : heures de deux écoles qui se recouvrent le même jour.
- Format : `carnet.ts::horaireTexte(s, format, avecGrille)` → « H2 (09h35 → 10h25) » / « H1–H2 (…) »
  quand l'école de la classe a une grille et que la séance a numéro + plage ; sinon réglage plage /
  numéro d'avant (« 1re–2e heures » pour une heure double). Smartschool et la fiche A4 suivent
  (`resoudreSeance(…, { avecGrille })`).

**Calendrier FWB** (`lib/calendrierFwb.ts`, données en code, une entrée par année scolaire, source et
date de consultation en commentaire) : 2025-2026, 2026-2027, 2027-2028 et 2028-2029 recopiés des PDF
officiels d'enseignement.be (page https://www.enseignement.be/calendrier-scolaire, PDF
`…/menu_courtoisie/calendrier_scolaire/2024_Cal_Obli_2526.pdf`, `2026_Cal_Obli_2627.pdf`,
`2026_Cal_Obli_2728.pdf`, `2026_Cal_Obli_2829.pdf`, consultés le 21/11/2026 ; 2026-2027 recoupé avec la
circulaire 9753 du 24/06/2026). Jours de congé = ceux surlignés sur les PDF (mardi gras compris quand il
tombe hors détente). Année absente → `etatJour` « inconnu » (jour de semaine compté comme jour de
classe possible) et l'interface affiche « Calendrier FWB 2029-2030 à confirmer ». Ajouter une année :
recopier son PDF officiel, source + date, `verifie: true`.

**Interface** (`CarnetPage` + `components/carnet/` ; emplacements d'AVANT la refonte du 21/11/2026, le
contenu de chaque bloc est conservé — voir « Interface refondue ») :
- « Mon horaire » (après « Mes classes », visible dès qu'il y a une classe ; ouvert d'office tant que
  l'horaire est vide) : `MonHoraire` → onglets d'école (plusieurs écoles), alerte de chevauchement,
  `GrilleEcole` (création pré-remplie avec la grille d'exemple de l'utilisateur ; début `type="time"`,
  durées / nombres / positions en listes, aperçu « Journée calculée » en direct, « Corriger » une heure,
  « Fin des cours », mercredi), puis « Semaine — École » : tableau jours × heures dès 720 px
  (`useEcranLarge`), un jour à la fois sur téléphone ; chaque case = liste des classes DE CETTE ÉCOLE
  ou « — » (enregistrée aussitôt). Raccourcir la grille retire (après confirmation) les cases hors
  grille. « Ma semaine complète » résume toutes les écoles.
- « Aujourd'hui » (en tête dès que l'horaire a une case) : créneaux du jour (« en cours » / « le plus
  proche »), « Noter la séance » ou « Séance notée ✓ » (ouvre la séance), autre jour au choix,
  congé / week-end / « calendrier à confirmer » ; « Séances à noter » (oubliées, depuis une date
  mémorisée par appareil, défaut 14 jours de classe, 12 visibles puis « Afficher les n »).
- « Heures restantes » : « 14 heures avec 4Ge d'ici le 18 décembre 2026 (9 séances) », date par défaut
  = dernier jour de classe avant le prochain congé FWB (`prochainConge`).
- `FormulaireSeance` : liste « Créneau de l'horaire » des créneaux du jour choisi (règle classe,
  numéros, plage ; changer de date ou de classe suit) + « Autre horaire (saisie libre) ». Nouvelle
  séance, « Noter », oubliée, bouton « Carnet » d'un chapitre (`?chapitre=`) : créneau pré-rempli.

**Vérifications** : Playwright sur un build de test (faux client étendu aux deux tables, option
`horaireAbsent` qui refuse aussi `numero_heure_fin` — 42703), heure figée (`page.clock`, Europe/Brussels),
iPhone 13 et 1 280 px, clair et sombre : 360 vérifications (grille et aperçu, correction d’heure,
semaine, Aujourd'hui, séance pré-remplie + autre créneau / autre date, heure double en base,
Smartschool, oubliées et « Noter », congés, 2030 à confirmer, deux écoles + chevauchement, heures
restantes, grille raccourcie, chapitre → créneau, 0003 absent) ; 0 erreur console, `scrollWidth` =
largeur. Le parcours Playwright de la phase 2 repasse aussi (carnet sans horaire).

**Mise en service** : SQL Editor → New query → coller TOUT `0003_horaire.sql` → Run → « Success. No
rows returned » ; recharger `/carnet` → « Mon horaire ». À vérifier contre le vrai projet : grille,
cases, séance « H1–H2 » (colonne `numero_heure_fin`).

**Heure zéro (H0, `supabase/migrations/0004_heure_zero.sql`)** — décisions de l'utilisateur : certaines
écoles (dont la sienne) ont, exceptionnellement, une heure AVANT H1. Case « Cette école a une heure zéro
(H0) » dans la grille, décochée par défaut ; H0 JUSTE AVANT H1, SANS pause, MÊME durée que les autres
heures (grille de l'utilisateur : H0 07h55 → 08h45), corrigeable avec « Corriger » ; mercredi aussi.
H1 … Hn GARDENT numéros et horaires : rien ne bouge dans les cases ni dans les séances existantes. Deux
usages : H0 FIXE (ligne H0 en haut de la semaine, une classe ; comptée dans Aujourd'hui, Séances à noter,
Heures restantes) et H0 PONCTUELLE (« — » dans l'horaire : jamais d'oubli ni d'heure restante, mais le
formulaire de séance propose « H0 (07h55 → 08h45) · heure zéro ponctuelle » pour la date choisie, sans
classe imposée). Format « H0 (07h55 → 08h45) » / « H0–H1 (07h55 → 09h35) » partout (carnet, Smartschool,
fiche A4) ; sans grille, réglage numéro : « heure zéro », « heure zéro et 1re heure », « heure zéro à
2e heure » (jamais « 0e heure »).

- **Schéma 0004** (idempotent, à coller APRÈS 0001–0003 ; « Success. No rows returned ») :
  `horaires_ecoles.heure_zero boolean not null default false` ; contraintes ÉLARGIES sous LEURS noms
  (remplacées seulement si elles ont encore l'ancienne définition, repérée par `pg_get_constraintdef`,
  donc relançable et sans réécriture de données) : `horaire_cases_heure_check` 0–15,
  `seances_numero_heure_check` 0–15 (noms donnés par Postgres aux CHECK de colonne de 0003 / 0002),
  `seances_numero_heure_fin_valide` 1–15 et > `numero_heure` (« H0–H1 »),
  `horaires_ecoles_exceptions_valides` → `exceptions_horaire_valides(j, n, heure_zero)` (heure 0 permise
  SEULEMENT si `heure_zero`, ≤ 16 corrections) ; nouvelle `horaires_ecoles_heure_zero_tient`
  (`heure_zero_tient(debut, duree, exceptions)` : H0 non corrigée = début de H1 — corrigé ou non — moins
  la durée ≥ 00h00, jamais la veille ; corrigée, ses « HH:MM » sont forcément dans la journée).
  `journee_horaire_tient` inchangée (H0 est avant H1, la fin ne bouge pas). Relancer 0003 après 0004 ne
  rétrécit rien (ses contraintes sont créées « si absentes »). RLS, droits, FK et cascades inchangés ;
  nouvelles fonctions : `revoke … from public, anon`, `grant execute … to authenticated`. Une case H0
  d'une école sans heure zéro n'est pas refusée par la base (comme une case au-delà du nombre
  d'heures) : le site la retire et l'ignore.
- **Calcul** (`lib/horaire.ts`) : `journee` ajoute `{ numero: 0 }` EN TÊTE (`heures[0]`) si `heure_zero`
  et au moins une heure ce jour-là ; NE PLUS indexer `heures[numero - 1]` : `heureDe(j, numero)`,
  `premiereHeure(g)` (0 ou 1). `erreursGrille` : correction de H0 sans heure zéro, H0 la veille, H0 qui
  finit après le début de H1. Heure double : règle existante (`heureFin === heure - 1`, pas de pause
  « après 0 ») → « H0–H1 », « H0–H2 ». `creneauxPonctuels(date, grilles, cases)` : H0 des écoles à heure
  zéro sans case H0 ce jour-là (`classe_id` vide, `ponctuel: true`), jamais dans `creneauxDuJour`.
  `casesHorsGrille` : cases H0 sans heure zéro (ou mercredi sans cours) en plus des heures supprimées.
  PIÈGE : le numéro 0 est FAUX en JavaScript — tout test `if (s.numero_heure)` devient `!== null`
  (`seanceDuCreneau`, `horaireTexte`, `horaireParDefaut`, `ligneSeance`, formulaire).
- **0004 pas appliqué** : `carnetDonnees.ts::lireGrilles` lit avec `heure_zero`, et sur 42703 / PGRST204
  mentionnant `heure_zero` relit SANS la colonne → `DonneesHoraire.heureZero` faux ; `ligneGrille` n'écrit
  alors ni la colonne ni une correction de H0, les cases H0 sont ignorées ; la case de la grille est
  désactivée avec « Heure zéro pas encore activée : colle le fichier 0004_heure_zero.sql… » ; la liste
  des numéros ne propose « heure zéro » que si 0004 est appliqué. Tout le reste comme avant.
- **Interface** : `GrilleEcole` (case + aide, H0 dans l'aperçu et « Corriger H0 » — « H1 et la suite ne
  bougent pas », mercredi « H0 → H4 ») ; décocher H0 avec des cases H0 → confirmation « … (heure zéro
  retirée) … Les séances déjà notées sont conservées » puis suppression de ces cases (comme raccourcir la
  grille) ; `MonHoraire` (ligne H0, mercredi d'après `journee(g, 3)`, aide fixe / ponctuelle) ;
  `FormulaireSeance` (H0 ponctuelle : la choisir garde la classe ; changer de classe la garde ; changer de
  date reprend la H0 ponctuelle de la même école ce jour-là, sinon la règle des créneaux de la classe).
- **Vérifications** : Postgres 16 local (faux schéma `auth`, 0001–0003 + données, 0004 exécuté trois
  fois — instantané des lignes identique —, 0003 relancé après 0004, 0004 encore) : 81 vérifications
  (H0 / H0–H1 / H0–H2 acceptées, -1 / 16 / fin ≤ début refusés, correction de H0 sans heure zéro ou
  décocher en la gardant refusés, H0 la veille refusée, 16 corrections, RLS croisé, `anon`, désactivé,
  cascades, suppression de compte) + les 90 de 0003 repassent avec 0004. Logique : 82 vérifications
  esbuild + node (journée de l'utilisateur avec H0, correction, mercredi, H0–H1, ponctuelle sans oubli,
  heures restantes, formats) ; les suites horaire (116) et carnet (85) repassent. Playwright (faux client
  étendu : option `heureZeroAbsent`, contrôles 0…15 et fin > début) iPhone 13 et 1 280 px, clair et
  sombre : 274 vérifications (case cochée / décochée avec case H0, aperçu, correction, ligne H0, Aujourd'hui
  H0–H1 en cours, séance H0–H1 + Smartschool, H0 ponctuelle, heures restantes, « heure zéro » en numéro,
  0004 absent) ; 0 erreur console, `scrollWidth` = largeur ; le parcours de 0003 (360) repasse.
- **Mise en service** : SQL Editor → New query → coller TOUT `0004_heure_zero.sql` → Run → « Success. No
  rows returned » ; recharger `/carnet` → Mon horaire → Modifier la grille → cocher « Cette école a une
  heure zéro (H0) » → Enregistrer. À vérifier contre le vrai projet : case H0, séance « H0–H1 ».

### Agenda d'une période (dans `/carnet`, AUCUNE migration)

Demande de l'utilisateur : télécharger / imprimer pas seulement la séance, mais « l'agenda complet allant
d'une période à une autre ». Tout se calcule à partir des séances existantes : marche avec ou sans
0003 / 0004 (sans grille : format d'horaire du réglage, comme les cartes de séance). Choix par défaut
(ajustables par l'utilisateur) :
- Bloc « Agenda d'une période » (`components/carnet/AgendaPeriode.tsx`), après la classe active, avant
  « Mon horaire » : classe (suit la classe active tant qu'on n'en a pas choisi une ici) ou « Toutes mes
  classes » ; Du / Au en `type="date"` ; raccourcis « Cette semaine » (lundi → vendredi), « Ce mois-ci »
  (1er → dernier jour), « Depuis la rentrée » (rentrée FWB → aujourd'hui), « Du dernier congé à
  aujourd'hui » (premier jour de classe après les dernières vacances de plusieurs jours finies, été
  compris → aujourd'hui ; PÉRIODE PAR DÉFAUT) ; cases « Inclure les liens » (cochée), « Inclure mes
  remarques » (DÉCOCHÉE : note privée, comme Smartschool ; vaut pour les trois sorties), et pour
  toutes les classes « Une section par classe » (décochée : un tableau chronologique unique avec une
  colonne Classe). Résumé en direct (« 5 séances · 7 heures de cours · 1 chapitre · 4 sections pour
  5e B du … ») ; période vide → « Aucune séance notée pour … : rien à imprimer », boutons désactivés ;
  dates inversées → erreur. Pas de limite de durée.
- Sorties : **Imprimer l'agenda** (`ouvrirFiche` : lien `target=_blank` vers une URL blob `#imprimer`,
  jamais `window.open`), **Télécharger (HTML A4)** (nom ASCII `agenda-5e-b-2026-09-01-au-2026-12-18.html`,
  `agenda-toutes-classes-…`), **Copier pour Smartschool** (texte + HTML riche, repli texte à copier à la
  main).
- `lib/carnetAgenda.ts` (PUR, 103 vérifications esbuild + node) : `periodeRaccourci`, `rentreeDe`,
  `debutDepuisDernierConge`, `congesDeLaPeriode` (congés FWB + vacances d'été entre deux années,
  réduits à leurs jours de semaine dans la période ; un congé tombé un week-end n'est pas cité),
  `construireAgenda` (bornes INCLUSES, ordre date → heure → classe ; `groupes` : un seul, ou un par
  classe), `blocsParSemaine` (« Semaine du 15 septembre », année ajoutée si la période couvre deux
  années civiles ; un congé est annoncé UNE fois, dans la première semaine qu'il touche ; semaine
  entièrement en congé sans séance → seulement la ligne du congé ; semaine de classe sans séance →
  « Aucune séance notée cette semaine. », sauf si elle commence après aujourd'hui), `syntheseAgenda`
  (séances, heures via `carnet.ts::heuresSeance` — « H1–H2 » = 2 ; sans numéro de fin, plage ÷ durée
  d'une heure arrondie, ≥ 1 —, chapitres et sections distincts, détail par classe),
  `texteSmartschoolAgenda` / `htmlSmartschoolAgenda` (chaque séance = `texteSmartschool(r, { liens,
  remarque })`, même format que la copie d'une séance ; options par défaut : liens, sans remarque),
  `nomFichierAgenda`, `periodeTexte` (« du lundi 1er septembre au vendredi 18 décembre 2026 »).
- `lib/carnetFiche.ts::agendaPeriodeHtml` : même style que la fiche d'une séance ; en-tête (école(s),
  professeur, « Agenda — 5e B » / « Agenda — toutes les classes », période en toutes lettres, classes) ;
  lignes en grille (Date · horaire | [Classe] | Matière vue : chapitre, parties, exercices, devoir,
  remarque si cochée ; « 2 heures » sous l'horaire d'une heure double) ; chaque séance `break-inside:
  avoid`, titre de semaine collé à sa première ligne (`.tete-semaine`) ; « une section par classe » :
  saut de page entre classes + synthèse par classe ; synthèse globale à la fin ; pied de page `@page`
  « professeur · titre » à gauche, « page n / N » à droite (boîtes de marge : Chromium / Edge ; ignoré
  ailleurs, jamais bloquant). Aucune figure, aucune ressource externe (une année entière ≈ 200 Ko).
- `texteSmartschool` / `htmlSmartschool` ont gagné des options `{ liens, remarque }` ; sans option :
  sortie d'une séance IDENTIQUE à avant (remarque jamais copiée).
- **Vérifications** : logique 103 (bornes, raccourcis, congés 2026-2027 et été, semaines, futur, heures
  doubles, synthèse, textes, remarques exclues par défaut, documents) ; suites carnet (85), horaire (116),
  heure zéro (82) repassent. Playwright (build de test, faux client, heure figée au samedi 21/11/2026,
  iPhone 13 et 1 280 px, clair et sombre, + 0003 absent) : 215 vérifications (défauts, raccourcis,
  imprimer → onglet blob `#imprimer`, téléchargements et noms, presse-papiers relu avec / sans remarques
  et liens, toutes les classes en tableau et par classe, période vide, dates inversées, repli de copie,
  `page.pdf` A4 + `pdftotext -layout` : « page n / N » et nom du professeur sur chaque page, aucune
  séance coupée, aucun titre de semaine orphelin) ; 0 erreur console, `scrollWidth` = largeur.

### Interface refondue (21/11/2026 : menu + « Aujourd'hui » + « Ma semaine » + page par classe, AUCUNE migration)

Décision de l'utilisateur (maquettes A + B + C) : la longue page unique est remplacée par un menu et des
vues ; RIEN n'a disparu (classes, écoles, horaire et grille avec H0, réglages, agenda, évaluation,
progression, fiches, séances à rattraper, messages, cas sans école / sans classe / horaire vide).
- Routes (`App.tsx` : `/carnet/*`, garde `PageReservee` inchangée, `PageCompte large`, jamais pré-rendues) :
  `/carnet` Aujourd'hui · `/carnet/semaine` · `/carnet/classe/:id` (mémorisée comme classe active) ·
  `/carnet/classes` (`GestionClasses`, « Ajouter une classe ») · `/carnet/agenda` (`?classe=` présélectionne)
  · `/carnet/horaire` (`MonHoraire`) · `/carnet/reglages` ; adresse inconnue → `/carnet`.
- Menu : `MenuCarnet` a disparu le 22/11/2026, repris dans `MenuEspace` (voir « Harmonisation « Mon
  espace » » en fin de fichier) — « n à noter » = créneaux du jour passés / en cours sans séance, nombre
  de séances par classe ; téléphone : barre fixe en bas (Aujourd'hui · Semaine · Classes · Plus,
  feuilles au-dessus, Échap / clic à côté). Classe CSS
  `.carnet-barre-bas` (`.carnet-barre` = barre de progression d'`index.css`, ne pas réutiliser).
- `Aujourdhui` : heures du jour (`journeeCarnet.ts::lignesDuJour` : H0 → Hn, heures doubles, libres
  regroupées, récréation / midi ; plusieurs écoles le même jour → créneaux seuls), créneau proposé
  encadré, notée → « ✓ Noté » + `ActionsSeance`, sinon « Noter la séance » (+ « dernière fois : … ») ;
  carte « Maintenant » sur téléphone ; colonne : À rattraper (jours précédents, date mémorisée, 12 puis
  « Afficher les n »), Où en sont mes classes, raccourcis. En-tête « Période n · semaine n »
  (`outilsCarnet::reperesScolaires` : vacances de plusieurs jours passées + semaines ayant un jour de
  classe FWB). Séances du jour hors horaire listées dessous ; horaire vide / 0003 absent → invitation.
- `MaSemaine` : `journeeCarnet.ts::grilleSemaine` (rangées = heures des écoles actives + pauses de
  l'école par défaut ; `rowSpan` des heures doubles, heures sans cours regroupées, congé FWB = colonne
  grisée) ; case notée → panneau de la séance, « Noter » → panneau pré-rempli ; téléphone : un jour à la
  fois ; « Imprimer la semaine » = `agendaPeriodeHtml` du lundi au vendredi (toutes classes, sans
  remarques) ; `Planification` (heures restantes) dessous, ancre `#heures-restantes`.
- `PageClasse` : en-tête (niveau, h/semaine = cases de l'horaire, école, séances, « Modifier la classe »
  → `FormClasse` + suppression), fil par semaine (2 semaines en entier, puis lignes compactes, 4 semaines
  puis « Voir les semaines précédentes »), progression à droite (chapitre en cours, ✓ / ▸ / ○ avec dates,
  « Comparer avec » une classe du même niveau, autres chapitres, `ProgressionClasse` complète repliée),
  `EvaluationMatiere` (`#evaluation`).
- Panneau commun `PanneauLateral` (portail, `role="dialog"` + `aria-modal`, focus piégé, Échap, focus
  rendu, clic sur le voile SANS effet) : `FormulaireSeance` (résumé classe · date · créneau + « changer »,
  chapitre en cours proposé — suit la classe tant qu'il n'a pas été choisi, sauf `?chapitre=` —, « vu le /
  commencé le », aperçu Smartschool en direct, Annuler / Enregistrer / « Enregistrer et copier » : la copie
  est lancée AVANT l'enregistrement, repli texte à copier si refusée) ; séance ouverte = `CarteSeance`.
- Une action principale par séance (`CarteSeance.tsx::ActionsSeance` : Copier pour Smartschool) + menu
  « … » (`MenuActions` : `role="menu"`, flèches, Échap) : fiche, télécharger, modifier, supprimer.
  `contexteCarnet.ts::resoudre` = mêmes options qu'avant → textes / fiches IDENTIQUES.
- Styles : `components/carnet/carnet.css` (importé par `CarnetPage`, morceau à la demande), couleurs de
  classe `.carnet-c0…c5` (rang dans la liste), jetons clair / sombre.
- **Vérifications** (Vite de développement + faux client, heure figée vendredi 20/11/2026 11h50,
  données fictives : 1 école à H0, 3 classes, 17 cases, 25 séances) : 216 vérifications Playwright
  (1 280 px et iPhone 13) dont non-régression contre l'interface d'avant — 25 textes Smartschool,
  25 fiches, 4 agendas (texte + HTML) identiques octet pour octet —, panneau (pré-remplissage, focus
  piégé, Échap, enregistrer et copier = aperçu, modifier, supprimer), semaine (heure double, mercredi,
  Armistice, Toussaint), classe, barre du bas, `?chapitre=`, cas vides ; 82 captures (clair + sombre),
  `scrollWidth` = largeur, 0 erreur console.

### Événements et bulletin (`supabase/migrations/0006_agenda.sql`, dans `/carnet`, maquettes du 22/11/2026)

Décisions de l'utilisateur : événements (sortie, voyage scolaire, journée pédagogique, conseil de classe,
absence du professeur, session d'examens, interrogation, autre) pour TOUTES les classes d'une école ou CERTAINES ; pendant un
événement les classes concernées n'ont pas cours (heures SUPPRIMÉES) ; « J'accompagne » supprime aussi les
heures du professeur avec ses AUTRES classes pendant l'événement ; une INTERROGATION (une classe, une date,
heure et chapitre facultatifs) ne supprime rien. ABSENCE DU PROFESSEUR (ajoutée le 22/11/2026, « prévois
parmi les événements l'absence du professeur aussi ») : concerne TOUTES ses classes de l'école de
l'événement (`toutes_classes = true`, `accompagne = false`, ni Toutes / Certaines ni « J'accompagne » dans
le formulaire), journée entière ou certaines heures, du / au, intitulé facultatif (« Formation »,
« Maladie »). Pas de semaines A / B (`semaine` reste NULL). Périodes du
bulletin par école ET par année scolaire (date de remise des points de P1 … Pn), seuil d'avertissement en
jours de classe (défaut 3, 0–15). AUCUNE donnée d'élève.

**Schéma 0006** (idempotent, à coller APRÈS 0005 ; « Success. No rows returned » ; vérifié sur Postgres 16
local, 0001 → 0005 + données puis 0006 exécuté CINQ fois et 0002 → 0005 relancés après lui, données
identiques — 135 vérifications, outils `agenda-evenements/test_sql.py` du dossier de travail).
**Recolle 0006 si tu l'avais déjà collé** avant l'ajout de l'absence du professeur : la liste des types est
la contrainte `evenements_type_check` (nom que Postgres avait donné au CHECK de colonne de la première
version), retirée et reposée à CHAQUE exécution par un seul `alter table … drop constraint if exists …, add
constraint …` juste après le `create table if not exists` (la colonne `type` n'a plus de CHECK en ligne) ;
idem pour `evenements_absence_professeur` (`type <> 'absence_professeur' or (toutes_classes and not
accompagne)`). Vérifié (`agenda-absence/test_absence_sql.py`, 108 vérifications) : ancien 0006 + événements
de tous les anciens types puis nouveau 0006 ×5 (données, RLS, politiques, droits, déclencheurs identiques ;
seules ces deux contraintes changent), nouveau 0006 seul ×3, 0002 → 0005 relancés après, absence acceptée
(journée, heures, deux jours), « certaines » / « J'accompagne » / `classe_id` / liaison refusés (23514), RLS
croisé, `anon`, suppression de compte ; les 135 vérifications d'origine repassent. La contrainte qui
imposerait des classes à « certaines » n'existe pas (événement sans classe restante ignoré par le site) :
rien à changer puisque l'absence est toujours « toutes ».

| Table | Colonnes | Contraintes |
| --- | --- | --- |
| `evenements` | `proprietaire`, `ecole_id`, `type` (8 valeurs, `evenements_type_check`), `intitule` (≤ 120, vide = nom du type), `du`, `au`, `journee_entiere`, `heure_debut` / `heure_fin` (0–15 : H0 permise comme 0004), `toutes_classes`, `accompagne`, `classe_id` + `chapitre` (« niveau/slug ») de l'interro, dates | `au >= du`, ≤ 366 jours, années 2000–2100 ; journée entière ⟺ heures NULL, sinon fin ≥ début ; interro ⟺ `classe_id` + une date + pas « toutes » + pas « J'accompagne » (sinon `classe_id` et `chapitre` NULL) ; absence ⟹ « toutes » et pas « J'accompagne » ; FK `(ecole_id, proprietaire) → ecoles` et `(classe_id, ecole_id, proprietaire) → classes` (cascade, ON UPDATE CASCADE : l'interro suit sa classe qui change d'école) |
| `evenements_classes` | `evenement_id`, `classe_id`, `ecole_id`, `proprietaire` | clé `(evenement_id, classe_id, proprietaire)` ; FK `(evenement_id, ecole_id, proprietaire) → evenements` et `(classe_id, ecole_id, proprietaire) → classes` (cascades) : un événement à soi, une classe à soi DE LA MÊME ÉCOLE |
| `periodes_bulletin` | `proprietaire`, `ecole_id`, `annee_scolaire` (« 2026-2027 », années consécutives), `numero` (1–8), `remise` (1er août → 31 juillet de l'année) | uniques `(proprietaire, ecole_id, annee_scolaire, numero)` et `(proprietaire, ecole_id, remise)` ; FK école (cascade) |
| `carnet_reglages` | + `seuil_avertissement` (défaut 3) | `carnet_reglages_seuil_valide` 0–15 |

Liaison plutôt qu'un tableau `uuid[]` : un élément de tableau ne porte pas de clé étrangère (il faudrait
un déclencheur pour vérifier propriétaire ET école, et rien ne retirerait une classe supprimée) ; la FK
composée le garantit, la cascade nettoie, le RLS s'applique ligne par ligne. Déclencheurs SECURITY INVOKER
(`search_path = ''`) : `evenements_classes_coherence` (pas de liaison sur un événement « toutes » ou une
interro — 23514), `evenements_retirer_liaisons` (passage à « toutes », à interro ou changement d'école →
liaisons retirées), `classes_change_ecole_agenda` (une classe qui change d'école quitte les événements de
l'ancienne). RLS des trois tables comme 0002 (`proprietaire = auth.uid() and est_actif()`, `anon` sans
droit, l'admin ne voit rien) ; `supprimer_mon_compte()` inchangé (cascade).

**0006 pas appliqué** : `agendaDonnees.ts::chargerAgenda` renvoie `AGENDA_INACTIF` (tables absentes —
`ErreurCarnet.tableAbsente` — ou colonne `seuil_avertissement` inconnue) ; le carnet marche comme avant
(aucune heure barrée, rien de nouveau dans Aujourd'hui / Ma semaine / la page classe) ; « + Événement »
ouvre le panneau avec « Agenda pas encore activé : colle le fichier 0006_agenda.sql… », Réglages affiche le
même message à la place des périodes. Une panne de lecture de l'agenda ne bloque pas le carnet.

**Règles de calcul** (`lib/agendaEvenements.ts`, PUR, 126 vérifications esbuild + node — dont le scénario
exact des maquettes : 5e B, 7 h prévues du jeu. 3/12 au ven. 11/12, − théâtre, − JP = 5 h ; 2 jours pour
corriger le 9/12 ; interro du 14/12 → période 3 —, Noël / Toussaint, plusieurs jours, J'accompagne dans la
même école et dans une autre, toutes / certaines, période sans date suivante, renumérotation) :
- Heure supprimée (`raisonSuppression`) : événement non-interro du jour qui CONCERNE la classe (interro :
  sa classe ; « toutes » : les classes de SON école ; sinon les liées encore existantes) et couvre l'heure
  (journée entière, ou numéro entre `heure_debut` et `heure_fin`) — prioritaire —, sinon événement
  « J'accompagne » d'autres classes : journée entière → toute la journée (toutes écoles) ; certaines heures →
  même école par numéro, autre école par recouvrement de la plage horaire (grille de l'école de
  l'événement). À égalité, le plus ancien créé. Événement « certaines » sans classe restante : ignoré.
- `predicatSuppression` → option `supprimee` de `horaire.ts` (`creneauxDuJour`, `creneauxOublies`,
  `heuresRestantes`, filtre `garder` de `creneauxSemaine`) : sans elle, comportement d'avant (les suites
  horaire 116, heure zéro 82, carnet 85, agenda 103 repassent). Une heure supprimée n'est ni « à noter », ni
  « à rattraper », ni comptée dans « Heures restantes ».
- `journeeAgenda(date)` : créneaux qui ont lieu + `supprimes` (heures consécutives même classe même
  événement regroupées) + événements du jour ; `journeeCarnet.ts::lignesDuJour` / `grilleSemaine` reçoivent
  l'agenda en option (ligne / cellule `supprime`).
- Jours de classe (`joursDeClasse(apres, jusqua, ecole)`) : APRÈS `apres`, jusqu'à `jusqua` INCLUS, jours
  ouvrables hors congés FWB et hors événements « journée entière + toutes les classes » de l'école — une
  absence du professeur d'une journée entière en est un, une absence de certaines heures non
  (`texteSansCours` : « (la journée pédagogique ne compte pas) », « (ton absence ne compte pas) », article
  par type : « le voyage scolaire », « le conseil de classe »…).
- Absence du professeur (`titreEvenement` / `motifCourt`) : « Absence du professeur (formation) » —
  l'intitulé en précision, jamais à la place du type, minuscule initiale sauf sigle ; « Pas cours — absence
  du professeur (formation) » sur les heures barrées (puce courte « Absence » dans Aujourd'hui), ligne
  « Absence du professeur (formation) − n h » du compteur ; `quiTexte` : « toutes tes classes » (« … de
  l'école » s'il a des classes ailleurs). Tests : `agenda-absence/absence.test.ts` (45 vérifications, dont
  jeu. 10 → ven. 11/12 de la 1re à la 3e heure : 4e A · 2 h — 5e B · 2 h, l'autre école intacte, compteur,
  heures restantes, à rattraper, jours de classe).
- Période d'une date : première remise ≥ date (même année scolaire) ; après la dernière → `numero + 1`,
  remise `null` (« date de remise pas encore fixée dans tes réglages »).
- Avertissements (`avertissementsInterro`) : « apres » si la date est STRICTEMENT après la remise de la
  période en cours (prochaine remise ≥ aujourd'hui, même année) — « Comptera pour la période n » + raison ;
  « peu-de-temps » si jours de classe entre l'interro (exclue) et la remise de SA période (incluse) ≤ seuil
  — le jour de la remise compte (mer. 9/12 → ven. 11/12 = 2 : jeu., ven.). Les deux peuvent coexister.
- Heures effectives (`compteurHeures`) : heures de l'horaire de la classe d'aujourd'hui (heures déjà
  commencées exclues) à `jusqua` inclus, congés FWB déduits (« prévues »), moins une ligne par événement
  (« − n h », détail « jeu. 3/12 · 3e h », au-delà de deux dates « du … au … »), accompagnement compris.
  Jusqu'à la prochaine remise ET jusqu'à la fin de l'année (`finDAnnee` : veille de la session d'examens de
  JUIN de l'école qui concerne la classe, sinon dernier jour de classe FWB).
- Renumérotation des périodes (`planRenumerotation`) : P1 = la plus tôt ; ordre des mises à jour qui ne
  heurte jamais l'unicité (montées du plus grand au plus petit, puis descentes) ; une date déplacée au-delà
  d'une voisine est refusée (« … supprime cette période et ajoute-la à sa nouvelle date »).
- Formats : « jeu. 3/12 », « vendredi 11/12 », réglages « ven. 04/06/2027 », ordinaux « 1re / 3e », H0.

**Interface** (`components/carnet/` + `agenda.css`, importé par `CarnetPage` après `carnet.css`) :
- `ContexteCarnet` gagne `agenda`, `ctxAgenda` (horaire + événements + classes, `null` sans 0003 ou 0006),
  `nouvelEvenement(prerempli)`, `ouvrirEvenement(e)` ; panneau `{ type: 'evenement' }` dans `CarnetPage`.
- `FormulaireEvenement` (dans `PanneauLateral`) : type en puces (radios ; « Absence du professeur » après
  « Conseil de classe », icône personne barrée, teinte `--bad`), intitulé (« Intitulé (facultatif) » pour
  l'absence, qui remplace Toutes / Certaines et « J'accompagne » par « Toutes tes classes : tes heures de
  cours pendant … sont supprimées »), école (si plusieurs),
  du / au, « Journée entière » / « Certaines heures » (de la / à la : numéros de la grille de l'école,
  « heure zéro (H0) »), « Toutes » / « Certaines » (pastilles = cases), « J'accompagne », résumé « Heures
  supprimées : 5e B · 3e h — 6e C · 4e h (tu accompagnes). Rien n'est noté… » ; Interrogation : classe, date,
  heure facultative (créneaux de la classe ce jour-là), chapitre (niveau de la classe), avertissements en
  direct, « Enregistrer l'interrogation ». Supprimer : confirmation DANS le panneau (focus Annuler, Échap
  l'annule sans fermer le panneau). Toucher un événement (bandeau, case barrée, puce, ligne) rouvre le même
  formulaire. Aucun champ numérique.
- `Aujourdhui` : « + Événement » ; bandeaux des événements du jour (« Théâtre — 5e B (3e à 5e heure). Tu
  accompagnes : … ») ; heures supprimées barrées « Pas cours — théâtre … » / « Pas cours — tu accompagnes la
  5e B : … » + puce du type, sans « Noter » ; « Interro · Suites ⚠ 2 jours pour corriger » sur le créneau ;
  repère « Remise des points P2 : vendredi 11/12 — dans 5 jours de classe (…) » (une ligne par école qui a
  des périodes) ; carte « Heures de cours effectives d'ici le 11/12 » (classes de l'horaire, liens vers la
  page classe). « À rattraper » et la pastille « n à noter » ignorent les heures supprimées.
- `MaSemaine` : « + Événement » ; rangée d'en-tête par jour (événements sans heure de cours propre, puce
  « Remise des points P2 ») ; cases « pas cours » barrées ; interro dans la case ; téléphone : mêmes puces
  au-dessus du jour ; colonne « Heures effectives restantes » (→ remise, → juin), carte de remise (« P3
  ensuite »), « Événements de la semaine » ; `Planification` déduit les heures supprimées.
- `PageClasse` → `HeuresEffectives.tsx::CompteurClasse` : deux grands chiffres (bandeau sombre), « Détail
  jusqu'au 11/12 » ligne par ligne (horaire hebdomadaire, prévues, chaque événement « − n h », il reste),
  « À venir pour la 5e B » (puces, avertissements), « + Événement pour la 5e B ».
- `AgendaPeriode` : « Événements de la période » (classe choisie : ceux qui la concernent ou dont
  l'accompagnement touche ses heures), heures barrées « Pas cours : 5e B · 3e h — … », « + Événement ». Le
  document imprimé / Smartschool de l'agenda est INCHANGÉ (séances seulement).
- Réglages (« Réglages du carnet ») : `ReglagesAgenda` (école si plusieurs, année scolaire en cours / suivante,
  P1 … Pn avec « · examens de décembre ensuite » quand une session d'examens de l'école commence dans les
  21 jours, crayon → date + Enregistrer / Annuler / « Supprimer la période » avec confirmation dans la page,
  « + Ajouter une période », seuil − / + enregistré à chaque clic) puis le réglage d'horaire d'avant.
- Panneau « Évaluations et examens » : `EvaluationMatiere` ajoute `cid=<classe>` à `urlEvaluationMatiere` ;
  le panneau le retire de l'URL et affiche `AvertissementEvaluation` (lecture de la classe + `chargerAgenda`
  par `import()`, `avertissement-evaluation.css`) d'après le champ Date de l'en-tête : « Comptera pour la
  période 3 — évaluation du 14/12 pour la 5e B… », « Peu de temps pour corriger… ». Classe inconnue (panneau
  ouvert sans passer par le carnet), feuille d'exercices, 0006 absent ou aucune période : rien.

**Vérifications** (dossier de travail `agenda-evenements/` : `test_sql.py`, `agenda-evenements.test.ts`,
`faux-supabase.js` étendu — tables, option `agendaAbsent`, contraintes, déclencheur, cascades —,
`donnees.mjs` = scénario des maquettes, jeudi 3/12/2026 9h40, `parcours.mjs`, `captures.mjs`) : Playwright
sur un build `NODE_ENV=development vite build --mode test`, iPhone 13 et 1 280 px, clair et sombre : 439
vérifications (heures barrées partout, bandeaux, repère de remise, compteurs = valeurs de la logique pure,
semaine, création / modification / suppression de chaque type, J'accompagne, erreurs, Échap, avertissements
dans le formulaire et dans le panneau d'évaluation — et rien sans `cid` —, périodes : ajout au milieu,
suppression, date refusée, seuil, agenda d'une période, 0006 absent, cibles ≥ 44 px, aucun champ
numérique, `scrollWidth` = largeur, 0 erreur console).

**Mise en service** : SQL Editor → New query → coller TOUT `0006_agenda.sql` → Run → « Success. No rows
returned » ; recharger `/carnet` → Réglages → « Périodes du bulletin » (dates de remise) → « + Événement ».
Déjà collé avant l'ajout de l'absence du professeur : recoller TOUT `0006_agenda.sql` (même résultat, rien
n'est perdu) — sinon l'enregistrement d'une absence est refusé : `ErreurCarnet` reconnaît
`evenements_type_check` (23514) et affiche « Type d'événement inconnu du serveur : recolle tout le fichier
…0006_agenda.sql… ».
À vérifier contre le vrai projet : création d'un événement « certaines classes » (liaison), interro,
périodes et seuil.

### Devoirs, évaluations et texte en rubriques (`supabase/migrations/0007_devoirs_evaluations.sql`, maquettes « Noter » et « Texte » du 24/11/2026)

Décisions de l'utilisateur (maquettes validées) : le panneau « Noter la séance » gagne un bloc **Devoir**
(consigne, « Pour le », exercices en ligne joints) et un bloc **Évaluation** (annoncer une interro, interro
faite aujourd'hui, contrôle / bilan) ; le texte « Copier pour Smartschool » devient un texte en **rubriques
activables** (🎯 Objectif, 📘 Vu en classe, 🧭 Compétences travaillées, ✏️ Pour s'entraîner, 📌 Devoir pour
le …, 📅 Interro annoncée), choix mémorisé dans les réglages. AUCUNE donnée d'élève.

**Schéma 0007** (idempotent, à coller APRÈS 0006 ; « Success. No rows returned ») — des COLONNES, pas de
nouvelle table : un devoir et une évaluation sont notés avec une séance (un par séance), lus et écrits
avec elle ; les politiques RLS de 0002 (`proprietaire = auth.uid() and est_actif()`, toutes opérations,
`anon` sans droit) couvrent déjà ces colonnes, sans jointure ni seconde écriture qui pourrait échouer à
moitié. L'interro annoncée reste un ÉVÉNEMENT de l'agenda (0006 : une seule source pour sa date et son
heure, modifiable depuis l'agenda) ; la séance n'en garde que le lien.

| Table | Colonnes ajoutées | Contraintes |
| --- | --- | --- |
| `seances` | `devoir_pour` date, `devoir_generateurs` jsonb (`[]`), `objectif` text (`''`), `competences` jsonb (`[]`), `evaluation_type` (`annonce` / `faite` / `bilan`, NULL), `evaluation_parties` jsonb (`[]`), `evaluation_evenement` uuid | `seances_devoir_pour_valide` (≥ `date_seance`, ≤ + 366 j) ; `tableau_de_textes` : exercices ≤ 100 × 40, compétences ≤ 12 × 80, parties ≤ 100 × 80 ; objectif ≤ 300 ; `seances_evaluation_coherente` (sans type : ni parties ni lien ; « faite » : pas de lien) ; FK COMPOSÉE `seances_evaluation_evenement_du_proprietaire (evaluation_evenement, proprietaire) → evenements (id, proprietaire) ON DELETE SET NULL (evaluation_evenement)` (contrainte ajoutée `evenements_id_proprietaire_uniq` ; liste de colonnes de SET NULL : Postgres ≥ 15, Supabase l'est) |
| `carnet_reglages` | `rubriques` jsonb (NULL = défaut), `competences_transversales` jsonb (NULL = liste proposée) | `rubriques_texte_valides(j)` (objet, clés `objectif`/`processus`/`transversales`/`liens`/`emojis`, valeurs booléennes ; `immutable`, `search_path = ''`, `anon` sans droit d'exécution) ; liste ≤ 12 × 80 |

Lier l'interro d'un autre professeur : 23503 (sans rien révéler) ; supprimer l'interro dans l'agenda remet
seulement le lien à NULL (la séance garde son type « annonce » : le texte omet alors la ligne de l'interro
et le formulaire dit « supprimée de l'agenda : Enregistrer la recrée ») ; supprimer la classe emporte
séances et interros (cascades existantes) ; `supprimer_mon_compte()` inchangé. Vérifié sur Postgres 16
local (faux schéma `auth`, 0001 → 0006 + données, 0007 ×4, 0002 → 0006 relancés après lui puis 0007 encore :
données, contraintes, politiques, droits et déclencheurs identiques) : 100 vérifications (dossier de
travail `carnet-devoir/test_sql.py` : valeurs par défaut des anciennes lignes, écriture / relecture, toutes
les limites — 23514 —, NOT NULL — 23502 —, interro d'un autre — 23503, superutilisateur compris —, RLS
croisé, insertion au nom d'un autre — 42501 —, `anon` — 42501 —, SET NULL, compte désactivé, cascade de la
classe, suppression de compte).

**0007 pas appliqué** : `carnetDonnees.ts::chargerSeances` lit avec les colonnes de 0007 et, sur 42703 /
PGRST204 mentionnant l'une d'elles (`colonne0007Absente`), relit SANS → `devoirs: false` ; `ligneSeance`
n'écrit alors jamais ces colonnes ; `lireReglagesTexte` → `actif: false` (défauts). Le carnet marche comme
avant : la consigne du devoir reste (colonne de 0002), « Pour le », les exercices joints et le bloc
Évaluation affichent « Pas encore activé : … colle le fichier 0007_devoirs_evaluations.sql… »
(`FormulaireSeance.tsx::MessageDevoirsInactif`), le texte en rubriques se copie (rubriques réglables pour la
session, rien de mémorisé), Réglages affiche le même message à la place de la liste. Un 23514 / 23503 de ces
colonnes a son message (`ErreurCarnet`).

**Logique PURE** (`lib/carnetDevoirs.ts`, 98 vérifications esbuild + node, `carnet-devoir/devoirs.test.ts`) :
- `prochainsCours({ classeId, apres, grilles, cases, evenements, classes, n })` : jours de cours EFFECTIFS
  de la classe strictement après `apres` (horaire de la classe, week-ends / congés / vacances FWB exclus par
  `creneauxDuJour`, heures supprimées par l'agenda exclues par `predicatSuppression` — journée pédagogique,
  sortie de la classe, absence du professeur, « J'accompagne » ; une interro ne supprime rien), avec le
  premier créneau du jour ; horizon 120 jours ; classe sans case → `[]`. `choixDeLaDate` (puce retrouvée à la
  modification), `dateCourteDevoir` (« jeu. 26/11 »). Tests : maquette (mar. 24/11 → jeu. 26/11, lun.
  30/11), Noël, Toussaint + fête des morts, Armistice, mardi gras, carnaval, JP, absence, sortie de la
  classe ou à d'autres heures, J'accompagne, voyage de toute l'école.
- `devoirsARendre(seances, date, classe?)`, `devoirsEntre`, `aUnDevoir` (consigne OU exercices joints),
  `resumeDevoir`.
- `processusDeduits(generateurs, processusDe)` : processus des exercices faits ET joints au devoir ; la
  table (`evaluationPayload.ts::GENERATEURS_EVALUATION_PILOTE`, `processus ?? 2` comme `lignesInitiales`)
  est INJECTÉE ; générateur absent de la table : ignoré, jamais deviné.
- `objectifPropose(parties, chapitre)` : « Je suis capable d'expliquer et d'utiliser : <titres des
  sous-parties cochées, ou titre court de la section entière> . » — il n'existe PAS de champ « objectif »
  dans le contenu ; la phrase est une PROPOSITION à reformuler, jamais présentée comme venant du programme.
  `essentielsDesParties` : « L'essentiel » des sections touchées, montré à côté comme aide (jamais copié).
- `donneesTexteAgenda(seance, r, { lienGenerateur, processusDe, evenement, objectif, transversales })` →
  `texteAgenda(d, rubriques)` / `htmlAgenda(d, rubriques)` : en-tête « Mardi 24 novembre 2026 · H4 (11h35 →
  12h25) · 5Ge », « MATHÉMATIQUES — Chapitre 3 : Suites », puis les rubriques non vides séparées par une ligne
  vide : objectif ; « • § 3 Titre » + « – sous-partie » + lien de l'ancre ; « • Processus : Appliquer (…) ·
  Transférer (…) » et « • Transversales : … » (rubrique omise si les deux sont coupés ou vides) ; « • titre —
  lien » des exercices faits ; « Devoir pour le jeudi 26/11 » (ou « Devoir ») + consigne + exercices joints ;
  « Interro annoncée : lundi 7/12 (H2) — § 2 et § 3 (suites géométriques, convergence et divergence). »
  (« Contrôle-bilan annoncé : … », « 📝 Interro faite en classe — … »). Rubriques (`Rubriques`, maquette) :
  objectif, processus, transversales, liens, émojis — Vu en classe, Pour s'entraîner, Devoir et Interro
  apparaissent dès qu'ils ont un contenu. HTML : titres en gras, listes imbriquées, liens cliquables.
  La remarque n'est JAMAIS copiée. `lireRubriques` / `lireCompetences` (tolérants), `erreurCompetence`.
- `COMPETENCES_TRANSVERSALES_DEFAUT` (S'approprier une situation · Raisonner et argumenter · Communiquer
  en langage mathématique · Généraliser et structurer · Utiliser un outil numérique) : liste PROPOSÉE, pas
  officielle — l'école peut suivre FESeC ou WBE (pas encore précisé par l'utilisateur) : renommable,
  complétable, supprimable dans les réglages.
- `carnet.ts` : `Seance` / `SaisieSeance` + champs facultatifs de 0007, `TypeEvaluation`, `OBJECTIF_MAX`,
  `erreursSeance` (`devoirPour` : pas avant la séance, ≤ un an ; `objectif` ≤ 300).

**Interface** :
- `FormulaireSeance` (titre « Noter la séance ») : blocs repliables `BlocFormulaire` (bouton
  `aria-expanded`, résumé quand replié — « 2 parties · 2 exercices », « pour le jeu. 26/11 », « interro
  lun. 7/12 ») : Matière vue (chapitre, parties, exercices faits — inchangés), Devoir (consigne ; « Pour le » =
  puces radio « prochain cours · jeu. 26/11 » / « lun. 30/11 » / « Autre date… » + `type="date"`, prochain
  cours d'office ; sans horaire : autre date seule ; exercices en ligne à joindre = générateurs du chapitre ;
  note « Le devoir apparaît aussi dans l'agenda du jeudi 26/11 (« À rendre ») et dans la page de la
  classe »), Évaluation (type en puces ; « Pas d'évaluation pour cette séance » pour retirer ; annonce /
  bilan : date — proposée au premier cours au moins une semaine après — et heure facultative = créneaux de
  la classe ce jour-là ; parties = sections déjà vues par la classe dans le chapitre + cochées aujourd'hui,
  toutes cochées ; `AvertissementsInterro` de 0006 ; « Préparer l'évaluation » = `urlEvaluationMatiere`
  (`?matiere=` + `classe` + `cid`) et « Choisir dans mon coffre » = `/coffre?niveau=<levelSlug>&q=<titre
  court du chapitre>`, LIENS dans un nouvel onglet : la saisie reste dans le panneau), Remarque privée, aperçu
  du texte. Pied : Annuler · Enregistrer et copier · Enregistrer (principal). Annonce / bilan sans 0006 :
  puces désactivées + `MessageAgendaInactif`.
- `CarnetPage.enregistrerSeance(s, copier, annonce)` : annonce / bilan → crée (ou MET À JOUR, jamais de
  doublon) l'événement « Interrogation » (intitulé « Contrôle-bilan » pour un bilan, chapitre de la séance),
  puis la séance avec `evaluation_evenement` ; échec de la séance → l'interro qu'on vient de créer est
  retirée ; passer à « faite » ou retirer l'évaluation supprime l'interro liée. Message « Séance enregistrée.
  Interro du lundi 7/12 ajoutée à l'agenda. ». Supprimer une séance garde son interro dans l'agenda.
- Copie : « Copier pour Smartschool » (`ActionsSeance`, « Enregistrer et copier ») = `contexteCarnet.ts::
  textesSeance` avec les rubriques mémorisées ; l'objectif n'y figure que s'il a été validé dans le panneau
  du texte (la phrase proposée n'est jamais copiée sans relecture). Le menu « … » gagne « Texte pour l'agenda
  scolaire (rubriques)… » → `TexteAgenda.tsx` (panneau large `PanneauLateral large`, 1 180 px) : texte exact à
  gauche (`<pre>`), à droite « Ce que contient le texte » (5 cases de la maquette, mémorisées dès qu'on les
  change), objectif pré-rempli modifiable (« Reprendre la phrase proposée », L'essentiel replié en aide),
  puces des compétences transversales de la liste (`aria-pressed`, ✓ ; une compétence cochée puis renommée
  dans la liste reste affichée), « Copier pour Smartschool » (objectif et compétences enregistrés avec la
  séance, `enregistrerTexteSeance`). L'agenda d'une période garde son texte d'avant (`texteSmartschool`).
- Processus : table chargée À PART (`components/carnet/processusCarnet.ts`, `import()` de
  `evaluationPayload.ts` — ≈ 1,9 Mo / 0,5 Mo compressé, partagé avec le panneau des évaluations — lancé 400 ms
  après l'affichage du carnet) ; avant son arrivée, le texte n'a pas de ligne « Processus ».
- « À rendre » (`DevoirsARendre.tsx`, bouton qui ouvre la séance où le devoir a été donné) : Aujourd'hui
  (sur le premier créneau de la classe ce jour-là, sinon liste en tête), Ma semaine (rangée d'en-tête du
  jour, à côté des événements et des remises), page de la classe (« À rendre en 5Ge », 4 semaines),
  Agenda d'une période (« Devoirs à rendre de la période »). Carte de séance : « Devoir pour le jeudi 26/11 »,
  exercices joints, « Évaluation : interro annoncée le lundi 7/12 (H2) — § 2, § 3 ».
- Réglages du carnet : `ReglagesTexteAgenda` (rubriques par défaut ; « Mes compétences transversales » :
  renommer — Entrée / Échap —, retirer, ajouter — doublon refusé, 12 au plus —, « Revenir à la liste
  proposée » ; « pas une liste officielle … (FESeC, WBE…) »).
- Coffre : `?q=` pré-remplit la recherche, `?niveau=` filtre le niveau s'il est présent dans le coffre ;
  les deux sont retirés de l'adresse après lecture.
- Styles : fin de `carnet.css` (blocs sur fond `--paper`, puces `.agenda-choix` de l'agenda, `.carnet-a-rendre`
  sur `--accent-soft`, compétences cochées `--good-soft` ; clair et sombre par les jetons).

**Vérifications** (dossier de travail `carnet-devoir/` : `devoirs.test.ts`, `test_sql.py`, `faux-supabase.js`
étendu — colonnes 0007, option `devoirsAbsent` (42703 / PGRST204), contraintes, SET NULL —, `donnees.mjs` =
maquette, mardi 24/11/2026 12h30, `parcours.mjs`, captures dans `captures/`) : Playwright sur un build
`NODE_ENV=development vite build --mode test` (variables Supabase factices dans `.env.test.local`, non suivi),
iPhone 13 et 1 280 px, clair et sombre — 363 vérifications : puces « Pour le » (maquette, JP du 26/11 qui
décale à lun. 30/11), chaque « Pour le » enregistré puis retrouvé, date avant la séance refusée, exercices
joints, interro annoncée (événement créé : date, heure, classe, chapitre ; avertissement « 4 jours de
classe »), faite (événement retiré), contrôle-bilan (« Contrôle-bilan », journée), nouvelle annonce = même
événement mis à jour, « À rendre » dans Aujourd'hui / Ma semaine / page classe / agenda d'une période,
`?matiere=` → panneau d'évaluation « Matière vue en 5Ge : 2 sections », lien du coffre, copie relue (texte et
HTML) avec rubriques coupées / rétablies, collage réel dans un `<textarea>` et en HTML, objectif et
compétences enregistrés, compétences renommées / ajoutées / retirées (doublon refusé), 0007 absent (messages,
séance enregistrée sans ces colonnes, aucune écriture de colonne 0007, copie), cibles ≥ 44 px, aucun champ
numérique, `scrollWidth` = largeur, 0 erreur console. `npm run build` : 24 pages.

**Mise en service** : SQL Editor → New query → coller TOUT `0007_devoirs_evaluations.sql` → Run → « Success.
No rows returned » ; recharger `/carnet` → Noter la séance → blocs Devoir et Évaluation ; Réglages → « Texte
pour l'agenda scolaire » (adapter la liste des compétences au programme de l'école). À vérifier contre le
vrai projet : séance avec devoir pour le prochain cours, interro annoncée (événement créé, lien), copie dans
Smartschool (émojis lisibles ? sinon décocher « Émojis de section »).

## Page « Mon profil » refondue (21/11/2026 : proposition A, style du carnet, AUCUNE migration)

Décision de l'utilisateur (maquettes `AStyleCarnet` / `AStyleTelephone`). RIEN n'a disparu (nom affiché
et sa validation, écoles : ajouter / modifier / supprimer / par défaut, état vide, messages, e-mail,
mot de passe, coffre et déconnexion — dans le menu —, suppression du compte, chargement / indisponible).
- `PageCompte large sansTete` : le `<h1>` est dans le bandeau sombre (initiale, « ESPACE PROFESSEUR »,
  pastilles des écoles) ; `EnTeteCompte` en repli tant que le profil n'est pas prêt.
- `components/compte/MenuEspace.tsx` : menu « Mon espace » (Mon profil · Carnet · Feuilles · Évaluations
  et examens · Mon coffre | Administration si admin · Se déconnecter) ; téléphone : barre du bas
  (Carnet · Feuilles · Coffre · Profil · Plus). Réutilise les CLASSES CSS du menu du carnet
  (`carnet.css`, importé par `ProfilPage`) et `MenuActions` (« … ») sans les modifier — menu unique
  depuis l'harmonisation (fin de fichier).
- Cartes « Sur les copies » (pastille « ✓ enregistré » / « non enregistré », Enregistrer / Annuler),
  « Mes écoles » (couleur = rang, `.carnet-c0…c5` ; par défaut encadrée ; « Mettre par défaut » ; état
  de l'horaire du carnet LU par `import()` de `carnetDonnees.ts::chargerHoraire` : « ✓ Horaire H0–H7 »,
  « Grille H1–H7 · semaine à remplir », « Horaire à remplir », rien si 0003 absent ; lien
  `/carnet/horaire?ecole=<id>` — `MonHoraire` ouvre l'onglet de cette école, sinon l'école par défaut
  comme avant ; « … » Modifier / Supprimer avec confirmation DANS la page — focus sur Annuler, Échap —,
  qui dit que classes, séances et horaire de l'école partent aussi (cascade) ; « + Ajouter une école »
  ouvre le formulaire, ouvert d'office sans école), « Mon compte » (suppression : confirmation intégrée
  au lieu de `window.confirm`, même RPC).
- `components/compte/ApercuCartouche.tsx` (« Ce qui s'imprime ») : `cartoucheDepuisCompte` →
  `cartoucheEffectif`, mêmes morceaux que `morceauxSurtitre`, adresse en ligne méta, pied de page de la
  feuille ; nom SAISI (non enregistré), école par défaut ou ses valeurs en cours de modification (ou la
  future première école) ; ce qui diffère de l'enregistré ou a le focus est surligné (`<mark>`). Colonne
  de droite collante ; contenu étroit (`@container` < 758 px) : en tête, compact.
- Styles `components/compte/profil.css` (jetons, bandeau / panneau sombres dans les deux thèmes).
- Vérifié (Vite de développement + faux client avec `definir_ecole_par_defaut`, données fictives, 1 280 px
  et iPhone 13, clair et sombre) : 172 vérifications Playwright (0 / 1 / 2 écoles, horaire rempli /
  grille seule / vide / 0003 absent, frappe du nom et de l'adresse → aperçu surligné, nom vide refusé,
  par défaut, suppression avec Échap puis cascade, ajout, menu « Plus », lien `?ecole=`, déconnexion,
  cibles ≥ 44 px sur téléphone) ; `scrollWidth` = largeur, 0 erreur console.

## Page « Mon coffre » refondue (21/11/2026 : proposition B « Liste et fiche détaillée », AUCUNE migration)

Décision de l'utilisateur (maquettes `BListe` / `Telephone` + « Ranger par : récents / chapitre » repris de
C). RIEN n'a disparu (chargement, erreur — avec « Réessayer » —, coffre vide avec liens `/exercice` et
`/evaluation`, import des enregistrements du navigateur, renommer avec `erreurTitrePlan`, dupliquer,
supprimer, « Ouvrir dans le panneau » = `routeDuPlan` + `?plan=`, messages `role=status/alert`).
- `routes/CoffrePage.tsx` : `PageCompte large sansTete` + `MenuEspace` (Mon coffre actif), bandeau sombre
  (classes `profil-bandeau…` de `profil.css`, sous-titre « n enregistrements · suivent ton compte… »,
  pastilles par type), bandeau d'import, pastilles de type (comptes après filtres niveau + recherche) et de
  niveau (niveaux présents, seulement s'il y en a ≥ 2), recherche, « Ranger par » (`localStorage`
  `math-belgium-coffre-ranger`, commodité), liste (boutons, `aria-current`) et fiche (`aria-labelledby`).
  Sélection dans `?id=` (`replace` : un retour arrière depuis le panneau rouvre la même fiche ; « Ouvrir »
  pose `?id=` avant de naviguer) ; ordinateur : le plus récent par défaut ; liste et fiche empilées (écran
  étroit) : la fiche est amenée à l'écran. Suppression confirmée DANS la fiche (focus sur Annuler, Échap),
  plus de `window.confirm`. Téléphone (< 760 px) : pas de fiche par défaut ; un choix ouvre un tiroir fixe
  au-dessus de la barre « Mon espace » (réduit : type, date, titre, résumé, « Ouvrir dans le panneau » +
  « … » `MenuActions` — Voir le contenu, Renommer, Dupliquer, Supprimer… ; poignée = fiche complète ;
  × ou Échap ferme et rend le focus à la ligne).
- `lib/coffreResume.ts` (PUR) : AUCUN générateur relancé, tout vient du `PlanDocument` stocké et de
  `chaptersIndex.ts`. Questions = série A rangée par processus comme la copie, tous les vrai/faux = une
  question, exercices d'une même ligne (`ElementPlan.ligne` + générateur + processus) = une question
  (approximation : l'impression regroupe aussi selon la consigne de chaque instance, ce qui demande le
  générateur) ; titre = carte « S'entraîner » du générateur (`titreGenerateur`), question ouverte =
  « Démonstration / Formule / Compréhension — section ». Points stockés ; examen « total fixé » : total
  imprimé (clés de `partiesExamen`) + note de mise à l'échelle ; feuille / remédiation : pas de points ni de
  calculatrice. **Pas de durée** (elle demande `niveauEtDuree` sur chaque instance retirée). Recherche
  (`normaliserRecherche` : sans accents ni casse, ponctuation = espace) sur titre, type, niveau, « ch n »,
  titres complet et court (`titreCourtChapitre`) ; un nombre seul est un mot entier (« ch 1 » ≠ « ch 10 »).
  Lien remédiation → évaluation : `contenu.remediation.titreSource` = titre du coffre ou titre du
  document sans préfixe (renommer l'évaluation dans le coffre ne casse pas le lien) ; plusieurs : même
  niveau, puis la plus récente créée avant ; aucune → « (pas dans ton coffre) ». « Par chapitre » : niveau
  → chapitre (ordre et titres réels) → plus récent d'abord, « Plusieurs chapitres » en fin de niveau,
  remédiation SOUS son évaluation si celle-ci est affichée.
- Styles `components/compte/coffre.css` (après `carnet.css` et `profil.css`, sans les modifier) : type =
  `--sky` / `--accent` / `--plan` / `--good` (`.coffre-t-*`), processus 1/2/3 = `--sky` / `--accent` /
  `--plan` ; miniature papier blanche (cartouche école · professeur de `cartoucheDepuisCompte`).
- Vérifié (Vite de développement + faux client étendu à `plans` — titre vide / type inconnu refusés,
  panne de lecture —, données fictives : 0, 1 et 9 enregistrements des 4 types et 3 niveaux, remédiation
  liée, examen sur 4 chapitres à total fixé, 3 enregistrements locaux ; 1 280 / 1 024 / 800 px et iPhone 13,
  clair et sombre) : 185 vérifications Playwright (filtres, recherche sans accents, rangement, `?id=` et
  rechargement, renommer — vide refusé, Échap —, dupliquer, supprimer — Échap, confirmer, remédiation
  orpheline —, ouvrir puis retour arrière, import, panne puis Réessayer, tiroir : focus, poignée, « … »,
  Échap, ×, cibles ≥ 44 px) ; `scrollWidth` = largeur, 0 erreur console.

## Page « Administration » refondue (22/11/2026 : proposition B « tableaux » + deux ajouts de C, AUCUN SQL)

Décision de l'utilisateur (maquette `BTableaux`). RIEN n'a disparu (générer avec les mêmes validations,
codes à transmettre + « Copier le lien d'inscription », révoquer, qui a utilisé quel code, liste des
professeurs, désactiver / réactiver — jamais soi-même —, liens `/evaluation` et `/exercice`, messages
`role=status/alert`, chargement). Sans Supabase : `AdminHistorique` INCHANGÉ.
- `AdminPage` : `PageCompte large sansTete` + `EnTeteCompte` en repli tant qu'il n'y a pas de profil
  administrateur actif ; `routes/AdminComptes.tsx` dans `MenuEspace` (Administration active).
- Bandeau sombre (bouclier, « tu ne vois ni les coffres, ni les écoles, ni les carnets… », liens,
  pastilles : actifs, codes en attente, désactivés et « à accompagner » si > 0). Onglets `role=tablist`
  (flèches, Début / Fin, tabindex itinérant) ; `?onglet=codes`, sinon Professeurs.
- Professeurs : recherche nom + e-mail (`normaliserRecherche` : sans accents ni casse, chaque mot), puces
  Tous / Actifs / Désactivés / À accompagner / Sans connexion depuis 30 jours (non vides + Tous + l'active),
  tableau (nom, e-mail, « via K7QM-… · note » en petit, état, inscrit le, dernière connexion relative,
  enregistrements, écoles), ligne choisie = `?prof=<id>` (`replace`). Fiche à droite (téléphone < 760 px :
  cartes + tiroir `PanneauLateral`) : initiale, via le code (code complet + note ; « premier compte » pour
  l'admin sans code), dernière connexion détaillée, « n enregistrements · n écoles » + « tu vois des
  nombres… », Désactiver avec confirmation DANS la fiche (focus Annuler, Échap), Réactiver direct.
- Ajouts de C, côté client : **par quel code** = `invitations.utilise_par === professeurs.id` ; **à
  accompagner** = actif, pas toi, `nombre_plans === 0` (pastille, puce, phrase « Inscrite le …, pas encore
  d'école ni d'enregistrement » / « 1 école renseignée, pas encore d'enregistrement » ; accord d'après la
  civilité du nom affiché). « Sans connexion depuis 30 jours » : actif, pas toi, jamais connecté ou > 30 j.
- Codes : puces En attente (défaut) / Utilisés / Expirés / Révoqués / Tous (même priorité d'état
  qu'avant), tableau (code, note, état + date — « jusqu'au … · encore n jours » —, créé le, utilisé par →
  lien `?prof=`), « … » (`MenuActions`) sur les codes en attente seulement : Copier le lien (presse-papiers,
  repli : champ en lecture seule à copier à la main) et Révoquer (confirmation dans la page).
- « + Inviter » (barre des deux onglets, et l'état vide « Aucun code en attente : + Inviter ») : panneau
  `PanneauLateral` — note « Pour qui ? », nombre (1–50, `lireEntier`, jamais filtré), expiration 7 j /
  30 j (défaut) / sans limite / une date (`finDeJournee` ; vide ou passée refusée) — puis codes à
  transmettre (focus sur la première copie), « Générer d'autres codes » ; l'onglet Codes se recharge et
  marque les nouveaux (« nouveau »).
- Logique PURE `lib/compteAdmin.ts` ; styles `components/compte/admin.css` (après `carnet.css` et
  `profil.css`, sans les modifier ; `page-tool` élargie à 1 320 px pour ce seul écran).
- Vérifié (Vite de développement + faux client étendu aux cinq RPC admin, navigation interne par
  `popstate` — recharger l'application à chaque étape donne `ERR_INSUFFICIENT_RESOURCES` —, données
  fictives : 7 professeurs, 11 codes des 4 états ; 1 280 px et iPhone 13, clair et sombre) : 262
  vérifications Playwright (puces, recherche avec accents, via, à accompagner, fiche et `?prof=`,
  désactiver avec Échap puis confirmer puis réactiver, jamais soi-même, onglets au clavier, filtres de
  codes, lien utilisé par → fiche, copie relue + repli, révoquer avec Échap, générer — validations,
  arguments RPC, sans limite = null —, état vide, erreur de chargement, non-admin, page historique, cibles
  ≥ 44 px, tiroir) ; `scrollWidth` = largeur, 0 erreur console.

## Harmonisation « Mon espace » (22/11/2026 : bandeau sombre + menu unique, AUCUN SQL)

Décision de l'utilisateur : le carnet et les pages de conception (professeur connecté) prennent le bandeau
sombre et le menu `MenuEspace` du profil, du coffre et de l'administration ; contenu et fonctionnement
des pages inchangés.
- `components/compte/BandeauEspace.tsx` : bandeau commun (classes `profil-bandeau…`, depuis le 22/11/2026 dans `bandeau-espace.css` ;
  pastille ronde, « ESPACE PROFESSEUR », `<h1>`, `apresTitre`, `pastilles` = `<li>`, `fin`). Profil et
  coffre l'utilisent (DOM identique, captures avant / après identiques au pixel près hors chevron du
  menu) ; l'administration garde `admin-bandeau` (jetons `--admin-*`).
- `MenuEspace` = menu UNIQUE : « Carnet de matière vue » se déplie (bouton `aria-expanded`, chevron) en
  Aujourd'hui (« n à noter ») · Ma semaine · Mes classes (couleur + nombre de séances, + Ajouter une
  classe) · Agenda d'une période · Mon horaire · Réglages ; déplié d'office dans `/carnet/*` (prop
  `carnet` : classes, séances, à noter), replié ailleurs (déplié à la main : « Mes classes » au lieu de la
  liste). Défilement en haut / vers l'ancre au changement de sous-page du carnet (repris de `MenuCarnet`).
  Téléphone : UNE barre — dans le carnet Aujourd'hui · Semaine · Classes · Plus (Plus = Agenda, Mon
  horaire, Réglages, puis Mon profil, Mon coffre, Feuilles, Évaluations, Administration si admin, Se
  déconnecter : les trois vues du quotidien en classe à un geste), ailleurs Carnet · Feuilles · Coffre ·
  Profil · Plus (inchangée).
- Carnet (`CarnetPage`) : `PageCompte sansTete` + `EnTeteCompte` en repli ; bandeau « Carnet de matière
  vue » (titre fixe : les vues gardent leur propre titre — date, semaine, classe) avec pastilles
  « Période n · semaine n » (`texteReperes` d'aujourd'hui), « n à noter » (accent) et « n classes »,
  visibles aussi sur téléphone. Le surtitre de repères d'`Aujourdhui` / `MaSemaine` ne s'affiche plus
  que s'il DIFFÈRE de celui du bandeau (autre semaine) : jamais doublé. Tous les états (chargement,
  0002 absent, erreur, sans école) sont dans le même cadre.
- Conception (`components/compte/EspaceConception.tsx`, professeur connecté SEULEMENT : `/exercice`,
  `/…/exercices`, `/evaluation`) : `MenuEspace compact` (colonne d'icônes de 760 à 1 359 px — libellés
  visuellement masqués mais lus, `title`, cibles 48 px —, menu complet dès 1 360 px, `page-tool` élargie
  à 1 440 px : le panneau garde au moins la largeur d'avant), bandeau (icône feuille / évaluation,
  titre — « Feuille d'exercices — Calcul vectoriel » + « 4e · chapitre 6 » sur une page de chapitre —,
  pastilles école choisie · niveau (sauf page de chapitre) · « n exercices choisis », lien « Voir comme
  un élève », même `?vue=eleve`). Pastilles : prop `onResume` du panneau (lecture seule, effet) vers un
  petit magasin (`useSyncExternalStore`) : seul le bandeau se re-rend. Téléphone : la barre « Ma feuille
  · Générer » du panneau est remontée AU-DESSUS de la barre du menu (`.espace-conception
  .conc-barre-mobile`), jamais superposée. Visiteur, élève, « vue élève » et `/admin` historique :
  inchangés (aucun bandeau ni menu).
- Vérifié (Vite de développement + faux client, données fictives du carnet, du coffre et de l'admin,
  heure figée au 20/11/2026 11h50 ; 1 440 / 1 280 / 1 024 / 800 px et iPhone 13, clair et sombre) :
  450 vérifications Playwright (menu déplié / replié au clavier, `aria-current`, classes et compteurs,
  sous-pages, panneau Noter, barre du bas et feuille « Plus », menu d'icônes, pastille = compte du
  panneau, Aperçu, mode examen, vue élève aller-retour, visiteur sans bandeau, `scrollWidth` = largeur,
  0 erreur console hors document blob de l'Aperçu — `ERR_INVALID_URL`, antérieur) ; le parcours du carnet
  refondu (216, dont 25 textes Smartschool, 25 fiches, 4 agendas identiques à la référence) repasse.

## Répartition mémorisée (22/11/2026 : `supabase/migrations/0005_repartition.sql`)

Décision de l'utilisateur : la répartition Connaître / Appliquer / Transférer est RÉGLABLE et la
valeur du professeur est mémorisée dans son profil. Défaut 25 / 50 / 25 (`REPARTITION_PROCESSUS`).
**Sens de 0005 depuis la décision du 22/11/2026** : `profils.repartition` est la répartition d'EXAMEN
du professeur — elle ne vaut QUE pour « Préparer l'examen » (mode examen du panneau), seul endroit où
le réglage mémorisé et « Enregistrer comme ma répartition d'examen » apparaissent. Évaluations et
feuilles d'exercices (« hyper flexible ») : compétences cochées, temps à parts égales, ajustable pour
le document seulement, jamais mémorisé ; assistant élève (visiteurs) : parts égales pour la feuille,
parts au hasard ou réglées par l'élève pour l'évaluation blanche. Aucun changement SQL (colonne, contrainte, droits identiques). Logique de
composition et interface : `.claude/rules/feuilles-evaluations.md` (« Façons de composer »).

**Schéma 0005** (idempotent, ne dépend que de 0001 ; « Success. No rows returned », 0005 exécutée trois
fois sur des données réelles sans rien changer) :
- `profils.repartition jsonb` (`add column if not exists`), **NULL = défaut du site** (tous les profils
  existants, et chaque nouvelle inscription) ; sinon `{"connaitre": 30, "appliquer": 45, "transferer":
  25}`.
- Contrainte `profils_repartition_valide` (ajoutée si absente) = `public.repartition_valide(j)`
  (`immutable`, `set search_path = ''`, `case` sans conversion hasardeuse) : objet à EXACTEMENT ces trois
  clés, nombres entiers écrits sans signe ni décimale (`25` ; `25.0`, `-5`, `"25"`, `null`, booléen
  refusés), chacun ≤ 100, somme 100. Exécution : `revoke … from public, anon`, `grant execute … to
  authenticated` (une contrainte appelle la fonction avec les droits de celui qui écrit).
- Droits : `grant update (repartition) on public.profils to authenticated` (droit de COLONNE, comme
  `nom_affiche` : `est_admin`, `actif`, `id`, dates restent refusés — 42501), `revoke all on
  public.profils from anon`. Lecture : déjà couverte par le `grant select` de 0001. RLS et politiques
  INCHANGÉS : on ne lit que son profil (l'administrateur lit les profils, répartition comprise, comme le
  nom), on ne modifie que le sien et seulement compte actif (`profils_modification`) ; compte désactivé :
  lecture de son profil, modification sans effet (0 ligne). `supprimer_mon_compte()` inchangé (la ligne
  part avec le profil).
- **0001 retouché** (sans effet sans 0005) : son `revoke all … from authenticated` retire aussi les
  droits de colonne ; un bloc `do` redonne `update (repartition)` si la colonne existe. 0001 reste donc
  « relançable sans danger » même après 0005 (vérifié : droits identiques, enregistrement possible).

**Code** :
- `lib/repartitionProcessus.ts` (pur) : `RepartitionPourcents`, `REPARTITION_DEFAUT` (tiré de la
  constante), `repartitionValide` (même règle que la contrainte), `fractionsRepartition`,
  `texteRepartition(compact, r)` (espace insécable avant « % »), `ajusterRepartition` (boutons − / +).
- `lib/compteDonnees.ts` : `lireRepartition(c, id)` — lue À PART de `lireProfil` (inchangé : sans 0005
  rien d'autre ne casse) → `{ actif: true, repartition | null }` ou `{ actif: false }` ;
  `enregistrerRepartition(c, id, r)` (défaut écrit NULL ; `false` si 0005 absente) ;
  `colonneRepartitionAbsente` (42703 / PGRST204 / « schema cache » / « does not exist » mentionnant
  `repartition`). `messageErreur` : 23514 sur `repartition` → « Répartition refusée… ».
- `components/admin/conception/ReglageRepartition.tsx` : `useRepartitionProfesseur(compte)` (état
  `memo` : `sans-compte` / `chargement` / `active` / `absente` / `erreur` ; valeur de session gardée en
  mémoire du module : elle survit au passage `/exercice` ↔ `/evaluation`, pas à un rechargement ; une
  valeur réglée avant la fin de la lecture n'est pas écrasée) et `ReglageRepartition` (panneau « Ta
  répartition d'examen », affiché seulement en mode examen ; la lecture du profil se fait quand même
  au chargement du panneau, sans effet hors examen).
- **0005 pas appliquée** : réglage et composition marchent pour la session ; le panneau affiche
  « Mémorisation pas encore activée : colle le fichier 0005_repartition.sql dans l'éditeur SQL de
  Supabase (SQL Editor → coller tout le fichier → Run). En attendant, ce réglage vaut pour cette
  session. » (aussi après « Enregistrer », qui n'écrit rien). **Sans compte** (Supabase non configuré,
  `/admin` historique) : 25 / 50 / 25 réglable pour la session, pas de bouton « Enregistrer », note
  « Sans compte connecté, ce réglage vaut pour cette session seulement. ».

**Vérifications** (outils dans le dossier de travail `repartition/` : `test_sql.py`, `faux_auth.sql`,
`composer.cjs`, `ui.mjs`, `faux-supabase.js` étendu) :
- Postgres 16 local + faux schéma `auth` (0001 → 0004 + données, puis 0005 ×3, ×2 encore avec des
  valeurs enregistrées, 0001 relancé, 0005 encore) : 93 vérifications — sortie vide (« No rows
  returned »), données identiques, contrainte une seule fois, seuls droits ajoutés = `UPDATE
  (repartition)` d'`authenticated`, RLS / politiques inchangés ; lecture / écriture de SA répartition
  (0/100/0, 100/0/0, clés dans un autre ordre, 33/34/33, NULL, avec `nom_affiche` dans la même
  requête), celle d'un autre refusée (0 ligne, même pour l'admin en écriture), 17 valeurs invalides
  refusées (23514 : somme 95 / 105, clé manquante / en trop / mal nommée, négatif, 25.5, 25.0, "25",
  null, > 100, booléen, tableau, nombre, texte, objet imbriqué, `{}` ; aussi pour le superutilisateur),
  `est_admin` / `actif` / `id` / dates refusés (42501, seuls ou avec `repartition`), ni insert ni delete,
  `anon` (lecture, écriture, fonction : 42501), compte désactivé puis réactivé, inscription après 0005
  (NULL), suppression de compte. Les suites 0003 (90) et 0004 (81) repassent avec 0001 retouché.
- Playwright (Vite de développement, faux client étendu : option `repartitionAbsente` — 42703 en
  lecture, PGRST204 en écriture — et contrainte imitée), 1 280 px et iPhone 13 : 138 vérifications
  (carte et nom accessible, réglage, total 100 à chaque clic, bornes, retour au défaut, enregistrement
  en base, Échap + focus rendu, rechargement → valeur relue, composition qui suit la répartition — 0 %
  jamais choisi —, `/evaluation` avec la valeur du profil puis examen, 0005 absente, sans compte,
  cibles ≥ 44 px, aucun champ numérique, `scrollWidth` = largeur, 0 erreur console). Depuis la
  décision « examen seulement » (dossier de travail `repartition-examen/ui.mjs`, 174 vérifications) :
  feuille et évaluation n'affichent ni la répartition mémorisée ni « Enregistrer » et ne modifient
  jamais le profil ; examen : répartition du profil (20 / 60 / 20) affichée, réglée (20 / 50 / 30),
  enregistrée en base, relue après rechargement.

**Mise en service** : SQL Editor → New query → coller TOUT `0005_repartition.sql` → Run → « Success. No
rows returned » ; recharger `/evaluation` → Document : Examen → « Préparer l'examen » → Modifier →
régler → « Enregistrer comme ma répartition d'examen ». À vérifier contre le vrai projet : enregistrement puis
rechargement (valeur relue), message « Répartition refusée » impossible depuis le site (les boutons ne
produisent que des valeurs valides).

## Bannière, menu « Mon compte » et pages d'accès (22/11/2026 : maquettes « A », AUCUN SQL)

Décision de l'utilisateur (« J'accepte tes recommandations ») : bannière A (claire), menu A (liste groupée),
pages de compte telles que dessinées ; bannière B (sombre) et menu en tuiles NON retenus. Champs, libellés,
aides, erreurs, validations et flux Supabase (code d'invitation, lien par e-mail, `?retour=`, `?oubli=1`,
garde des pages réservées) inchangés.
- `SiteHeader` : logo (carré marine arrondi, courbe orange, `aria-hidden`) + « Chapitres de maths »
  (Fraunces, sans retour à la ligne dès 360 px) ; téléphone : loupe = bouton bordé de 44 px ; ordinateur
  (≥ 900 px) : champ de recherche à droite, à côté du compte (`RechercheSite` inchangé) ; fil d'Ariane
  toujours SOUS la ligne. `theme-color` : `#ffffff` en clair, `#161f27` (= `--surface` sombre) en sombre
  (`media`), manifeste PWA `#ffffff` : plus d'orange.
- `MenuCompte` : visiteur → bouton bordé « Professeur » (icône personne, 44 px ; absent de `/connexion`,
  `/inscription`, `/mot-de-passe`) ; connecté → pastille ronde (initiale du `nom_affiche` sans la civilité :
  « M. Essai » → E) + ▾, `aria-label="Mon compte"`, `aria-expanded`, `aria-controls`. Menu `nav` : en-tête
  (initiale, nom, « Espace professeur »), Préparer (Feuilles d'exercices, Évaluations et examens) · Mes outils
  (Mon coffre, Carnet de matière vue) · Mon compte (Mon profil, Administration + badge « admin », admin
  seulement) — mêmes six liens, même ordre ; « Tu es ici » + fond orange pâle + `aria-current="page"`
  (`"true"` sur une sous-page du carnet) ; « Se déconnecter » à part, en rouge. Lignes ≥ 48 px. Téléphone
  (< 760 px) : tiroir par le bas + voile (voile, Échap, lien, glisser vers le bas ; page bloquée dessous) ;
  ordinateur : liste de 300 px ancrée à droite (clic à côté, Échap, Tab hors du menu). Focus sur le premier
  lien à l'ouverture, rendu au bouton (Échap, voile) ; `prefers-reduced-motion` : aucune animation. En-tête
  passé à `z-index: 90` tant que le menu est ouvert (au-dessus des barres fixes des pages).
- Icônes au trait communes : `components/compte/IconesEspace.tsx` (sorties de `MenuEspace`, qui les
  réexporte ; sans dépendance, car `MenuCompte` est dans le paquet principal), mode `compte` = 20 px.
- Pages d'accès : `components/compte/PageAcces.tsx` (+ `acces.css`, chargé avec ces pages) — bandeau
  `BandeauEspace` (icône clé / enveloppe / personne), carte blanche, champs 52 px, bouton principal orange
  plein pleine largeur, liens secondaires sous un filet, fond uni ; phrase « Tu es élève ? Pas besoin de
  compte… Retour aux chapitres » sur connexion et inscription ; ordinateur (≥ 860 px) : bandeau (+ « Prépare
  tes feuilles, évaluations et examens… ») et phrase élève à gauche, carte à droite. `MessageAcces` :
  pastille verte (« E-mail envoyé », « Presque fini ! », « Mot de passe modifié. ») ou rouge (« Ce lien ne
  fonctionne plus » + message d'avant). Inscription : la phrase d'introduction est devenue le sous-titre du
  bandeau (« Réservée aux professeurs, avec un code d'invitation donné par l'administrateur du site. »).
  `PageCompte` / `EnTeteCompte` restent pour les autres pages.
- Règles du bandeau sorties de `profil.css` vers `components/compte/bandeau-espace.css` (importé par
  `BandeauEspace.tsx`), à l'identique : les pages d'accès n'importent pas `profil.css` (qui doit rester
  APRÈS `carnet.css` : le charger plus tôt depuis `/connexion` inverserait l'ordre au passage vers `/profil`).
- Vérifié (dossier de travail `banniere/` : `verifier.mjs`, `captures.mjs`, `faux-supabase.js` étendu à
  `signInWithPassword` / `resetPasswordForEmail` / `updateUser` / `signUp` / `signOut` + options `anonyme`,
  `recuperation`) : visiteur sur le build de PRODUCTION, professeur et flux simulés sur un build
  `NODE_ENV=development vite build --mode test` + faux client ; iPhone 13, 360 px, 1 000 et 1 280 px, clair
  et sombre — 726 vérifications (une ligne dès 360 px, 44 / 48 / 52 px, `?retour=`, œil dans le champ, menu
  admin / non admin, « Tu es ici », Échap, voile, clic à côté, Tab, glisser, déconnexion, connexion →
  `?retour=`, lien envoyé, inscription, nouveau mot de passe, `MenuEspace` intact, `scrollWidth` =
  largeur), 0 erreur console ; sous l'en-tête, captures de `/profil` et `/coffre` identiques au pixel près
  avant / après (bandeau déplacé sans changement). Captures avant / après dans `banniere/captures/`.
  `npm run build` : 24 pages pré-rendues, accueil avec ses 23 liens de chapitres.
