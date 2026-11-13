import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceDetectiveErreurs, IdDescription, LigneResolution, NatureValeur, TypeErreur } from "../core/detectiveErreurs.types";
import {
  DECIMALES,
  SCENARIOS,
  configuration,
  copieEleve,
  descriptionCorrecte,
  incoherence,
  indiceLigneFausse,
  nombreLatex,
  resolutionCorrecte,
  solutionAmbigue,
  triangleDeLaCopie,
  typeErreur,
  type ValeurAttendue,
} from "../moteur/modeleDetectiveErreurs";
import { champsAttendus } from "../moteur/verificationDetectiveErreurs";

/**
 * Textes de gen81 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; angles en degrés.
 */

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

export const NOTE_MEMOIRE =
  "Précision demandée : longueurs au centième, angles au dixième de degré. L'élève garde les valeurs exactes en mémoire de sa calculatrice : les nombres qu'il recopie sont arrondis.";

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

function liste(elements: string[]): FragmentConsigne[] {
  const f: FragmentConsigne[] = [];
  elements.forEach((el, i) => {
    if (i > 0) f.push(texte(i === elements.length - 1 ? " et " : ", "));
    f.push(latex(el));
  });
  return f;
}

/** « Dans le triangle ABC, on donne … On demande … » (ce que l'élève fictif devait faire). */
export function enonceTriangle(e: ExerciceDetectiveErreurs): FragmentConsigne[] {
  const d = e.donnees;
  const cm = (x: number) => `${x}\\text{ cm}`;
  let donnees: string[];
  let demandes: string[];
  switch (configuration(e)) {
    case "SAS":
      donnees = [`b = ${cm(d.b!)}`, `c = ${cm(d.c!)}`, `\\hat{A} = ${d.A}°`];
      demandes = ["a", "\\hat{B}", "\\hat{C}"];
      break;
    case "SSS":
      donnees = [`a = ${cm(d.a!)}`, `b = ${cm(d.b!)}`, `c = ${cm(d.c!)}`];
      demandes = ["\\hat{A}", "\\hat{B}", "\\hat{C}"];
      break;
    case "AAS":
      donnees = [`\\hat{A} = ${d.A}°`, `\\hat{B} = ${d.B}°`, `c = ${cm(d.c!)}`];
      demandes = ["\\hat{C}", "a", "b", "\\mathcal{A}"];
      break;
    case "SSA":
      donnees = [`\\hat{A} = ${d.A}°`, `a = ${cm(d.a!)}`, `b = ${cm(d.b!)}`];
      demandes = ["\\hat{B}", "\\hat{C}", "c"];
      break;
  }
  const aire = configuration(e) === "AAS" ? [texte(" (l'aire du triangle)")] : [];
  return [texte("Dans le triangle ABC, on donne "), ...liste(donnees), texte(". L'élève doit calculer "), ...liste(demandes), ...aire, texte(".")];
}

/** Une ligne de la copie (ou du corrigé), sans son numéro. */
export function fragmentsLigne(l: LigneResolution): FragmentConsigne[] {
  if (l.fragmentsLibres) return l.fragmentsLibres.map((f) => (f.type === "texte" ? texte(f.valeur) : latex(f.valeur)));
  const formule = l.resultat === null ? l.membres.join(" = ") : `${l.membres.join(" = ")} ${l.relation} ${l.resultat}`;
  const f: FragmentConsigne[] = [];
  if (l.prefixe) f.push(texte(l.prefixe));
  f.push(latex(formule));
  if (l.suffixe) f.push(texte(l.suffixe));
  return f;
}

export function lignesCopie(e: ExerciceDetectiveErreurs): FragmentConsigne[][] {
  return copieEleve(e).map(fragmentsLigne);
}

// ---------------------------------------------------------------------------------------------
// Valeurs
// ---------------------------------------------------------------------------------------------

