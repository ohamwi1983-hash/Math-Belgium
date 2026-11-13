import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { Affine, ExerciceChantierTerrains } from "../../core/chantierTerrains.types";
import { angleDegres, demiVecteur, equationPiquet, lettreInconnue, point, valeurCritere, valeurInconnue, vecteursUtiles } from "../../moteur/modeleChantierTerrains";
import {
  CONSIGNE_GENERALE,
  EGALITE_ENCLOS,
  colonneLatex,
  consignePapier,
  contexte,
  critereCalculLatex,
  ecrans,
  equationLatex,
  formuleCritereLatex,
  indicePhraseJuste,
  nomCritere,
  nombreLatex,
  phrasesConclusion,
  pointLatex,
  recitFragments,
  soustractionLatex,
  traductionOutil,
  vecLatex,
  affineLatex,
} from "../../ui/formatChantierTerrains";
import { figureChantierSvg } from "../../ui/figureChantierTerrains";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChantierTerrains } from "./index";
import { profilChantierTerrains } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen88. Énoncé papier = situation, coordonnées,
 * plan (sans codage ni point cherché) et la question du contexte (« Justifie par un calcul
 * vectoriel ») ; les quatre écrans (outil, vecteurs, critère, réponse) deviennent les étapes a, b,
 * c, d du corrigé, dont le plan avec les vecteurs utiles (`figureHtml`). Séries équilibrées :
 * `profil.ts` (le verdict n'y entre jamais).
 */

function donneesHtml(e: ExerciceChantierTerrains): string {
  return `<p class="paragraphe">${fragmentsVersHtml(recitFragments(e))}</p><div class="paragraphe">${figureChantierSvg(e)}</div>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceChantierTerrains): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: ecrans(e).map((ecran) => ({ consigne: ecran.consigne })),
  };
}

function enoncePapier(e: ExerciceChantierTerrains): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: consignePapier(e) }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceChantierTerrains): FragmentConsigne[] {
  if (e.verdict !== null) {
    const v = valeurCritere(e);
    return [texte(`${e.verdict ? "Oui" : "Non"} — ${nomCritere(e)} : `), latex(v === 0 ? "0" : `${nombreLatex(v)} \\neq 0`)];
  }
  return [latex(pointLatex(e.cherche!))];
}

function fragmentsVecteurs(e: ExerciceChantierTerrains): FragmentConsigne[] {
  const lettre = lettreInconnue(e);
  const morceaux: FragmentConsigne[] = [texte("Composantes, arrivée moins départ : ")];
  vecteursUtiles(e).forEach((v, i) => {
    if (i > 0) morceaux.push(texte(" et "));
    morceaux.push(latex(`${soustractionLatex(e, v)} = ${colonneLatex(affineLatex(v.x, lettre), affineLatex(v.y, lettre))}`));
  });
  morceaux.push(texte("."));
  return morceaux;
}

function etapesCritere(e: ExerciceChantierTerrains): EtapeCorrection[] {
  const [u, v] = vecteursUtiles(e);
  switch (e.situation) {
    case "milieu": {
      const nom = e.cherche!.nom;
      const am = demiVecteur(e);
      return [
        {
          label: "Calcul",
          sousQuestion: "c",
          fragments: [latex(`${vecLatex("A", nom)} = \\frac{1}{2}\\,${vecLatex("A", "B")} = ${colonneLatex(`\\frac{1}{2} \\times ${facteur(u!.x.cst)}`, `\\frac{1}{2} \\times ${facteur(u!.y.cst)}`)} = ${colonneLatex(nombreLatex(am.x), nombreLatex(am.y))}`), texte(".")],
        },
      ];
    }
    case "enclos": {
      const c = point(e, "C");
      return [
        { label: "Méthode", sousQuestion: "c", fragments: [texte("ABCD est un parallélogramme si et seulement si "), latex(EGALITE_ENCLOS), texte(" (côtés opposés, même sens).")] },
        { label: "Calcul", sousQuestion: "c", fragments: [texte("Avec "), latex("D(x_D\\,;\\,y_D)"), texte(" : "), latex(`${vecLatex("D", "C")}${colonneLatex(`${nombreLatex(c.x)} - x_D`, `${nombreLatex(c.y)} - y_D`)}`), texte(".")] },
      ];
    }
    case "piquet": {
      const lettre = lettreInconnue(e)!;
      return [
        { label: "Méthode", sousQuestion: "c", fragments: [texte("A, B et P alignés : le déterminant de "), latex(vecLatex("A", "B")), texte(" et "), latex(vecLatex("A", "P")), texte(" est nul : "), latex(`${formuleCritereLatex(e)} = 0`), texte(".")] },
        {
          label: "Calcul",
          sousQuestion: "c",
          fragments: [latex(`${facteur(u!.x.cst)} \\times ${terme(v!.y, lettre)} - ${facteur(u!.y.cst)} \\times ${terme(v!.x, lettre)} = 0`), texte(", soit "), latex(equationLatex(e)), texte(".")],
        },
      ];
    }
    default:
      return [
        { label: "Méthode", sousQuestion: "c", fragments: [texte(`${nomCritere(e).charAt(0).toUpperCase()}${nomCritere(e).slice(1)} de `), latex(vecLatex(u!.origine, u!.extremite)), texte(" et "), latex(vecLatex(v!.origine, v!.extremite)), texte(" : "), latex(formuleCritereLatex(e)), texte(".")] },
        { label: "Calcul", sousQuestion: "c", fragments: [latex(critereCalculLatex(e)), texte(".")] },
      ];
  }
}

function etapesConclusion(e: ExerciceChantierTerrains): EtapeCorrection[] {
  if (e.verdict !== null) {
    return [{ label: "Conclusion", sousQuestion: "d", fragments: phrasesConclusion(e)[indicePhraseJuste(e)]! }];
  }
  const c = e.cherche!;
  const a = point(e, "A");
  if (e.situation === "milieu") {
    const am = demiVecteur(e);
    const somme = (x: number, d: number) => `${nombreLatex(x)} ${d < 0 ? "-" : "+"} ${nombreLatex(Math.abs(d))}`;
    return [
      { label: "Calcul", sousQuestion: "d", fragments: [latex(`x_${c.nom} = x_A + x_{${vecLatex("A", c.nom)}} = ${somme(a.x, am.x)} = ${nombreLatex(c.x)}`), texte(" et "), latex(`y_${c.nom} = ${somme(a.y, am.y)} = ${nombreLatex(c.y)}`), texte(".")] },
      { label: "Conclusion", sousQuestion: "d", fragments: [texte(`${contexte(e).sujet.charAt(0).toUpperCase()}${contexte(e).sujet.slice(1)} se trouve en `), latex(pointLatex(c)), texte(".")] },
    ];
  }
  if (e.situation === "enclos") {
    const pc = point(e, "C");
    const [ab] = vecteursUtiles(e);
    return [
      {
        label: "Calcul",
        sousQuestion: "d",
        fragments: [latex(`${nombreLatex(pc.x)} - x_D = ${nombreLatex(ab!.x.cst)}`), texte(" donc "), latex(`x_D = ${nombreLatex(c.x)}`), texte(" ; "), latex(`${nombreLatex(pc.y)} - y_D = ${nombreLatex(ab!.y.cst)}`), texte(" donc "), latex(`y_D = ${nombreLatex(c.y)}`), texte(".")],
      },
      { label: "Conclusion", sousQuestion: "d", fragments: [texte(`${contexte(e).sujet.charAt(0).toUpperCase()}${contexte(e).sujet.slice(1)} : `), latex(pointLatex(c)), texte(".")] },
    ];
  }
  const lettre = lettreInconnue(e)!;
  const eq = equationPiquet(e);
  return [
    { label: "Calcul", sousQuestion: "d", fragments: [latex(`${affineLatex({ coef: eq.coef, cst: 0 }, lettre)} = ${nombreLatex(-eq.cst)}`), texte(" donc "), latex(`${lettre} = \\dfrac{${nombreLatex(-eq.cst)}}{${nombreLatex(eq.coef)}} = ${nombreLatex(valeurInconnue(e))}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte(`Il faut planter ${contexte(e).sujet} en `), latex(pointLatex(c)), texte(".")] },
  ];
}

