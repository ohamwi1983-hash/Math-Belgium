---
paths:
  - "src/interactive/**"
  - "src/components/chapter/InteractiveWidget.tsx"
  - "tsconfig.app.json"
---

# Widgets interactifs portés (`src/interactive/`)

Certains chapitres migrés depuis un artifact d'origine contenaient des Web Components JS vanilla
(`customElements.define`, Shadow DOM) construits pour cet artifact — ex. les ateliers du chapitre
« La fonction du second degré » (`parabole-widget`, `transformations-widget`). Plutôt que de les
laisser tomber lors de la migration, ils sont **portés tels
quels** dans `src/interactive/` (fichiers `.js` non typés, `allowJs: true` dans
`tsconfig.app.json`) et montés via 2 nouveaux kinds de `Block` (`content/types.ts`, voir
`.claude/rules/content-authoring.md` pour l'usage côté contenu) :

- `{ kind: 'atelier', tag, label, caption? }` — atelier libre "Manipule toi-même", sans notion de
  correction ni de score, sans générateur `genN` équivalent (rien à lier en plus du widget).
- `{ kind: 'entrainement', ..., widgetTag? }` — extension additive de l'`entrainement` existant :
  un widget gradé serait monté AU-DESSUS de la description, dans `CarteEntrainement`, le lien
  "S'entraîner ↗" restant affiché en dessous. **Aucune carte ne s'en sert** : les ports
  `gen7-widget` / `gen8-widget` (commit `0d61389`) n'ont jamais été fusionnés dans la branche
  principale, et l'utilisateur a décidé de ne pas les porter (audit du 4e ch. 1) — les cartes gen7
  et gen8 renvoient au générateur, qui a les règles communes (saisie, aides, corrigé).

`InteractiveWidget` (`components/chapter/InteractiveWidget.tsx`) monte l'élément custom via un ref
DOM impératif (`document.createElement(tag)` + `host.replaceChildren(...)`) plutôt qu'une balise
JSX à tiret, pour éviter toute friction de typage sur un nom d'élément non enregistré auprès de
React/TypeScript. Un widget porté ajoute : son propre fichier `.js` (copié verbatim depuis
l'artifact), un `register-<tag>.js` qui l'importe en effet de bord (garantit l'ORDRE d'exécution
ES module — un widget dépendant d'un module partagé lisant une variable globale `window.X` doit
importer ce module AVANT son propre fichier), une entrée dans `InteractiveWidgetTag` (liste fermée),
et son cas dans `InteractiveWidget.tsx`. `.atelier-frame-wrap`/`.widget-host` (`index.css`) et le
sélecteur d'export HTML (A4) (`.no-export`, déjà posé sur ces conteneurs) suivent le même principe
que les autres blocs non exportables — un Shadow DOM n'est de toute façon pas repris par un
`cloneNode`/`outerHTML` classique.

**Piège vérifié en pratique** : un fichier `.js` porté verbatim depuis un artifact suit souvent un
motif d'export UMD (`if (typeof module !== "undefined" && module.exports) module.exports = X; else
root.X = X;`) pour rester compatible Node ET navigateur. Vite/Rollup détecte le simple TOKEN
`module.exports` (même dans une branche jamais empruntée en navigateur) et empaquette TOUT le
fichier dans un wrapper `__commonJS` paresseux, jamais invoqué par un import de effet de bord
(`import './fichier.js'`) — le code ne s'exécute alors jamais, silencieusement (pas d'erreur, juste
`window.X` qui reste `undefined`, découvert via un crash différé au premier usage du widget).
Diagnostiqué en inspectant directement le chunk compilé (`dist/assets/*.js`), pas en devinant.
Correctif : supprimer entièrement la branche `module.exports` de tout fichier de ce dossier, ne
garder que `root.X = X;`, et appeler l'IIFE avec `window` directement (jamais le ternaire
`typeof window !== "undefined" ? window : this`) — ces widgets ne tournent jamais que dans un
navigateur, la compatibilité Node est une fausse piste ici.

**Figure épinglée pendant la manipulation (`epinglerFigure`, `InteractiveWidget.tsx`)** — retour
utilisateur : dans la plupart des ateliers, curseurs et boutons sont trop loin du dessin ; en les
manipulant, on ne voit plus le graphe. Correctif GÉNÉRIQUE (aucun widget modifié) : après montage,
la plus grande `<svg>` du Shadow DOM est repérée, on remonte jusqu'à son plus grand ancêtre qui ne
contient encore aucun contrôle (input/button/select/textarea), et cet élément reçoit
`position: sticky; top: 50px (12px ≥ 760px, pas d'en-tête collant); bottom: 8px` + un fond opaque
(premier fond non transparent trouvé en remontant). `top` couvre les réglages placés SOUS la figure,
`bottom` ceux placés AU-DESSUS ; le parent (qui contient les réglages) borne l'épinglage, la figure
ne sort donc jamais de son atelier. Une figure plus haute que 55 % de l'écran (deux panneaux
empilés sur téléphone) est réduite par `zoom` ; rien n'est épinglé au-delà de 90 %, ni si l'atelier
tient déjà à l'écran (< 90 % de la hauteur). Un `MutationObserver` ré-applique quand un widget
reconstruit son DOM (court-circuit tant que l'élément épinglé est toujours connecté). **Pour un
NOUVEL atelier** : garder la figure principale dans une `<svg>` et ne PAS mettre de bouton à
l'intérieur du conteneur direct de la figure (sinon seule la `<svg>` elle-même est épinglée, bornée
par ce petit conteneur, donc sans effet). Vérification : `scratchpad/test-epingle.cjs` (chaque
contrôle amené à l'écran → figure entièrement visible et ne recouvrant pas le contrôle).

**Ateliers du parcours de chapitre** : un atelier n'est plus monté dans le fil de la page mais dans
un panneau `<dialog>` (`PanneauModal`, plein écran sur téléphone) ouvert depuis une carte
« Manipuler ». `InteractiveWidget figuresTactiles` y ajoute `svg { touch-action: none }` dans le
Shadow DOM (feuille adoptée) : le doigt qui déplace une flèche ne fait pas défiler le panneau ; le
panneau défile en glissant ailleurs.

**Épinglage dans le panneau (`InteractiveWidget panneau`)** — retour utilisateur : la figure épinglée
couvrait une ligne de réglages ou une consigne. Cause : le collage en BAS (`bottom: 8px`) remontait la
figure, dès l'ouverture, par-dessus ce qui la précède (consigne, boutons, curseurs au-dessus d'elle).
Dans le panneau : rien n'est épinglé si l'atelier entier tient sous l'en-tête (hauteur du `<dialog>`
moins `.panneau-entete`) ; sinon collage en HAUT seulement, `top` = hauteur de l'en-tête du panneau
(aussi sur ordinateur, où l'ancien `12px` passait sous l'en-tête) : les réglages défilent sous la
figure et arrivent entièrement visibles sous elle. Deux bugs corrigés au passage : `zoom` réduit aussi
`top`/`bottom` (50px sous zoom 0,7 = 35px à l'écran, sous l'en-tête) → décalages divisés par le
zoom ; une figure fluide (`svg` à `width: 100%`) ne rapetisse pas avec `zoom` → largeur bornée à la
place. Aucun widget modifié. Mesure : `scratchpad/chapitre-retouches/ateliers.cjs` (chaque atelier de
chaque chapitre ouvert dans le panneau, défilement balayé par pas de 8 px : contrôles
`input/button/select/label/textarea` et textes vs rectangle de la figure — couverts à l'ouverture,
couverts à l'arrivée en descendant, jamais visibles en entier) sur les 191 ateliers : avant, 5
ateliers fautifs à chaque taille (10 et 8 éléments couverts à l'ouverture) ; après, 0 / 0 / 0 à
375×667 et 390×664.

**Diapo du mode projection (`InteractiveWidget sansEpingle`)** : aucun épinglage ; disposition et zoom
choisis par `components/projection/dispositionAtelier.ts` (tel quel, figure à côté des réglages par une
grille posée dans le Shadow DOM — feuille adoptée + attributs `data-proj-*` —, ou défilement en dernier
recours), zoom jusqu'à ×3 — voir `chapter-components.md`, « Mode projection », « Atelier ». **Pour un
NOUVEL atelier** : mêmes règles que pour l'épinglage (figure principale dans une `<svg>`, aucun contrôle
dans le conteneur direct de la figure) ; c'est ce qui permet la disposition côte à côte en classe. Pour l'export PowerPoint, son Shadow DOM est aplati
(feuilles adoptées et `<style>` recopiés, `:host` → `[data-hote]`) avant d'être photographié.
