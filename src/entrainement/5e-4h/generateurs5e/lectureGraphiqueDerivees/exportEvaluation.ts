import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneEcran,
  formatEnteteColonnesTableauFPrime,
  formatEnteteColonnesTableauFSeconde,
  formatReponseAttenduePhaseLatex,
  texteAideNiveau1,
} from "../../ui5e/formatLectureGraphiqueDerivees";
import { calculerViewBoxLectureGraphiqueDerivees, construireMarqueursPointIsole, construireSegmentsDerivees } from "../../ui5e/lectureGraphiqueDeriveesCourbe";
import { ecransParcourus, type EcranLectureGraphiqueDerivees } from "../../moteur5e/typesLectureGraphiqueDerivees";
import { listeAsymptotes } from "../../moteur5e/typesLectureGraphiqueLimites";
import {
  pointsTangenteHorizontale,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  TOLERANCE_POSITION_INFLEXION,
  TOLERANCE_POSITION_TANGENTE,
  TOLERANCE_VALEUR_EXTREMUM,
} from "../../moteur5e/verificationLectureGraphiqueDerivees";
import { repartirSurQuatre, tableauSignesEtudeLatex } from "../etudeLocale/exportEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./index";
import { profilLectureGraphiqueDerivees } from "../profilsEvaluationDerivees28-30";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees>` pour 5gen30 (Lecture
 * graphique — dérivées et applications) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Le graphique EST l'énoncé : dessiné ici (`svgLectureGraphiqueDerivees`) avec un quadrillage d'une
 * unité (lecture à 0,3 près annoncée), à partir des MÊMES morceaux de courbe que l'écran
 * (`construireSegmentsDerivees` : les branches sont prolongées jusqu'au bord du cadre près d'une
 * asymptote verticale, la divergence reste visible). Consigne globale qui ne révèle ni le nombre ni
 * le type d'asymptotes, ni l'existence d'extremums ou de points d'inflexion (« éventuels »). Les 6
 * écrans du générateur (`ecransParcourus` : asymptotes, tangentes horizontales, tableau de f',
 * valeurs des extremums, points d'inflexion, tableau de f'') sont les étapes du corrigé ; le corrigé
 * montre le graphique annoté (asymptotes nommées, extremums, paliers, points d'inflexion) et les deux
 * tableaux de signes (`tableauFPrimeAttendu`/`tableauFSecondeAttendu`, la source de l'écran).
 */

const LETTRES = "abcdefgh";

// ============================================================================
// Graphique (énoncé et corrigé).
// ============================================================================

const LARGEUR = 440;
const MARGE = 22;
const COULEUR_COURBE = "#1971c2";
const COULEUR_GRILLE = "#e3e7ec";
const COULEUR_GRILLE_FORTE = "#c5ccd5";
const COULEUR_AXE = "#495057";
const COULEUR_ANNOTATION = "#9a3b12";
// Asymptotes : couleur distincte de l'axe, pour qu'une asymptote confondue avec un axe (x = 0, y = 0)
// reste visible (pointillés tracés par-dessus l'axe).
const COULEUR_ASYMPTOTE = "#c2410c";
let compteurSvg = 0;

/** Nombre écrit dans le SVG : virgule décimale et vrai signe moins. */
function nombreSvg(v: number): string {
  const r = Math.round(v * 10) / 10;
  return String(Object.is(r, -0) ? 0 : r).replace(".", ",").replace("-", "−");
}

function droiteSvg(pente: number, ordonnee: number): string {
  const p = pente === 1 ? "x" : pente === -1 ? "−x" : `${nombreSvg(pente)}x`;
  return ordonnee === 0 ? p : `${p} ${ordonnee < 0 ? "−" : "+"} ${nombreSvg(Math.abs(ordonnee))}`;
}

function etiquette(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end", couleur = COULEUR_ANNOTATION): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" font-weight="bold" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="3" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

function svgLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees, annoter: boolean): string {
  const vb = calculerViewBoxLectureGraphiqueDerivees(exercice);
  const [xMin, xMax] = vb.x;
  const [yMin, yMax] = vb.y;
  const ux = (LARGEUR - 2 * MARGE) / (xMax - xMin);
  const uy = Math.min(22, Math.max(14, 300 / (yMax - yMin)));
  const hauteur = Math.round((yMax - yMin) * uy + 2 * MARGE);
  const sx = (x: number) => MARGE + (x - xMin) * ux;
  const sy = (y: number) => MARGE + (yMax - y) * uy;
  const id = `clip-lgd-${++compteurSvg}`;
  const pasLabelY = yMax - yMin > 12 ? 2 : 1;

  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin); v <= xMax; v++) {
    const forte = v % 2 === 0;
    grille.push(`<line x1="${sx(v).toFixed(1)}" y1="${MARGE}" x2="${sx(v).toFixed(1)}" y2="${hauteur - MARGE}" stroke="${forte ? COULEUR_GRILLE_FORTE : COULEUR_GRILLE}" stroke-width="${forte ? 0.8 : 0.6}"/>`);
    if (forte && v !== 0) labels.push(`<text x="${sx(v).toFixed(1)}" y="${(sy(0) + 12).toFixed(1)}" font-size="9" text-anchor="middle" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${nombreSvg(v)}</text>`);
  }
  for (let v = Math.ceil(yMin); v <= yMax; v++) {
    const forte = v % pasLabelY === 0;
    grille.push(`<line x1="${MARGE}" y1="${sy(v).toFixed(1)}" x2="${LARGEUR - MARGE}" y2="${sy(v).toFixed(1)}" stroke="${forte && pasLabelY === 2 ? COULEUR_GRILLE_FORTE : COULEUR_GRILLE}" stroke-width="0.6"/>`);
    if (forte && v !== 0) labels.push(`<text x="${(sx(0) - 5).toFixed(1)}" y="${(sy(v) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${nombreSvg(v)}</text>`);
  }
  const fleche = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.3" marker-end="url(#${id}-fleche)"/>`;
  const axes = fleche(MARGE - 4, sy(0), LARGEUR - MARGE + 8, sy(0)) + fleche(sx(0), hauteur - MARGE + 4, sx(0), MARGE - 8);
  const nomsAxes =
    `<text x="${LARGEUR - MARGE + 6}" y="${(sy(0) - 6).toFixed(1)}" font-size="10" font-style="italic" text-anchor="end" fill="${COULEUR_AXE}">x</text>` +
    `<text x="${(sx(0) + 6).toFixed(1)}" y="${MARGE - 2}" font-size="10" font-style="italic" fill="${COULEUR_AXE}">y</text>`;

  // Courbe : une branche par domaine, prolongée jusqu'au bord VISIBLE près d'une AV (même fonction
  // que l'écran), découpée au cadre par un clipPath.
  const chemins = construireSegmentsDerivees(exercice, xMin, xMax, [yMin, yMax])
    .map((seg) => {
      const [lo, hi] = seg.domaine;
      const n = 400;
      const pts: string[] = [];
      for (let i = 0; i <= n; i++) {
        const x = lo + ((hi - lo) * i) / n;
        const y = seg.evaluer(x);
        if (!Number.isFinite(y)) continue;
        const yBorne = Math.max(yMin - 2, Math.min(yMax + 2, y));
        pts.push(`${sx(x).toFixed(1)},${sy(yBorne).toFixed(1)}`);
      }
      return pts.length > 1 ? `<path d="M ${pts.join(" L ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linejoin="round" clip-path="url(#${id})"/>` : "";
    })
    .join("");

  const ligne = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.4" stroke-dasharray="5 4" clip-path="url(#${id})"/>`;
  const asymptotes: string[] = exercice.asymptotique.vas.map((va) => ligne(va.position, yMin, va.position, yMax));
  const { infini } = exercice.asymptotique;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) asymptotes.push(ligne(xMin, y, xMax, y));
  } else if (infini.type === "oblique") {
    asymptotes.push(ligne(xMin, infini.pente * xMin + infini.ordonnee, xMax, infini.pente * xMax + infini.ordonnee));
  }

  const pointsIsoles = construireMarqueursPointIsole(exercice)
    .map((m) => `<circle cx="${sx(m.x).toFixed(1)}" cy="${sy(m.y).toFixed(1)}" r="3.6" fill="${COULEUR_COURBE}"/>`)
    .join("");

  const annotations: string[] = [];
  if (annoter) {
    exercice.asymptotique.vas.forEach((va, i) => {
      const X = sx(va.position);
      const aGauche = X > LARGEUR - 70;
      annotations.push(etiquette(aGauche ? X - 4 : X + 4, MARGE + 12 + 13 * i, `x = ${nombreSvg(va.position)}`, aGauche ? "end" : "start"));
    });
    if (infini.type === "horizontale") {
      const memes = infini.limitePlusInfini === infini.limiteMoinsInfini;
      annotations.push(etiquette(LARGEUR - MARGE - 3, sy(infini.limitePlusInfini) - 5, `y = ${nombreSvg(infini.limitePlusInfini)}${memes ? "" : " (en +∞)"}`, "end"));
      if (!memes) annotations.push(etiquette(MARGE + 3, sy(infini.limiteMoinsInfini) - 5, `y = ${nombreSvg(infini.limiteMoinsInfini)} (en −∞)`, "start"));
    } else if (infini.type === "oblique") {
      const xL = xMin + 0.82 * (xMax - xMin);
      const yL = Math.min(Math.max(infini.pente * xL + infini.ordonnee, yMin + 1), yMax - 1);
      annotations.push(etiquette(sx(xL), sy(yL) + (infini.pente > 0 ? 14 : -7), `y = ${droiteSvg(infini.pente, infini.ordonnee)}`, "middle"));
    }
    for (const p of pointsTangenteHorizontale(exercice)) {
      const nom = p.classification === "max" ? "max" : p.classification === "min" ? "min" : "palier";
      const dessus = p.classification !== "min";
      annotations.push(`<circle cx="${sx(p.position).toFixed(1)}" cy="${sy(p.valeur).toFixed(1)}" r="3.4" fill="${COULEUR_ANNOTATION}"/>`);
      // Près de l'axe des ordonnées, l'étiquette part sur le côté (elle masquerait les graduations).
      const presAxe = Math.abs(sx(p.position) - sx(0)) < 45;
      const ancre = presAxe ? (p.position >= 0 ? "start" : "end") : "middle";
      const dx = presAxe ? (p.position >= 0 ? 6 : -6) : 0;
      annotations.push(etiquette(sx(p.position) + dx, sy(p.valeur) + (dessus ? -8 : 16), `${nom} (${nombreSvg(p.position)} ; ${nombreSvg(p.valeur)})`, ancre));
    }
    const positionsPaliers = exercice.paliers.map((p) => p.position);
    for (const pi of exercice.inflexions) {
      if (positionsPaliers.some((x) => Math.abs(x - pi.position) < 1e-6)) continue;
      const X = sx(pi.position);
      const Y = sy(pi.valeur);
      annotations.push(`<rect x="${(X - 3.2).toFixed(1)}" y="${(Y - 3.2).toFixed(1)}" width="6.4" height="6.4" fill="#ffffff" stroke="${COULEUR_ANNOTATION}" stroke-width="1.6"/>`);
      annotations.push(etiquette(X + 7, Y + 4, `PI x ≈ ${nombreSvg(pi.position)}`, "start"));
    }
  }

  return `<svg class="${annoter ? "figure-corrige" : "graphe-derivees"}" width="${LARGEUR}" height="${hauteur}" viewBox="0 0 ${LARGEUR} ${hauteur}" xmlns="http://www.w3.org/2000/svg" style="display:block;max-width:100%;height:auto;margin:0.4em auto">
<defs><clipPath id="${id}"><rect x="${MARGE}" y="${MARGE}" width="${LARGEUR - 2 * MARGE}" height="${hauteur - 2 * MARGE}"/></clipPath><marker id="${id}-fleche" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${COULEUR_AXE}"/></marker></defs>
<rect x="0" y="0" width="${LARGEUR}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${axes}${nomsAxes}
${asymptotes.join("")}
${chemins}${pointsIsoles}
${labels.join("")}
${annotations.join("")}
<rect x="0.5" y="0.5" width="${LARGEUR - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>
</svg>`;
}

