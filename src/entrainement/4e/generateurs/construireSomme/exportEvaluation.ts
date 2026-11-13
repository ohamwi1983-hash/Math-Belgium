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
import type { Composantes, EcranConstruction, ExerciceConstruireSomme, Point } from "../../core/construireSomme.types";
import {
  VEC_U,
  VEC_V,
  coefficientsEffectifs,
  centreEtiquettePoint,
  centreEtiquetteVecteur,
  ecrans,
  fenetre,
  moins,
  plus,
  pointFinal,
  pointsConstruits,
  pointsDonnes,
  vecteurDemandeLatex,
  vecteursDonnes,
} from "../../moteur/modeleConstruireSomme";
import {
  aidesEcrans,
  attenduConstructionLatex,
  colonneLatex,
  coefficientLatex,
  consigneGenerale,
  consignesEcrans,
  enonceGlobalPapier,
  origineFragments,
  sourceConstruction,
} from "../../ui/formatConstruireSomme";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceConstruireSomme } from "./index";
import { LIBELLE_CAS_CONSTRUIRE_SOMME, profilConstruireSomme } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen83. Énoncé papier = quadrillage avec les
 * données (vecteurs u et v, point O ; ou points A, B, C) + consigne globale (« Trace … à partir de
 * O », « Place le point M tel que … », « Donne les composantes … »). Les écrans d'apprentissage
 * (étape intermédiaire, résultat) deviennent les étapes du corrigé ; la construction attendue est
 * une FIGURE (`figureHtml`, même quadrillage que l'énoncé) — jamais dans l'énoncé. Séries
 * équilibrées : `profil.ts`.
 */

// ---------------------------------------------------------------------------------------------
// Figure SVG (quadrillage unité, même fenêtre que l'écran)
// ---------------------------------------------------------------------------------------------

const LARGEUR = 420;
const HAUTEUR = 280;
const COULEUR_GRILLE = "#d0d7e0";
const COULEUR_POINT = "#343a40";
const COULEUR_U = "#1971c2";
const COULEUR_V = "#9c36b5";
const COULEUR_AB_AC = "#868e96";
const COULEUR_ETAPE = "#0b7285";
const COULEUR_RESULTAT = "#e8590c";

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
}

function f1(n: number): string {
  return n.toFixed(1);
}