const UNITE_LATEX: Record<NatureValeur, string> = { cote: "\\text{ cm}", carre: "", angle: "°", trig: "", aire: "\\text{ cm}^2", aucune: "" };
export const UNITE_TEXTE: Record<NatureValeur, string> = { cote: "cm", carre: "", angle: "°", trig: "", aire: "cm²", aucune: "" };
const PRECISION: Record<NatureValeur, string> = {
  cote: "au centième",
  carre: "au centième",
  angle: "au dixième de degré",
  trig: "au dix-millième",
  aire: "au centième",
  aucune: "",
};

/** « \hat{B} \approx 130{,}8° ». */
export function valeurLatex(v: ValeurAttendue): string {
  return `${v.quantite} \\approx ${nombreLatex(v.valeur, DECIMALES[v.nature])}${UNITE_LATEX[v.nature]}`;
}

export interface LibelleChamp {
  libelle: FragmentConsigne[];
  quantite: string;
  unite: string;
}

/** Libellés des champs de l'écran 3. */
export function libellesChamps(e: ExerciceDetectiveErreurs): LibelleChamp[] {
  const n = indiceLigneFausse(e) + 1;
  return champsAttendus(e).map((v, i) => {
    const debut =
      e.scenario === "G1"
        ? i === 0
          ? "Second angle possible"
          : "Côté du second triangle"
        : i === 0
          ? `Ligne ${n} corrigée`
          : `Résultat final corrigé (ligne ${SCENARIOS[e.scenario].nombreLignes})`;
    return { libelle: [texte(`${debut} (${PRECISION[v.nature]}) :`)], quantite: v.quantite, unite: UNITE_TEXTE[v.nature] };
  });
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceDetectiveErreurs): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const unChamp = champsAttendus(e).length === 1;
  const correction =
    e.scenario === "G1"
      ? [texte("Corrige la copie : donne le second angle possible pour "), latex("\\hat{B}"), texte(", puis le côté "), latex("c"), texte(" du second triangle.")]
      : unChamp
        ? [texte(`Corrige la ligne ${n} : donne sa bonne valeur.`)]
        : [texte(`Corrige la copie : donne la bonne valeur de la ligne ${n}, puis le résultat final de la dernière ligne, recalculé.`)];
  return [[texte("Quelle ligne de la copie est fausse ?")], [texte(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], correction];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

/** Expression trigonométrique évaluée sur la ligne fausse (pour la description « radians »). */
function trigLigneFausse(e: ExerciceDetectiveErreurs): string | null {
  const d = e.donnees;
  const l = copieEleve(e)[indiceLigneFausse(e)]!;
  switch (e.scenario) {
    case "R1":
    case "K1":
      return `\\cos ${d.A}°`;
    case "R2":
    case "A4":
      return `\\sin ${180 - d.A! - d.B!}°`;
    case "C1":
    case "C2":
    case "C3": {
      const angle = { A: d.A!, B: d.B!, C: 180 - d.A! - d.B! }[e.sousVariante as "A" | "B" | "C"];
      return `\\sin ${angle}°`;
    }
    case "O1":
    case "O2":
    case "O3":
    case "R3":
    case "G1":
      return l.membres[1] ?? null;
    default:
      return null;
  }
}

/** Fonction réciproque utilisée sur la ligne fausse. */
function reciproque(e: ExerciceDetectiveErreurs): string {
  return e.scenario === "R3" ? "\\cos^{-1}" : "\\sin^{-1}";
}

export function descriptionFragments(id: IdDescription, e: ExerciceDetectiveErreurs): FragmentConsigne[] {
  const q = copieEleve(e)[indiceLigneFausse(e)]!.quantite;
  switch (id) {
    case "obtus":
      return [texte("La touche "), latex(reciproque(e)), texte(" ne donne qu'un angle aigu, or "), latex(q), texte(" est obtus : il fallait prendre son supplémentaire, "), latex("180°"), texte(" moins cet angle.")];
    case "ambigu":
      return [texte("Deux angles entre "), latex("0°"), texte(" et "), latex("180°"), texte(" ont ce sinus et les deux conviennent : il y a deux triangles, la copie en oublie un.")];
    case "radians": {
      const t = trigLigneFausse(e);
      return t ? [texte("La calculatrice était en mode radians au lieu de degrés pour calculer "), latex(t), texte(".")] : [texte("La calculatrice était en mode radians au lieu de degrés sur cette ligne.")];
    }
    case "arrondi":
      return [latex(q), texte(" est arrondi trop tôt, et c'est cette valeur arrondie qui est réutilisée dans la suite.")];
    case "coteOppose":
      return [texte("Dans la loi des sinus, un côté est associé au sinus d'un angle qui ne lui est pas opposé.")];
    case "signe":
      return [texte("Dans la formule d'Al-Kashi, le signe du terme en cosinus est inversé.")];
    case "facteur":
      return [texte("Dans la formule d'Al-Kashi, le facteur 2 du terme en cosinus est oublié.")];
    case "plusMoins":
      return [texte("Une racine carrée a deux valeurs : il fallait garder aussi "), latex("a = -\\sqrt{\\ldots}"), texte(".")];
    case "inverseRapport":
      return [texte("Le rapport de la loi des sinus est écrit à l'envers : il fallait diviser le sinus par le côté.")];
    case "operation":
      return [texte("Il fallait diviser par le sinus de l'angle, et non multiplier.")];
    case "fonctionReciproque":
      return [texte("Il fallait utiliser "), latex("\\sin^{-1}"), texte(" et non "), latex("\\cos^{-1}"), texte(" pour retrouver l'angle.")];
    case "ordreCotes":
      return [texte("Les côtés sont mal placés dans la formule : ce n'est pas le côté opposé à l'angle cherché qui est soustrait.")];
  }
}

export const NOMS_COURTS: Record<IdDescription, string> = {
  obtus: "angle obtus pris pour l'angle aigu",
  ambigu: "second triangle oublié dans le cas ambigu",
  radians: "calculatrice en radians",
  arrondi: "arrondi trop tôt",
  coteOppose: "côté non opposé à l'angle dans la loi des sinus",
  signe: "signe inversé dans Al-Kashi",
  facteur: "facteur 2 oublié dans Al-Kashi",
  plusMoins: "",
  inverseRapport: "",
  operation: "",
  fonctionReciproque: "",
  ordreCotes: "",
};

export function nomErreur(e: ExerciceDetectiveErreurs): string {
  return NOMS_COURTS[descriptionCorrecte(e)];
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse : il reste toujours au moins un calcul ou un choix)
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: ExerciceDetectiveErreurs): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = SCENARIOS[e.scenario].nombreLignes;
  const [p, q] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [
      texte("Contrôle d'abord la cohérence de la copie : une longueur est positive, la somme des angles vaut "),
      latex("180°"),
      texte(", et le plus grand côté fait face au plus grand angle. Refais ensuite les calculs ligne par ligne à la calculatrice."),
    ],
    [texte(`L'erreur se trouve à la ligne ${p + 1} ou à la ligne ${q + 1}.`)],
  ];
}

