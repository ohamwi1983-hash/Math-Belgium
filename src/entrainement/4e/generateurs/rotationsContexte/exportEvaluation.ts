import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceRotationsContexte } from "../../core/rotationsContexte.types";
import {
  angleReference,
  calculExact,
  grandeurRetour,
  hauteurDirecte,
  kInverse,
  positionDirecte,
  quadrantDe,
  solutionsContexte,
  solutionsTheta,
  thetaDirect,
} from "../../moteur/modeleRotationsContexte";
import {
  CONSIGNE_GENERALE,
  alphaCalculLatex,
  consignesEcrans,
  contexteTexte,
  egalOuApprox,
  equationInverseLatex,
  hauteurExacteLatex,
  libelleOrigine,
  nombreLatex,
  nombreFixeLatex,
  objet,
  objetMajuscule,
  pronom,
  espacer,
  heureApresMidi,
  precisionPapier,
  produitExactLatex,
  questionTexte,
  reference,
  retoursLatex,
  solutionsThetaLatex,
  thetaCalculLatex,
  valeurExacteLatex,
} from "../../ui/formatRotationsContexte";
import { figureRotationsContexteSvg } from "../../ui/figureRotationsContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceRotationsContexte } from "./index";
import { LIBELLE_CAS_ROTATIONS_CONTEXTE, profilRotationsContexte } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen79. Énoncé papier = la situation, son schéma
 * (cercle trigonométrique superposé, sans réponse) et la question du contexte avec sa précision ;
 * les quatre écrans d'apprentissage (repérage, angle / équation, position / solutions, réponse /
 * retour au contexte) deviennent les étapes a, b, c, d du corrigé, dont la dernière porte le schéma
 * corrigé (`figureHtml`). Calculatrice interdite (profil `exacte`) : la précision papier demande la
 * valeur exacte. Séries équilibrées : `profil.ts`.
 */