/** Facteur dans un produit : parenthèses autour d'un négatif. */
function facteur(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

/** Composante dans un produit : parenthèses autour d'une expression en lettre ou d'un négatif. */
function terme(a: Affine, lettre: string): string {
  return a.coef !== 0 ? `(${affineLatex(a, lettre)})` : facteur(a.cst);
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

function arrondi1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function piege(e: ExerciceChantierTerrains): EtapeCorrection {
  const [u, v] = vecteursUtiles(e);
  const nu = vecLatex(u!.origine, u!.extremite);
  switch (e.situation) {
    case "alignement":
    case "paralleles": {
      if (!e.verdict) {
        const ecart = Math.min(angleDegres({ x: u!.x.cst, y: u!.y.cst }, { x: v!.x.cst, y: v!.y.cst }), 180 - angleDegres({ x: u!.x.cst, y: u!.y.cst }, { x: v!.x.cst, y: v!.y.cst }));
        return { label: "Piège", sousQuestion: "d", fragments: [texte(`Sur le plan, l'écart ne se voit presque pas (environ ${arrondi1(ecart)}°) : seul le calcul tranche. Un déterminant non nul, même petit, veut dire « non ».`)] };
      }
      const g = pgcd(v!.x.cst, u!.x.cst);
      const num = Math.abs(v!.x.cst) / g;
      const den = Math.abs(u!.x.cst) / g;
      const negatif = v!.x.cst * u!.x.cst < 0;
      const kLatex = den === 1 ? (num === 1 ? (negatif ? "-" : "") : nombreLatex((negatif ? -1 : 1) * num)) : `${negatif ? "-" : ""}\\frac{${num}}{${den}}`;
      return {
        label: "Piège",
        sousQuestion: "d",
        fragments: [texte("Colinéaires ne veut pas dire égaux : "), latex(`${vecLatex(v!.origine, v!.extremite)} = ${kLatex}\\,${nu}`), texte(e.situation === "paralleles" ? " — la longueur des deux tronçons ne compte pas, seule la direction compte." : " — les composantes sont proportionnelles, pas identiques.")],
      };
    }
    case "equerre": {
      const angle = angleDegres({ x: u!.x.cst, y: u!.y.cst }, { x: v!.x.cst, y: v!.y.cst });
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [
          texte("Pour un angle droit, c'est le produit scalaire "),
          latex("x_u \\cdot x_v + y_u \\cdot y_v"),
          texte(" — pas le déterminant, qui teste la colinéarité."),
          ...(e.verdict ? [] : [texte(` Ici, l'angle en A mesure environ ${arrondi1(angle)}° : à l'œil, impossible de le distinguer d'un angle droit.`)]),
        ],
      };
    }
    case "milieu": {
      const a = point(e, "A");
      const b = point(e, "B");
      return {
        label: "Piège",
        sousQuestion: "d",
        fragments: [texte("Ne pas s'arrêter aux composantes de "), latex(vecLatex("A", e.cherche!.nom)), texte(" : ce sont celles d'un déplacement, pas les coordonnées du point. Contrôle par la moyenne : "), latex(`\\frac{${nombreLatex(a.x)} + ${nombreLatex(b.x)}}{2} = ${nombreLatex(e.cherche!.x)}`), texte(".")],
      };
    }
    case "enclos": {
      const c = point(e, "C");
      const faux = { nom: "D", x: c.x + u!.x.cst, y: c.y + u!.y.cst };
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [texte("L'ordre des lettres compte : "), latex(`${vecLatex("A", "B")} = ${vecLatex("C", "D")}`), texte(" donnerait "), latex(pointLatex(faux)), texte(", et ABCD serait un quadrilatère croisé.")],
      };
    }
    case "piquet": {
      const lettre = lettreInconnue(e)!;
      return {
        label: "Piège",
        sousQuestion: "b",
        fragments: [texte(`Garder la lettre ${lettre} dans la composante de `), latex(vecLatex("A", "P")), texte(" ("), latex(`${lettre === "y" ? "y" : "x"}_{${vecLatex("A", "P")}} = ${affineLatex(lettre === "y" ? v!.y : v!.x, lettre)}`), texte(") : c'est elle qui donne l'équation. Contrôle : avec la valeur trouvée, "), latex(vecLatex("A", "P")), texte(" doit être un multiple de "), latex(nu), texte(".")],
      };
    }
  }
}

