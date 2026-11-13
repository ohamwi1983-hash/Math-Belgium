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
import type { ExerciceDeplacementsSuccessifs } from "../../core/deplacementsSuccessifs.types";
import {
  composantes,
  distanceArrondie,
  distanceParcourue,
  estDiagonale,
  lettreEcran,
  nomArrivee,
  nomCible,
  simplifierRacine,
  surUnAxe,
  total,
  vecteurCible,
  vecteurDistance,
  vecteurRetour,
  vecteursDeplacements,
  carreNorme,
} from "../../moteur/modeleDeplacementsSuccessifs";
import {
  chaslesLatex,
  colonneLatex,
  consignesEcrans,
  descriptionGrandPas,
  differenceColonneLatex,
  distanceExacteLatex,
  instructionTexte,
  introFragments,
  listeInstructions,
  nombreLatex,
  nomDistance,
  normeSubstitueeLatex,
  positionEnMots,
  questionsPapier,
  repereFragments,
  reponseDistanceFragments,
  sommeColonneLatex,
  suiteFragments,
  uniteTexte,
  vecteurCibleLatex,
  vecteurDistanceLatex,
  vecteurTotalLatex,
  vecteurU,
} from "../../ui/formatDeplacementsSuccessifs";
import { construireFigureDeplacements } from "../../ui/figureDeplacementsSuccessifs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDeplacementsSuccessifs } from "./index";
import { LIBELLE_CAS_DEPLACEMENTS_SUCCESSIFS, profilDeplacementsSuccessifs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen86. Énoncé papier = situation, liste des
 * instructions, repère, carte (sans le trajet) + les VRAIES questions distinctes : a) position
 * d'arrivée, b) distance ou dernier déplacement ou nombre de grands pas, c) retour ou distance. La
 * traduction des instructions (écran 1) devient la première étape du corrigé ; la carte avec le
 * trajet et les vecteurs va dans le corrigé (`figureHtml`).
 */

function enteteHtml(e: ExerciceDeplacementsSuccessifs): string {
  const items = listeInstructions(e)
    .map((f) => `<li>${fragmentsVersHtml(f)}</li>`)
    .join("");
  return (
    `<ul class="paragraphe" style="list-style:none;padding-left:0">${items}</ul>` +
    `<p class="paragraphe">${fragmentsVersHtml(suiteFragments(e))}</p>` +
    `<p class="paragraphe">${fragmentsVersHtml(repereFragments(e))}</p>` +
    construireFigureDeplacements(e, { theme: "papier" })
  );
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDeplacementsSuccessifs): SectionExercice {
  return {
    enteteFragments: introFragments(e),
    enteteHtml: enteteHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDeplacementsSuccessifs): EnoncePapier {
  const { consignes, etapes } = questionsPapier(e);
  return {
    section: { enteteFragments: introFragments(e), enteteHtml: enteteHtml(e), questions: consignes.map((consigne) => ({ consigne })) },
    etapesParQuestion: etapes,
    reponseBreve: reponseBreve(e),
  };
}

function totalFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  return [latex(`${vecteurTotalLatex(e)} = ${colonneLatex(total(e))}`)];
}