function grilleHtml(e: ExerciceConstruireSomme): { html: string; echelle: Echelle } {
  const vue = fenetre(e);
  const [x0, x1] = vue.x;
  const [y0, y1] = vue.y;
  const echelle: Echelle = {
    sx: (x) => ((x - x0) / (x1 - x0)) * LARGEUR,
    sy: (y) => HAUTEUR - ((y - y0) / (y1 - y0)) * HAUTEUR,
  };
  const lignes: string[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) lignes.push(`<line x1="${f1(echelle.sx(x))}" y1="0" x2="${f1(echelle.sx(x))}" y2="${HAUTEUR}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  for (let y = Math.ceil(y0); y <= y1; y++) lignes.push(`<line x1="0" y1="${f1(echelle.sy(y))}" x2="${LARGEUR}" y2="${f1(echelle.sy(y))}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  return { html: lignes.join(""), echelle };
}

/** Étiquette « lettre surmontée d'une flèche » (notation du cours), en géométrie SVG pure. */
function etiquetteVecteur(x: number, y: number, nom: string, couleur: string): string {
  const yFleche = y - 13;
  return (
    `<text x="${f1(x)}" y="${f1(y)}" font-size="15" font-style="italic" font-weight="700" text-anchor="middle" fill="${couleur}" font-family="'Times New Roman', serif">${nom}</text>` +
    `<line x1="${f1(x - 5)}" y1="${f1(yFleche)}" x2="${f1(x + 4)}" y2="${f1(yFleche)}" stroke="${couleur}" stroke-width="1.3"/>` +
    `<polygon points="${f1(x + 7)},${f1(yFleche)} ${f1(x + 3)},${f1(yFleche - 2.6)} ${f1(x + 3)},${f1(yFleche + 2.6)}" fill="${couleur}"/>`
  );
}

function flecheHtml(origine: Point, w: Composantes, couleur: string, echelle: Echelle, options: { epaisseur?: number; pointille?: boolean; nom?: string; centreNom?: Point } = {}): string {
  const x1 = echelle.sx(origine.x);
  const y1 = echelle.sy(origine.y);
  const x2 = echelle.sx(origine.x + w.x);
  const y2 = echelle.sy(origine.y + w.y);
  const L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const tete = 9;
  const xb = x2 - ux * tete;
  const yb = y2 - uy * tete;
  const p2 = `${f1(xb - uy * 4.5)},${f1(yb + ux * 4.5)}`;
  const p3 = `${f1(xb + uy * 4.5)},${f1(yb - ux * 4.5)}`;
  const tirets = options.pointille ? ` stroke-dasharray="5 4"` : "";
  let html =
    `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(xb)}" y2="${f1(yb)}" stroke="${couleur}" stroke-width="${options.epaisseur ?? 2.2}"${tirets}/>` +
    `<polygon points="${f1(x2)},${f1(y2)} ${p2} ${p3}" fill="${couleur}"/>`;
  if (options.nom && options.centreNom) {
    // Étiquette au point choisi par `centreEtiquetteVecteur` (même règle qu'à l'écran).
    html += etiquetteVecteur(echelle.sx(options.centreNom.x), echelle.sy(options.centreNom.y) + 6, options.nom, couleur);
  }
  return html;
}

function pointHtml(e: ExerciceConstruireSomme, p: Point, nom: string, echelle: Echelle, couleur = COULEUR_POINT): string {
  const x = echelle.sx(p.x);
  const y = echelle.sy(p.y);
  // Même placement de la lettre qu'à l'écran (loin des flèches de la figure complète).
  const c = centreEtiquettePoint(e, p, [...pointsDonnes(e).map((q) => q.point), ...(e.variante === "point" ? pointsConstruits(e) : [])]);
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.2" fill="${couleur}"/><text x="${f1(echelle.sx(c.x))}" y="${f1(echelle.sy(c.y) + 4.5)}" font-size="13" font-weight="700" text-anchor="middle" fill="${couleur}" font-family="sans-serif">${nom}</text>`;
}

/** Figure de l'énoncé (`etapes` = 0) ou du corrigé (toutes les constructions jusqu'à `etapes`). */
export function figureConstruireSomme(e: ExerciceConstruireSomme, corrige: boolean): string {
  const { html: grille, echelle } = grilleHtml(e);
  const morceaux: string[] = [grille];
  for (const v of vecteursDonnes(e)) morceaux.push(flecheHtml(v.origine, v.composantes, v.nom === "u" ? COULEUR_U : COULEUR_V, echelle, { nom: v.nom, centreNom: centreEtiquetteVecteur(e, v.origine, v.composantes) }));
  if (e.variante === "point") {
    for (const w of [e.u, e.v]) morceaux.push(flecheHtml(e.O, w, COULEUR_AB_AC, echelle, { epaisseur: 1.4 }));
  }
  const pointsSup: string[] = [];
  if (corrige) {
    if (e.variante === "lecture") {
      // Lecture : déplacement horizontal puis vertical, en pointillés.
      for (const v of vecteursDonnes(e)) {
        morceaux.push(flecheHtml(v.origine, { x: v.composantes.x, y: 0 }, COULEUR_ETAPE, echelle, { epaisseur: 1.6, pointille: true }));
        morceaux.push(flecheHtml(plus(v.origine, { x: v.composantes.x, y: 0 }), { x: 0, y: v.composantes.y }, COULEUR_ETAPE, echelle, { epaisseur: 1.6, pointille: true }));
      }
    } else {
      const liste = ecrans(e).filter((ec): ec is EcranConstruction => ec.type === "construction");
      liste.forEach((ec, i) => {
        const dernier = i === liste.length - 1;
        morceaux.push(flecheHtml(ec.origine, moins(ec.attendu, ec.origine), dernier ? COULEUR_RESULTAT : COULEUR_ETAPE, echelle, { epaisseur: dernier ? 3 : 2, pointille: !dernier }));
        if (e.variante === "point") pointsSup.push(pointHtml(e, ec.attendu, ec.role === "placerPoint" ? "M" : "P", echelle, dernier ? COULEUR_RESULTAT : COULEUR_ETAPE));
      });
    }
  }
  const points = pointsDonnes(e).map((p) => pointHtml(e, p.point, p.nom, echelle));
  return `<svg width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;max-width:100%;height:auto;border:1px solid #e6e6f0;border-radius:6px;background:#ffffff;">${morceaux.join("")}${points.join("")}${pointsSup.join("")}</svg>`;
}

// ---------------------------------------------------------------------------------------------
// Énoncés
// ---------------------------------------------------------------------------------------------

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceConstruireSomme): SectionExercice {
  return {
    enteteFragments: consigneGenerale(e),
    enteteHtml: figureConstruireSomme(e, false),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceConstruireSomme): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceGlobalPapier(e),
      enteteHtml: figureConstruireSomme(e, false),
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceConstruireSomme): FragmentConsigne[] {
  if (e.variante === "lecture") return [latex(`\\vec{u} = ${colonneLatex(e.u)}`), texte(" ; "), latex(`\\vec{v} = ${colonneLatex(e.v)}`)];
  const final = moins(pointFinal(e), e.O);
  if (e.variante === "point") return [texte("M s'obtient à partir de A : "), latex(`\\vec{AM} = ${colonneLatex(final)}`)];
  return [latex(`${vecteurDemandeLatex(e)} = ${colonneLatex(final)}`), texte(" (tracé à partir de O)")];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

const LETTRES = ["a", "b", "c", "d"];

/** « de 3 carreaux vers la droite et de 2 vers le bas » (composante nulle omise). */
function deplacement(w: Composantes): string {
  const parts: string[] = [];
  const carreaux = (n: number) => `${String(Math.abs(n)).replace(".", ",")} ${Math.abs(n) > 1 ? "carreaux" : "carreau"}`;
  if (w.x !== 0) parts.push(`de ${carreaux(w.x)} vers la ${w.x > 0 ? "droite" : "gauche"}`);
  if (w.y !== 0) parts.push(`de ${carreaux(w.y)} vers le ${w.y > 0 ? "haut" : "bas"}`);
  return parts.join(" et ");
}


function etapesEcran(e: ExerciceConstruireSomme, i: number, dernier: boolean): EtapeCorrection[] {
  const ec = ecrans(e)[i]!;
  const lettre = LETTRES[i]!;
  const aide = aidesEcrans(e)[i]![0]!;
  if (ec.type === "choix") {
    return [
      { label: "Méthode", sousQuestion: lettre, fragments: aide },
      { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`\\vec{AM} = ${ec.options[ec.correct]!}`)] },
    ];
  }
  if (ec.type === "lecture") {
    return [
      { label: "Méthode", sousQuestion: lettre, fragments: aide },
      ...[
        { nom: "u", c: e.u },
        { nom: "v", c: e.v },
      ].map(({ nom, c }) => ({
        label: "Lecture",
        sousQuestion: lettre,
        fragments: [latex(`\\vec{${nom}}`), texte(` : on se déplace ${deplacement(c)}, donc `), latex(`\\vec{${nom}} = ${colonneLatex(c)}`), texte(".")],
      })),
      { label: "Figure", sousQuestion: lettre, fragments: [texte("Déplacements horizontal puis vertical, en pointillés.")], figureHtml: figureConstruireSomme(e, true) },
    ];
  }
  const w = moins(ec.attendu, ec.origine);
  const source = sourceConstruction(e, ec, i);
  const calcul: FragmentConsigne[] =
    source && Math.abs(source.coefficient) !== 1
      ? [latex(`${ec.vecteurLatex} = ${coefficientLatex(source.coefficient)} \\cdot ${colonneLatex(source.composantes)} = ${colonneLatex(w)}`)]
      : [latex(attenduConstructionLatex(ec))];
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: lettre, fragments: aide },
    { label: "Construction", sousQuestion: lettre, fragments: [...calcul, texte(" : à partir de "), ...origineFragments(e, ec, i), texte(`, on se déplace ${deplacement(w)}.`)] },
  ];
  if (dernier) {
    etapes.push({
      label: "Figure",
      sousQuestion: lettre,
      fragments: [texte(e.variante === "point" ? "Construction (étapes en pointillés, point M en orange) :" : "Construction (étapes en pointillés, vecteur demandé en orange) :")],
      figureHtml: figureConstruireSomme(e, true),
    });
  }
  return etapes;
}

