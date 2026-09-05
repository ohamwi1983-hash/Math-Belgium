---
paths:
  - "src/interactive/**"
  - "src/components/chapter/InteractiveWidget.tsx"
  - "tsconfig.app.json"
---

# Widgets interactifs portés (`src/interactive/`)

Certains chapitres migrés depuis un artifact d'origine contenaient des Web Components JS vanilla
(`customElements.define`, Shadow DOM) construits pour cet artifact — ex. les 4 widgets du chapitre
« La fonction du second degré » (`parabole-widget`, `transformations-widget`, `gen7-widget`,
`gen8-widget`). Plutôt que de les laisser tomber lors de la migration, ils sont **portés tels
quels** dans `src/interactive/` (fichiers `.js` non typés, `allowJs: true` dans
`tsconfig.app.json`) et montés via 2 nouveaux kinds de `Block` (`content/types.ts`, voir
`.claude/rules/content-authoring.md` pour l'usage côté contenu) :

- `{ kind: 'atelier', tag, label, caption? }` — atelier libre "Manipule toi-même", sans notion de
  correction ni de score, sans générateur `genN` équivalent (rien à lier en plus du widget).
- `{ kind: 'entrainement', ..., widgetTag? }` — extension additive de l'`entrainement` existant :
  le widget gradé (gen7, gen8) est monté AU-DESSUS de la description, dans `CarteEntrainement`,
  mais le lien "S'entraîner ↗" vers la version hébergée sur plateforme-maths reste toujours affiché
  en dessous — c'est la version de référence maintenue, le widget embarqué est une commodité, pas
  un remplacement du principe "lien vers le générateur" documenté ailleurs.

`InteractiveWidget` (`components/chapter/InteractiveWidget.tsx`) monte l'élément custom via un ref
DOM impératif (`document.createElement(tag)` + `host.replaceChildren(...)`) plutôt qu'une balise
JSX à tiret, pour éviter toute friction de typage sur un nom d'élément non enregistré auprès de
React/TypeScript. Un widget porté ajoute : son propre fichier `.js` (copié verbatim depuis
l'artifact), un `register-<tag>.js` qui l'importe en effet de bord (garantit l'ORDRE d'exécution
ES module — un widget dépendant d'un module partagé, ex. `gen8-widget` lisant `window.Gen7Core`,
doit l'importer AVANT son propre fichier), une entrée dans `InteractiveWidgetTag` (liste fermée),
et son cas dans `InteractiveWidget.tsx`. `.atelier-frame-wrap`/`.widget-host` (`index.css`) et le
sélecteur d'export Word/PDF/PPTX (`.no-export`, déjà posé sur ces conteneurs) suivent le même
principe que les autres blocs non exportables.

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