function enonceTexte(e: ExerciceRotationsContexte): string {
  return `${contexteTexte(e)} ${questionTexte(e)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceRotationsContexte): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} ${enonceTexte(e)}`)],
    enteteHtml: figureRotationsContexteSvg(e, "enonce"),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceRotationsContexte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${enonceTexte(e)} ${precisionPapier(e, calculExact(e))}`)],
      enteteHtml: figureRotationsContexteSvg(e, "enonce"),
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceRotationsContexte): FragmentConsigne[] {
  if (e.sens === "direct") {
    const H = hauteurDirecte(e);
    if (calculExact(e) && !Number.isInteger(H * 100)) return [texte("Hauteur : "), latex(`${hauteurExacteLatex(e)} \\approx ${nombreFixeLatex(H, 2)}\\text{ ${e.unite}}`)];
    return [texte("Hauteur : "), latex(`${egalOuApprox(H, 2).replace(/^=\s*/, "")}\\text{ ${e.unite}}`)];
  }
  return [latex(retoursLatex(e))];
}

function etapeRepere(e: ExerciceRotationsContexte): EtapeCorrection[] {
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Sur le cercle trigonométrique, 0° est à droite, 90° en haut, 180° à gauche, 270° en bas ; le sens trigonométrique est le sens contraire des aiguilles d'une montre.")],
    },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments: [
        texte(`${objetMajuscule(e)} part de la position ${libelleOrigine(e.origine)} et tourne dans le sens ${e.rotation === 1 ? "trigonométrique" : "horaire"} : `),
        latex(`\\theta = ${e.origine}^\\circ ${e.rotation === 1 ? "+" : "-"} \\alpha`),
        texte(", où α est l'angle parcouru depuis le départ."),
      ],
    },
  ];
}

/** Valeur exacte, suivie de sa valeur approchée seulement si elle contient une racine. */
function exactEtApproche(exact: string, v: number): string {
  return exact.includes("\\sqrt") ? `${exact} ${egalOuApprox(v, 2)}` : exact;
}

function correctionDirecte(e: ExerciceRotationsContexte): EtapeCorrection[] {
  const theta = thetaDirect(e);
  const ref = angleReference(theta);
  const q = quadrantDe(theta);
  const { x, y } = positionDirecte(e);
  const H = hauteurDirecte(e);
  const exacte = calculExact(e);
  const etapes: EtapeCorrection[] = [...etapeRepere(e)];
  if (e.situation === "roue" || e.situation === "horloge") etapes.push({ label: "Calcul", sousQuestion: "b", fragments: [texte("Angle parcouru : "), latex(alphaCalculLatex(e))] });
  etapes.push({ label: "Conclusion", sousQuestion: "b", fragments: [latex(thetaCalculLatex(e))] });
  const signes = `quadrant ${q}, angle du premier quadrant ${ref}°`;
  if (exacte) {
    etapes.push(
      { label: "Méthode", sousQuestion: "c", fragments: [texte("Coordonnées : "), latex(`(r\\cos\\theta \\,;\\, r\\sin\\theta)`), texte(", avec "), latex(`r = ${nombreLatex(e.rayon)}\\text{ ${e.unite}}`), texte(` ; ${signes} :`), latex(`\\cos ${theta}^\\circ = ${valeurExacteLatex("cos", theta)} \\quad ; \\quad \\sin ${theta}^\\circ = ${valeurExacteLatex("sin", theta)}`)] },
      {
        label: "Calcul",
        sousQuestion: "c",
        fragments: [latex(`x = ${nombreLatex(e.rayon)}\\cos ${theta}^\\circ = ${exactEtApproche(produitExactLatex(e.rayon, "cos", theta), x)}`), texte(" ; "), latex(`y = ${nombreLatex(e.rayon)}\\sin ${theta}^\\circ = ${exactEtApproche(produitExactLatex(e.rayon, "sin", theta), y)}`)],
      },
    );
  } else {
    etapes.push(
      { label: "Méthode", sousQuestion: "c", fragments: [texte("Coordonnées : "), latex(`(r\\cos\\theta \\,;\\, r\\sin\\theta)`), texte(", avec "), latex(`r = ${nombreLatex(e.rayon)}\\text{ ${e.unite}}`), texte(` ; ${signes} : les signes de cos θ et de sin θ sont ceux de ce quadrant (la calculatrice les donne directement).`)] },
      { label: "Calcul", sousQuestion: "c", fragments: [latex(`x = ${nombreLatex(e.rayon)}\\cos ${theta}^\\circ ${egalOuApprox(x, 2)}`), texte(" ; "), latex(`y = ${nombreLatex(e.rayon)}\\sin ${theta}^\\circ ${egalOuApprox(y, 2)}`), texte(` (en ${e.unite})`)] },
    );
  }
  etapes.push(
    { label: "Méthode", sousQuestion: "d", fragments: [texte(`Hauteur au-dessus ${reference(e)} = hauteur du centre + ordonnée du point :`), latex("h + y")] },
    {
      label: "Conclusion",
      sousQuestion: "d",
      fragments: [
        latex(
          exacte
            ? `\\text{hauteur} = ${nombreLatex(e.hauteurCentre)} + (${produitExactLatex(e.rayon, "sin", theta)}) = ${hauteurExacteLatex(e)} ${hauteurExacteLatex(e).includes("\\sqrt") ? `\\approx ${nombreFixeLatex(H, 2)}` : ""}\\text{ ${e.unite}}`
            : `\\text{hauteur} = ${nombreLatex(e.hauteurCentre)} + ${nombreLatex(e.rayon)}\\sin ${theta}^\\circ ${egalOuApprox(H, 2)}\\text{ ${e.unite}}`,
        ),
      ],
      figureHtml: figureRotationsContexteSvg(e, "corrige"),
    },
  );
  etapes.push(piegeDirect(e));
  return etapes;
}

function piegeDirect(e: ExerciceRotationsContexte): EtapeCorrection {
  const theta = thetaDirect(e);
  const faux = ((e.alpha ?? 0) % 360 + 360) % 360;
  return {
    label: "Piège",
    sousQuestion: "b",
    fragments: [
      texte(`Prendre directement α comme angle trigonométrique (${faux}°) revient à faire partir ${objet(e)} de la droite et tourner dans le sens trigonométrique : ici ${pronom(e)} part de ${e.origine}° et tourne dans le sens ${e.rotation === 1 ? "trigonométrique" : "horaire"}, d'où `),
      latex(`\\theta = ${theta}^\\circ`),
      texte("."),
    ],
  };
}

