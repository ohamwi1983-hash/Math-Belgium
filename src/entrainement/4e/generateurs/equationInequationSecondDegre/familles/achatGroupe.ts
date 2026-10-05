/**
 * Couche A — famille Q "achatGroupe" (extension `ca355440-specgen55optimisationseconddegre.md`/
 * `f56fd11e-specgen56equationinequationseconddegre.md`, voir CLAUDE.md), SEULE famille
 * `voieSysteme=true` de ce générateur — introduit les 2 écrans "poserSysteme"/"eliminerSysteme".
 *
 * **Scénario** : un groupe organise un achat/une sortie collective — le montant total collecté `M`
 * (€) est FIXE, peu importe le nombre de participants. `x` = prix payé par personne (€), `y` =
 * nombre de participants — situation RÉELLE : `x·y=M`. Si `b` personnes de moins se joignaient, le
 * prix par personne augmenterait de `a` € pour collecter le MÊME montant `M` — situation
 * HYPOTHÉTIQUE : `(x+a)(y-b)=M`. Soustraire les 2 équations élimine le terme croisé `xy` :
 * `xy - [(x+a)(y-b)] = 0` ⟺ `xy - (xy - bx + ay - ab) = 0` ⟺ `ay - bx = ab` — relation LINÉAIRE
 * (écran "eliminerSysteme"), isolée en `y = (b/a)x + b` (écran "isolement", réutilisé de gen55,
 * `base.contrainte`), substituée dans `Montant(x)=x·y=(b/a)x²+bx` (écran "construction",
 * `base.fonction`) — jamais retravaillée en Couche A ici, cette étape appartient déjà aux composants
 * partagés `EtapeIsolementOptimisation`/`EtapeConstructionOptimisation`.
 *
 * **Propreté entière garantie par construction, "cible d'abord" à 3 paramètres** : `a`/`b`
 * (variations, entiers) et `m` (nombre RÉEL de participants, entier) choisis EN PREMIER, puis
 * `x*=a·m` (prix réel) et `y*=b·(m+1)` (participants réels, TOUJOURS entier) DÉRIVÉS —
 * `M=x*·y*=ab·m(m+1)` DÉRIVÉ, toujours entier. Vérifié directement : `x*·y*=M` ET
 * `(x*+a)(y*-b)=(am+a)(b(m+1)-b)=a(m+1)·bm=ab·m(m+1)=M` — les 2 équations du système sont donc
 * TOUTES DEUX satisfaites par ce même point `(x*,y*)`, qui sert d'ancrage de vérification
 * (`diagnostiquerEquivalenceQuadratiqueXY`, voir `moteur/verificationEquationInequationSecondDegre.ts`).
 * Seule fraction non entière de ce générateur (`base.fonction.a=b/a`, le coefficient directeur) — même
 * principe déjà établi pour `resistancesParallele.ts` (F) et `generateurs/optimisation/familles/materiauCoupe.ts`
 * (gen55/U) : documentée explicitement, jamais une régression de la convention "propreté entière"
 * (qui ne porte que sur `sommet`/`domaine`/`optimal`/`k`/racines, jamais sur `a`/`b`/`c`
 * eux-mêmes).
 *
 * **Racines — piège structurel, PAS un effet du domaine** : résoudre `Montant(x)=M`, soit
 * `(b/a)x²+bx-M=0`, multiplié par `a` : `bx²+abx-aM=0`, racines `x*=am` (positive, TOUJOURS valide)
 * et `-a(m+1)` (TOUJOURS strictement négative, donc TOUJOURS rejetée à l'écran "validation" — un
 * prix par personne ne peut jamais être négatif, `domaine=[0,x*+marge]`) — contrairement aux 7
 * autres familles, la variabilité de validité vient ici de la STRUCTURE algébrique elle-même, jamais
 * du domaine généré (toujours [0, x*+marge], jamais de "clip").
 *
 * **Équation UNIQUEMENT, jamais inéquation** (décision explicite de la spec, voir
 * `generateurs/equationInequationSecondDegre/index.ts::PAIRES_VALIDES`) — un système à résoudre par
 * substitution/élimination n'a pas de pendant "inéquation" pédagogiquement sensé pour ce générateur.
 */
import type { ExerciceEquationSecondDegre } from "../../../core/equationInequationSecondDegre.types";
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../../optimisation/optimum";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "../interpretation";
import { randomInt } from "../aleatoire";