const AIDES_ERREUR: Record<TypeErreur, FragmentConsigne[][]> = {
  obtus: [
    [texte("Combien d'angles entre "), latex("0°"), texte(" et "), latex("180°"), texte(" ont un même sinus ? Lequel la calculatrice donne-t-elle ?")],
    [texte("Le plus grand côté fait face au plus grand angle, et la somme des angles vaut "), latex("180°"), texte(" : vérifie ces deux contrôles avec l'angle de cette ligne.")],
  ],
  ambigu: [
    [texte("Combien d'angles entre "), latex("0°"), texte(" et "), latex("180°"), texte(" ont ce sinus ?")],
    [texte("Teste le second candidat : la somme de "), latex("\\hat{A}"), texte(" et de cet angle reste-t-elle inférieure à "), latex("180°"), texte(" ?")],
  ],
  radians: [
    [texte("Refais le calcul de cette ligne à ta calculatrice, en vérifiant le mode d'angle.")],
    [texte("Compare le résultat de la copie à celui que tu obtiens en mode radians.")],
  ],
  arrondi: [
    [texte("Regarde avec quelle précision le résultat de cette ligne est écrit.")],
    [texte("Compare cette précision à celle demandée, puis regarde quel nombre la ligne suivante réutilise.")],
  ],
  coteOppose: [
    [texte("Dans la loi des sinus, chaque côté va avec le sinus de l'angle qui lui fait face :"), latex("\\dfrac{a}{\\sin\\hat{A}} = \\dfrac{b}{\\sin\\hat{B}} = \\dfrac{c}{\\sin\\hat{C}}")],
    [texte("Vérifie, sur cette ligne, la lettre du côté et celle de l'angle utilisés ensemble.")],
  ],
  alKashi: [
    [texte("La formule d'Al-Kashi du cours s'écrit :"), latex("a^2 = b^2 + c^2 - 2bc\\cos\\hat{A}")],
    [texte("Compare-la, terme par terme, avec celle de la copie : le signe et le coefficient du terme en cosinus.")],
  ],
};

