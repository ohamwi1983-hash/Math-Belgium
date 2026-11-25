---
paths:
  - "src/lib/suivi*"
  - "src/lib/planRevision*"
  - "src/routes/{Suivi,PlanRevision}*"
  - "src/components/suivi/**"
  - "src/routes/EntrainementPage.tsx"
  - "scripts/tester-plan-revision.mts"
  - "scripts/tester-suivi.mts"
  - "src/entrainement/components/ValidationEcran.tsx"
---

# Côté élève, sans compte

Décision du professeur (25/11/2026, maquettes « côté élève » planches 01–13 validées, planche 14 en
suspens) : **aucune donnée d'élève ne quitte l'appareil**. Réglages, progression, suivi, plan :
`localStorage` seulement, chaque lecture/écriture dans un try/catch, la page marche sans stockage
(navigation privée, quota plein). Aucun compte élève, aucun nom, aucune adresse. Mention visible :
« Gardé sur cet appareil, jamais envoyé. »

## Mon suivi et plan de révision (planche 13)

Routes publiques, `noindex` (`usePageNonIndexee`), **jamais pré-rendues** (absentes de
`scripts/routes.mjs`), chargées à la demande (`App.tsx`) :

- `/suivi` — `routes/SuiviPage.tsx`. `?niveau=` (sinon année de l'accueil `anneeDeDepart`, sinon celle
  du dernier essai), `?chapitre=` (sinon le dernier chapitre travaillé). Onglets des chapitres de
  l'année ; « À retravailler » en tête (pourquoi + « Revoir : étape n, « … » » + « M'entraîner : id ·
  titre ») ; puis chaque étape : comprise (pastille ✓), 5 derniers essais en cases, « 9 réussis sur 11,
  dont 2 avec aide », cartes « n / N « Je savais » ». « Effacer mon suivi… » : confirmation DANS la page
  (jamais `confirm()`), cases « essais » / « plan » cochées, « étapes comprises et cartes de toutes les
  années » décochée. Pas de « bilan à montrer » ni d'« emporter » (planche 14 en suspens).
- `/suivi/plan` — `routes/PlanRevisionPage.tsx`. Formulaire (date de l'interro `input type="date"`,
  année, étapes par chapitre en `<details>` préremplies par « À retravailler », 10 / 20 / 30 min, jour
  libre), puis le plan jour par jour (cases cochables, durées, « revue n° k », « reporté de lundi »,
  résumé des reports d'un jour raté, évaluation blanche l'avant-veille → `/{niveau}/{chapitre}/exercices`).
- Accès : carte « Mon suivi » de l'accueil (`HomePage.tsx`, `CarteSuivi`, à côté de « Préparer mon
  interro ») ; le plan depuis Mon suivi. La maquette ne met pas de lien dans l'en-tête ni dans la page de
  chapitre : rien n'y a été ajouté.

### Enregistrer les essais des générateurs (`lib/suiviEssais.ts`)

Clé `suivi:essais:v1` : `{ v: 1, g: { [idGénérateur]: [{ t, e, v? }] } }` — `t` = `Date.now()` de la fin
de l'exercice, `e` = un caractère par écran (`o` juste du premier coup, `a` juste avec aide, `r` révélé,
comme les puces ; « sans objet » non gardé), `v` = variante si connue (quiz : le thème). Verdict d'un
essai : `rate` si un écran révélé, sinon `aide` si un écran avec aide, sinon `reussi`. Bornes : 30 essais
par générateur, 1 500 au total (≈ 60 Ko) ; quota plein → la moitié la plus ancienne part, un seul nouvel
essai. Événement local `suivi:modifie` (même onglet), `storage` (autres onglets).

**Points de passage communs** (aucun générateur réécrit) :

1. le magasin du cadre (`entrainement/components/cadreGenerateur.ts`), où `ProgressionPuces` publie ses
   segments — `EntrainementPage` s'y abonne (`observerProgression(...).segments`) ;
