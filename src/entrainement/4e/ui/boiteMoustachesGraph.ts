/**
 * Géométrie pure du graphe "boîte à moustaches" — coordonnées de DONNÉES (pas pixel), séparée du
 * rendu React (`components/BoiteMoustachesGraph.tsx`) pour rester testable sans DOM, même principe
 * que les autres graphes du projet.
 *
 * **Rendu via Mafs** (`promptgen36modifications.md`, section 2 — remplace le SVG natif d'origine,
 * documenté par `promptgen36creation.md` comme délibérément "jamais Mafs" ; cette décision est
 * explicitement renversée par ce prompt, qui demande la grille interactive déjà partagée par le
 * reste de la plateforme) : X = les vraies valeurs de la série (échelle réelle) ; Y ne représente
 * rien de mathématique, seulement un SÉPARATEUR DE LIGNE (1 ligne pour construction/lecture, 2 pour
 * comparaison) — jamais une vraie grandeur. `ratioGraphe` choisit un ratio largeur/hauteur PROPRE à
 * ce graphe (plus large/plat qu'ailleurs, `RATIO_GRAPHE` du reste du projet serait trop carré pour
 * une boîte à moustaches) plutôt que le `RATIO_GRAPHE` partagé — mêmes briques `GrilleAdaptative`/
 * `useLargeurConteneur`/`ZOOM_MIN`/`ZOOM_MAX` réutilisées telles quelles pour le reste (zoom/pan,
 * grille adaptative, indicateur de pas).
 */
import type { PlageAxe } from "../core/boiteMoustaches.types";

/** Écart (en unités de données) entre 2 lignes consécutives (variante "comparaison" uniquement) —
 * `6` (voir l'historique de `DEMI_HAUTEUR_BOITE` ci-dessous pour la genèse) : `ESPACEMENT_LIGNE -
 * 2*DEMI_HAUTEUR_BOITE` doit rester un écart net et confortable entre les 2 boîtes, jamais juste
 * suffisant. */
export const ESPACEMENT_LIGNE = 6;

/** Demi-hauteur (en unités de données) du rectangle de la boîte (Q1 à Q3) — agrandie de `0,7` à
 * `1,8` au fil de 3 itérations (retour utilisateur répété : la boîte restait visuellement petite),
 * `promptcorrectioninstabiliteratioboitemoustaches.md` suite :
 *
 * 1. Resserrer `ratioGraphe` seul (`0,7` conservé) rendait le WIDGET plus haut à l'écran, mais la
 *    boîte elle-même — dessinée dans `components/BoiteMoustachesGraph.tsx` avec cette constante en
 *    unités de DONNÉES — restait strictement la même taille en pixels (les pixels par unité de
 *    données sont verrouillés identiques sur X et Y par `ajusterAuRatio`, voir sa doc) : tout
 *    l'espace vertical gagné ne servait qu'à agrandir la marge/le quadrillage autour d'elle.
 * 2. `0,7→1` (mesuré : la boîte n'occupait encore que ~12-19% de la hauteur Y finale sur la plage
 *    réaliste) — la boucle de clairance de grille Y de `etendreViewBoxPourEtiquettes`
 *    (`CIBLE_NOMBRE_LIGNES_Y_BOITE` lignes labellisées) gonflait la hauteur Y bien plus vite qu'une
 *    variation modeste de cette constante ; pousser `DEMI_HAUTEUR_BOITE` plus loin (essayé jusqu'à
 *    `3`) faisait remonter le ratio axe/étendue en mode comparaison jusqu'à ×8,3 — ré-ouvrant le bug
 *    de marge disproportionnée que ce chantier corrige depuis plusieurs prompts (seuil visé : jamais
 *    5× ou plus).
 * 3. **14ᵉ piège, `ui/mafsTransformation.ts`** : l'axe Y de ce graphe n'affichant JAMAIS de vraie
 *    grandeur (`yLigne`, simple séparateur), ses étiquettes numériques sont désormais masquées
 *    (`GrilleAdaptative`, `masquerEtiquettesY`) — la clairance de grille Y n'a donc plus AUCUNE
 *    étiquette à protéger. `BoiteMoustachesGraph.tsx` utilise maintenant
 *    `etendreLargeurXPourEtiquettes` (X seul grid-ancré, Y verrouillé par le seul ratio, sans
 *    inflation de clairance) au lieu de `etendreViewBoxPourEtiquettes` — la hauteur Y disponible pour
 *    la boîte grandit d'un coup, ET le ratio axe/étendue s'améliore EN MÊME TEMPS (moins de gonflement
 *    parasite de Y à compenser côté X). `1,8` retenu : balayage numérique de la plage réaliste
 *    (`boiteMoustachesGraph.test.ts`) donnant une fraction boîte/hauteurY ≈ 44,6% (1 ligne) / 23,1%
 *    (2 lignes, comparaison) — contre 18,6%/11,2% avant ce 3ᵉ correctif — pour un pire ratio
 *    axe/étendue de 3,00×/3,75×, MEILLEUR qu'avant (4,38×/4,00×), pas seulement compensé. Bonus
 *    collatéral : la dépendance résiduelle à la position, jusque-là bornée mais jamais éliminée pour
 *    le mode 2 lignes (13ᵉ piège, ~20%), disparaît elle aussi ENTIÈREMENT — `etendreLargeurXPour
 *    Etiquettes` ne couple plus jamais X et Y (contrairement à `elargirAvecClairance`/
 *    `assurerClairanceBorne`), donc plus aucun mécanisme par lequel la position pourrait s'y
 *    infiltrer (vérifié : balayage de position à étendue fixe, 1 SEULE largeur finale, 1 et 2 lignes). */
