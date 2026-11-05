import type {
  ExerciceMoyennePonderee,
  ExerciceMoyennePondereeClasses,
  ExerciceMoyennePondereeDiscrete,
} from "../../core/moyennePonderee.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_SOMMES,
  LABEL_MOYENNE_BARRE,
  LABEL_SOMME_N,
  LABEL_SOMME_XN,
  consigneCentres,
  consigneQuotient,
  formatClasseTexte,
  formatEnonceTexte,
} from "../../ui/formatMoyennePonderee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoyennePonderee } from "./index";
import { avecVirgulesBelges, nombreFr, nombreFrLatex } from "../../ui/nombreFr";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceMoyennePonderee>` pour gen32 (Moyenne pondérée,
 * `AppMoyennePonderee.tsx`/`moteur/sessionMoyennePonderee.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question papier (dépend de la variante, `moteur/sessionMoyennePonderee.ts::phaseInitiale`) :**
 * - variante `"classes"` (3 écrans : `centres` → `sommes` → `quotient`) → 3 questions a) b) c) :
 *   a) centre de chaque classe, b) sommes intermédiaires Σ(xᵢ·nᵢ)/Σnᵢ, c) moyenne x̄.
 * - variante `"discrete"` (2 écrans, l'écran `centres` n'existe pas pour cette variante — les xᵢ
 *   sont déjà donnés) → 2 questions a) b) : a) sommes intermédiaires, b) moyenne x̄.
 * Consignes RÉUTILISÉES telles quelles depuis `ui/formatMoyennePonderee.ts` (`consigneCentres`,
 * `CONSIGNE_SOMMES`, `consigneQuotient`) — déjà le texte exact affiché à l'écran pour ces mêmes
 * consignes, jamais réécrites indépendamment ici (`consigneQuotient` retourne un `ConsigneSegmentee`
 * — avant/latex/après — converti en `FragmentConsigne[]` par `consigneQuotientFragments` ci-dessous,
 * simple changement de contrat texte, pas une nouvelle formulation).
 *
 * PAS `regroupable` : ni la condition "exactement une question par instance" (2 ou 3 selon la
 * variante, jamais 1) ni "consigne générique indépendante des valeurs tirées" (`consigneQuotient`/
 * `consigneCentres` mentionnent `exercice.contexte.unite`, propre à chaque instance) ne sont
 * remplies — voir la doc de `AdaptateurFeuilleExercices.regroupable` dans `genererFeuilleExercices.ts`.
 *
 * **Le tableau de données initial (xᵢ/nᵢ, ou classes) est une donnée FIXE affichée en permanence à
 * l'écran** (`EnonceMoyennePonderee.tsx`, avant chaque phase) — jamais reconstruite par l'élève,
 * contrairement à "Tableau de fréquences". Elle est donc affichée ici dans `enteteFragments`
 * (`formatDonneesDiscretesTexte`/`formatDonneesClassesTexte`, une liste "valeur (effectif n)"
 * séparée par des points-virgules, même principe que la liste brute de
 * `tableauFrequences/exportEvaluation.ts`) plutôt qu'en `enteteHtml` : ce dernier est réservé aux
 * contenus NON représentables en `FragmentConsigne` (graphiques SVG, voir la doc de `SectionExercice`
 * dans `genererFeuilleExercices.ts`) et surtout IGNORÉ par le pipeline docx
 * (`genererFeuilleExercices.ts::construireBlocCorrection`) — un tableau de données que l'élève doit
 * absolument voir pour répondre ne peut pas dépendre d'un pipeline qui l'ignore silencieusement.
 *
 * **Aucune zone de réponse vierge** (`QuestionExercice.reponse` omis partout, spec de la tâche) —
 * l'élève répond sur une feuille à part.
 *
 * **Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance** (`instance.n`,
 * `instance.sommeXN`, `instance.moyenne`, `classe.centre`), jamais recalculée indépendamment ici :
 * même donnée que celle vérifiée par `moteur/verificationMoyennePonderee.ts` côté écran. Rendue en
 * deux `BlocCorrection` de type `"tableau"` (voir `tableauFrequences/exportEvaluation.ts`/
 * `analyseFonction/exportWord.ts` pour le même patron — grandeurs en LIGNES, données tirées en
 * COLONNES, l'orientation la plus lisible sur une feuille imprimée pour ce type de tableau) : un
 * premier pour les centres de classe (variante `"classes"` uniquement), un second pour les produits
 * xᵢ·nᵢ ligne par ligne — puis deux paragraphes texte pour les sommes totales et le quotient final.
 * Rappel du piège "estimation" (voir `core/moyennePonderee.types.ts`) explicité dans la dernière
 * phrase pour la variante `"classes"` uniquement (la variante `"discrete"` donne une moyenne EXACTE).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Ligne à un index donné, sous la forme générique (x, n) — x est la valeur (variante "discrete")
 * ou le centre déjà connu (variante "classes") — même principe que `ligneAt`/`lignes` de
 * `components/EtapeSommesMoyennePonderee.tsx` (dupliqué ici, pas importé : `exportEvaluation.ts`
 * n'importe jamais `src/moteur/`/`src/components/`, même convention que les autres adaptateurs). */
function donneesLignes(instance: ExerciceMoyennePonderee): { x: number; n: number }[] {
  if (instance.variante === "discrete") {
    return instance.lignes.map((ligne) => ({ x: ligne.valeur, n: ligne.effectif }));
  }
  return instance.classes.map((classe) => ({ x: classe.centre, n: classe.effectif }));
}

function formatDonneesDiscretesTexte(instance: ExerciceMoyennePondereeDiscrete): string {
  return instance.lignes.map((ligne) => `${formatNombre(ligne.valeur)} (effectif ${formatNombre(ligne.effectif)})`).join(" ; ");
}

function formatDonneesClassesTexte(instance: ExerciceMoyennePondereeClasses): string {
  return instance.classes.map((classe, i) => `${formatClasseTexte(instance, i)} (effectif ${formatNombre(classe.effectif)})`).join(" ; ");
}

/** `consigneQuotient` (`ui/formatMoyennePonderee.ts`) retourne un `ConsigneSegmentee`
 * (avant/latex/après, patron JSX) — simple changement de contrat vers `FragmentConsigne[]`, jamais
 * une reformulation du texte lui-même. */
function consigneQuotientFragments(instance: ExerciceMoyennePonderee): FragmentConsigne[] {
  const consigne = consigneQuotient(instance);
  return [texte(consigne.avant), latex(consigne.latex), texte(consigne.apres)];
}

function construireEnonceMoyennePonderee(instance: ExerciceMoyennePonderee): SectionExercice {
  const donneesTexte = instance.variante === "discrete" ? formatDonneesDiscretesTexte(instance) : formatDonneesClassesTexte(instance);

  const questions: QuestionExercice[] = [];
  if (instance.variante === "classes") {
    questions.push({ consigne: [texte(consigneCentres(instance))] });
  }
  questions.push({ consigne: [texte(CONSIGNE_SOMMES)] });
  questions.push({ consigne: consigneQuotientFragments(instance) });

  return {
    enteteFragments: [texte(`${formatEnonceTexte(instance)} `), texte(donneesTexte), texte(".")],
    questions,
  };
}

function construireCorrectionMoyennePonderee(instance: ExerciceMoyennePonderee): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];
  let indexLettre = 0;
  const prochaineLettre = (): string => `${LETTRES[indexLettre++] ?? String(indexLettre)}) `;

  if (instance.variante === "classes") {
    blocs.push({ type: "paragraphe", fragments: [texte(`${prochaineLettre()}Centre de chaque classe :`)] });
    blocs.push({
      type: "tableau",
      libellesLignes: ["Classe", "Effectif", "Centre"],
      valeursParLigne: [
        instance.classes.map((_, i) => formatClasseTexte(instance, i)),
        instance.classes.map((classe) => formatNombre(classe.effectif)),
        instance.classes.map((classe) => formatNombre(classe.centre)),
      ],
    });
  }

  const donnees = donneesLignes(instance);
  blocs.push({ type: "paragraphe", fragments: [texte(`${prochaineLettre()}Sommes intermédiaires :`)] });
  blocs.push({
    type: "tableau",
    libellesLignes: [instance.variante === "classes" ? "Centre" : "Valeur", "Effectif", "Produit"],
    valeursParLigne: [
      donnees.map((ligne) => formatNombre(ligne.x)),
      donnees.map((ligne) => formatNombre(ligne.n)),
      donnees.map((ligne) => formatNombre(ligne.x * ligne.n)),
    ],
  });
  blocs.push({
    type: "paragraphe",
    fragments: [latex(LABEL_SOMME_N), texte(` = ${formatNombre(instance.n)}    `), latex(LABEL_SOMME_XN), texte(` = ${formatNombre(instance.sommeXN)}.`)],
  });

  const messageEstimation =
    instance.variante === "classes"
      ? " Attention : les valeurs exactes à l'intérieur de chaque classe sont inconnues — cette moyenne n'est donc qu'une ESTIMATION, jamais une valeur exacte."
      : "";
  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(prochaineLettre()),
      latex(
        `${LABEL_MOYENNE_BARRE} = \\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}} = \\dfrac{${formatNombre(instance.sommeXN)}}{${formatNombre(instance.n)}} = ${formatNombre(instance.moyenne)}`,
      ),
      texte(` ${instance.contexte.unite}.${messageEstimation}`),
    ],
  });

  return blocs;
}

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Tout
// vient de l'instance (lignes ou classes, n, sommeXN, moyenne — les champs de l'écran) ; nombres en
// notation belge (`nombreFr`/`nombreFrLatex`) — ces champs ne passent pas par `avecVirgulesBelges`,
// qui ne convertit que `construireEnonce`/`construireCorrection`. Étapes du corrigé = sous-questions
// de `construireEnonce` : (a) centres,) sommes, quotient.
// ============================================================================

