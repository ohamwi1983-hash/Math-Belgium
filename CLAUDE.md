# Math-Belgium — site des chapitres de cours FWB

Site de chapitres de cours narratifs (4e/5e/6e), séparé de `plateforme-maths` (dépôt indépendant).
Chaque chapitre renvoie vers les générateurs d'exercices interactifs de `plateforme-maths` via des
liens directs.

## Stack

- React + TypeScript, Vite.
- React Router (`react-router-dom`) pour la navigation.
- KaTeX pour toutes les formules mathématiques (rendu via `src/components/Math.tsx`, pas de
  notation maison en CSS).
- Déploiement : GitHub → Vercel (même schéma que `plateforme-maths`).
- Pré-rendu statique (SSG) pour le SEO : `npm run build` lance, après `vite build`,
  `scripts/prerender.mjs` — un vrai Chromium headless (Playwright) visite chaque route réelle
  (`scripts/routes.mjs`, dérivée de `chaptersIndex.ts`) et écrit son DOM final dans
  `dist/{route}/index.html`, pour que Google et les crawlers voient le contenu/les balises
  `og:*`/JSON-LD sans exécuter de JS. Un SSR Node (`react-dom/server`) ne marcherait pas : les
  illustrations Mafs et les widgets interactifs (Web Components Shadow DOM) ont besoin d'un vrai
  navigateur pour s'initialiser. `vercel.json` route déjà vers ces fichiers sans rien à changer
  (Vercel sert un fichier du disque, dont `{route}/index.html`, avant d'appliquer la réécriture
  SPA de secours) — seul `vite preview` en local ne résout pas ces chemins sans `/` final.

## Principe d'architecture : gabarit unique + contenu en données

Contrairement à `plateforme-maths` (3 chantiers indépendants sans contrat partagé, parce que la
logique de vérification de chaque générateur diffère trop pour être mutualisée), un chapitre de
cours suit **toujours la même structure**. Il n'y a donc **pas** de composant par chapitre : un
seul gabarit partagé, `ChapterPage` (`src/components/chapter/ChapterPage.tsx`), et chaque
chapitre est un objet de **données** (`ChapterContent`, voir `src/content/types.ts`), jamais du
code React réécrit à chaque fois.

Ajouter un chapitre = :

1. Créer `src/content/chapters/{niveau}/{slug}.ts` exportant un `ChapterContent`.
2. L'ajouter au tableau `chapters` du bon niveau dans `src/content/chaptersIndex.ts`.

Aucune route ni page à coder à la main — `ChapterRoute` résout `/{levelSlug}/{chapterSlug}` en
cherchant le chapitre correspondant dans `chaptersIndex.ts`.

## Structure de navigation

- Années (`LEVELS` de `chaptersIndex.ts`, ordre des onglets partout) : `4e`, `5e-4h` « 5e (4h) », `5e-6h`
  « 5e (6h) » (ajoutée le 26/11/2026 ; propre à ce dépôt : aucun générateur ni page d'évaluation chez
  `plateforme-maths`, feuilles et évaluations générées localement, clé `5e|6H` du panneau, calculatrice
  Casio Graph Math+), `6e-6h` « 6e (6h) ». Tout ce qui énumère les années lit `LEVELS` / `LEVEL_LABELS`
  (accueil, recherche, Mon suivi, plan, carnet, coffre, « Mon ordre ») ; seuls endroits à compléter pour une
  année de plus : `LEVEL_LABELS` (`entrainement/registry.ts`), `chapitresFonctionnels.ts` (+ `LEVELSLUGS_GENERATION_LOCALE`
  d'`evaluationLocal.ts`), `NIVEAU_HEURES_VERS_LEVELSLUG` d'`evaluationPayload.ts`, `questionsFormules/index.ts`,
  `LEVEL_TONE` d'`HomePage.tsx` (couleur par slug).
- `/` — page d'accueil « Mon année d'abord » (`routes/HomePage.tsx`, maquettes A du 22/11/2026) :
  onglets d'année (`LEVELS`), choix mémorisé dans le navigateur (`lib/anneeAccueil.ts`, clé
  `accueil:annee` ; première visite sans choix ni historique : cartes « Tu es en… »), depuis le 27/11/2026
  carte « Ma classe » et trois portes — Mon cours avec « Reprendre » (dernière étape ouverte DE CETTE ANNÉE,
  clé `parcours:derniere-etape`), M'entraîner (`/entrainer`), Préparer mon interro (`/suivi/plan`) —, chapitres de
  l'année avec leur progression (celle des pages de chapitre, jamais envoyée). Les quatre années restent
  dans le DOM (25 liens de chapitres dans la page pré-rendue, 26 pages pré-rendues) : ce qui est montré dépend de `<html
  data-annee-accueil>`, posé avant le JS par le script en ligne d'`index.html` (même logique que
  `anneeDeDepart`, à garder en accord). Recherche dans l'en-tête (`components/RechercheSite.tsx`, toutes
  les pages à `SiteHeader`) : titres de chapitres, d'étapes (`title`, `titreCourt`, `kicker`) et
  sous-titres, index léger `lib/rechercheIndex.ts` chargé à la demande au premier focus.