export const DEMI_HAUTEUR_BOITE = 1.8;

/** Demi-hauteur des "chapeaux" verticaux des moustaches (min/max) — toujours strictement plus petits
 * que la boîte, pour rester visuellement subordonnés — `0,9`, même proportion (moitié de
 * `DEMI_HAUTEUR_BOITE`) et même historique que ci-dessus. */
export const DEMI_HAUTEUR_MOUSTACHE = 0.9;

const MARGE_VERTICALE = 1.3;

/**
 * Cible de lignes de grille labellisées PROPRE à ce graphe (`promptgen36fixmafsechelle.md`) —
 * transmise à `GrilleAdaptative`/`calculerPasGrille` (`mafsGraphPartage.tsx`/`mafsTransformation.ts`,
 * tous deux additifs/optionnels, comportement inchangé pour leurs 3 autres consommateurs). Les
 * valeurs affichées héritent directement de la magnitude du contexte narratif tiré (jusqu'à 6
 * chiffres, ex. un kilométrage en centaines de milliers) — bien au-delà des domaines habituels des
 * autres graphes Mafs du projet. Réduire la cible (10 → 6) élargit proportionnellement l'espace
 * pixel disponible par étiquette, quel que soit son nombre de chiffres : vérifié empiriquement en
 * navigateur (méthode "verify before fixing") sur le contexte le plus extrême de la banque
 * (`véhicules — km`, jusqu'à 6 chiffres) qu'aucune étiquette ne chevauche plus sa voisine.
 */
export const CIBLE_NOMBRE_LIGNES_BOITE = 6;