// ============================================================================
// Énoncé.
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (droites en pointillés orange : asymptotes de la courbe ; point plein : point de la courbe ; quadrillage d'une unité).";

function nombreTexte(v: number): string {
  return String(v).replace(".", ",");
}

const CONSIGNE_PAPIER =
  "Par lecture du graphique : nomme les éventuelles asymptotes de la courbe (verticale, horizontale ou oblique) avec leur équation ; donne l'abscisse de chaque point où la tangente est horizontale ; dresse le tableau de signes de f' et les variations de f, puis donne la valeur de chaque extremum ; donne l'abscisse de chaque point d'inflexion ; dresse le tableau de signes de f'' et la concavité de f. " +
  (TOLERANCE_POSITION_TANGENTE === TOLERANCE_VALEUR_EXTREMUM
    ? `Une lecture à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près est acceptée (à ${nombreTexte(TOLERANCE_POSITION_INFLEXION)} près pour les points d'inflexion).`
    : `Une lecture à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près est acceptée pour les abscisses et à ${nombreTexte(TOLERANCE_VALEUR_EXTREMUM)} près pour les valeurs (à ${nombreTexte(TOLERANCE_POSITION_INFLEXION)} près pour les points d'inflexion).`);

/** Consigne d'étape = celle de l'écran, sans les tournures d'interface (« coche… », « Complète… »). */
function consigneEtape(ecran: EcranLectureGraphiqueDerivees): FragmentConsigne[] {
  const t = consigneEcran(ecran)
    .replace(/S'il n'y en a aucune, coche « [^»]+ »\./, "S'il n'y en a aucune, indique-le.")
    .replace(/S'il n'y en a aucun, coche « [^»]+ »\./, "S'il n'y en a aucun, indique-le.")
    .replace("Complète le tableau", "Dresse le tableau")
    .replace("du graphique", "de la courbe");
  return [texte(t)];
}

function construireEnonceLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): SectionExercice {
  return {
    enteteFragments: [texte(LEGENDE)],
    enteteHtml: svgLectureGraphiqueDerivees(exercice, false),
    questions: ecransParcourus(exercice).map((ecran) => ({ consigne: consigneEtape(ecran) })),
  };
}

function enoncePapierLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): EnoncePapier {
  return {
    section: { enteteFragments: [texte(LEGENDE)], enteteHtml: svgLectureGraphiqueDerivees(exercice, false), questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [ecransParcourus(exercice).map((_, i) => LETTRES[i])],
  };
}

// ============================================================================
// Réponse brève, corrigé, barème.
// ============================================================================

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function reponseBreveLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): FragmentConsigne[] {
  return [
    ...joindre(formatReponseAttenduePhaseLatex(exercice, "asymptotes")),
    texte(" — "),
    ...(exercice.extrema.length > 0 ? joindre(formatReponseAttenduePhaseLatex(exercice, "extremums")) : [texte("aucun extremum")]),
    texte(" — points d'inflexion : "),
    ...joindre(formatReponseAttenduePhaseLatex(exercice, "inflexions")),
  ];
}

function methode(ecran: EcranLectureGraphiqueDerivees, sousQuestion: string): EtapeCorrection {
  return { label: "Méthode", sousQuestion, fragments: [texte(texteAideNiveau1(ecran))] };
}

function correctionDetailleeLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): EtapeCorrection[] {
  const ordre = ecransParcourus(exercice);
  const L = (e: EcranLectureGraphiqueDerivees) => LETTRES[ordre.indexOf(e)];
  const lignes: EtapeCorrection[] = [];
  for (const ecran of ordre) {
    const l = L(ecran);
    switch (ecran) {
      case "asymptotes":
        lignes.push(methode(ecran, l), {
          label: "Lecture",
          sousQuestion: l,
          fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)),
          figureHtml: svgLectureGraphiqueDerivees(exercice, true),
        });
        if (listeAsymptotes(exercice.asymptotique).length === 0) {
          lignes.push({ label: "Piège", sousQuestion: l, fragments: [texte("Les branches partent vers ±∞ sans se rapprocher d'aucune droite : il n'y a pas d'asymptote.")] });
        } else if (exercice.asymptotique.vas.length > 0) {
          lignes.push({ label: "Piège", sousQuestion: l, fragments: [texte("Une asymptote verticale a une équation de la forme « x = … », pas « y = … ».")] });
        }
        break;
      case "zerosFPrime":
      case "inflexions":
        lignes.push(methode(ecran, l), { label: "Lecture", sousQuestion: l, fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)) });
        break;
      case "tableauFPrime": {
        const attendu = tableauFPrimeAttendu(exercice);
        lignes.push({ label: "Tableau", sousQuestion: l, fragments: [latex(tableauSignesEtudeLatex(attendu, formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes), "fprime"))] });
        lignes.push({ label: "Conclusion", sousQuestion: l, fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)) });
        lignes.push({
          label: "Piège",
          sousQuestion: l,
          fragments:
            exercice.paliers.length > 0
              ? [texte("En un palier, la tangente est horizontale mais la courbe garde le même sens : ce n'est ni un maximum ni un minimum.")]
              : [texte("Le signe de f' se lit sur le sens de variation de la courbe (elle monte : f' > 0), pas sur sa position au-dessus ou au-dessous de l'axe des abscisses.")],
        });
        break;
      }
      case "extremums":
        lignes.push(methode(ecran, l), { label: "Lecture", sousQuestion: l, fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)) });
        break;
      case "tableauFSeconde": {
        const attendu = tableauFSecondeAttendu(exercice);
        lignes.push({ label: "Tableau", sousQuestion: l, fragments: [latex(tableauSignesEtudeLatex(attendu, formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes), "fseconde"))] });
        lignes.push({ label: "Conclusion", sousQuestion: l, fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)) });
        break;
      }
    }
  }
  return lignes;
}