function correctionInverse(e: ExerciceRotationsContexte): EtapeCorrection[] {
  const k = kInverse(e);
  const sols = solutionsContexte(e);
  const thetas = solutionsTheta(e);
  const etapes: EtapeCorrection[] = [...etapeRepere(e)];
  etapes.push(
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Le point repéré par θ est à la hauteur "), latex("h + r\\sin\\theta"), texte(` au-dessus ${reference(e)}.`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(equationInverseLatex(e))] },
  );
  if (thetas.length === 1) {
    etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: [texte(`sin θ = ${k === 1 ? "1" : "−1"} : un seul point du cercle, ${k === 1 ? "tout en haut" : "tout en bas"}, donc `), latex(solutionsThetaLatex(e))] });
  } else if (Math.abs(k) === 0.5) {
    etapes.push(
      { label: "Méthode", sousQuestion: "c", fragments: [texte("Valeur remarquable : "), latex("\\sin 30^\\circ = \\dfrac{1}{2}"), texte(`, angle de référence 30° ; ${k > 0 ? "k > 0 : quadrants I et II" : "k < 0 : quadrants III et IV"}.`)] },
      { label: "Conclusion", sousQuestion: "c", fragments: [latex(k > 0 ? "\\theta_1 = 30^\\circ \\quad ; \\quad \\theta_2 = 180^\\circ - 30^\\circ = 150^\\circ" : "\\theta_1 = 180^\\circ + 30^\\circ = 210^\\circ \\quad ; \\quad \\theta_2 = 360^\\circ - 30^\\circ = 330^\\circ")] },
    );
  } else {
    const a = (Math.asin(k) * 180) / Math.PI;
    etapes.push(
      {
        label: "Calcul",
        sousQuestion: "c",
        fragments: [
          texte("Calculatrice en degrés : "),
          latex(`\\sin^{-1}(${nombreLatex(k, 4)}) \\approx ${nombreFixeLatex(a, 1)}^\\circ`),
          texte(a < 0 ? " ; ramené dans [0° ; 360°[ : " : " ; "),
          ...(a < 0 ? [latex(`${nombreFixeLatex(a, 1)}^\\circ + 360^\\circ \\approx ${nombreFixeLatex(a + 360, 1)}^\\circ`), texte(" ; ")] : []),
          texte("la seconde solution a le même sinus : "),
          latex(`180^\\circ - (${nombreFixeLatex(a, 1)}^\\circ) \\approx ${nombreFixeLatex(180 - a, 1)}^\\circ`),
        ],
      },
      { label: "Conclusion", sousQuestion: "c", fragments: [latex(solutionsThetaLatex(e))] },
    );
  }
  const formule = e.rotation === 1 ? `\\alpha = \\theta - ${e.origine}^\\circ` : `\\alpha = ${e.origine}^\\circ - \\theta`;
  const alphas = sols.map((s, i) => `\\alpha${sols.length > 1 ? `_{${i + 1}}` : ""} ${egalOuApprox(s.alpha, 1)}^\\circ`).join(" \\quad ; \\quad ");
  etapes.push({ label: "Méthode", sousQuestion: "d", fragments: [texte("Angle parcouru depuis le départ, ramené dans [0° ; 360°[ : "), latex(formule), texte(" ; d'où "), latex(alphas), texte(".")] });
  const conversion: FragmentConsigne[] = (() => {
    switch (e.situation) {
      case "roue":
        return [texte(`Un tour dure ${e.periode} min = ${(e.periode ?? 0) * 60} s : `), latex(`t = \\dfrac{\\alpha}{360^\\circ} \\times ${(e.periode ?? 0) * 60}\\text{ s}`), texte(". ")];
      case "eolienne":
        return [texte(`Un tour dure ${e.periode} s : `), latex(`t = \\dfrac{\\alpha}{360^\\circ} \\times ${e.periode}\\text{ s}`), texte(". ")];
      case "horloge":
        return [texte("6° par minute : "), latex("m = \\dfrac{\\alpha}{6^\\circ}"), texte(". ")];
      default:
        return [];
    }
  })();
  etapes.push({ label: "Conclusion", sousQuestion: "d", fragments: [...conversion, latex(retoursLatex(e)), ...(e.situation === "horloge" ? [texte(`, soit ${sols.every((s) => Number.isInteger(s.valeur)) ? "à" : "vers"} ${sols.map((s) => heureApresMidi(s.valeur)).join(" et ")}.`)] : [])], figureHtml: figureRotationsContexteSvg(e, "corrige") });
  etapes.push(piegeInverse(e));
  return etapes;
}