/**
 * Cible de lignes pour l'axe Y — TOUJOURS cette valeur fixe, jamais celle (adaptative) de X (voir
 * `cibleNombreLignesXAdaptative` ci-dessous) : contrairement à X, Y n'est jamais qu'un séparateur
 * de ligne (`yLigne`, valeurs toujours petites, jamais la magnitude potentiellement grande — jusqu'
 * à 6 chiffres, ex. un kilométrage — de la vraie donnée X) — aucune raison de la restreindre pour
 * protéger contre un chevauchement d'étiquettes larges qui ne peut jamais se produire sur cet axe.
 *
 * **Rôle réduit depuis le 14ᵉ piège (`ui/mafsTransformation.ts`, `promptcorrectioninstabilite
 * ratioboitemoustaches.md` suite)** : cette cible ne pilote plus AUCUN calcul de clairance/extension
 * de la hauteur Y (`BoiteMoustachesGraph.tsx` utilise désormais `etendreLargeurXPourEtiquettes`, qui
 * verrouille Y par le seul ratio — voir sa doc) — elle ne reste utile que pour la densité COSMÉTIQUE
 * du quadrillage Y affiché par `GrilleAdaptative` (nombre de lignes horizontales dessinées, jamais
 * labellisées — `masquerEtiquettesY`). `8` conservé tel quel (aucune raison de le changer, la
 * contrainte "pas de chevauchement d'étiquette Y" qui l'avait fait choisir a disparu avec les
 * étiquettes elles-mêmes) — historique complet (pourquoi 8, jamais 6 ni 10) laissé ci-dessous pour
 * mémoire.
 *
 * Choix de la valeur (8) — compromis entre 2 contraintes en tension, toutes deux vérifiées
 * empiriquement (fuzz-testing numérique sur la plage réaliste complète + Playwright sur ~70
 * générations réelles, PC et mobile 320px, les 3 variantes), À L'ÉPOQUE où Y affichait encore des
 * étiquettes numériques :
 *
 * - **Trop fin (10, la cible partagée par défaut du reste de la plateforme) cassait Y** :
 *   contrairement aux graphes où `CIBLE_NOMBRE_LIGNES=10` a été validé, l'axe Y de CE graphe est
 *   beaucoup plus court en PIXELS (`hauteur = largeur/ratioGraphe`, avec `ratioGraphe`
 *   délibérément plat — 2,4 à 3,6 — et `largeur` bornée à `[LARGEUR_MIN,LARGEUR_MAX]` = `[240,480]`
 *   — soit une hauteur réelle de **67 à 200px seulement**). Cramponner jusqu'à 10 lignes labellisées
 *   dans une hauteur aussi courte les faisait chevaucher verticalement — confirmé à la fois
 *   numériquement (`calculerPasGrille(4,10)` donne un pas de 0,5, soit 8 lignes dans une hauteur de
 *   67px) et visuellement (Playwright, chevauchement réel des étiquettes -8 à 7 constaté).
 * - **Trop grossier (6, la valeur historique/celle de X pour les grandes magnitudes) cassait X** :
 *   un `cibleY` grossier grid-ancrait l'axe Y à un pas disproportionné pour son étendue déjà petite,
 *   ce qui regonflait la hauteur Y via `assurerClairanceBorne`/`ajusterAuRatio` (boucle à point fixe,
 *   voir les pièges 5-11 de `etendreViewBoxPourEtiquettes`) — cette hauteur regonflée se propageait à
 *   son tour à la largeur X via le ratio imposé, rouvrant PARTIELLEMENT le problème de marge que ce
 *   chantier corrige (confirmé numériquement : `cibleY=6` faisait remonter le ratio axe/donnée jusqu'à
 *   6,25-8,75× sur la plage réaliste, AU-DESSUS du plafond de 5× visé).
 *
 * `8` était le plus petit residual sûr trouvé entre ces deux bornes.
 */
export const CIBLE_NOMBRE_LIGNES_Y_BOITE = 8;

