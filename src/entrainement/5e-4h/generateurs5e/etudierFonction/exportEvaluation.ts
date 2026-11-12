import type { RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction } from "../../core5e/etudierFonction.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import {
  formatCoordonneesLatex,
  formatDomaineLatex,
  formatFDeXLatex,
  formatFPrimeDeXLatex,
  formatFSecondeDeXLatex,
  formatLimiteCibleLatex,
  formatOrdonneeLatex,
  formatReponseAttenduePhaseLatex,
  formatResumeTableauLatex,
} from "../../ui5e/formatEtudierFonction";
import { libelleLigne2Tableau } from "../../ui5e/formatEtudeLocale";
import { calculerViewBoxEtudierFonction } from "../../ui5e/etudierFonctionCourbe";
import { ordreEcransEtudierFonction, type EcranEtudierFonction } from "../../moteur5e/typesEtudierFonction";
import {
  classificationFPrime,
  decalageVertical,
  exclusionsCE,
  listeSlotsLimites,
  pointsClesEtudierFonction,
  racinesFPrime,
  racinesFSeconde,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  typeAsymptotique,
  valeurF,
} from "../../moteur5e/verificationEtudierFonction";
import type { TableauEtudeLocaleAttendu } from "../../moteur5e/verificationEtudeLocale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction } from "./index";
import { LIBELLE_CAS_ETUDIER_FONCTION, profilEtudierFonction } from "../profilsEvaluationDerivees31-33";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudierFonction>` pour 5gen31 (« Étudier une
 * fonction », chapitre 5 de 5e « Dérivées et applications ») — feuille d'exercices et évaluation,
 * selon `.claude/rules/feuilles-evaluations.md`.
 *
 * - **Énoncé papier** (`enoncePapier`) = la fonction + 4 VRAIES questions du problème (domaine et
 *   asymptotes ; f′ et variations ; f″ et concavité ; coordonnées des points remarquables et allure
 *   du graphique). Aucune ne révèle la réponse d'une autre (pas de « la valeur exclue x = … », pas de
 *   nombre d'extremums annoncé).
 * - **Étapes** (`construireEnonce`) = un écran du générateur par étape, dans l'ordre de l'écran
 *   (`ordreEcransEtudierFonction`, écran « recap » purement présentationnel exclu) : elles
 *   deviennent les titres « Étape n — consigne » du corrigé.
 * - **Corrigé** tiré des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `formatResumeTableauLatex`, `formatCoordonneesLatex`, `tableauFPrimeAttendu`…, `valeurF` qui
 *   inclut le décalage vertical des rationnelles). Les deux tableaux de signes et le graphique
 *   (courbe, asymptotes, points remarquables) sont donnés en figures (`figureHtml`).
 */

const LETTRES = "abcdefghij";

/** Étapes = écrans du générateur, sans l'écran « recap » (aucune nouvelle question). */
function etapes(exercice: ExerciceEtudierFonction): EcranEtudierFonction[] {
  return ordreEcransEtudierFonction(exercice).filter((e) => e !== "recap");
}

function lettreDe(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string {
  return LETTRES[etapes(exercice).indexOf(ecran)] ?? "a";
}

function fonctionFragments(exercice: ExerciceEtudierFonction): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatFDeXLatex(exercice)), texte(".")];
}

// ============================================================================
// Étapes (une par écran) — consignes rédigées pour le papier (rien de propre à la saisie).
// ============================================================================

function consigneEtape(ecran: EcranEtudierFonction): FragmentConsigne[] {
  switch (ecran) {
    case "domaine":
      return [texte("Détermine le domaine de définition de f.")];
    case "limites":
      return [texte("Calcule les limites de f aux bornes de son domaine et en −∞ et +∞ ; donne l'équation de chaque asymptote.")];
    case "calculerFPrime":
      return [texte("Calcule "), latex("f'(x)"), texte(".")];
    case "tableauFPrime":
      return [texte("Dresse le tableau de signes de "), latex("f'"), texte(" et déduis-en les variations de f (nature de chaque zéro de "), latex("f'"), texte(").")];
    case "calculerFSeconde":
      return [texte("Calcule "), latex("f''(x)"), texte(".")];
    case "tableauFSeconde":
      return [texte("Dresse le tableau de signes de "), latex("f''"), texte(" et déduis-en la concavité de f (points d'inflexion).")];
    case "coordonnees":
      return [texte("Calcule les coordonnées des points remarquables de f.")];
    case "graphique":
      return [texte("Trace l'allure du graphique de f.")];
    case "recap":
      return [];
  }
}

function construireEnonceEtudierFonction(exercice: ExerciceEtudierFonction): SectionExercice {
  return { enteteFragments: fonctionFragments(exercice), questions: etapes(exercice).map((e) => ({ consigne: consigneEtape(e) })) };
}

/** 4 vraies questions : (domaine +) limites | f′ + tableau | f″ + tableau | coordonnées + graphique. */
function enoncePapierEtudierFonction(exercice: ExerciceEtudierFonction): EnoncePapier {
  const l = (e: EcranEtudierFonction) => lettreDe(exercice, e);
  const avecDomaine = etapes(exercice).includes("domaine");
  return {
    section: {
      enteteFragments: [...fonctionFragments(exercice), texte(" Étudie cette fonction.")],
      questions: [
        { consigne: [texte("Détermine le domaine de définition de f, puis les limites de f aux bornes de son domaine et en −∞ et +∞. Donne l'équation de chaque asymptote éventuelle.")] },
        { consigne: [texte("Calcule "), latex("f'(x)"), texte(", dresse son tableau de signes et déduis-en les variations de f ainsi que la nature de chaque zéro de "), latex("f'"), texte(".")] },
        { consigne: [texte("Calcule "), latex("f''(x)"), texte(", dresse son tableau de signes et déduis-en la concavité de f et ses éventuels points d'inflexion.")] },
        { consigne: [texte("Calcule les coordonnées des points remarquables de f (extremums, points d'inflexion et point d'abscisse 0), puis trace l'allure du graphique de f.")] },
      ],
    },
    etapesParQuestion: [avecDomaine ? [l("domaine"), l("limites")] : [l("limites")], [l("calculerFPrime"), l("tableauFPrime")], [l("calculerFSeconde"), l("tableauFSeconde")], [l("coordonnees"), l("graphique")]],
    reponseBreve: reponseBreveEtudierFonction(exercice, true),
  };
}

// ============================================================================
// Valeurs communes.
// ============================================================================

function nombreLatex(v: number): string {
  return formatOrdonneeLatex(v);
}

/** Équations des asymptotes (verticales, puis horizontale ou oblique) — ou « aucune asymptote ». */
function asymptotesLatex(exercice: ExerciceEtudierFonction): string[] {
  const out = exclusionsCE(exercice).map((x) => `x=${nombreLatex(x)}`);
  for (const slot of listeSlotsLimites(exercice)) {
    if (slot.kind === "infiniHorizontale") out.push(`y=${nombreLatex(slot.valeur)}`);
    if (slot.kind === "infiniOblique") out.push(`y=${formatLimiteCibleLatex(slot)}`);
  }
  return out;
}

function joindre(valeurs: string[], separateur = " ; "): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => (i === 0 ? [latex(v)] : [texte(separateur), latex(v)]));
}

/** Racine en texte simple (en-têtes des tableaux HTML du corrigé) : « 1/2 », « 1 − √2 ». */
function racineTexte(r: RacineEtudeLocale): string {
  const moins = (s: string) => s.replace(/-/g, "−");
  if (r.exact) return moins(r.valeur.den === 1 ? `${r.valeur.num}` : `${r.valeur.num}/${r.valeur.den}`);
  const racine = `√${r.radicande}`;
  if (r.centre === 0) return r.signe < 0 ? `−${racine}` : racine;
  return `${moins(`${r.centre}`)} ${r.signe < 0 ? "−" : "+"} ${racine}`;
}

function nombreTexte(v: number): string {
  return formatOrdonneeLatex(v).replace("{,}", ",").replace(/-/g, "−");
}

// ============================================================================
// Figures du corrigé : tableaux de signes (HTML) et graphique (SVG).
// ============================================================================

const STYLE_TABLE = 'style="border-collapse:collapse;margin:4px 0;font-size:13px;font-family:Archivo, Arial, Helvetica, sans-serif"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center;min-width:22px"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:left;background:#f1f3f5;font-style:italic"';

function tableauHtml(exercice: ExerciceEtudierFonction, attendu: TableauEtudeLocaleAttendu, mode: "fprime" | "fseconde"): string {
  const racines = mode === "fprime" ? racinesFPrime(exercice) : racinesFSeconde(exercice);
  const exclusions = exclusionsCE(exercice);
  const entetes = attendu.colonnes.map((c) => (c.type === "racine" ? racineTexte(racines[c.index]) : c.type === "exclusion" ? nombreTexte(exclusions[c.index]) : ""));
  const ligne2 = attendu.ligne2.map((v, j) => {
    if (attendu.colonnes[j].type === "exclusion") return "‖";
    const t = libelleLigne2Tableau(v);
    return t === "PI" ? "point d'inflexion" : t === "pas de PI" ? "pas d'inflexion" : t;
  });
  const signes = attendu.signes.map((s) => (s === "-" ? "−" : s));
  const cases = (valeurs: string[]) => valeurs.map((v) => `<td ${STYLE_CASE}>${v}</td>`).join("");
  const ligne = (titre: string, valeurs: string[], bords: [string, string]) => `<tr><td ${STYLE_ENTETE}>${titre}</td><td ${STYLE_CASE}>${bords[0]}</td>${cases(valeurs)}<td ${STYLE_CASE}>${bords[1]}</td></tr>`;
  const titreSigne = mode === "fprime" ? "f′(x)" : "f″(x)";
  const titreLigne2 = mode === "fprime" ? "f" : "concavité de f";
  return `<table ${STYLE_TABLE}><tbody>${ligne("x", entetes, ["−∞", "+∞"])}${ligne(titreSigne, signes, ["", ""])}${ligne(titreLigne2, ligne2, ["", ""])}</tbody></table>`;
}

const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#c92a2a";
const LARGEUR_SVG = 360;
const HAUTEUR_SVG = 260;
const MARGE_SVG = 10;

function texteSvg(x: number, y: number, contenu: string, ancre: "start" | "end" | "middle", couleur: string): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

function construireSvgEtudierFonction(exercice: ExerciceEtudierFonction): string {
  const vbEcran = calculerViewBoxEtudierFonction(exercice);
  const vb = { xMin: vbEcran.x[0], xMax: vbEcran.x[1], yMin: vbEcran.y[0], yMax: vbEcran.y[1] };
  const etendue = vb.yMax - vb.yMin;
  const exclusions = exclusionsCE(exercice);
  const evaluer = (x: number): number | null => {
    if (exclusions.some((e) => Math.abs(x - e) < 1e-6)) return null;
    const y = valeurF(exercice, x);
    return Number.isFinite(y) && y > vb.yMin - 6 * etendue && y < vb.yMax + 6 * etendue ? y : null;
  };
  const type = typeAsymptotique(exercice);
  const slots = listeSlotsLimites(exercice);
  const oblique = slots.find((s) => s.kind === "infiniOblique");
  const droite =
    type === "horizontale"
      ? (_x: number) => decalageVertical(exercice)
      : oblique && oblique.kind === "infiniOblique"
        ? (x: number) => oblique.pente * x + oblique.ordonnee
        : null;
  const points: PointMarqueSvg[] = pointsClesEtudierFonction(exercice).map((p, i) => ({
    x: p.x,
    y: p.y,
    label: `(${p.racine ? racineTexte(p.racine) : nombreTexte(p.x)} ; ${nombreTexte(p.y)})`,
    couleur: COULEUR_COURBE,
    labelPosition: i % 2 === 0 ? "dessus" : "dessous",
  }));
  const svg = construireSvgFonction(evaluer, vb, {
    largeur: LARGEUR_SVG,
    hauteur: HAUTEUR_SVG,
    couleurCourbe: COULEUR_COURBE,
    classe: "figure-corrige",
    points,
    courbesSecondaires: droite ? [{ evaluer: droite, couleur: COULEUR_ASYMPTOTE, pointilles: true }] : undefined,
    legende: [{ texte: "courbe de f", couleur: COULEUR_COURBE }, ...(droite || exclusions.length > 0 ? [{ texte: "asymptotes", couleur: COULEUR_ASYMPTOTE, pointilles: true }] : [])],
  });
  const zoneX = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - vb.xMin) / (vb.xMax - vb.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((vb.yMax - y) / (vb.yMax - vb.yMin)) * zoneY;
  const ajouts: string[] = [];
  // Raccord fin près de chaque asymptote verticale (240 échantillons ne suffisent pas près d'un pôle).
  const pas = (vb.xMax - vb.xMin) / 240;
  const borne = (y: number) => Math.min(Math.max(y, vb.yMin - etendue), vb.yMax + etendue);
  for (const e of exclusions) {
    for (const cote of [-1, 1]) {
      const pts: string[] = [];
      for (let d = 1.5 * pas; d > 1e-7; d *= 0.8) {
        const y = valeurF(exercice, e + cote * d);
        if (!Number.isFinite(y)) break;
        pts.push(`${sx(e + cote * d).toFixed(1)},${sy(borne(y)).toFixed(1)}`);
        if (y < vb.yMin - etendue || y > vb.yMax + etendue) break;
      }
      if (pts.length > 1) ajouts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`);
    }
    const X = sx(e);
    ajouts.push(`<line x1="${X.toFixed(1)}" y1="${MARGE_SVG}" x2="${X.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
    ajouts.push(texteSvg(X + 4, HAUTEUR_SVG - MARGE_SVG - 6, `x = ${nombreTexte(e)}`, "start", COULEUR_ASYMPTOTE));
  }
  if (droite) {
    const xe = vb.xMax - (vb.xMax - vb.xMin) * 0.03;
    const ye = Math.min(Math.max(droite(xe), vb.yMin + etendue * 0.06), vb.yMax - etendue * 0.06);
    const eq = asymptotesLatex(exercice)
      .filter((a) => a.startsWith("y="))
      .map((a) => a.replace("y=", "y = ").replace(/\{,\}/g, ",").replace(/-/g, "−"))[0];
    const fe = valeurF(exercice, xe);
    const courbeAuDessus = Number.isFinite(fe) && fe > droite(xe);
    if (eq) ajouts.push(texteSvg(sx(xe), sy(ye) + (courbeAuDessus ? 14 : -6), eq, "end", COULEUR_ASYMPTOTE));
  }
  return svg.replace("</svg>", `${ajouts.join("")}</svg>`);
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesEtape(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): EtapeCorrection[] {
  const sq = lettreDe(exercice, ecran);
  const avecDomaine = etapes(exercice).includes("domaine");
  switch (ecran) {
    case "domaine":
      return [
        { label: "Méthode", sousQuestion: sq, fragments: [texte("Les valeurs interdites sont celles qui annulent le dénominateur.")] },
        { label: "Calcul", sousQuestion: sq, fragments: [latex(formatDomaineLatex(exercice)), texte(".")] },
      ];
    case "limites": {
      const lignes: EtapeCorrection[] = [];
      if (!avecDomaine) lignes.push({ label: "Domaine", sousQuestion: sq, fragments: [latex(formatDomaineLatex(exercice)), texte(" (aucune valeur interdite).")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [...joindre(formatReponseAttenduePhaseLatex(exercice, "limites")), texte(".")] });
      const asym = asymptotesLatex(exercice);
      lignes.push({
        label: "Conclusion",
        sousQuestion: sq,
        fragments: asym.length === 0 ? [texte("Les limites en −∞ et +∞ sont infinies et f est définie sur ℝ : aucune asymptote.")] : [texte("Asymptotes : "), ...joindre(asym), texte(".")],
      });
      if (exercice.famille === "rationnelleAO") {
        lignes.push({ label: "Piège", sousQuestion: sq, fragments: [texte("Le terme fraction tend vers 0 en ±∞ : l'asymptote oblique est la partie affine seule.")] });
      }
      return lignes;
    }
    case "calculerFPrime":
      return [
        { label: "Méthode", sousQuestion: sq, fragments: [texte(exercice.famille === "etudeLocale" && exercice.noyau.type === "polynomiale" ? "Dérivée d'un polynôme, terme à terme." : "Règle du quotient (ou dérivée de la fraction terme à terme).")] },
        { label: "Calcul", sousQuestion: sq, fragments: [latex(formatFPrimeDeXLatex(exercice)), texte(".")] },
      ];
    case "tableauFPrime": {
      const racines = racinesFPrime(exercice);
      const tableau = tableauFPrimeAttendu(exercice);
      return [
        {
          label: "Calcul",
          sousQuestion: sq,
          fragments: racines.length === 0 ? [latex("f'"), texte(" ne s'annule pas.")] : [texte("Zéros de "), latex("f'"), texte(" : "), ...joindre(racines.map((r) => `x=${formatReponseRacine(r)}`)), texte(".")],
        },
        { label: "Conclusion", sousQuestion: sq, fragments: [...joindre(formatResumeTableauLatex(exercice, "fprime")), texte(".")], figureHtml: tableauHtml(exercice, tableau, "fprime") },
        ...(classificationFPrime(exercice).includes("ni_lun_ni_lautre")
          ? [{ label: "Piège", sousQuestion: sq, fragments: [texte("Une racine double de "), latex("f'"), texte(" : le signe ne change pas, ce n'est pas un extremum.")] }]
          : []),
      ];
    }
    case "calculerFSeconde":
      return [{ label: "Calcul", sousQuestion: sq, fragments: [texte("On dérive "), latex("f'(x)"), texte(" : "), latex(formatFSecondeDeXLatex(exercice)), texte(".")] }];
    case "tableauFSeconde": {
      const racines = racinesFSeconde(exercice);
      const tableau = tableauFSecondeAttendu(exercice);
      return [
        {
          label: "Calcul",
          sousQuestion: sq,
          fragments: racines.length === 0 ? [latex("f''"), texte(" ne s'annule pas.")] : [texte("Zéros de "), latex("f''"), texte(" : "), ...joindre(racines.map((r) => `x=${formatReponseRacine(r)}`)), texte(".")],
        },
        { label: "Conclusion", sousQuestion: sq, fragments: [...joindre(formatResumeTableauLatex(exercice, "fseconde")), texte(".")], figureHtml: tableauHtml(exercice, tableau, "fseconde") },
      ];
    }
    case "coordonnees":
      return [
        { label: "Méthode", sousQuestion: sq, fragments: [texte("On remplace x par l'abscisse de chaque point dans f(x) (et non dans f′(x)).")] },
        { label: "Calcul", sousQuestion: sq, fragments: [...joindre(formatCoordonneesLatex(exercice)), texte(".")] },
      ];
    case "graphique":
      return [{ label: "Graphique", sousQuestion: sq, fragments: [texte("Courbe passant par les points remarquables, avec ses asymptotes et le sens de variation trouvé.")], figureHtml: construireSvgEtudierFonction(exercice) }];
    case "recap":
      return [];
  }
}

function formatReponseRacine(r: RacineEtudeLocale): string {
  if (r.exact) return r.valeur.den === 1 ? `${r.valeur.num}` : `${r.valeur.num < 0 ? "-" : ""}\\dfrac{${Math.abs(r.valeur.num)}}{${r.valeur.den}}`;
  const racine = `\\sqrt{${r.radicande}}`;
  if (r.centre === 0) return r.signe < 0 ? `-${racine}` : racine;
  return `${r.centre}${r.signe < 0 ? "-" : "+"}${racine}`;
}

function correctionDetailleeEtudierFonction(exercice: ExerciceEtudierFonction): EtapeCorrection[] {
  return etapes(exercice).flatMap((e) => lignesEtape(exercice, e));
}

function reponseBreveEtudierFonction(exercice: ExerciceEtudierFonction, parQuestion = false): FragmentConsigne[] {
  const asym = asymptotesLatex(exercice);
  const morceaux: FragmentConsigne[][] = [
    [latex(formatDomaineLatex(exercice)), texte(" ; "), ...(asym.length === 0 ? [texte("aucune asymptote")] : [texte("asymptotes "), ...joindre(asym, ", ")])],
    [latex(formatFPrimeDeXLatex(exercice)), texte(" ; "), ...joindre(formatResumeTableauLatex(exercice, "fprime"), ", ")],
    [latex(formatFSecondeDeXLatex(exercice)), texte(" ; "), ...joindre(formatResumeTableauLatex(exercice, "fseconde"), ", ")],
    [...joindre(formatCoordonneesLatex(exercice), ", ")],
  ];
  return morceaux.flatMap((m, i) => [...(i > 0 ? [texte(" — ")] : []), ...(parQuestion ? [texte(`${LETTRES[i]}) `)] : []), ...m]);
}

function baremeEtudierFonction(exercice: ExerciceEtudierFonction): BaremeExercice {
  const l = (e: EcranEtudierFonction) => lettreDe(exercice, e);
  const avecDomaine = etapes(exercice).includes("domaine");
  const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
  return {
    reponseFinale: reponseBreveEtudierFonction(exercice, true),
    criteres: [
      c(avecDomaine ? l("domaine") : l("limites"), "Domaine, limites aux bornes et équations des asymptotes", 1),
      c(l("calculerFPrime"), "f′(x) correcte", 0.5),
      c(l("tableauFPrime"), "Tableau de signes de f′, variations et nature des zéros", 0.5),
      c(l("calculerFSeconde"), "f″(x) correcte", 0.5),
      c(l("tableauFSeconde"), "Tableau de signes de f″ et concavité (points d'inflexion)", 0.5),
      c(l("coordonnees"), "Coordonnées des points remarquables", 0.5),
      c(l("graphique"), "Allure du graphique cohérente (points, asymptotes, variations)", 0.5),
    ],
    erreursFrequentes: [
      { description: [texte("Classer une racine double de f′ comme extremum")], cout: "0 pt sur le tableau de f′" },
      { description: [texte("Calculer l'ordonnée d'un point dans f′(x) au lieu de f(x)")], cout: "0 pt sur les coordonnées" },
      ...(exercice.famille === "rationnelleAO" ? [{ description: [texte("Inclure la fraction dans l'équation de l'asymptote oblique")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[texte("Ordonnées exactes ou arrondies au centième ; f′ et f″ sous une forme équivalente (développée ou factorisée)")]],
  };
}

function difficulteEtudierFonction(exercice: ExerciceEtudierFonction): 1 | 2 | 3 {
  if (exercice.famille === "rationnelleAO") return 3;
  return exercice.noyau.type === "polynomiale" ? 2 : 3;
}

/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionEtudierFonction(exercice: ExerciceEtudierFonction): BlocCorrection[] {
  return correctionDetailleeEtudierFonction(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationEtudierFonction: AdaptateurFeuilleExercices<ExerciceEtudierFonction> = {
  titreDocument: "Étudier une fonction — Dérivées et applications — Évaluation",
  nomFichierBase: "etudier-fonction-derivees-applications",
  genererInstance: genererExerciceEtudierFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudierFonction,
  construireCorrection: construireCorrectionEtudierFonction,
  difficulte: difficulteEtudierFonction,
  reponseBreve: (exercice) => reponseBreveEtudierFonction(exercice),
  correctionDetaillee: correctionDetailleeEtudierFonction,
  bareme: baremeEtudierFonction,
  enoncePapier: enoncePapierEtudierFonction,
  dureeMinutes: 25,
  profilInstance: profilEtudierFonction,
  libelleCasParticulier: LIBELLE_CAS_ETUDIER_FONCTION,
  calculatriceIndispensable: ["polynomiale-irrationnelle", "rationnelleSansCE", "rationnelleAO-irrationnelle"],
};