function reponseBreve(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  const a = [texte("a) "), ...totalFragments(e)];
  if (e.question === "retour") return [...a, texte(" ; b) "), ...reponseDistanceFragments(e), texte(" ; c) "), latex(`\\vec{AD} = ${colonneLatex(vecteurRetour(e))}`)];
  if (e.question === "dernier") return [...a, texte(" ; b) "), latex(`\\vec{PC} = ${colonneLatex(vecteurCible(e))}`), texte(" ; c) "), ...reponseDistanceFragments(e)];
  return [...a, texte(" ; b) "), latex(`k = ${e.k}`), texte(" ; c) "), ...reponseDistanceFragments(e)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé (une lettre par écran)
// ---------------------------------------------------------------------------------------------

function etapesTraduction(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "traduire");
  const diag = e.deplacements.some((d) => estDiagonale(d.direction))
    ? " Un pas en diagonale change les deux composantes d'une case chacune (vers le nord-ouest : une case vers l'ouest et une vers le nord)."
    : "";
  return [
    {
      label: "Méthode",
      sousQuestion: l,
      fragments: [texte("Repère : x vers l'est, y vers le nord. L'est et le nord donnent des composantes positives, l'ouest et le sud des composantes négatives ; le long d'un seul axe, l'autre composante est nulle." + diag)],
    },
    ...e.deplacements.map((d, i) => ({
      label: "Calcul",
      sousQuestion: l,
      fragments: [texte(`${i + 1}. ${instructionTexte(e.situation, d)} : `), latex(`${vecteurU(i + 1)} = ${colonneLatex(composantes(d))}`)],
    })),
  ];
}

function etapesTotal(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "total");
  const A = nomArrivee(e);
  const lieu = e.question === "repetition" ? "le rocher R" : `le point ${A}`;
  return [
    {
      label: "Méthode",
      sousQuestion: l,
      fragments: [texte("Relation de Chasles : les déplacements se mettent bout à bout, le déplacement total est leur somme : "), latex(chaslesLatex(e))],
      figureHtml: construireFigureDeplacements(e, { theme: "papier", trajet: true, complet: true }),
    },
    { label: "Calcul", sousQuestion: l, fragments: [latex(`${vecteurTotalLatex(e)} = ${sommeColonneLatex(e)} = ${colonneLatex(total(e))}`)] },
    { label: "Conclusion", sousQuestion: l, fragments: [...totalFragments(e), texte(` : ${lieu} se trouve ${positionEnMots(e, total(e))} du départ.`)] },
  ];
}

function etapesDistance(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "distance");
  const v = vecteurDistanceLatex(e);
  const nom = nomDistance(e);
  const u = uniteTexte(e.situation);
  const axe = surUnAxe(e);
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: l,
      fragments: axe
        ? [texte("La distance à vol d'oiseau est la norme de "), latex(v), texte(" ; ce vecteur est porté par un axe (une composante nulle) : sa norme est la valeur absolue de l'autre composante.")]
        : [texte("La distance à vol d'oiseau est la norme du vecteur qui relie les deux points : "), latex(`${nom} = \\|${v}\\| = \\sqrt{x_{${v}}^2 + y_{${v}}^2}`)],
    },
  ];
  const n = carreNorme(vecteurDistance(e));
  const entiere = simplifierRacine(n).b === 1;
  const calcul = `${normeSubstitueeLatex(e)} = ${distanceExacteLatex(e)}`;
  etapes.push({
    label: "Calcul",
    sousQuestion: l,
    fragments: [latex(entiere || e.precision === "exacte" ? calcul : `${calcul} \\approx ${nombreLatex(distanceArrondie(e))}`), texte(` ${u}`)],
  });
  etapes.push({ label: "Conclusion", sousQuestion: l, fragments: [...reponseDistanceFragments(e), texte(".")] });
  return etapes;
}

function etapesRetour(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "retour");
  return [
    { label: "Méthode", sousQuestion: l, fragments: [texte("Revenir au départ, c'est faire le déplacement opposé au déplacement total : "), latex(`\\vec{AD} = -\\vec{DA}`)] },
    { label: "Conclusion", sousQuestion: l, fragments: [latex(`\\vec{AD} = ${colonneLatex(vecteurRetour(e))}`), texte(`, soit ${positionEnMots(e, vecteurRetour(e))}.`)] },
  ];
}