2. `ValidationEcran` (partagé par les trois chantiers, 724 usages) signale chaque écran clos
   (`useSignalerVerdict`, `SuiviVerdictContext`, une fois à l'apparition du bloc) ;
3. un écouteur de clic (capture) sur la racine de la page repère « Aide » (`.btn-aide`,
   `[data-bouton-aide]`, y compris via le tiroir du cadre qui clique le même bouton).

Piège constaté : la plupart des générateurs gardent le DERNIER écran « courante » jusqu'au clic sur
« Nouvel exercice », qui repart aussitôt sur un nouvel exercice — les segments ne sont jamais tous clos.
D'où la règle : un essai est noté quand tous les segments sont clos, OU quand `ValidationEcran` apparaît
alors que le seul segment non clos est l'écran en cours et qu'il est le dernier (résultat de ce dernier
écran = verdict révélé/juste + « Aide » touchée pendant cet écran). Une seule note par exercice ; la
suivante dès qu'un nouvel exercice recommence. Un écran : chaque verdict compte. Sans puces publiées du
tout : chaque verdict = un exercice d'un écran. Logique testée seule : `node --experimental-strip-types
scripts/tester-suivi.mts`. Couvre les 323 générateurs (sur 347 au registre) dont l'arbre d'import atteint
`ProgressionPuces` — tous les socles (`AppCombinatoire`, `AppEcransTrigo`, `sessionEcransTrig`,
`AppTransfertSecondDegre`, `AppEspaceLotH`…) et les applis propres. Un exercice abandonné en cours n'est
pas noté.

Sans puces partagées : `useNoterEssai()` (`lib/suiviContexte.ts`, contexte fourni par
`EntrainementPage`, sans effet ailleurs) — les 23 quiz vrai/faux (gen59–66, 5gen39–43, 6gen64–73 : une
affirmation répondue = un essai d'un écran, variante = thème) et gen40 « Section plane » (à « Nouvel
exercice » ; il entoure son rendu de `<SuiviVerdictContext.Provider value={null}>` pour que ses verdicts
écran par écran ne comptent pas chacun comme un exercice). Contrôle de couverture : script `couverture.mjs` du dossier de travail (arbre d'import de
chaque entrée du registre vers `ProgressionPuces.tsx`). Un nouveau générateur qui utilise
`ProgressionPuces` est couvert sans rien faire ; un nouveau quiz doit appeler `useNoterEssai()` dans son
`onValider` (même trois lignes que les autres).

### Rattacher un essai à son étape (`lib/suiviChapitres.ts`, pur)

Générateurs d'une étape = blocs `entrainement` de la section (un générateur cité dans deux sections
compte dans les deux) ; la carte `recap.entrainement` (quiz du chapitre) forme une ligne « Tout le
chapitre » si elle n'est dans aucune section. Progression : `lireParcours` (`parcours:…`), cartes :
`lireEtatsCartes` (`cartes:…`, clé `idSection:indice`). « À retravailler » : ≥ 2 ratés sur les 3
derniers essais d'un générateur, ou dernier essai raté, ou ≥ 1 carte « À revoir » ; le pourquoi le dit
(« 2 ratés sur tes 3 derniers essais de 5gen15, et 1 carte « Teste-toi » marquée « À revoir ». »).
Tons : Bien / À retravailler / Compris (lue, sans essai) / Commencé / Pas commencé.

Cases des 5 derniers essais : **forme et couleur** — ✓ plein vert (réussi), ✓ pointillés ambre (avec
aide), ✗ encadré rouge (raté), case grise (pas encore) ; `role="img"` + `aria-label` en mots ; légende
sous le chapitre.

### Plan de révision (`lib/planRevision.ts`, pur ; stockage `lib/planRevisionStockage.ts`)

Clé `suivi:plan:v1` : `{ debut, interro, minutes, jourLibre, niveau, etapes: ['chapitre#section'], faites: [idTâche] }`.

Algorithme (testé seul : `node --experimental-strip-types scripts/tester-plan-revision.mts`, 16 tests —
dates/heure d'été, 7 jours, jour libre, jours ratés, rattrapage, peu de temps, 12 étapes, interro
demain, interro passée, essentiel) :

1. **Plan de base** (ne dépend ni du jour courant ni des coches, donc stable) : jours `debut` → veille de
   l'interro ; jour libre sans tâche (jamais tous) ; dernier jour de travail = veille (cartes « À revoir »,
   10 min ; toutes les cartes si aucune n'est marquée) ; avant-dernier = évaluation blanche (20 min) s'il y
   a au moins 4 jours de travail ; un seul jour = « l'essentiel » (cartes + un exercice par étape, à
   retravailler d'abord). Les autres jours apprennent les étapes dans l'ordre (une par jour, ou par paquets
   égaux) : relire « L'essentiel » (2 min) + 2 exercices (3 si à retravailler, 4 min chacun ; un exemple
   résolu à refaire, 5 min, si l'étape n'a pas de générateur) + cartes (0,8 min/carte) ; réduit jusqu'à
   tenir dans le temps choisi (1 exercice, sans relecture, puis exercices retirés aux étapes non à
   retravailler). Jours restants : mélange (exercices, à retravailler d'abord). Cartes qui reviennent :
   le lendemain, 3 jours, une semaine (revues n° 2, 3, 4), sur le premier jour de travail suivant, avant la
   veille, sans dépasser temps + 10 min.
2. **Jours passés** : statut fait / en partie / pas fait ; ce qui n'est pas coché est reporté sur les
   jours à partir d'aujourd'hui, **jamais plus de 10 min de plus par jour** (`SURPLUS_MAX`), exercices un
   par un, la veille ne prend que des cartes. D'abord l'essentiel (cartes, premier exercice de chaque
   étape) — au besoin en allégeant un jour (relecture, exercices au-delà d'un) —, puis le reste ; ce qui ne
   tient pas est laissé de côté (« le plan garde l'essentiel »). Rien ne s'accumule : tout est recalculé
   à chaque affichage depuis le plan de base et les coches. L'évaluation blanche ne se reporte pas (20 min
   > surplus) ; elle reste proposée en bas du plan.
3. **Coches** : une tâche reportée garde l'identifiant d'origine (`#i` pour un exercice seul), donc la
   cocher n'importe quel jour vaut pour le jour d'origine ; des cartes d'une étape revues un jour suivant
   valent pour les revues manquées avant.

**Point d'accroche (page de classe, lot C)** : `lienPlanRevision({ date, niveau, chapitre, etapes })` →
`/suivi/plan?date=AAAA-MM-JJ&niveau=5e-4h&chapitre=suites&etapes=idSection1,idSection2` (`?interro=` est
aussi lu). Le formulaire s'ouvre prérempli (« Date et étapes reprises de la page de ta classe ») ; rien
n'est remplacé sans que l'élève valide.

### Mise en page

`components/suivi/suivi.css` (chargé avec ces pages), classes `suivi-*` / `plan-*`, jetons du site
uniquement (clair, sombre, tout thème qui les redéfinit) ; police de lecture `var(--l-police, Andika…)`.
Cibles ≥ 44 px (cases du plan dans une zone de 44 px, liens, onglets), onglets des chapitres au clavier
(flèches, Début, Fin), focus visible, la rangée d'onglets défile seule sur téléphone (jamais la page).