const POIDS_ECRAN: Record<EcranLectureGraphiqueDerivees, number> = { asymptotes: 1, zerosFPrime: 0.5, tableauFPrime: 1, extremums: 0.5, inflexions: 0.5, tableauFSeconde: 0.5 };

const CRITERE_ECRAN: Record<EcranLectureGraphiqueDerivees, string> = {
  asymptotes: "Asymptotes nommées avec leur équation (ou aucune)",
  zerosFPrime: "Abscisses des points à tangente horizontale",
  tableauFPrime: "Tableau de signes de f', variations et nature de chaque point",
  extremums: "Valeur de chaque extremum",
  inflexions: "Abscisses des points d'inflexion",
  tableauFSeconde: "Tableau de signes de f'' et concavité",
};

function baremeLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): BaremeExercice {
  const ordre = ecransParcourus(exercice);
  const points = repartirSurQuatre(ordre.map((e) => POIDS_ECRAN[e]));
  const criteres: CritereBareme[] = ordre.map((e, i) => ({ sousQuestion: LETTRES[i], critere: [texte(CRITERE_ECRAN[e])], points: points[i] }));
  const erreurs: ErreurFrequente[] = [];
  if (exercice.asymptotique.vas.length > 0) erreurs.push({ description: [texte("Asymptote verticale écrite « y = … » au lieu de « x = … »")], cout: "0 pt sur cette asymptote" });
  if (exercice.paliers.length > 0) erreurs.push({ description: [texte("Palier classé maximum ou minimum")], cout: "0 pt sur la nature de ce point" });
  erreurs.push({ description: [texte("Valeurs interdites (asymptotes verticales) oubliées dans les tableaux de signes")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveLectureGraphiqueDerivees(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte(`Lectures à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près (abscisses, valeurs) et à ${nombreTexte(TOLERANCE_POSITION_INFLEXION)} près (points d'inflexion)`)], [texte("Asymptotes dans n'importe quel ordre")]],
  };
}

function difficulteLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): 1 | 2 | 3 {
  const { vas, infini } = exercice.asymptotique;
  const pointIsole = vas.some((va) => va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined);
  if (vas.length >= 2 || pointIsole || exercice.paliers.length > 0 || (vas.length > 0 && infini.type === "oblique")) return 3;
  return 2;
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): BlocCorrection[] {
  return correctionDetailleeLectureGraphiqueDerivees(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationLectureGraphiqueDerivees: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees> = {
  titreDocument: "Lecture graphique — dérivées et applications — Évaluation",
  nomFichierBase: "lecture-graphique-derivees",
  genererInstance: genererExerciceLectureGraphiqueDerivees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLectureGraphiqueDerivees,
  construireCorrection: construireCorrectionLectureGraphiqueDerivees,
  difficulte: difficulteLectureGraphiqueDerivees,
  reponseBreve: reponseBreveLectureGraphiqueDerivees,
  correctionDetaillee: correctionDetailleeLectureGraphiqueDerivees,
  bareme: baremeLectureGraphiqueDerivees,
  enoncePapier: enoncePapierLectureGraphiqueDerivees,
  dureeMinutes: 12,
  profilInstance: profilLectureGraphiqueDerivees,
  // Graphique (`enteteHtml`) : pas de regroupement.
  regroupable: false,
};