function piegeInverse(e: ExerciceRotationsContexte): EtapeCorrection {
  const thetas = solutionsTheta(e);
  if (thetas.length === 1) {
    return { label: "Piège", sousQuestion: "c", fragments: [texte("Une seule solution ici : la droite horizontale touche le cercle en un seul point. Ne pas inventer une seconde solution symétrique.")] };
  }
  return {
    label: "Piège",
    sousQuestion: "d",
    fragments: [
      texte("Les angles θ trouvés sont comptés depuis 0° (à droite) dans le sens trigonométrique : ce ne sont pas encore les réponses. Il faut les recompter depuis la position de départ ("),
      latex(`${e.origine}^\\circ`),
      texte(`), dans le sens ${e.rotation === 1 ? "trigonométrique" : "horaire"}.`),
    ],
  };
}

function correctionDetaillee(e: ExerciceRotationsContexte): EtapeCorrection[] {
  return (e.sens === "direct" ? correctionDirecte(e) : correctionInverse(e)).map((etape) => ({ ...etape, fragments: espacer(etape.fragments) }));
}

function construireCorrection(e: ExerciceRotationsContexte): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceRotationsContexte): BaremeExercice {
  if (e.sens === "direct") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Position de départ et sens de rotation reportés sur le cercle trigonométrique")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Angle trigonométrique θ (θ₀ ± α, réduit à [0° ; 360°[)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Coordonnées (r cos θ ; r sin θ) avec les bons signes")], points: 1.5 },
        { sousQuestion: "d", critere: [texte(`Hauteur au-dessus ${reference(e)} : h + y, avec l'unité`)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("α pris directement comme angle trigonométrique (origine ou sens du contexte ignorés)")], cout: "0 pt sur b), suite corrigée sans double sanction" },
        { description: [texte("Mauvais signe de sin θ (quadrant mal identifié)")], cout: "0,5 pt sur c)" },
        { description: [texte("Hauteur donnée par rapport au centre (h oublié)")], cout: "0,5 pt sur d)" },
      ],
      reponsesAcceptees: [[texte("Valeur exacte ou valeur approchée au centième")], [texte("θ non réduit mais correct à 360° près, si la suite est juste (0,5 pt retiré sur b)")]],
    };
  }
  const unique = solutionsTheta(e).length === 1;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Position de départ et sens de rotation reportés sur le cercle trigonométrique")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Mise en équation h + r sin θ = H, puis valeur de sin θ")], points: 1 },
      { sousQuestion: "c", critere: [texte(unique ? "Solution unique de sin θ = ±1 dans [0° ; 360°[" : "Les deux solutions de sin θ = k dans [0° ; 360°[")], points: 1.5 },
      { sousQuestion: "d", critere: [texte(`Retour au contexte (${grandeurRetour(e.situation) === "angle" ? "angles de rotation depuis le départ" : grandeurRetour(e.situation) === "minutes" ? "minutes après midi" : "instants"}), avec l'unité`)], points: 1 },
    ],
    erreursFrequentes: [
      unique
        ? { description: [texte("Une seconde solution ajoutée à tort")], cout: "0,5 pt sur c)" }
        : { description: [texte("Une seule solution donnée (la seconde, 180° − θ₁, oubliée)")], cout: "0,75 pt sur c)" },
      { description: [texte("Angles θ donnés comme réponse, sans les recompter depuis le départ")], cout: "0 pt sur d)" },
      { description: [texte("Sens de rotation inversé dans la conversion")], cout: "0,5 pt sur d)" },
    ],
    reponsesAcceptees: [[texte("Écart dû à un arrondi au dixième de degré des angles θ")]],
  };
}

function difficulte(e: ExerciceRotationsContexte): 1 | 2 | 3 {
  if (e.sens === "inverse") return solutionsTheta(e).length === 1 ? 2 : 3;
  return 2;
}

export const adaptateurEvaluationRotationsContexte: AdaptateurFeuilleExercices<ExerciceRotationsContexte> = {
  profilInstance: profilRotationsContexte,
  libelleCasParticulier: LIBELLE_CAS_ROTATIONS_CONTEXTE,
  titreDocument: "Le cercle dans le réel : rotations en contexte — Évaluation",
  nomFichierBase: "rotations-contexte",
  genererInstance: genererExerciceRotationsContexte,
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