function correctionDetaillee(e: ExerciceChantierTerrains): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: traductionOutil(e) },
    { label: "Calcul", sousQuestion: "b", fragments: fragmentsVecteurs(e), figureHtml: figureChantierSvg(e, true) },
    ...etapesCritere(e),
    ...etapesConclusion(e),
    piege(e),
  ];
}

function construireCorrection(e: ExerciceChantierTerrains): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: etape.fragments }));
}

function bareme(e: ExerciceChantierTerrains): BaremeExercice {
  const erreurs: ErreurFrequente[] = [{ description: [texte("Composantes calculées « départ moins arrivée » (signes inversés)")], cout: "−0,5 par vecteur" }];
  const acceptees: FragmentConsigne[][] = [];
  if (e.verdict !== null) {
    erreurs.unshift({ description: [texte(e.situation === "equerre" ? "Déterminant calculé au lieu du produit scalaire" : "Produit scalaire calculé au lieu du déterminant")], cout: "0 pt sur a), c) et d)" });
    erreurs.push({ description: [texte("Conclusion tirée du dessin, ou résultat non nul jugé « négligeable »")], cout: "0 pt sur d)" });
    acceptees.push([texte("Tout autre couple de vecteurs valable (par exemple "), latex(e.situation === "paralleles" ? `${vecLatex("B", "A")} \\text{ et } ${vecLatex("D", "C")}` : `${vecLatex("B", "A")} \\text{ et } ${vecLatex("B", "C")}`), texte(e.situation === "equerre" ? ")… à condition que l'angle testé soit bien celui en A" : ")")]);
    if (e.situation !== "equerre") acceptees.push([texte("Déterminant calculé avec les vecteurs dans l'autre ordre (valeur opposée), si la conclusion est juste")]);
  } else if (e.situation === "milieu") {
    erreurs.push({ description: [texte("Composantes de "), latex(vecLatex("A", e.cherche!.nom)), texte(" données comme coordonnées du point")], cout: "0 pt sur d)" });
    acceptees.push([texte("Coordonnées obtenues directement par la moyenne des coordonnées de A et B")]);
  } else if (e.situation === "enclos") {
    erreurs.push({ description: [texte("Égalité "), latex(`${vecLatex("A", "B")} = ${vecLatex("C", "D")}`), texte(" (quadrilatère croisé)")], cout: "0 pt sur c) et d)" });
    acceptees.push([texte("Égalité "), latex(`${vecLatex("A", "D")} = ${vecLatex("B", "C")}`), texte(" ou "), latex(`${vecLatex("B", "A")} = ${vecLatex("C", "D")}`), texte(", qui donnent le même point D")]);
  } else {
    erreurs.push({ description: [texte("Coordonnée inconnue de P remplacée par un nombre au hasard, ou équation mal développée")], cout: "0 pt sur c) et d)" });
    acceptees.push([texte("Équation écrite sous une autre forme équivalente (multipliée par un nombre, déterminant de "), latex(`${vecLatex("A", "P")} \\text{ et } ${vecLatex("A", "B")}`), texte(")")]);
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Outil vectoriel reconnu derrière les mots du contexte")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Composantes des vecteurs utiles justes")], points: 1.5 },
      { sousQuestion: "c", critere: [texte(e.verdict !== null ? `${nomCritere(e).charAt(0).toUpperCase()}${nomCritere(e).slice(1)} posé et calculé` : e.situation === "piquet" ? "Condition d'alignement traduite en équation" : e.situation === "enclos" ? "Égalité de vecteurs correcte, composantes de DC" : "Composantes du demi-vecteur")], points: 1 },
      { sousQuestion: "d", critere: [texte(e.verdict !== null ? "Réponse dans le contexte, justifiée par la valeur du critère" : "Coordonnées du point cherché, réponse dans le contexte")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

const DIFFICULTE: Record<ExerciceChantierTerrains["situation"], 1 | 2 | 3> = {
  alignement: 2,
  equerre: 2,
  paralleles: 2,
  milieu: 1,
  enclos: 2,
  piquet: 3,
};

export const adaptateurEvaluationChantierTerrains: AdaptateurFeuilleExercices<ExerciceChantierTerrains> = {
  profilInstance: profilChantierTerrains,
  titreDocument: "Chantier et terrains — Évaluation",
  nomFichierBase: "chantier-terrains",
  genererInstance: genererExerciceChantierTerrains,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte: (e) => DIFFICULTE[e.situation],
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
