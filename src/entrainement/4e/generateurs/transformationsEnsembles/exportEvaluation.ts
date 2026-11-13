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
import type { Axe, ExerciceTransformationsEnsembles, Intervalle, Transformation } from "../../core/transformationsEnsembles.types";
import { appliquer, axeDe, ensembleDeDepart, ensembleFinal, natureDe, transformationsDeLAxe } from "../../moteur/modeleTransformationsEnsembles";
import {
  CONSIGNE_GENERALE,
  CONSIGNE_PAPIER,
  DOM_G,
  IM_G,
  consignesEcrans,
  donneesFragments,
  ensembleGLatex,
  intervalleLatex,
  listeTransformations,
  operationBornes,
  sigleTransformation,
} from "../../ui/formatTransformationsEnsembles";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationsEnsembles } from "./index";
import { LIBELLE_CAS_TRANSFORMATIONS_ENSEMBLES, profilTransformationsEnsembles } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen72. Énoncé papier = données + liste des
 * transformations + consigne globale (« Détermine le domaine et l'ensemble image de g ») ; les trois
 * écrans (classer, suivre le domaine, suivre l'ensemble image) deviennent les étapes a, b, c du
 * corrigé. Séries équilibrées : `profil.ts`.
 */

function donneesHtml(e: ExerciceTransformationsEnsembles): string {
  const items = listeTransformations(e).map((f) => `<li>${fragmentsVersHtml(f)}</li>`).join("");
  return `<p class="paragraphe">${fragmentsVersHtml(donneesFragments(e))}</p><ul class="paragraphe" style="list-style:none;padding-left:0">${items}</ul>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTransformationsEnsembles): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceTransformationsEnsembles): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceTransformationsEnsembles): FragmentConsigne[] {
  return [latex(`${DOM_G} = ${intervalleLatex(ensembleFinal(e, "H"))}`), texte(" ; "), latex(`${IM_G} = ${intervalleLatex(ensembleFinal(e, "V"))}`)];
}

function rangs(liste: { rang: number }[]): string {
  const r = liste.map((x) => String(x.rang));
  if (r.length === 1) return `la transformation ${r[0]}`;
  return `les transformations ${r.slice(0, -1).join(", ")} et ${r[r.length - 1]}`;
}

function etapesAxe(e: ExerciceTransformationsEnsembles, axe: Axe, lettre: string): EtapeCorrection[] {
  const liste = transformationsDeLAxe(e, axe);
  const nom = axe === "H" ? "le domaine" : "l'ensemble image";
  if (liste.length === 0) {
    return [
      { label: "Méthode", sousQuestion: lettre, fragments: [texte(`Aucune transformation de la liste ne modifie ${nom} : il ne change pas.`)] },
      { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${ensembleGLatex(axe)} = ${intervalleLatex(ensembleDeDepart(e, axe))}`)] },
    ];
  }
  const etapes: EtapeCorrection[] = [];
  let courant = ensembleDeDepart(e, axe);
  for (const { t, rang } of liste) {
    const suivant = appliquer(t, courant);
    etapes.push({
      label: "Calcul",
      sousQuestion: lettre,
      fragments: [texte(`${rang}. `), ...sigleTransformation(t), texte(" appliquée à "), latex(intervalleLatex(courant)), texte(" — "), ...operationBornes(t, courant), texte(" On obtient "), latex(intervalleLatex(suivant)), texte(".")],
    });
    courant = suivant;
  }
  etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${ensembleGLatex(axe)} = ${intervalleLatex(courant)}`)] });
  return etapes;
}

/** Résultat obtenu en appliquant les transformations d'un axe dans l'ordre inverse (piège « ordre »). */
function resultatOrdreInverse(e: ExerciceTransformationsEnsembles, axe: Axe): Intervalle {
  return [...transformationsDeLAxe(e, axe)].reverse().reduce((i, { t }) => appliquer(t, i), ensembleDeDepart(e, axe));
}

function piege(e: ExerciceTransformationsEnsembles): EtapeCorrection {
  // 1. Symétrie : l'échange des bornes et des crochets.
  for (const axe of ["H", "V"] as const) {
    let courant = ensembleDeDepart(e, axe);
    for (const { t } of transformationsDeLAxe(e, axe)) {
      if (natureDe(t) === "S") {
        const faux: Intervalle = { gauche: -courant.gauche, gaucheFerme: courant.gaucheFerme, droite: -courant.droite, droiteFerme: courant.droiteFerme };
        return {
          label: "Piège",
          sousQuestion: axe === "H" ? "b" : "c",
          fragments: [
            texte(`${t.type} : changer les signes ne suffit pas. `),
            latex(intervalleLatex(courant)),
            texte(" devient "),
            latex(intervalleLatex(appliquer(t, courant))),
            texte(" — les bornes s'échangent et chaque crochet suit sa borne —, et pas "),
            latex(intervalleLatex(faux)),
            texte("."),
          ],
        };
      }
      courant = appliquer(t, courant);
    }
  }
  // 2. Ordre : deux transformations de natures différentes sur le même ensemble.
  for (const axe of ["H", "V"] as const) {
    const inverse = resultatOrdreInverse(e, axe);
    const final = ensembleFinal(e, axe);
    // Seulement si l'ordre inverse donne des bornes lisibles (au plus une décimale).
    const lisible = [inverse.gauche, inverse.droite].every((b) => !Number.isFinite(b) || Number.isInteger(b * 10));
    if (lisible && intervalleLatex(inverse) !== intervalleLatex(final)) {
      return {
        label: "Piège",
        sousQuestion: axe === "H" ? "b" : "c",
        fragments: [texte("L'ordre compte : appliquer les transformations dans le désordre donnerait "), latex(intervalleLatex(inverse)), texte(" au lieu de "), latex(intervalleLatex(final)), texte(".")],
      };
    }
  }
  // 3. Sinon : se tromper d'ensemble.
  const exemple = e.transformations[0]!;
  return {
    label: "Piège",
    sousQuestion: "a",
    fragments: [
      texte("Ne pas appliquer une transformation au mauvais ensemble : "),
      ...sigleTransformation(exemple),
      texte(axeDe(exemple) === "H" ? " déplace les points horizontalement, elle ne change pas l'ensemble image." : " déplace les points verticalement, elle ne change pas le domaine."),
    ],
  };
}

function correctionDetaillee(e: ExerciceTransformationsEnsembles): EtapeCorrection[] {
  const h = transformationsDeLAxe(e, "H");
  const v = transformationsDeLAxe(e, "V");
  const classement: FragmentConsigne[] = [
    texte(h.length > 0 ? `Le domaine est modifié par ${rangs(h)} (${h.length > 1 ? "horizontales" : "horizontale"})` : "Aucune transformation ne modifie le domaine"),
    texte(" ; "),
    texte(v.length > 0 ? `l'ensemble image par ${rangs(v)} (${v.length > 1 ? "verticales" : "verticale"}).` : "aucune ne modifie l'ensemble image."),
  ];
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Une transformation horizontale (TH, SOY, EH, CH) change les abscisses des points : elle agit sur le domaine. Une transformation verticale (TV, SOX, EV, CV) change les ordonnées : elle agit sur l'ensemble image.")],
    },
    { label: "Conclusion", sousQuestion: "a", fragments: classement },
    ...etapesAxe(e, "H", "b"),
    ...etapesAxe(e, "V", "c"),
    piege(e),
  ];
}