interface LettresEtapes {
  centres?: string;
  sommes: string;
  quotient: string;
}

function lettresEtapes(instance: ExerciceMoyennePonderee): LettresEtapes {
  return instance.variante === "classes" ? { centres: "a", sommes: "b", quotient: "c" } : { sommes: "a", quotient: "b" };
}

function classeLatex(instance: ExerciceMoyennePondereeClasses, index: number): string {
  const classe = instance.classes[index];
  const fermante = index === instance.classes.length - 1 ? "]" : "[";
  return `[${nombreFrLatex(classe.borneInf)}\\,;\\,${nombreFrLatex(classe.borneSup)}${fermante}`;
}

function classeTexte(instance: ExerciceMoyennePondereeClasses, index: number): string {
  const classe = instance.classes[index];
  const fermante = index === instance.classes.length - 1 ? "]" : "[";
  return `[${nombreFr(classe.borneInf)} ; ${nombreFr(classe.borneSup)}${fermante}`;
}

function tableauLatex(rangees: [string, string[]][]): string {
  return `\\begin{array}{l|${"c".repeat(rangees[0][1].length)}} ${rangees.map(([tete, cellules]) => [tete, ...cellules].join(" & ")).join(" \\\\ \\hline ")} \\end{array}`;
}

/** Moyenne NON pondérée des valeurs (ou centres) — l'erreur la plus fréquente, citée dans le barème. */
function moyenneNonPonderee(instance: ExerciceMoyennePonderee): number {
  const xs = donneesLignes(instance).map((l) => l.x);
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
}