- `/{levelSlug}/{chapterSlug}` — page d'un chapitre (`routes/ChapterRoute.tsx`), résolue via
  `findChapter()`. Parcours « une étape par écran » sur cette seule route : vue choisie par le
  fragment (`#sectionId` = étape, `#reviser`, `#entrainer`, rien = carte), voir
  `.claude/rules/chapter-components.md`.
- Comptes professeurs (`.claude/rules/comptes.md`) : `/connexion`, `/inscription`, `/mot-de-passe`, `/admin`, et
  l'**espace professeur** réorganisé le 27/11/2026 (section « Espace professeur : tableau de bord et quatre portes ») :
  `/espace` (tableau de bord, page d'arrivée après la connexion) puis quatre portes, un seul menu `MenuEspace` sur toutes
  les pages professeur — **Mes classes** (`/carnet`, vue d'ensemble ; `/carnet/aujourdhui`, `/carnet/semaine`…, Page des
  élèves `/carnet/classe/:id/eleves`), **Préparer un cours** (`/espace/preparer` → projection, `/exercice`, `/evaluation`,
  remédiation), **Mes documents** (`/coffre`, `/partage/<jeton>`), **Réglages** (`/profil`, `/carnet/reglages`). Anciennes
  adresses inchangées ; le panneau des évaluations/examens (`/evaluation`) exige une session. Cours, générateurs et feuilles d'exercices (`/exercice`, `/{levelSlug}/{chapterSlug}/exercices`)
  restent publics (décision de l'utilisateur : les élèves s'en servent pour préparer leurs évaluations).
- `/classe` — page de classe à code des élèves, SANS compte (`routes/ClassePage.tsx`, publique, `noindex`, non
  pré-rendue ; `?code=` du QR retiré de l'adresse) : ce que le professeur publie depuis le carnet
  (`/carnet/classe/:id/eleves`, migration `0010_page_classe.sql`) — voir `.claude/rules/comptes.md`, « Page de classe ».
- Côté élève sans compte (`.claude/rules/cote-eleve.md`) : `/suivi` (« Mon suivi », carte de l'accueil) et
  `/suivi/plan` (plan de révision) — publics, non indexés, non pré-rendus, tout reste dans le navigateur.
- Côté élève plus clair (27/11/2026, `.claude/rules/cote-eleve.md`, « Côté élève plus clair ») : accueil à trois portes
  (Mon cours / M'entraîner / Préparer mon interro) + carte « Ma classe » (code gardé) ; `/entrainer` (« M'entraîner »,
  publique, non indexée, non pré-rendue) ; barre du bas sur téléphone (`HoteBarreEleve`), aide « ? » dans l'en-tête,
  visite de 3 bulles ; page de chapitre guidée, fin d'étape, fin d'exercice des générateurs (`FinExercice`).

## Règles détaillées (chargées seulement quand pertinentes)

Le détail par thème vit dans `.claude/rules/` — chaque fichier n'est chargé que lorsqu'un fichier
correspondant à son champ `paths` est lu ou modifié, pour ne pas payer son coût sur toutes les
tâches :

| Fichier | Portée (`paths`) | Contenu |
| --- | --- | --- |
| `.claude/rules/content-authoring.md` | `src/content/**`, `src/lib/generatorLink.ts`, `src/lib/{lienChapitre,prerequisChapitre}.ts`, `src/components/Math.tsx`, `src/lib/lectureFormules.ts`, `src/lib/katexAccessible.ts`, `src/entrainement/components/KatexAccessible.tsx`, `scripts/*lecture-formules*` | Schéma `ChapterContent`/`Block` complet, mini-syntaxe `RichText` (KaTeX + gras) et ses pièges, convention de lien vers un générateur, déclaration des kinds `atelier`/`entrainement.widgetTag` côté contenu, lecture en mots des formules (`aria-label`, `npm run controle:lecture`), chapitres autonomes (jamais de numéro de chapitre dans le texte, lien nommé `[[niveau/slug#section]]` contrôlé au build par `scripts/verifier-liens-chapitres.mjs`, champ `utilise` des sections). |
| `.claude/rules/illustration-components.md` | `src/components/illustrations/**` | Catalogue complet des kinds d'`IllustrationSpec` (machine, curvePlot, vectorPlane, setMapping, pascalTriangle, etc.) et la convention des classes CSS `svg-*` du thème. |
| `.claude/rules/chapter-components.md` | `src/components/chapter/**` | Composants du gabarit de chapitre (`ChapterPage`, `BlockRenderer`, Callouts, `ExempleResolu`, `SignTable`, `FeatureTable`, `OperationChain`...). |
| `.claude/rules/interactive-widgets.md` | `src/interactive/**`, `src/components/chapter/InteractiveWidget.tsx`, `tsconfig.app.json` | Mécanisme de portage des Web Components vanilla (Shadow DOM) depuis un artifact, montage impératif, ordre d'import, et le piège UMD `module.exports`/Vite-Rollup. |
| `.claude/rules/export-pipeline.md` | `src/lib/export/**`, `src/components/chapter/ExportSection.tsx` | Pipeline d'export Word/PDF/PowerPoint (`collectBlocks`, `captureBlocks`, `buildPdf`/`buildDocx`/`buildPptx`). |
| `.claude/rules/content-history.md` | `src/content/chapters/**` | Historique détaillé, chapitre par chapitre, des migrations/enrichissements déjà réalisés (choix éditoriaux, bugs trouvés et corrigés, kinds ajoutés). |
| `.claude/rules/quiz-generators.md` | `src/entrainement/**/generateurs/quiz*/**` | Convention des bancs d'affirmations vrai/faux : jamais de « grand calcul » (seulement vérification rapide), critère de tri, et le piège `nombreExercices` fixe si le compte varie par thème. |
| `.claude/rules/comptes.md` | `src/lib/supabase.ts`, `src/lib/compte*`, `src/components/compte/**`, `src/routes/{Connexion,Inscription,Profil,Coffre,Admin,MotDePasse,Evaluation,Partage,Espace,Preparer}*`, `src/lib/espaceProfesseur.ts`, `src/lib/partage*`, `src/routes/ClassePage.tsx`, `src/lib/pageClasse*`, `src/lib/ordreChapitres.ts`, `supabase/**`, `.env*` | Comptes professeurs (Supabase) : espace professeur (tableau de bord `/espace`, quatre portes, un seul menu, noms), schéma, RLS, inscription par code d'invitation (déclencheur sur `auth.users`), RPC admin, coffre des plans, partage entre collègues par lien (0009), page de classe à code des élèves sans compte publiée depuis le carnet (0010 : ce qui est publié / jamais publié, limite d'essais), « Mon ordre des chapitres » (0011 : jamais le numéro du site côté élève, `lib/ordreChapitres.ts`), cartouche école/professeur, garde des routes réservées, configuration (`.env.production` versionné, clé publique seulement), mise en service, limites de l'offre gratuite. |
| `.claude/rules/feuilles-evaluations.md` | `src/entrainement/export/**`, `**/exportEvaluation.ts`, `src/lib/evaluation*.ts`, `src/lib/banquesVraiFaux.ts` | Méthode des feuilles d'exercices et évaluations (pilote 6e ch. 3) : décisions de l'utilisateur (pas de place de réponse, énoncé papier sans sous-questions, version aménagée, sélecteurs intacts), champs d'adaptateur à remplir, niveau de difficulté 1–7 et durée par exercice (`criteresDifficulte`, `niveauDifficulte.ts`), `versionPapier`, `?code=`, vrai/faux, mise en page A4 (points à droite, minuscules d'insistance, pied de page, consignes), options du document (annexe formulaire, deux colonnes, Word corrigé/grille), document « Examen » (parties, total fixé, horaire, `examen.ts`), vérifications. À relire avant d'étendre la refonte à un chapitre. |
| `.claude/rules/cote-eleve.md` | `src/lecture.css`, `src/lib/reglagesLecture.ts`, `src/lib/formulesDebordantes.ts`, `src/components/lecture/**`, `src/components/Math.tsx`, `src/components/SiteHeader.tsx`, `index.html`, `src/lib/suivi*`, `src/lib/planRevision*`, `src/routes/{Suivi,PlanRevision}*`, `src/components/suivi/**`, `src/routes/EntrainementPage.tsx`, `src/lib/voixLecture.ts`, `src/components/chapter/ContenuEtape.tsx`, `src/entrainement/confortLecture.css`, `src/entrainement/components/{JeBloque,PanneauJeBloque,TexteInsistance,CorrigeDetailleEcran,BarreGenerateur}.tsx`, `src/lib/exempleJeBloque.ts`, `src/lib/{phrasesPage,decoupagePhrases,lectureTableauSignes}.ts`, `src/entrainement/components/{EcouterAides,CadreActions}.tsx`, `src/entrainement/*/components*/EnTeteExercice.tsx` | Côté élève sans compte (rien ne quitte l'appareil) : confort de lecture (fait d'office, panneau « Aa » Texte / Couleurs, `reglagesLecture.ts`, anti-flash d'`index.html`, thèmes) ; aides de lecture de l'onglet « Aides » (règle / masque, un bloc à la fois, loupe, air autour des signes, exemples guidés, correspondances, point d'accroche « Écouter » `lecture:dire`) ; « Mon suivi » (`/suivi`) et plan de révision (`/suivi/plan`) : essais des générateurs enregistrés localement, « À retravailler », algorithme du plan, point d'accroche `?date=` pour la page de classe ; générateurs (lot G) : taille du texte, « Aa », corrigé ligne par ligne, « Je bloque », majuscules d'insistance en gras ; lecture à voix haute (lot VX) : moteur `voixLecture.ts` (file de phrases, voix fr, vitesse), phrases de la page `phrasesPage.ts`, barre de lecture, « Écouter » (étape, exemples, loupe, tableau, énoncés, aides, corrigés), section du panneau. |

## Champs de saisie libre : jamais de blocage

Décision de l'utilisateur : un champ de saisie libre (générateur, atelier, widget) ne **bloque jamais**
la frappe — pas de filtre `onKeyDown`/`onChange` qui retire des caractères, pas de
`inputMode="numeric"`/`"decimal"` ni de `type="number"` (sur téléphone, ces claviers n'ont souvent
pas de touche « − » : impossible d'écrire une valeur négative). La seule transformation admise est
`normaliserSigneMoins` (`src/lib/normaliserSaisie.ts`, « − »/« – »/« — » → « - »), pour que la lecture
`Number(…)` reconnaisse le négatif. Une saisie illisible est jugée par la vérification
(`parse_error`), jamais effacée pendant la frappe.

## Vérification avant de pousser

- `npm run build` (= `tsc -b && vite build`) doit passer sans erreur.
