import type { ExerciceOptimisation } from "../../core5e/optimisationGeometrique.types";
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
import { consigneGeneraleRiche, formatNombreLatex, formatReponseAttendueEcranLatex, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../../ui5e/formatOptimisationGeometrique";
import { ordreEcransOptimisation, type EcranOptimisation } from "../../moteur5e/typesOptimisationGeometrique";
import { conclusionReelle, pointsTest } from "../../moteur5e/verificationOptimisationGeometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimisation } from "./index";
import { profilOptimisation } from "../profilsEvaluationDerivees31-33";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOptimisation>` pour 5gen32 (« Optimisation
 * géométrique », chapitre 5 de 5e) — feuille d'exercices et évaluation, selon
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * - **Énoncé papier** = la situation (texte de l'écran, `consigneGeneraleRiche`), les données, un
 *   schéma SVG autonome (`enteteHtml`, mêmes proportions que `components5e/SchemaOptimisation.tsx`)
 *   et UNE consigne globale (« Détermine … ; justifie la nature de l'extremum ; donne les valeurs
 *   optimales »). Seule vraie question en plus : le coût du matériau du cylindre (application
 *   numérique), qui est un second problème.
 * - **Étapes** = écrans du générateur (`ordreEcransOptimisation`) : lien, fonction, dérivée,
 *   résolution, signe de F′ en deux points test, conclusion (+ application) — titres « Étape n » du
 *   corrigé, rédigés pour le papier (rien sur la saisie).
 * - **Corrigé** tiré des MÊMES fonctions que l'écran (`formatReponseAttendueEcranLatex`, aides,
 *   `pointsTest`) ; la variable de l'énoncé (α, r) remplace le x imposé par la saisie à l'écran.
 *   Aucun test par la dérivée seconde : la nature se justifie par le signe de F′ (cours §8).
 */

const LETTRES = "abcdefgh";

function lettreDe(exercice: ExerciceOptimisation, ecran: EcranOptimisation): string {
  return LETTRES[ordreEcransOptimisation(exercice).indexOf(ecran)] ?? "a";
}

/** `$…$` → fragments texte / LaTeX. */
function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

function variable(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") return "\\alpha";
  if (exercice.famille === "fenetreA" || exercice.famille === "fenetreB") return "r";
  return "x";
}

/** L'écran fait saisir x pour α ou r : le papier reprend la variable de l'énoncé. */
function avecVariable(exercice: ExerciceOptimisation, latexEcran: string): string {
  const v = variable(exercice);
  if (v === "x") return latexEcran;
  return latexEcran.replace(/(?<![A-Za-z\\])x(?![A-Za-z])/g, v === "\\alpha" ? "\\alpha " : "r").replace(/\\alpha \)/g, "\\alpha)").replace(/\\alpha ([,}])/g, "\\alpha$1");
}

function reponseEcran(exercice: ExerciceOptimisation, ecran: EcranOptimisation): string {
  return avecVariable(exercice, formatReponseAttendueEcranLatex(exercice, ecran));
}

function nombreTexte(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  return `${arrondi}`.replace(".", ",");
}

// ============================================================================
// Schéma SVG autonome (papier : traits noirs, aucune variable CSS).
// ============================================================================

const TRAIT = 'stroke="#212529" stroke-width="2" fill="none"';
const COTE = 'stroke="#495057" stroke-width="1" stroke-dasharray="4 3" fill="none"';
const TXT = 'font-size="13" font-style="italic" fill="#212529" font-family="Georgia, Times New Roman, serif"';

function txt(x: number, y: number, contenu: string, ancre = "start"): string {
  return `<text x="${x}" y="${y}" text-anchor="${ancre}" ${TXT}>${contenu}</text>`;
}

function schemaSvg(exercice: ExerciceOptimisation): string {
  let corps = "";
  switch (exercice.famille) {
    case "trapeze": {
      const ax = 100, bx = 160, y0 = 130, dx = 35, dy = 60.6;
      corps =
        `<polyline points="${ax - dx},${y0 - dy} ${ax},${y0} ${bx},${y0} ${bx + dx},${y0 - dy}" ${TRAIT}/>` +
        `<line x1="${ax - dx}" y1="${y0 - dy}" x2="${bx + dx}" y2="${y0 - dy}" ${COTE}/>` +
        `<line x1="${bx}" y1="${y0}" x2="${bx + 55}" y2="${y0}" ${COTE}/>` +
        `<line x1="${bx + dx}" y1="${y0 - dy}" x2="${bx + dx}" y2="${y0}" ${COTE}/>` +
        `<path d="M ${bx + 20} ${y0} A 20 20 0 0 0 ${bx + 10} ${y0 - 17.3}" stroke="#212529" stroke-width="1.2" fill="none"/>` +
        txt(bx + 24, y0 - 8, "α") +
        txt((ax + bx) / 2, y0 + 18, "b", "middle") +
        txt(ax - dx / 2 - 14, y0 - dy / 2 + 4, "l", "middle") +
        txt(bx + dx / 2 + 12, y0 - dy / 2 - 4, "l", "middle") +
        txt(bx + dx + 8, y0 - dy / 2 + 4, "h") +
        txt((ax + bx) / 2, y0 - dy - 8, "B", "middle");
      break;
    }
    case "cylindre": {
      const cx = 130, rx = 45, ry = 12, haut = 35, bas = 135;
      corps =
        `<ellipse cx="${cx}" cy="${haut}" rx="${rx}" ry="${ry}" ${TRAIT}/>` +
        `<line x1="${cx - rx}" y1="${haut}" x2="${cx - rx}" y2="${bas}" ${TRAIT}/>` +
        `<line x1="${cx + rx}" y1="${haut}" x2="${cx + rx}" y2="${bas}" ${TRAIT}/>` +
        `<path d="M ${cx - rx} ${bas} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bas}" ${TRAIT}/>` +
        `<path d="M ${cx - rx} ${bas} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bas}" ${COTE}/>` +
        `<line x1="${cx}" y1="${haut}" x2="${cx + rx}" y2="${haut}" stroke="#212529" stroke-width="1.2"/>` +
        `<circle cx="${cx}" cy="${haut}" r="2" fill="#212529"/>` +
        txt(cx + rx / 2, haut - 4, "x", "middle") +
        `<line x1="${cx + rx + 14}" y1="${haut}" x2="${cx + rx + 14}" y2="${bas}" ${COTE}/>` +
        txt(cx + rx + 20, (haut + bas) / 2 + 4, "h");
      break;
    }
    case "margesA":
    case "margesB": {
      const x0 = 70, y0 = 15, l = 120, h = 140, mh = 22, mv = 18;
      const m = (x: number, y: number, indice: string) => `<text x="${x}" y="${y}" text-anchor="middle" ${TXT} font-size="11">m<tspan baseline-shift="sub" font-size="8">${indice}</tspan></text>`;
      corps =
        `<rect x="${x0}" y="${y0}" width="${l}" height="${h}" ${TRAIT}/>` +
        `<rect x="${x0 + mh}" y="${y0 + mv}" width="${l - 2 * mh}" height="${h - 2 * mv}" stroke="#212529" stroke-width="1.2" fill="#e9ecef"/>` +
        txt(x0 + l / 2, y0 + h - mv - 6, "x", "middle") +
        txt(x0 + l - mh - 12, y0 + h / 2 + 4, "y", "middle") +
        m(x0 + mh / 2, y0 + h / 2 + 4, "h") +
        m(x0 + l - mh / 2, y0 + h / 2 + 4, "h") +
        m(x0 + l / 2, y0 + mv / 2 + 4, "v") +
        m(x0 + l / 2, y0 + h - mv / 2 + 4, "v");
      break;
    }
    case "fenetreA":
    case "fenetreB": {
      const cx = 130, r = 40, yBase = 150, hRect = 70;
      const yHaut = yBase - hRect;
      corps =
        `<path d="M ${cx - r} ${yHaut} L ${cx - r} ${yBase} L ${cx + r} ${yBase} L ${cx + r} ${yHaut} A ${r} ${r} 0 0 0 ${cx - r} ${yHaut}" ${TRAIT}/>` +
        `<line x1="${cx - r}" y1="${yHaut}" x2="${cx + r}" y2="${yHaut}" ${COTE}/>` +
        `<line x1="${cx}" y1="${yHaut}" x2="${(cx + r * Math.cos(Math.PI / 4)).toFixed(1)}" y2="${(yHaut - r * Math.sin(Math.PI / 4)).toFixed(1)}" stroke="#212529" stroke-width="1.2"/>` +
        `<circle cx="${cx}" cy="${yHaut}" r="2" fill="#212529"/>` +
        txt(cx + 8, yHaut - 16, "r") +
        txt(cx + r + 8, (yHaut + yBase) / 2 + 4, "h") +
        txt(cx, yBase + 16, "2r", "middle");
      break;
    }
    case "cubique":
      return "";
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 172" width="260" height="172" style="display:block;margin:6px auto 0;max-width:100%">${corps}</svg>`;
}