/**
 * `promptajustementmargeboitemoustaches.md` : `CIBLE_NOMBRE_LIGNES_BOITE` (6, fixe) produisait une
 * marge disproportionnée pour la plupart des générations réelles — l'étendue de la vraie donnée
 * (`etendueTotale = q1-min + mediane-q1 + q3-mediane + max-q3`, `generateurs/boiteMoustaches/
 * index.ts`) reste TOUJOURS bornée à `[4,16]` quel que soit le contexte narratif (indépendante de sa
 * magnitude, ex. `[30000,180000]` pour "véhicules — km" donne malgré tout un écart de quelques
 * unités seulement, jamais un écart de plusieurs milliers) — un pas grossier (`cible=6`, choisi à
 * l'origine pour laisser de la place aux étiquettes à 6 chiffres) est donc presque toujours BIEN
 * trop grossier pour une étendue aussi petite, gonflant l'axe affiché à 3-7 fois l'étendue réelle
 * (confirmé numériquement : `xmin=4,Q1=6,Q2=9,Q3=10,xmax=12`, étendue 8, axe affiché à ~36-60
 * unités selon le mode).
 *
 * Or la magnitude des nombres affichés (ce que `cible=6` protège réellement) et l'étendue de la
 * donnée sont deux dimensions INDÉPENDANTES pour ce générateur (l'étendue reste toujours petite,
 * la magnitude peut être grande) — la cible doit donc suivre la MAGNITUDE des bornes affichées
 * (nombre de chiffres), jamais l'étendue elle-même (contrairement à ce qu'une lecture rapide du
 * symptôme pourrait suggérer) : une cible plus fine reste sûre tant que les étiquettes restent
 * courtes, quelle que soit l'étendue réelle.
 *
 * Seulement **2 paliers** (pas 3, une 1ʳᵉ version en avait un 3ᵉ à `magnitude<100` avec une cible
 * de 24, voire 10 — **abandonnés, cassaient les étiquettes X elles-mêmes**, chevauchement massif
 * constaté visuellement, Playwright, dès qu'un contexte à 4 chiffres — ex. `2200-4800` de la banque
 * `bienaymeTchebychev/contextes.ts` — tombait dans ce palier trop fin ; puis, en réduisant encore,
 * chevauchement constaté même à 2 chiffres sur mobile 375px, LARGEUR_MIN=240 laissant trop peu de
 * pixels par étiquette pour une cible aussi fine) : `CIBLE_NOMBRE_LIGNES_BOITE` (6, la valeur
 * historique, déjà éprouvée en production) conservée À L'IDENTIQUE au-delà de 4 chiffres — aucune
 * régression possible pour ce palier, seul celui déjà empiriquement validé par le correctif
 * d'origine (`promptcorrectionmafslabelsgen13.md`, "véhicules — km").
 *
 * **Limite PRÉ-EXISTANTE constatée en vérifiant `promptcorrectioninstabiliteratioboitemoustaches.md`
 * (cause 1), non introduite par ce correctif** : la boucle de convergence
 * `etendreViewBoxPourEtiquettes` (2ᵉ palier, voir sa doc) peut faire grossir la largeur finale de
 * plusieurs multiples entiers de pas SANS redéclencher un passage à un pas plus grossier — le nombre
 * de lignes RÉELLEMENT rendues dépasse alors parfois `cibleNombreLignesXAdaptative`. Constaté par
 * Playwright (mobile 375px) avec `MANTISSES_GRILLE_BOITE`, PUIS reconstaté À L'IDENTIQUE en
 * repassant temporairement aux mantisses PAR DÉFAUT (1-2-5) sur le code d'AVANT ce correctif (ex.
 * `110,115,120,...,155` à `cible=8`, pas=5 — déjà un mantisse par défaut) : ce chevauchement mobile
 * existait donc déjà avant `MANTISSES_GRILLE_BOITE`, qui le rend seulement un peu plus fréquent (un
 * pas plus fin traduit la même marge absolue en plus de lignes) sans en être la cause. Corriger cette
 * boucle est hors du périmètre de ce prompt (qui porte sur la stabilité position/mantisse du ratio,
 * pas sur le chevauchement d'étiquettes en lui-même) — laissé tel quel, `8` inchangé, à traiter par
 * un futur correctif dédié si constaté gênant en usage réel.
 *
 * Vérifié numériquement (voir `boiteMoustachesGraph.test.ts`) sur la plage réaliste complète de ce
 * générateur (étendue 4 à 16 par série — voir `ECART_MIN`/`ECART_MAX`,
 * `generateurs/boiteMoustaches/index.ts` —, magnitude de quelques unités à 180000, 1 et 2 lignes) :
 * ramène le ratio axe affiché/étendue réelle à un maximum de 4,0× (1 ligne) / 4,2× (2 lignes,
 * comparaison) sur l'ensemble de cette plage — sous l'ancien 3 à 7,5× et sous le seuil de 5× visé.
 */
export function cibleNombreLignesXAdaptative(bornePlage: PlageAxe): number {
  const magnitude = Math.max(Math.abs(bornePlage.min), Math.abs(bornePlage.max));
  if (magnitude < 10000) return 8;
  return CIBLE_NOMBRE_LIGNES_BOITE;
}