function piege(e: ExerciceConstruireSomme): EtapeCorrection {
  const nombre = ecrans(e).length;
  const derniere = LETTRES[nombre - 1]!;
  const premiere = "a";
  const P = (sousQuestion: string, fragments: FragmentConsigne[]): EtapeCorrection => ({ label: "Piège", sousQuestion, fragments });
  switch (e.methode) {
    case "triangle":
      return P(premiere, [texte("Bout à bout : la copie de "), latex(VEC_V), texte(" part de l'extrémité de "), latex(VEC_U), texte(", pas de O. Placer les deux vecteurs origine contre origine et relier leurs extrémités ne donne pas la somme.")]);
    case "parallelogramme":
      return P(derniere, [texte("La somme est la diagonale issue de O. Le segment qui joint les extrémités de "), latex(VEC_U), texte(" et de "), latex(VEC_V), texte(" représente une différence, pas la somme.")]);
    case "oppose":
      return P(premiere, [latex(`-${VEC_V}`), texte(" a le sens contraire de "), latex(VEC_V), texte(" : reporter "), latex(VEC_V), texte(" tel quel au bout de "), latex(VEC_U), texte(" donnerait "), latex(`${VEC_U}+${VEC_V}`), texte(".")]);
    case "origineCommune":
      return P(premiere, [latex(`${VEC_U}-${VEC_V}`), texte(" va de l'extrémité de "), latex(VEC_V), texte(" vers celle de "), latex(VEC_U), texte(" ; la flèche dans l'autre sens représente "), latex(`${VEC_V}-${VEC_U}`), texte(".")]);
    case "chaine": {
      const negatif = e.k < 0 ? { c: e.k, nom: VEC_U, lettre: "a" } : e.l < 0 ? { c: e.l, nom: VEC_V, lettre: "b" } : null;
      if (negatif) return P(negatif.lettre, [texte("Le coefficient de "), latex(negatif.nom), texte(" est négatif ("), latex(coefficientLatex(negatif.c)), texte(") : sa flèche va dans le sens contraire de "), latex(negatif.nom), texte(".")]);
      return P("b", [texte("Bout à bout : le second terme part de l'extrémité du premier, pas de O.")]);
    }
    case "AM":
      return P("b", [texte("Relation de Chasles : M s'atteint en passant par P, "), latex("\\vec{AM} = \\vec{AP} + \\vec{PM}"), texte(" ; le second terme part de P, pas de A.")]);
    case "MA":
      return P("a", [latex("\\vec{MA}"), texte(" et "), latex("\\vec{AM}"), texte(" sont opposés : sans retourner la relation, on placerait le symétrique de M par rapport à A.")]);
    case "lecture":
      return P("a", [texte("On lit de l'origine vers l'extrémité : un déplacement vers la gauche ou vers le bas donne une composante négative.")]);
  }
}