function etapesCible(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "cible");
  const A = nomArrivee(e);
  const C = nomCible(e) ?? "C";
  return [
    {
      label: "Méthode",
      sousQuestion: l,
      fragments: [texte("Relation de Chasles, en passant par le départ D : "), latex(`\\vec{${A}${C}} = \\vec{${A}D} + \\vec{D${C}} = \\vec{D${C}} - \\vec{D${A}}`), texte(` (coordonnées de ${C} moins celles de ${A}).`)],
    },
    { label: "Calcul", sousQuestion: l, fragments: [latex(`${vecteurCibleLatex(e)} = ${differenceColonneLatex(e)} = ${colonneLatex(vecteurCible(e))}`)] },
    { label: "Conclusion", sousQuestion: l, fragments: [latex(`${vecteurCibleLatex(e)} = ${colonneLatex(vecteurCible(e))}`), texte(`, soit ${positionEnMots(e, vecteurCible(e))}.`)] },
  ];
}

function etapesK(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const l = lettreEcran(e, "k");
  const w = e.pas ?? { x: 1, y: 1 };
  const rt = vecteurCible(e);
  return [
    {
      label: "Méthode",
      sousQuestion: l,
      fragments: [texte(`Le grand pas (${descriptionGrandPas(w)}) se traduit par `), latex(`\\vec{w} = ${colonneLatex(w)}`), texte(". On cherche k entier tel que "), latex("\\vec{RT} = k \\cdot \\vec{w}"), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: l,
      fragments: [latex(`k = \\dfrac{${nombreLatex(rt.x)}}{${nombreLatex(w.x)}} = ${e.k}`), texte(" ; contrôle : "), latex(`${e.k} \\cdot ${w.y < 0 ? `(${nombreLatex(w.y)})` : nombreLatex(w.y)} = ${nombreLatex(rt.y)}`), texte(", la deuxième composante convient aussi.")],
    },
    { label: "Conclusion", sousQuestion: l, fragments: [texte(`Il faut répéter le grand pas ${e.k} fois : `), latex(`\\vec{RT} = ${e.k}\\,\\vec{w}`), texte(".")] },
  ];
}

function piege(e: ExerciceDeplacementsSuccessifs): EtapeCorrection {
  const l = lettreEcran(e, "distance");
  const u = uniteTexte(e.situation);
  const parcourue = distanceParcourue(e);
  const parcourueLatex = Number.isInteger(parcourue) ? nombreLatex(parcourue) : `${nombreLatex(Math.round(parcourue * 10) / 10)}`;
  const approx = Number.isInteger(parcourue) ? "=" : "\\approx";
  const nom = nomDistance(e);
  const distanceFrag = reponseDistanceFragments(e)[0]!;
  if (e.question === "retour") {
    const somme = e.deplacements.map((d) => (estDiagonale(d.direction) ? `${d.longueur === 1 ? "" : nombreLatex(d.longueur)}\\sqrt{2}` : nombreLatex(d.longueur))).join(" + ");
    return {
      label: "Piège",
      sousQuestion: l,
      fragments: [
        texte("Ne pas confondre avec la distance parcourue en suivant le trajet : "),
        latex(`${somme} ${approx} ${parcourueLatex}`),
        texte(` ${u}. À vol d'oiseau, on va en ligne droite : `),
        distanceFrag,
        texte(` ${u}.`),
      ],
    };
  }
  const v = vecteurDistance(e);
  return {
    label: "Piège",
    sousQuestion: l,
    fragments: [
      texte("Ne pas additionner les deux composantes (chemin en suivant le quadrillage) : "),
      latex(`${nombreLatex(Math.abs(v.x))} + ${nombreLatex(Math.abs(v.y))} = ${parcourueLatex}`),
      texte(` ${u}. À vol d'oiseau, la distance ${nom} est la norme : `),
      distanceFrag,
      texte(` ${u}.`),
    ],
  };
}

function correctionDetaillee(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapesTraduction(e), ...etapesTotal(e)];
  if (e.question === "retour") etapes.push(...etapesDistance(e), ...etapesRetour(e));
  else if (e.question === "dernier") etapes.push(...etapesCible(e), ...etapesDistance(e));
  else etapes.push(...etapesCible(e), ...etapesK(e), ...etapesDistance(e));
  etapes.push(piege(e));
  return etapes;
}