function echapperHtml(texteBrut: string): string {
  return texteBrut.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Données de l'énoncé papier en vrai tableau (valeurs ou classes en colonnes, effectifs dessous). */
function tableauDonneesHtml(instance: ExerciceMoyennePonderee): string {
  const td = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center"';
  const th = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:left;font-weight:600"';
  const entetes =
    instance.variante === "discrete"
      ? instance.lignes.map((l) => nombreFr(l.valeur))
      : instance.classes.map((_, i) => classeTexte(instance, i));
  const effectifs = donneesLignes(instance).map((l) => nombreFr(l.n));
  const premiere = instance.variante === "discrete" ? `Valeur (${instance.contexte.unite})` : `Classe (${instance.contexte.unite})`;
  const ligne = (tete: string, cellules: string[]) => `<tr><th ${th}>${echapperHtml(tete)}</th>${cellules.map((c) => `<td ${td}>${echapperHtml(c)}</td>`).join("")}</tr>`;
  return `<table style="border-collapse:collapse;margin:6px 0">${ligne(premiere, entetes)}${ligne("Effectif", effectifs)}</table>`;
}

/** ★ données discrètes (application directe) ; ★★ données groupées (centres, amplitudes inégales,
 * estimation). */
function difficulteMoyennePonderee(instance: ExerciceMoyennePonderee): 1 | 2 | 3 {
  return instance.variante === "classes" ? 2 : 1;
}

function reponseBreveMoyennePonderee(instance: ExerciceMoyennePonderee): FragmentConsigne[] {
  return [latex(`\\bar{x} = ${nombreFrLatex(instance.moyenne)}`), texte(` ${instance.contexte.unite}${instance.variante === "classes" ? " (estimation)" : ""}`)];
}

function correctionDetailleeMoyennePonderee(instance: ExerciceMoyennePonderee): EtapeCorrection[] {
  const l = lettresEtapes(instance);
  const etapes: EtapeCorrection[] = [];
  if (instance.variante === "classes" && l.centres) {
    etapes.push({ label: "Méthode", sousQuestion: l.centres, fragments: [texte("Le centre d'une classe est la moyenne de ses bornes : "), latex("c_i = \\dfrac{\\text{borne inf.} + \\text{borne sup.}}{2}"), texte(".")] });
    etapes.push({
      label: "Conclusion",
      sousQuestion: l.centres,
      fragments: [latex(tableauLatex([["\\text{Classe}", instance.classes.map((_, i) => classeLatex(instance, i))], ["c_i", instance.classes.map((c) => nombreFrLatex(c.centre))]]))],
    });
  }
  const donnees = donneesLignes(instance);
  const tete = instance.variante === "classes" ? "c_i" : "x_i";
  etapes.push({
    label: "Méthode",
    sousQuestion: l.sommes,
    fragments: [
      texte(`On multiplie chaque ${instance.variante === "classes" ? "centre" : "valeur"} par son effectif puis on additionne les produits ; `),
      latex(LABEL_SOMME_N),
      texte(" est la somme des effectifs."),
    ],
  });
  etapes.push({
    label: "Calcul",
    sousQuestion: l.sommes,
    fragments: [
      latex(
        tableauLatex([
          [tete, donnees.map((d) => nombreFrLatex(d.x))],
          ["n_i", donnees.map((d) => nombreFrLatex(d.n))],
          [`${tete} \\cdot n_i`, donnees.map((d) => nombreFrLatex(d.x * d.n))],
        ]),
      ),
    ],
  });
  etapes.push({
    label: "Conclusion",
    sousQuestion: l.sommes,
    fragments: [latex(`${LABEL_SOMME_N} = ${nombreFrLatex(instance.n)}`), texte(" ; "), latex(`${LABEL_SOMME_XN} = ${nombreFrLatex(instance.sommeXN)}`)],
  });
  etapes.push({
    label: "Calcul",
    sousQuestion: l.quotient,
    fragments: [latex(`${LABEL_MOYENNE_BARRE} = \\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}} = \\dfrac{${nombreFrLatex(instance.sommeXN)}}{${nombreFrLatex(instance.n)}} = ${nombreFrLatex(instance.moyenne)}`)],
  });
  etapes.push({
    label: "Conclusion",
    sousQuestion: l.quotient,
    fragments: [
      texte(`La moyenne vaut ${nombreFr(instance.moyenne)} ${instance.contexte.unite}`),
      texte(instance.variante === "classes" ? " — c'est une ESTIMATION : on ne connaît pas les valeurs exactes à l'intérieur des classes." : "."),
    ],
  });
  etapes.push({
    label: "Piège",
    sousQuestion: l.quotient,
    fragments: [
      texte(
        instance.variante === "classes"
          ? "Les classes n'ont pas toutes la même amplitude : chaque centre se calcule séparément, et on divise par n, la somme des effectifs — jamais par le nombre de classes."
          : `On divise par n = ${nombreFr(instance.n)}, la somme des effectifs — jamais par le nombre de valeurs distinctes (${nombreFr(donnees.length)}).`,
      ),
    ],
  });
  return etapes;
}

function baremeMoyennePonderee(instance: ExerciceMoyennePonderee): BaremeExercice {
  const l = lettresEtapes(instance);
  const classes = instance.variante === "classes";
  const tete = classes ? "c_i" : "x_i";
  const criteres: CritereBareme[] = [];
  if (classes && l.centres) criteres.push({ sousQuestion: l.centres, critere: [texte("Centre de chaque classe")], points: 1 });
  criteres.push({ sousQuestion: l.sommes, critere: [texte("Produits "), latex(`${tete} \\cdot n_i`)], points: 1 });
  criteres.push({
    sousQuestion: l.sommes,
    critere: [latex(`${LABEL_SOMME_N} = ${nombreFrLatex(instance.n)}`), texte(" et "), latex(`${LABEL_SOMME_XN} = ${nombreFrLatex(instance.sommeXN)}`)],
    points: classes ? 0.5 : 1,
  });
  criteres.push({ sousQuestion: l.quotient, critere: [latex(`${LABEL_MOYENNE_BARRE} = \\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}} = ${nombreFrLatex(instance.moyenne)}`)], points: 1 });
  criteres.push({
    sousQuestion: l.quotient,
    critere: [texte(classes ? "Unité et mention « estimation » (valeurs exactes inconnues dans les classes)" : "Unité donnée avec le résultat")],
    points: classes ? 0.5 : 1,
  });

  const erreurs: ErreurFrequente[] = [
    {
      description: [texte(`Moyenne des ${classes ? "centres" : "valeurs"} sans tenir compte des effectifs (on trouve ${nombreFr(moyenneNonPonderee(instance))})`)],
      cout: `0 pt en ${l.quotient}) et sur les produits`,
    },
    { description: [texte(`Division par le nombre de ${classes ? "classes" : "valeurs distinctes"} au lieu de n = ${nombreFr(instance.n)}`)], cout: `0 pt sur le calcul en ${l.quotient})` },
  ];
  if (classes && l.centres) erreurs.push({ description: [texte("Borne inférieure (ou supérieure) prise à la place du centre")], cout: `0 pt en ${l.centres}), suite notée sans double pénalité` });

  return {
    reponseFinale: reponseBreveMoyennePonderee(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Résultat laissé en fraction "), latex(`\\dfrac{${nombreFrLatex(instance.sommeXN)}}{${nombreFrLatex(instance.n)}}`), texte(" si elle est juste")], [texte("Calcul présenté en colonnes plutôt qu'en lignes")]],
  };
}

/** Énoncé papier : phrase de contexte, données en tableau, puis UNE consigne — calculer (ou estimer)
 * la moyenne ; centres, sommes et quotient sont les étapes de l'écran, reprises dans le corrigé. */
function enoncePapierMoyennePonderee(instance: ExerciceMoyennePonderee): EnoncePapier {
  const consigne =
    instance.variante === "classes"
      ? `Calcule une estimation de la moyenne de cette série (en ${instance.contexte.unite}).`
      : `Calcule la moyenne de cette série (en ${instance.contexte.unite}).`;
  return {
    section: {
      enteteFragments: [texte(formatEnonceTexte(instance))],
      enteteHtml: tableauDonneesHtml(instance),
      questions: [{ consigne: [texte(consigne)] }],
    },
    etapesParQuestion: [instance.variante === "classes" ? ["a", "b", "c"] : ["a", "b"]],
  };
}

const adaptateurEvaluationMoyennePondereeBrut: AdaptateurFeuilleExercices<ExerciceMoyennePonderee> = {
  titreDocument: "Moyenne pondérée — Évaluation",
  nomFichierBase: "moyenne-ponderee",
  genererInstance: genererExerciceMoyennePonderee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceMoyennePonderee,
  construireCorrection: construireCorrectionMoyennePonderee,
  difficulte: difficulteMoyennePonderee,
  reponseBreve: reponseBreveMoyennePonderee,
  correctionDetaillee: correctionDetailleeMoyennePonderee,
  bareme: baremeMoyennePonderee,
  enoncePapier: enoncePapierMoyennePonderee,
  dureeMinutes: 5,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationMoyennePonderee: AdaptateurFeuilleExercices<ExerciceMoyennePonderee> = avecVirgulesBelges(adaptateurEvaluationMoyennePondereeBrut);