/**
 * `promptcorrectioninstabiliteratioboitemoustaches.md`, cause 1 — jeu de mantisses PROPRE à ce
 * graphe, passé à `calculerPasGrille` via son paramètre additif `mantissesPersonnalisees`
 * (`ui/mafsTransformation.ts`) : jamais le comportement PAR DÉFAUT (1-2-5) des autres consommateurs,
 * qui reste inchangé.
 *
 * Les mantisses par défaut (1-2-5, facteurs ×2 puis ×2,5) créent des paliers de pas — donc de
 * largeur finale affichée — très larges : sur toute une plage d'étendue réelle où le pas choisi ne
 * change pas, la largeur affichée reste constante alors que l'étendue, elle, varie, faisant grimper
 * le ratio jusqu'à ×6,3 en bas de palier avant un saut de +98% au changement de palier (confirmé par
 * balayage contrôlé, voir `boiteMoustachesGraph.test.ts`). Le mécanisme touche les DEUX axes : Y
 * (toujours petit, `hauteur ≈ 4` unités pour 1 ligne) converge SANS mantisse plus fine directement
 * sur un pas de 1 (aucun candidat par défaut ne couvre `brut ≈ 0,625` dans la décade unitaire), un
 * saut de palier à lui seul responsable du plancher de largeur X observé (`hauteur convergée × ratio
 * = 7 × 3,6 = 25,2`, cf. `CIBLE_NOMBRE_LIGNES_Y_BOITE`) — X n'a donc pas besoin d'être seul concerné.
 *
 * **Diminishing returns constatés empiriquement** : la boucle à point fixe (`etendreViewBoxPour
 * Etiquettes`) recalcule le pas depuis un résultat déjà élargi à CHAQUE itération — un jeu de
 * mantisses plus fin réduit le "gaspillage" de chaque arrondi individuel, mais chaque itération peut
 * elle-même redéclencher un changement de pas (donc un nouveau tour), de sorte que le pire cas
 * converge vers un plancher structurel PARTAGÉ par de nombreux jeux de mantisses raisonnablement
 * denses (`[1,1.5,2,3,4,5,7,9]`, `[1,1.5,2,2.5,3,4,5,6,7,8,9]`, etc. donnent tous le même pire ratio
 * mesuré) — densifier encore au-delà n'aide plus (confirmé par balayage comparatif sur plusieurs
 * jeux candidats, plusieurs magnitudes/positions/étendues, voir `boiteMoustachesGraph.test.ts`) :
 * ce plancher tient à la boucle elle-même (position déjà corrigée par ailleurs, voir 12ᵉ piège), pas
 * à la densité de mantisses — au-delà d'un certain seuil de finesse, retenir le jeu le plus SIMPLE
 * parmi ceux qui l'atteignent, plutôt qu'un jeu inutilement dense.
 *
 * Le jeu retenu (8 mantisses, contre 3 par défaut) ramène le pire ratio observé sur un balayage
 * large (plusieurs magnitudes, étendues 4 à 30, décalages de position) de ×7,20 (1 ligne)/×7,50
 * (2 lignes) avec les mantisses par défaut à ×6,48/×4,20 — un ajustement raisonnable, pas une
 * élimination complète (demande explicite du prompt : "sans viser une precision extrême").
 */
export const MANTISSES_GRILLE_BOITE = [1, 1.5, 2, 3, 4, 5, 7, 9];

/** Ratio largeur/hauteur PROPRE à ce graphe (plus plat pour 1 seule ligne, un peu moins pour 2) —
 * jamais le `RATIO_GRAPHE` partagé du reste du projet, qui produirait un graphe inutilement carré
 * pour une boîte à moustaches.
 *
 * Resserré de `3,6`/`2,4` à `2,6`/`1,8` (retour utilisateur — le widget paraissait trop plat/bas à
 * l'écran) : à largeur de conteneur inchangée (`LARGEUR_MIN`/`LARGEUR_MAX`,
 * `components/BoiteMoustachesGraph.tsx`), la hauteur RÉELLEMENT rendue (`largeur/ratioGraphe`)
 * augmente d'environ 38 % (1 ligne) / 33 % (2 lignes). Sans risque pour `CIBLE_NOMBRE_LIGNES_Y_BOITE`
 * (8, voir sa doc) : cette cible a été calibrée pour une hauteur PLUS COURTE (67-200px) — une
 * hauteur plus généreuse ne fait qu'ajouter de la marge par ligne Y, jamais en retirer. */
export function ratioGraphe(nombreLignes: 1 | 2): number {
  return nombreLignes === 1 ? 2.6 : 1.8;
}

/** Ordonnée (unités de données, jamais pixel) de la ligne `index` — 0 = première/unique série, 1 =
 * seconde série (variante "comparaison"). La première ligne est toujours la plus haute (Y décroît
 * avec l'index). */