// ============================================================================
// Énoncé : situation + données + schéma ; étapes (une par écran) ; consigne globale.
// ============================================================================

function donneesFragments(exercice: ExerciceOptimisation): FragmentConsigne[] {
  return [texte(" Données : "), latex(formatTermesDonneesLatex(exercice).join(",\\ ")), texte(".")];
}

function situationFragments(exercice: ExerciceOptimisation): FragmentConsigne[] {
  if (exercice.famille === "cubique") {
    return [texte("On cherche une fonction du troisième degré "), latex("f(x)=ax^3+bx^2+cx+d"), texte(" telle que "), latex(formatTermesDonneesLatex(exercice).join(",\\ ")), texte(".")];
  }
  return [...fragmentsRiches(consigneGeneraleRiche(exercice)), ...donneesFragments(exercice)];
}

const GRANDEUR: Record<Exclude<ExerciceOptimisation["famille"], "cubique">, string> = {
  trapeze: "l'aire de la section de la gouttière",
  cylindre: "l'aire totale de la boîte",
  margesA: "l'aire de la zone imprimée",
  margesB: "l'aire totale de l'affiche",
  fenetreA: "l'aire de la fenêtre",
  fenetreB: "le périmètre de la fenêtre",
};

function consigneEtape(exercice: ExerciceOptimisation, ecran: EcranOptimisation): FragmentConsigne[] {
  const v = variable(exercice);
  const f = exercice.famille;
  switch (ecran) {
    case "lien":
      if (f === "trapeze") return fragmentsRiches("Exprime la hauteur $h$ et la grande base $B$ du trapèze en fonction de $\\alpha$.");
      if (f === "margesA" || f === "margesB") return fragmentsRiches("Exprime la hauteur imprimée $y$ en fonction de $x$ à l'aide de la contrainte.");
      return fragmentsRiches(`Exprime la hauteur $h$ en fonction de $${v}$ à l'aide de la contrainte.`);
    case "construire":
      return fragmentsRiches(`Exprime ${f === "cubique" ? "" : GRANDEUR[f]} en fonction de la seule variable $${v}$ : c'est la fonction $F$ à optimiser.`);
    case "deriver":
      return fragmentsRiches(f === "trapeze" ? "Calcule $F'(\\alpha)$, avec $\\alpha$ en radians." : `Calcule $F'(${v})$.`);
    case "resoudre":
      if (f === "trapeze") return fragmentsRiches("Résous $F'(\\alpha)=0$ : remplace $\\sin^2\\alpha$ par $1-\\cos^2\\alpha$, pose $u=\\cos\\alpha$ et résous l'équation du deuxième degré obtenue ; donne $\\alpha$ en degrés.");
      if (f === "margesA" || f === "margesB" || f === "fenetreB") return fragmentsRiches(`Résous $F'(${v})=0$ et justifie la valeur de $${v}$ retenue.`);
      return fragmentsRiches(`Résous $F'(${v})=0$.`);
    case "justifier": {
      const pts = pointsTest(exercice);
      const u = f === "trapeze" ? "°" : "";
      return fragmentsRiches(`Calcule $F'$ en $${v}=${formatNombreLatex(pts.affichageAvant)}${u}$ et en $${v}=${formatNombreLatex(pts.affichageApres)}${u}$, puis déduis-en la nature de l'extremum.`);
    }
    case "conclure":
      return [texte("Donne les valeurs optimales dans le contexte de l'énoncé.")];
    case "application":
      return [texte("Calcule le coût du matériau de la boîte optimale.")];
    case "coeffsImmediats":
      return fragmentsRiches("Détermine $c$ et $d$ à partir des deux conditions en $x=0$.");
    case "relation":
      return fragmentsRiches("Exprime $b$ en fonction de $a$ à l'aide de la deuxième tangente horizontale.");
    case "resoudreA":
      return fragmentsRiches("Utilise le point de passage restant pour trouver $a$.");
    case "expressionFinale":
      return fragmentsRiches("Écris l'expression complète de $f(x)$.");
  }
}