function aidesCorrection(e: ExerciceDetectiveErreurs): FragmentConsigne[][] {
  const correcte = resolutionCorrecte(e);
  const i = indiceLigneFausse(e);
  const premiere: FragmentConsigne[] =
    e.scenario === "G1"
      ? [texte("Le second candidat se calcule ainsi :"), latex(`\\hat{B}_2 = 180° - \\hat{B}_1 = 180° - ${nombreLatex(solutionAmbigue(e).B1, 1)}°`)]
      : [texte(`La ligne ${i + 1} corrigée se calcule ainsi :`), latex(correcte[i]!.membres.join(" = "))];
  if (champsAttendus(e).length === 1) {
    return [premiere, [texte("Contrôle ensuite ta réponse : la somme des trois angles doit valoir "), latex("180°"), texte(".")]];
  }
  const derniere =
    e.scenario === "G1"
      ? `c_2 = \\dfrac{a\\sin\\hat{C}_2}{\\sin\\hat{A}}, \\quad \\hat{C}_2 = 180° - \\hat{A} - \\hat{B}_2`
      : correcte[correcte.length - 1]!.membres.slice(0, 2).join(" = ");
  return [premiere, [texte("Reprends ensuite les lignes suivantes avec cette valeur, jusqu'à la dernière :"), latex(derniere)]];
}

