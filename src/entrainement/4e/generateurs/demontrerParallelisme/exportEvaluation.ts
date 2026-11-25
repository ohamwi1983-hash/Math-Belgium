import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDemontrerParallelisme } from "./corrigeDetaille";
import type { ExerciceDemontrerParallelisme } from "../../core/demontrerParallelisme.types";
import { figurePositionsPlansSvg } from "../../ui/figurePositionsPlans";
import {
  consigneGlobale,
  elementsFigure,
  enonce,
  libelle,
  libelleCandidat,
  nomP,
  phraseSecantes,
} from "../../ui/formatDemontrerParallelisme";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerParallelisme, texteRaison } from "./index";
import { LIBELLE_CAS_GEN103, profilDemontrerParallelisme } from "./profil";
import { figureTroisPointsAlignesSvg } from "../../ui/figureTroisPointsAlignes";
import { dA, droiteFinale, nomsConstruits } from "../../ui/formatTroisPointsAlignes";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen103 (« Démontrer un parallélisme »).
 *
 * Énoncé papier = le texte (solide, milieux nommés, droite et plan(s)), la figure (plans dessinés par
 * le triangle de leurs trois points, droite de l'énoncé en rouge) et la consigne « Démontre que … »,
 * qui dit QUOI démontrer, jamais la méthode (décision de l'utilisateur). Les écrans d'apprentissage
 * (critère, droite(s) témoin(s), justification(s)) deviennent les étapes a, b, c (d) du corrigé ; la
 * figure complétée (droites témoins, sections des plans) va dans le corrigé (`figureHtml`).
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatDemontrerParallelisme.ts`,
 * `ui/figurePositionsPlans.ts`, `texteRaison`). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExerciceDemontrerParallelisme): string {
  // Trois points alignés : la pyramide, M, N, P et le triangle MNP seulement — les côtés prolongés et
  // I, J, K sont à construire (corrigé : `figureHtml`).
  const figure = e.variante === "alignes" ? figureTroisPointsAlignesSvg(e, { mode: "papier", construction: false, finale: false }) : figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigure(e, null, false) });
  return `<p class="paragraphe">${echapper(enonce(e))}</p>${figure}`;
}

/** Consignes des étapes (titres « Étape n — … » du corrigé), rédigées pour le papier. */
function consignesEtapes(e: ExerciceDemontrerParallelisme): string[] {
  if (e.variante === "alignes") {
    const noms = nomsConstruits(e);
    return e.cas === "general"
      ? [
          `Explique comment démontrer que trois points sont alignés à l'aide de deux plans.`,
          `Montre que ${noms} appartiennent à la fois au plan (MNP) et au plan (ABC).`,
          `Montre que ces deux plans sont sécants et conclus.`,
        ]
      : [
          `Explique comment démontrer que ${dA(droiteFinale(e))} est parallèle à ${dA(e.paralleles![1])}.`,
          `Montre que ${dA(droiteFinale(e))} est la droite d'intersection des plans (MNP) et (ABC).`,
          `Conclus à l'aide du théorème du toit.`,
        ];
  }
  if (e.variante === "droite-plan") {
    return [
      `Énonce le critère du cours qui permet de démontrer qu'une droite est parallèle à un plan.`,
      `Trouve une droite du plan ${nomP(e)} parallèle à ${libelle(e.droite)}.`,
      `Justifie ce parallélisme.`,
    ];
  }
  return [
    `Énonce le critère du cours qui permet de démontrer que deux plans sont parallèles.`,
    `Trouve deux droites sécantes du plan ${nomP(e, 0)} parallèles à deux droites du plan ${nomP(e, 1)}.`,
    `Justifie le premier parallélisme.`,
    `Justifie le second parallélisme.`,
  ];
}

function construireEnonce(e: ExerciceDemontrerParallelisme): SectionExercice {
  return {
    enteteFragments: [texte(enonce(e))],
    enteteHtml: enteteHtml(e),
    questions: consignesEtapes(e).map((c) => ({ consigne: [texte(c)] })),
  };
}