function construireEnonceOptimisation(exercice: ExerciceOptimisation): SectionExercice {
  return {
    enteteFragments: situationFragments(exercice),
    enteteHtml: schemaSvg(exercice) || undefined,
    questions: ordreEcransOptimisation(exercice).map((e) => ({ consigne: consigneEtape(exercice, e) })),
  };
}

function consigneGlobale(exercice: ExerciceOptimisation): FragmentConsigne[] {
  const precision = " Donne les valeurs exactes, ou arrondies au centième.";
  switch (exercice.famille) {
    case "trapeze":
      return fragmentsRiches(
        "Détermine l'angle $\\alpha$ (en degrés, arrondi au degré) qui rend l'aire de la section maximale et justifie qu'il s'agit d'un maximum ; donne alors la hauteur $h$, la grande base $B$ et l'aire maximale. Les calculs se font avec $\\alpha$ en radians ; tu peux utiliser $\\sin^2\\alpha=1-\\cos^2\\alpha$." +
          precision,
      );
    case "cylindre":
      return fragmentsRiches(`Détermine le rayon $x$ et la hauteur $h$ de la boîte qui utilise le moins de matériau, justifie qu'il s'agit d'un minimum et donne l'aire totale minimale.${precision}`);
    case "margesA":
      return fragmentsRiches(`Détermine les dimensions $x$ et $y$ de la zone imprimée qui rendent son aire maximale, justifie la nature de l'extremum et donne cette aire maximale.${precision}`);
    case "margesB":
      return fragmentsRiches(`Détermine les dimensions $x$ et $y$ de la zone imprimée qui rendent l'aire totale de l'affiche minimale, justifie la nature de l'extremum et donne cette aire minimale.${precision}`);
    case "fenetreA":
      return fragmentsRiches(`Détermine le rayon $r$ et la hauteur $h$ qui rendent l'aire de la fenêtre maximale, justifie la nature de l'extremum et donne cette aire maximale.${precision}`);
    case "fenetreB":
      return fragmentsRiches(`Détermine le rayon $r$ et la hauteur $h$ qui rendent le périmètre de la fenêtre minimal, justifie la nature de l'extremum et donne ce périmètre minimal.${precision}`);
    case "cubique":
      return fragmentsRiches("Détermine les coefficients $a$, $b$, $c$ et $d$, puis écris $f(x)$.");
  }
}