function construireCorrection(e: ExerciceTransformationsEnsembles): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceTransformationsEnsembles): BaremeExercice {
  const symetrie = e.transformations.some((t: Transformation) => natureDe(t) === "S");
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Transformation appliquée au mauvais ensemble (ex. une TH appliquée à l'ensemble image)")], cout: "0 pt sur l'ensemble concerné" },
    { description: [texte("Transformations d'un même ensemble appliquées dans le désordre")], cout: "moitié des points de l'ensemble concerné" },
  ];
  if (symetrie) erreurs.unshift({ description: [texte("Symétrie : signes changés sans échanger les bornes ni les crochets")], cout: "0,5 pt sur l'ensemble concerné" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Chaque transformation rattachée au domaine ou à l'ensemble image")], points: 1 },
      { sousQuestion: "b", critere: [texte("Domaine de g : bornes et crochets justes, étapes montrées")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Ensemble image de g : bornes et crochets justes, étapes montrées")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Bornes écrites sous forme de fraction ou de décimal équivalent")]],
  };
}

function difficulte(e: ExerciceTransformationsEnsembles): 1 | 2 | 3 {
  const n = e.transformations.length;
  if (n === 2 && e.niveau === 1) return 1;
  if (n >= 5 || (e.niveau === 2 && n >= 4)) return 3;
  return 2;
}

export const adaptateurEvaluationTransformationsEnsembles: AdaptateurFeuilleExercices<ExerciceTransformationsEnsembles> = {
  profilInstance: profilTransformationsEnsembles,
  libelleCasParticulier: LIBELLE_CAS_TRANSFORMATIONS_ENSEMBLES,
  titreDocument: "Domaine et ensemble image après transformations — Évaluation",
  nomFichierBase: "domaine-image-transformations",
  genererInstance: genererExerciceTransformationsEnsembles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