function enoncePapier(e: ExerciceDemontrerParallelisme): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [e.variante === "deux-plans" ? ["a", "b", "c", "d"] : ["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDemontrerParallelisme): FragmentConsigne[] {
  if (e.variante === "alignes") {
    const noms = nomsConstruits(e);
    const sur = e.construits.map((x) => `${x.nom} ∈ ${dA(x.droiteHaut)} et ${dA(x.droiteBase)}`).join(", ");
    if (e.cas === "general") {
      return [texte(`${noms} sont communs aux plans (MNP) et (ABC) (${sur}) ; ces plans sont distincts (M ∉ (ABC)) et sécants : ${noms} sont sur leur droite d'intersection, donc alignés.`)];
    }
    const [h, b] = e.paralleles!;
    return [texte(`${dA(droiteFinale(e))} est la droite d'intersection des plans (MNP) et (ABC) (${sur}) ; ces plans contiennent ${dA(h)} ∥ ${dA(b)} : par le théorème du toit, ${dA(droiteFinale(e))} ∥ ${dA(b)}.`)];
  }
  if (e.variante === "droite-plan") {
    return [texte(`${libelle(e.droite)} ∥ ${libelle(e.raison.droite2)}, une droite du plan ${nomP(e)} : ${texteRaison(e.raison)}`)];
  }
  const [a, b] = e.paireAttendue;
  return [
    texte(
      `${libelleCandidat(e.candidats[a]!)} et ${libelleCandidat(e.candidats[b]!)} ; ${phraseSecantes(e, a, b)}. ${texteRaison(e.candidats[a]!.raison!)} ${texteRaison(e.candidats[b]!.raison!)}`,
    ),
  ];
}

function correctionDetaillee(e: ExerciceDemontrerParallelisme): EtapeCorrection[] {
  return correctionDetailleeDemontrerParallelisme(e);
}

function construireCorrection(e: ExerciceDemontrerParallelisme): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDemontrerParallelisme): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  if (e.variante === "alignes" && e.cas === "general") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        c("a", "Idée : des points communs à deux plans sécants sont sur leur droite d'intersection", 1),
        c("b", "Chaque point placé dans les deux plans, par une droite de chaque plan qui le contient", 1.5),
        c("c", "Plans distincts (M hors du plan de la base) et sécants, droite d'intersection, conclusion", 1.5),
      ],
      erreursFrequentes: [
        err("Points déclarés alignés parce qu'ils sont dans un même plan", "0 pt sur c)"),
        err("Points placés « sur les côtés des triangles » au lieu des droites prolongées", "0,5 pt sur b)"),
        err("Plans sécants « en un point »", "0,5 pt sur c)"),
      ],
      reponsesAcceptees: [[texte("Toute rédaction qui montre que les trois points sont communs à deux plans distincts et sécants ; le nom donné à la droite d'intersection est libre.")]],
    };
  }
  if (e.variante === "alignes") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        c("a", "Idée : la droite est l'intersection des deux plans, puis le théorème du toit", 1),
        c("b", "Les deux points communs justifiés, plans distincts : la droite d'intersection", 1.5),
        c("c", "Théorème du toit appliqué aux deux droites parallèles de l'énoncé, chacune dans son plan", 1.5),
      ],
      erreursFrequentes: [
        err("Parallélisme affirmé parce que les deux droites sont dans le plan de la base", "0 pt sur c)"),
        err("Parallélisme affirmé « au jugé » sur la figure", "0 pt sur c)"),
      ],
      reponsesAcceptees: [[texte("Toute rédaction exacte qui établit que la droite est l'intersection des deux plans, puis applique le théorème du toit.")]],
    };
  }
  if (e.variante === "droite-plan") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        c("a", "Critère du cours cité (parallèle à une droite du plan)", 1),
        c("b", "Droite du plan, parallèle à la droite donnée, avec son appartenance au plan justifiée", 1.5),
        c("c", "Parallélisme des deux droites justifié par une propriété d'une figure plane (rectangle, parallélogramme, droite des milieux)", 1.5),
      ],
      erreursFrequentes: [
        err("Droite parallèle à la droite donnée, mais qui n'est pas dans le plan", "0 pt sur b)"),
        err("Parallélisme affirmé « au jugé » ou par « aucun point commun »", "0 pt sur c)"),
      ],
      reponsesAcceptees: [[texte("Toute autre droite du plan parallèle à la droite donnée, avec une justification exacte.")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", "Critère du cours cité (deux droites sécantes du premier plan parallèles à deux droites du second)", 1),
      c("b", "Deux droites sécantes du premier plan, chacune associée à une droite parallèle du second", 1),
      c("c", "Premier parallélisme justifié", 1),
      c("d", "Second parallélisme justifié", 1),
    ],
    erreursFrequentes: [
      err("Deux droites parallèles entre elles (une seule direction) utilisées pour le critère", "0 pt sur b)"),
      err("Une droite témoin qui n'est pas dans le plan annoncé", "0 pt sur b)"),
      err("Parallélisme affirmé « au jugé » ou parce que les droites sont dans deux faces parallèles", "0 pt sur la justification concernée"),
    ],
    reponsesAcceptees: [[texte("Toute autre paire de droites sécantes du premier plan parallèles à des droites du second, avec des justifications exactes.")]],
  };
}

/** Niveau (grille commune) : une étape par écran (critère, témoin(s), justification(s)) ; méthode 1
 * (l'énoncé papier dit QUOI démontrer, l'élève choisit le critère et la figure plane) ; aucun piège
 * dans les données. Constant dans chaque variante : 3 étapes (droite ∥ plan, 8 min) ou 4 (deux plans,
 * 10 min). Trois points alignés : 3 étapes (idée, points communs, conclusion), méthode 1, piège 0,
 * dans le cas général comme dans le cas toit (8 min). */
function criteresDifficulte(e: ExerciceDemontrerParallelisme): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 0 };
}

export const adaptateurEvaluationDemontrerParallelisme: AdaptateurFeuilleExercices<ExerciceDemontrerParallelisme> = {
  profilInstance: profilDemontrerParallelisme,
  libelleCasParticulier: LIBELLE_CAS_GEN103,
  // Trois points alignés : notion des § 5 (points communs à deux plans sécants) et § 8 (théorème du
  // toit) plutôt que des critères de parallélisme (§ 7) ; les deux autres variantes gardent le titre
  // de leur section.
  titrePapier: (e) =>
    e.variante !== "alignes" ? null : e.cas === "general" ? { titre: "Positions de deux plans", sectionId: "deux-plans" } : { titre: "Intersection de deux plans", sectionId: "percee" },
  titreDocument: "Démontrer un parallélisme — Évaluation",
  nomFichierBase: "demontrer-parallelisme",
  genererInstance: genererExerciceDemontrerParallelisme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