function correctionDetaillee(e: ExerciceConstruireSomme): EtapeCorrection[] {
  const n = ecrans(e).length;
  return [...Array.from({ length: n }, (_, i) => etapesEcran(e, i, i === n - 1)).flat(), piege(e)];
}

function construireCorrection(e: ExerciceConstruireSomme): BlocCorrection[] {
  return [
    { type: "html", html: figureConstruireSomme(e, true) },
    { type: "paragraphe", fragments: reponseBreve(e) },
  ];
}

// ---------------------------------------------------------------------------------------------
// Barème
// ---------------------------------------------------------------------------------------------

function bareme(e: ExerciceConstruireSomme): BaremeExercice {
  const criteres: CritereBareme[] = [];
  const erreurs: ErreurFrequente[] = [];
  const liste = ecrans(e);
  if (e.variante === "lecture") {
    criteres.push({ sousQuestion: "a", critere: [texte("Composantes de "), latex(VEC_U), texte(" : "), latex(colonneLatex(e.u))], points: 2 });
    criteres.push({ sousQuestion: "a", critere: [texte("Composantes de "), latex(VEC_V), texte(" : "), latex(colonneLatex(e.v))], points: 2 });
    erreurs.push({ description: [texte("Signe oublié pour un déplacement vers la gauche ou vers le bas")], cout: "−0,5 par composante" });
    erreurs.push({ description: [texte("Composantes inversées (verticale en haut)")], cout: "−1 par vecteur" });
  } else {
    const poids = liste.length === 2 ? [2, 2] : [1, 1.5, 1.5];
    liste.forEach((ec, i) => {
      const lettre = LETTRES[i]!;
      if (ec.type === "choix") {
        criteres.push({ sousQuestion: lettre, critere: [texte("Relation retournée : "), latex(`\\vec{AM} = ${ec.options[ec.correct]!}`)], points: poids[i]! });
        return;
      }
      if (ec.type !== "construction") return;
      const dernier = i === liste.length - 1;
      criteres.push({
        sousQuestion: lettre,
        critere: dernier
          ? e.variante === "point"
            ? [texte("Point M placé exactement ("), latex(`\\vec{AM} = ${colonneLatex(moins(ec.attendu, e.O))}`), texte(")")]
            : [texte("Vecteur demandé tracé à partir de O, extrémité exacte ("), latex(attenduConstructionLatex(ec)), texte(")")]
          : [texte("Étape intermédiaire : "), latex(ec.vecteurLatex), texte(" tracé à partir de la bonne origine")],
        points: poids[i]!,
      });
    });
    if (e.methode === "triangle" || e.methode === "chaine") erreurs.push({ description: [texte("Vecteurs placés origine contre origine au lieu de bout à bout")], cout: "0 pt sur le résultat" });
    if (e.methode === "parallelogramme") erreurs.push({ description: [texte("Segment joignant les extrémités pris pour la somme (au lieu de la diagonale issue de O)")], cout: "0 pt sur le résultat" });
    if (e.variante === "difference") erreurs.push({ description: [texte("Sens de la différence inversé (flèche vers l'extrémité de v)")], cout: "moitié des points de l'étape" });
    const eff = coefficientsEffectifs(e);
    if (eff.k < 0 || eff.l < 0) erreurs.push({ description: [texte("Coefficient négatif tracé dans le sens du vecteur")], cout: "moitié des points de l'étape" });
    if (e.methode === "MA") erreurs.push({ description: [texte("Relation non retournée (M placé au symétrique par rapport à A)")], cout: "0 pt sur les étapes suivantes" });
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees:
      e.variante === "lecture" ? [[texte("Composantes écrites en ligne entre parenthèses, si l'ordre est juste")]] : [[texte("Autre méthode de construction (triangle ou parallélogramme), si l'extrémité obtenue est exacte")]],
  };
}

function difficulte(e: ExerciceConstruireSomme): 1 | 2 | 3 {
  switch (e.methode) {
    case "triangle":
    case "parallelogramme":
    case "oppose":
    case "lecture":
      return 1;
    case "origineCommune":
    case "AM":
      return 2;
    case "chaine":
      return !Number.isInteger(e.k) || !Number.isInteger(e.l) ? 3 : 2;
    case "MA":
      return 3;
  }
}


export const adaptateurEvaluationConstruireSomme: AdaptateurFeuilleExercices<ExerciceConstruireSomme> = {
  profilInstance: profilConstruireSomme,
  libelleCasParticulier: LIBELLE_CAS_CONSTRUIRE_SOMME,
  titreDocument: "Construire une somme, une différence, un point — Évaluation",
  nomFichierBase: "construire-somme-difference-point",
  genererInstance: genererExerciceConstruireSomme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