function construireCorrection(e: ExerciceDeplacementsSuccessifs): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceDeplacementsSuccessifs): BaremeExercice {
  const negatif = vecteursDeplacements(e).some((v) => v.x < 0 || v.y < 0);
  const erreurs: ErreurFrequente[] = [];
  if (negatif) erreurs.push({ description: [texte("Déplacement vers l'ouest ou le sud traduit par une composante positive")], cout: "0,25 pt par vecteur faux ; pas de double sanction sur la suite" });
  erreurs.push({
    description: [texte(e.question === "retour" ? "Distance parcourue (somme des longueurs des étapes) donnée au lieu de la distance à vol d'oiseau" : "Somme des composantes (chemin case par case) donnée au lieu de la distance à vol d'oiseau")],
    cout: "0 pt sur la distance",
  });
  erreurs.push({ description: [texte("Racine carrée oubliée (carré de la distance donné comme distance)")], cout: "moitié des points de la distance" });
  if (e.precision === "exacte") erreurs.push({ description: [texte("Valeur approchée donnée alors que la valeur exacte est demandée")], cout: "−0,5 pt" });
  else erreurs.push({ description: [texte("Arrondi absent ou faux")], cout: "−0,25 pt" });
  if (e.question === "retour") erreurs.push({ description: [texte("Vecteur de retour avec le mauvais signe (le vecteur total recopié)")], cout: "0 pt sur le retour" });
  if (e.question === "dernier") erreurs.push({ description: [texte("Dernier déplacement calculé à l'envers (P moins C) ou coordonnées de C recopiées")], cout: "0 pt sur le dernier déplacement" });

  const lt = lettreEcran(e, "traduire");
  const lT = lettreEcran(e, "total");
  const lD = lettreEcran(e, "distance");
  const criteres =
    e.question === "retour"
      ? [
          { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 1 },
          { sousQuestion: lT, critere: [texte("Déplacement total par Chasles (somme des composantes)")], points: 1 },
          { sousQuestion: lD, critere: [texte("Distance à vol d'oiseau : norme du déplacement total, précision demandée, unité")], points: 1.5 },
          { sousQuestion: lettreEcran(e, "retour"), critere: [texte("Vecteur de retour : opposé du déplacement total")], points: 0.5 },
        ]
      : e.question === "dernier"
        ? [
            { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 1 },
            { sousQuestion: lT, critere: [texte("Position de P par Chasles (somme des composantes)")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "cible"), critere: [texte("Dernier déplacement : coordonnées de C moins celles de P")], points: 1 },
            { sousQuestion: lD, critere: [texte("Longueur du dernier trajet : norme, précision demandée, unité")], points: 1.25 },
          ]
        : [
            { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 0.75 },
            { sousQuestion: lT, critere: [texte("Position du rocher par Chasles")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "cible"), critere: [texte("Vecteur du rocher au trésor")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "k"), critere: [texte("Nombre de grands pas, vérifié sur les deux composantes")], points: 0.75 },
            { sousQuestion: lD, critere: [texte("Distance rocher–trésor : norme, précision demandée, unité")], points: 1 },
          ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Valeur exacte sous une forme équivalente (racine non simplifiée ou simplifiée)")],
      [texte("Résultat juste à partir d'un vecteur faux à l'étape précédente : points de méthode accordés (pas de double sanction)")],
    ],
  };
}

function difficulte(e: ExerciceDeplacementsSuccessifs): 1 | 2 | 3 {
  return e.question === "repetition" ? 3 : 2;
}

export const adaptateurEvaluationDeplacementsSuccessifs: AdaptateurFeuilleExercices<ExerciceDeplacementsSuccessifs> = {
  profilInstance: profilDeplacementsSuccessifs,
  libelleCasParticulier: LIBELLE_CAS_DEPLACEMENTS_SUCCESSIFS,
  titreDocument: "Carte au trésor et randonnée : déplacements successifs — Évaluation",
  nomFichierBase: "deplacements-successifs",
  genererInstance: genererExerciceDeplacementsSuccessifs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