export function aidesEcran(e: ExerciceDetectiveErreurs, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return AIDES_ERREUR[typeErreur(e)];
  return aidesCorrection(e);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse
// ---------------------------------------------------------------------------------------------

const COTES = ["a", "b", "c"];
const ANGLES = ["\\hat{A}", "\\hat{B}", "\\hat{C}"];

/** Contrôle qui trahit l'erreur (corrigé, étape a). */
export function constat(e: ExerciceDetectiveErreurs): FragmentConsigne[] {
  const copie = copieEleve(e);
  const i = indiceLigneFausse(e);
  const l = copie[i]!;
  const n = i + 1;
  const type = typeErreur(e);
  if (e.scenario === "G1") {
    const s = solutionAmbigue(e);
    return [
      texte("Un sinus correspond à deux angles entre "),
      latex("0°"),
      texte(" et "),
      latex("180°"),
      texte(" : "),
      latex(`${nombreLatex(s.B1, 1)}°`),
      texte(" et "),
      latex(`180° - ${nombreLatex(s.B1, 1)}° \\approx ${nombreLatex(s.B2, 1)}°`),
      texte(`. Or la ligne ${n} n'essaie pas le second, qui convient pourtant.`),
    ];
  }
  if (type === "arrondi") {
    return [texte(`À la ligne ${n}, `), latex(`${l.quantite} ${l.relation} ${l.resultat}`), texte(" est écrit avec une précision bien moins fine que celle demandée, et la ligne suivante réutilise ce nombre arrondi.")];
  }
  if (type === "coteOppose" || type === "alKashi") {
    return [texte(`À la ligne ${n}, la formule utilisée n'est pas celle du cours : `), latex(resolutionCorrecte(e)[i]!.membres.slice(0, 2).join(" = ")), texte(".")];
  }
  if (e.scenario === "R2") {
    return [texte(`La ligne ${n} donne `), latex(`k ${l.relation} ${l.resultat}`), texte(" : un rapport de longueurs négatif est impossible, et la suite donne des côtés négatifs.")];
  }
  if (e.scenario === "O2") {
    const t = triangleDeLaCopie(e)!;
    const somme = t.angles[0] + t.angles[1] + t.angles[2];
    return [texte("Dans la copie, la somme des angles vaut "), latex(`${nombreLatex(somme, 1)}°`), texte(" et non "), latex("180°"), texte(`. La ligne ${n} prend l'angle aigu donné par `), latex("\\sin^{-1}"), texte(".")];
  }
  if (e.scenario === "O1" || e.scenario === "O3") {
    const t = triangleDeLaCopie(e)!;
    const j = t.angles[0] > t.angles[2] ? 0 : 2;
    return [
      latex("b"),
      texte(" est le plus grand côté, donc "),
      latex("\\hat{B}"),
      texte(" doit être le plus grand angle ; or la copie donne "),
      latex(`\\hat{B} \\approx ${nombreLatex(t.angles[1], 1)}°`),
      texte(" et "),
      latex(`${ANGLES[j]} \\approx ${nombreLatex(t.angles[j]!, 1)}°`),
      texte(`. La ligne ${n} prend l'angle aigu donné par `),
      latex("\\sin^{-1}"),
      texte("."),
    ];
  }
  // Radians (R1, R3) : incohérence visible du triangle de la copie.
  const inc = incoherence(e);
  const t = triangleDeLaCopie(e)!;
  const debut: FragmentConsigne[] =
    inc?.nature === "ordre"
      ? [
          texte("Dans la copie, "),
          latex(`${COTES[inc.i]} > ${COTES[inc.j]}`),
          texte(" mais "),
          latex(`${ANGLES[inc.i]} < ${ANGLES[inc.j]}`),
          texte(" : le plus grand côté doit faire face au plus grand angle."),
        ]
      : inc?.nature === "angle"
        ? [texte("La copie obtient "), latex(`${ANGLES[inc.i]} \\approx ${nombreLatex(t.angles[inc.i]!, 1)}°`), texte(" : un angle négatif ou nul est impossible.")]
        : [texte("Les résultats de la copie ne forment pas un triangle cohérent.")];
  return [...debut, texte(` En refaisant les calculs, la ligne ${n} ne donne pas le même résultat en mode degrés.`)];
}

/** Piège ciblé (corrigé). */
export function piege(e: ExerciceDetectiveErreurs): FragmentConsigne[] {
  switch (typeErreur(e)) {
    case "obtus":
      return [latex("\\sin^{-1}"), texte(" ne renvoie que l'angle aigu. Après Al-Kashi, calcule les autres angles avec "), latex("\\cos^{-1}"), texte(" : aucune ambiguïté.")];
    case "ambigu":
      return [texte("Deux côtés et un angle non compris : teste toujours les deux candidats "), latex("\\hat{B}"), texte(" et "), latex("180° - \\hat{B}"), texte(".")];
    case "radians":
      return [texte("Vérifie toujours le mode degrés de la calculatrice avant un calcul de trigonométrie.")];
    case "arrondi":
      return [texte("Garde les valeurs exactes en mémoire de la calculatrice : n'arrondis que les résultats demandés.")];
    case "coteOppose":
      return [texte("Dans "), latex("\\dfrac{a}{\\sin\\hat{A}}"), texte(", le côté et l'angle portent la même lettre : ils se font face.")];
    case "alKashi":
      return [texte("Le terme correctif est "), latex("-2bc\\cos\\hat{A}"), texte(" : un signe moins et un facteur 2.")];
  }
}
