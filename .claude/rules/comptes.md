---
paths:
  - "src/lib/supabase.ts"
  - "src/lib/compte*"
  - "src/components/compte/**"
  - "src/routes/{Connexion,Inscription,Profil,Coffre,Admin,MotDePasse,Evaluation,Carnet}*"
  - "src/lib/carnet*"
  - "src/lib/horaire.ts"
  - "src/lib/calendrierFwb.ts"
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
période », sans migration).
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
- `MenuCarnet` : colonne de gauche ≥ 760 px (`NavLink`, `aria-current`, « n à noter » = créneaux du jour
  passés / en cours sans séance, nombre de séances par classe) ; téléphone : barre fixe en bas
  (Aujourd'hui · Semaine · Classes · Plus, feuilles au-dessus, Échap / clic à côté). Classe CSS
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