function enoncePapierOptimisation(exercice: ExerciceOptimisation): EnoncePapier {
  const ordre = ordreEcransOptimisation(exercice);
  const lettres = ordre.map((_, i) => LETTRES[i]);
  const application = ordre.includes("application");
  const section: SectionExercice = {
    enteteFragments: situationFragments(exercice),
    enteteHtml: schemaSvg(exercice) || undefined,
    questions: application
      ? [
          { consigne: consigneGlobale(exercice) },
          {
            consigne: [
              texte(`Le matériau coûte ${nombreTexte(exercice.famille === "cylindre" ? (exercice.prixUnitaireMateriau ?? 0) : 0)} € par cm². Calcule le coût du matériau de la boîte optimale, arrondi au centime.`),
            ],
          },
        ]
      : [{ consigne: consigneGlobale(exercice) }],
  };
  return {
    section,
    etapesParQuestion: application ? [lettres.slice(0, -1), [lettres[lettres.length - 1]]] : [lettres],
    reponseBreve: application ? [texte("a) "), ...reponseBreveSansApplication(exercice), texte(" — b) "), latex(reponseEcran(exercice, "application"))] : undefined,
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function aide(exercice: ExerciceOptimisation, ecran: EcranOptimisation, niveau: 1 | 2): FragmentConsigne[] {
  const a = niveau === 1 ? texteAideNiveau1(exercice, ecran) : texteAideNiveau2(exercice, ecran);
  if (!a || (a.texte === "" && !a.latex)) return [];
  const papier = a.texte.replace(/aux écrans précédents/g, "aux étapes précédentes").replace(/des écrans précédents/g, "des étapes précédentes").replace(/à l'écran précédent/g, "à l'étape précédente");
  const fragments = fragmentsRiches(papier).map((fr) => (fr.type === "latex" ? latex(avecVariable(exercice, fr.valeur)) : fr));
  return [...fragments, ...(a.latex ? [texte(" "), latex(avecVariable(exercice, a.latex))] : [])];
}

function lignesEtape(exercice: ExerciceOptimisation, ecran: EcranOptimisation): EtapeCorrection[] {
  const sq = lettreDe(exercice, ecran);
  const ligne = (label: string, fragments: FragmentConsigne[]): EtapeCorrection[] => (fragments.length === 0 ? [] : [{ label, sousQuestion: sq, fragments }]);
  const reponse = () => [latex(reponseEcran(exercice, ecran)), texte(".")];
  const f = exercice.famille;
  switch (ecran) {
    case "lien":
    case "construire":
      return [...ligne("Méthode", aide(exercice, ecran, 1)), ...ligne("Calcul", reponse())];
    case "deriver": {
      const methodeDerivee =
        f === "fenetreA"
          ? fragmentsRiches("$F$ est un polynôme du deuxième degré en $r$ : on dérive terme à terme.")
          : f === "margesA"
            ? [...fragmentsRiches("Règle du quotient pour le premier terme, puis dérivée du terme en $x$ :"), texte(" "), latex("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}")]
            : aide(exercice, ecran, 1);
      return [...ligne("Méthode", methodeDerivee), ...ligne("Calcul", reponse())];
    }
    case "resoudre": {
      const lignes = [...ligne("Calcul", aide(exercice, ecran, 2)), ...ligne("Conclusion", reponse())];
      if (f === "margesA" || f === "margesB" || f === "fenetreB") lignes.push(...ligne("Piège", [texte("L'équation a deux solutions opposées : une longueur est positive, on rejette la solution négative.")]));
      if (f === "trapeze") lignes.push(...ligne("Piège", [texte("On garde la solution u comprise entre 0 et 1 (u = cos α avec 0° < α < 90°).")]));
      return lignes;
    }
    case "justifier": {
      const nature = conclusionReelle(exercice) === "max" ? "maximum" : "minimum";
      return [
        ...ligne("Méthode", [texte(nature === "maximum" ? "F′ positive avant l'optimum et négative après : F croît puis décroît." : "F′ négative avant l'optimum et positive après : F décroît puis croît.")]),
        ...ligne("Conclusion", reponse()),
      ];
    }
    case "conclure":
      return [...ligne("Méthode", aide(exercice, ecran, 1)), ...ligne("Conclusion", reponse())];
    case "application":
      return [...ligne("Méthode", [texte("Coût = prix au cm² × aire totale minimale (ce n'est pas une nouvelle optimisation).")]), ...ligne("Calcul", reponse())];
    case "coeffsImmediats":
    case "relation":
    case "resoudreA":
      return [...ligne("Méthode", aide(exercice, ecran, 1)), ...ligne("Calcul", reponse())];
    case "expressionFinale":
      return ligne("Conclusion", reponse());
  }
}

function correctionDetailleeOptimisation(exercice: ExerciceOptimisation): EtapeCorrection[] {
  return ordreEcransOptimisation(exercice).flatMap((e) => lignesEtape(exercice, e));
}

function reponseBreveSansApplication(exercice: ExerciceOptimisation): FragmentConsigne[] {
  if (exercice.famille === "cubique") return [latex(reponseEcran(exercice, "expressionFinale"))];
  const nature = conclusionReelle(exercice) === "max" ? "maximum" : "minimum";
  return [latex(reponseEcran(exercice, "resoudre").replace(/\\ \\text\{\(l'autre[^}]*\}/, "")), texte(` (${nature}) ; `), latex(reponseEcran(exercice, "conclure"))];
}

function reponseBreveOptimisation(exercice: ExerciceOptimisation): FragmentConsigne[] {
  const base = reponseBreveSansApplication(exercice);
  return ordreEcransOptimisation(exercice).includes("application") ? [...base, texte(" ; "), latex(reponseEcran(exercice, "application"))] : base;
}

function baremeOptimisation(exercice: ExerciceOptimisation): BaremeExercice {
  const l = (e: EcranOptimisation) => lettreDe(exercice, e);
  const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
  let criteres: CritereBareme[];
  if (exercice.famille === "cubique") {
    criteres = [c(l("coeffsImmediats"), "c et d à partir des conditions en x = 0", 1), c(l("relation"), "b exprimé en fonction de a", 1), c(l("resoudreA"), "a trouvé grâce au point de passage", 1), c(l("expressionFinale"), "Expression complète de f(x)", 1)];
  } else {
    const application = ordreEcransOptimisation(exercice).includes("application");
    criteres = [
      c(l("lien"), "Contrainte exploitée : une seule variable", 0.5),
      c(l("construire"), "Fonction F à optimiser", 0.5),
      c(l("deriver"), "Dérivée F′ correcte", application ? 0.5 : 1),
      c(l("resoudre"), "Résolution de F′ = 0 et valeur retenue", 1),
      c(l("justifier"), "Signe de F′ de part et d'autre : nature de l'extremum", 0.5),
      c(l("conclure"), "Valeurs optimales dans le contexte, avec unités", 0.5),
      ...(application ? [c(l("application"), "Coût du matériau", 0.5)] : []),
    ];
  }
  const erreurs =
    exercice.famille === "cubique"
      ? [{ description: [texte("Oublier que f′(0) = 0 impose c = 0")], cout: "−1" }]
      : [
          { description: [texte("Dériver la fonction en gardant deux variables (contrainte non utilisée)")], cout: "0 pt sur la dérivée" },
          { description: [texte("Annoncer un maximum ou un minimum sans étudier le signe de F′")], cout: "0 pt sur la nature" },
          ...(exercice.famille === "trapeze" ? [{ description: [texte("Calculer avec la calculatrice en degrés une dérivée établie en radians")], cout: "−0,5" }] : []),
        ];
  return {
    reponseFinale: reponseBreveOptimisation(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs exactes (avec π ou une racine) ou arrondies au centième ; F et F′ sous une forme équivalente")]],
  };
}

function difficulteOptimisation(exercice: ExerciceOptimisation): 1 | 2 | 3 {
  if (exercice.famille === "trapeze" || exercice.famille === "fenetreA" || exercice.famille === "fenetreB") return 3;
  return 2;
}

/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionOptimisation(exercice: ExerciceOptimisation): BlocCorrection[] {
  return correctionDetailleeOptimisation(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationOptimisationGeometrique: AdaptateurFeuilleExercices<ExerciceOptimisation> = {
  titreDocument: "Optimisation géométrique — Dérivées et applications — Évaluation",
  nomFichierBase: "optimisation-geometrique-derivees-applications",
  genererInstance: genererExerciceOptimisation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceOptimisation,
  construireCorrection: construireCorrectionOptimisation,
  difficulte: difficulteOptimisation,
  reponseBreve: reponseBreveOptimisation,
  correctionDetaillee: correctionDetailleeOptimisation,
  bareme: baremeOptimisation,
  enoncePapier: enoncePapierOptimisation,
  dureeMinutes: 15,
  profilInstance: profilOptimisation,
  calculatriceIndispensable: ["cylindre-application"],
};