interface SkinAchatGroupe {
  phraseEnonce: (M: number, a: number, b: number) => string;
}

// 3 skins sourcés dans de vrais sujets d'examen (manuel Actimath 4 UAA5, confirmés par
// `promptrestructurationgenequationinequation.md`) — mêmes mécanique/dérivation, seule la
// narration diffère : achat de vases (pb15), commande de lampes (pb16), transport scolaire en bus
// (pb11). M/a/b restent générés dynamiquement par `construireAchatGroupe`, jamais figés.
const SKINS: SkinAchatGroupe[] = [
  { phraseEnonce: (M, a, b) => `Une classe achète des vases identiques pour un cadeau collectif ; le montant total collecté est toujours de ${M} €, peu importe le nombre d'élèves participants. Si ${b} élèves de moins participaient, chaque part coûterait ${a} € de plus.` },
  { phraseEnonce: (M, a, b) => `Une entreprise commande des lampes identiques pour un montant total de ${M} €, réparti à parts égales entre les commandes reçues. Si elle avait reçu ${b} commandes de moins, le prix par commande augmenterait de ${a} €.` },
  { phraseEnonce: (M, a, b) => `Une école affrète un bus pour un transport scolaire dont le coût total est de ${M} €, partagé à parts égales entre les élèves inscrits. Si ${b} élèves de moins s'étaient inscrits, le prix par élève aurait augmenté de ${a} €.` },
];

const A_MIN = 2;
const A_MAX = 6;
const B_MIN = 2;
const B_MAX = 6;
const M_PARTICIPANTS_MIN = 3;
const M_PARTICIPANTS_MAX = 8;
const MARGE_MIN = 2;
const MARGE_MAX = 6;

export function construireAchatGroupe(): ExerciceEquationSecondDegre {
  const a = randomInt(A_MIN, A_MAX);
  const b = randomInt(B_MIN, B_MAX);
  const m = randomInt(M_PARTICIPANTS_MIN, M_PARTICIPANTS_MAX);

  const xReel = a * m;
  const yReel = b * (m + 1);
  const M = xReel * yReel;

  const fonction = { a: b / a, b, c: 0 };
  const sommet = { x: -a / 2, y: fonction.a * (a / 2) * (a / 2) - fonction.b * (a / 2) };

  const domaine = { inf: 0, sup: xReel + randomInt(MARGE_MIN, MARGE_MAX) };
  const sommetDansDomaine = sommetDansIntervalle(sommet.x, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "achatGroupe",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(M, a, b),
      labelVariable: "x",
      nomVariable: "le prix par personne",
      nomGrandeur: "le montant total collecté",
      uniteVariable: "€",
      uniteGrandeur: "€",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    contrainte: {
      enonceLatex: `${a}y - ${b}x = ${a * b}`,
      lettreCherchee: "y",
      pente: fonction.a,
      ordonnee: b,
    },
    // Montant(x,y) = x·y — sert UNIQUEMENT à l'affichage de l'accolade de l'écran "systeme"
    // (`formatSystemeAccoladeLatex`, réutilisé de gen55) : `voieSysteme` saute l'écran
    // "contrainteEtGrandeur" (les 2 équations viennent déjà des écrans 0a/0b), donc
    // `diagnostiquerGrandeurXY` n'est jamais appelée pour cette famille.
    formuleGrandeurXYTexte: "x*y",
    optionsInterpretation: [],
  };

  const racinesCandidates: [number, number] = [-a * (m + 1), xReel];
  const racinesValides = [xReel];
  const racinesRejetees = [-a * (m + 1)];
  const k = M;

  return {
    variante: "equation",
    famille: "achatGroupe",
    base,
    k,
    voieSysteme: true,
    systeme: { M, a, b },
    racinesCandidates,
    racinesValides,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "equation",
      labelVariable: "x",
      nomGrandeur: "le montant total collecté",
      genreGrandeur: "masculin",
      k,
      uniteGrandeur: "€",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "equation",
      labelVariable: "x",
      nomGrandeur: "le montant total collecté",
      genreGrandeur: "masculin",
      uniteVariable: "€",
      uniteGrandeur: "€",
      uniteGrandeurFautive: "personnes",
      k,
      racinesValides,
      racinesRejetees,
    }),
  };
}