export function yLigne(index: number, nombreLignes: 1 | 2): number {
  return (nombreLignes - 1 - index) * ESPACEMENT_LIGNE;
}

export interface ViewBoxBoiteMoustaches {
  x: [number, number];
  y: [number, number];
}

/** Même principe que `ajusterAuRatio` (`ui/vecteurGraph.ts`, dupliquée pas importée — petite
 * fonction pure, jamais risquer une régression sur l'autre consommateur pour un partage marginal) :
 * élargit la dimension la plus étroite pour respecter le ratio demandé, jamais un rétrécissement. */
function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxBoiteMoustaches {
  const largeurX = x[1] - x[0];
  const largeurY = y[1] - y[0];
  const centreY = (y[0] + y[1]) / 2;
  if (largeurX / largeurY > ratio) {
    const demiLargeurY = largeurX / ratio / 2;
    return { x, y: [centreY - demiLargeurY, centreY + demiLargeurY] };
  }
  const centreX = (x[0] + x[1]) / 2;
  const demiLargeurX = (largeurY * ratio) / 2;
  return { x: [centreX - demiLargeurX, centreX + demiLargeurX], y };
}

/** ViewBox couvrant `bornePlage` en X et les `nombreLignes` lignes en Y, avec une marge fixe autour
 * de la boîte la plus haute/basse — puis ajusté au ratio propre à ce graphe. */
export function calculerViewBoxBoiteMoustaches(bornePlage: PlageAxe, nombreLignes: 1 | 2): ViewBoxBoiteMoustaches {
  const yMin = yLigne(nombreLignes - 1, nombreLignes) - DEMI_HAUTEUR_BOITE - MARGE_VERTICALE;
  const yMax = yLigne(0, nombreLignes) + DEMI_HAUTEUR_BOITE + MARGE_VERTICALE;
  return ajusterAuRatio([bornePlage.min, bornePlage.max], [yMin, yMax], ratioGraphe(nombreLignes));
}

/** Nettoie le bruit résiduel de virgule flottante (ex. `2.4000000000000004`) après un crantage à un
 * pas non entier — même principe que `formatEtiquetteGrille` (`mafsTransformation.ts`), appliqué ici
 * à une valeur numérique plutôt qu'à un texte d'étiquette. */
function nettoyerBruitFlottant(valeur: number): number {
  return Math.round(valeur * 1e9) / 1e9;
}

/** Accroche une valeur brute sur le multiple de `pas` le plus proche, borné à `[borneMin, borneMax]`
 * — jamais de valeur continue libre (même principe que `cranterHauteur`, "Regroupement en classes et
 * histogramme"). `pas` est additif et optionnel, défaut `1` (comportement historique
 * INCHANGÉ — accroche à l'entier le plus proche — pour tout appelant qui l'omet, notamment l'écran
 * "construction" de "Boîte à moustaches" lui-même) : introduit pour que la variante `classes` de
 * "Exercice de synthèse" puisse accrocher ses marqueurs à un pas de `0,1`, cohérent avec des
 * médiane/Q1/Q3 arrondis à 1 décimale (comme "Médiane" variante classes), plutôt que de les forcer à
 * l'entier — ce qui désynchroniserait la cible de la vraie lecture graphique du polygone. */
export function cranterValeur(xDonneeBrute: number, borneMin: number, borneMax: number, pas = 1): number {
  const valeurCrantee = nettoyerBruitFlottant(Math.round(xDonneeBrute / pas) * pas);
  return Math.max(borneMin, Math.min(borneMax, valeurCrantee));
}

/** Fabrique de fonction `constrain` pour `MovablePoint` — magnétisme HORIZONTAL uniquement : X
 * cranté au pas le plus proche (borné à `[borneMin, borneMax]`), Y toujours figé à `yFixe`. Un
 * marqueur de boîte à moustaches ne se déplace jamais verticalement — sa ligne (série) est fixée par
 * l'écran, pas par le geste de l'élève. `pas` additif et optionnel, défaut `1` — voir `cranterValeur`. */
export function snapHorizontal(yFixe: number, borneMin: number, borneMax: number, pas = 1) {
  return ([x]: readonly [number, number]): [number, number] => [cranterValeur(x, borneMin, borneMax, pas), yFixe];
}
