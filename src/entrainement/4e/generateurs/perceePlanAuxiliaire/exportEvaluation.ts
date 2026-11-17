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
import { texte } from "../../../export/fragmentsDocx";
import type { ExercicePercee } from "../../core/perceePlanAuxiliaire.types";
import { figurePerceeSvg } from "../../ui/figurePercee";
import {
  consigneGlobale,
  elementsFinaux,
  enonce,
  faceDuPlan,
  legendeFinale,
  nomB,
  nomDroite,
  nomPlan,
  perceeDansSolide,
  phraseNomsConstruits,
  phrasePositionPercee,
  raisonCandidat,
} from "../../ui/formatPercee";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePercee } from "./index";
import { LIBELLE_CAS_PARTICULIER_PERCEE, profilPercee } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen102 (« Point de percée par plan auxiliaire »).
 *
 * Énoncé papier = le texte (solide, points nommés, droite d, plan α), la figure (d prolongée en
 * orange, α représenté par le triangle de ses trois points en violet — jamais le point de percée ni
 * aucun plan auxiliaire) et la consigne globale. Le cadre de la figure laisse la place des
 * prolongements. Les trois écrans d'apprentissage (plan auxiliaire, droite commune b, point de
 * percée) deviennent les étapes a, b, c du corrigé, résolues avec l'option de référence ; la
 * construction complète (π, b, P) va dans le corrigé (`figureHtml`), jamais dans l'énoncé.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatPercee.ts`,
 * `ui/figurePercee.ts`). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExercicePercee): string {
  return `<p class="paragraphe">${echapper(enonce(e))}</p>${figurePerceeSvg(e, { mode: "papier", etiquetteD: true })}`;
}

function consignesEtapes(e: ExercicePercee): string[] {
  return [
    `Choisis un plan auxiliaire π qui contient la droite d = ${nomDroite(e)}.`,
    `Construis la droite b commune à π et au plan α = ${nomPlan(e.plan)} : trouve deux points communs à ces deux plans.`,
    "Construis le point de percée P de d dans α, intersection de d et b.",
  ];
}

function construireEnonce(e: ExercicePercee): SectionExercice {
  return {
    enteteFragments: [texte(enonce(e))],
    enteteHtml: enteteHtml(e),
    questions: consignesEtapes(e).map((c) => ({ consigne: [texte(c)] })),
  };
}

function enoncePapier(e: ExercicePercee): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reference(e: ExercicePercee) {
  const o = e.options[e.reference]!;
  return { o, s: o.suite!, paire: o.suite!.paireAttendue };
}

function reponseBreve(e: ExercicePercee): FragmentConsigne[] {
  const { o, s, paire } = reference(e);
  const noms = phraseNomsConstruits(s, paire);
  return [texte(`Plan auxiliaire π = ${nomPlan(o.nom)} ; b = ${nomB(e, s, paire)}${noms ? ` (${noms.replace(/^On nomme /, "").replace(/\.$/, "")})` : ""} ; P est le point de rencontre de ${nomDroite(e)} et ${nomB(e, s, paire)}, ${perceeDansSolide(e) ? "sur le solide" : "hors du solide"}.`)];
}

function correctionDetaillee(e: ExercicePercee): EtapeCorrection[] {
  const { o, s, paire } = reference(e);
  const [a, b] = e.droite;
  const face = faceDuPlan(e, o.nom);
  const B = nomB(e, s, paire);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("On choisit un plan auxiliaire π qui contient d. Il coupe α suivant une droite b ; le point de percée est l'intersection de d et b, deux droites du plan π.")],
    },
    {
      label: "Plan auxiliaire",
      sousQuestion: "a",
      fragments: [texte(`Le plan π = ${nomPlan(o.nom)}${face ? ` (${face})` : ""} contient ${a} et ${b}, donc la droite d. Tout plan qui contient d convient : il coupe α, puisqu'il contient le point où d perce α.`)],
    },
    ...paire.map((i) => ({ label: "Point commun", sousQuestion: "b", fragments: [texte(raisonCandidat(e, o, s.candidats[i]!))] })),
    {
      label: "Conclusion",
      sousQuestion: "b",
      fragments: [texte(`${phraseNomsConstruits(s, paire)} La droite b, commune à π et α, est ${B}.`.trim())],
    },
    {
      label: "Construction",
      sousQuestion: "c",
      fragments: [texte(`Les droites d = ${nomDroite(e)} et b = ${B} sont toutes deux dans le plan π : elles se coupent en un point P. P est sur b, donc dans α : c'est le point de percée de d dans α. ${phrasePositionPercee(e)} ${legendeFinale()}`)],
      figureHtml: figurePerceeSvg(e, { mode: "papier", etiquetteD: true, ...elementsFinaux(e, o, paire) }),
    },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [texte("Le point où d semble croiser une arête ou un côté de α sur le dessin n'est pas le point de percée : d et cette droite sont souvent gauches. Seule l'intersection de d avec b, deux droites d'un même plan, est sûre.")],
    },
  ];
}

function construireCorrection(e: ExercicePercee): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExercicePercee): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", "Plan auxiliaire qui contient d, justifié par deux points de d", 1),
      c("b", "Deux points communs à π et α, chacun justifié (point des deux plans, ou rencontre de deux droites d'une même face), et droite b tracée", 1.5),
      c("c", "Point de percée construit comme intersection de d et b (prolongements si besoin), justifié : d et b sont dans π", 1.5),
    ],
    erreursFrequentes: [
      err("Point de percée pris là où d croise une arête de α sur le dessin (droites gauches)", "0 pt sur c)"),
      err("Plan auxiliaire qui ne contient qu'un seul point de d", "0 pt sur a) et b)"),
      err("Point « commun » obtenu avec deux droites qui ne sont pas dans une même face", "0 pt sur ce point"),
    ],
    reponsesAcceptees: [[texte("Tout autre plan auxiliaire qui contient d, et toute autre paire de points communs, pourvu que la construction soit exacte et justifiée.")]],
  };
}

function difficulte(e: ExercicePercee): 1 | 2 | 3 {
  return e.directe ? 2 : 3;
}

export const adaptateurEvaluationPercee: AdaptateurFeuilleExercices<ExercicePercee> = {
  profilInstance: profilPercee,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_PERCEE,
  titreDocument: "Point de percée par plan auxiliaire — Évaluation",
  nomFichierBase: "point-de-percee",
  genererInstance: genererExercicePercee,
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
