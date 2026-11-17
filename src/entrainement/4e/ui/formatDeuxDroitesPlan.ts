import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { texte } from "../../export/fragmentsDocx";
import type {
  DeuxDroitesJustifiees,
  DroiteNommee,
  ExerciceDeuxDroites,
  ExerciceDeuxDroitesPlan,
  ExercicePlanDetermine,
  IdRaisonPlan,
  LieuPointCommun,
  OptionPlanCommun,
  OptionPointCommun,
  PositionDeuxDroites,
} from "../core/deuxDroitesPlan.types";
import type { Point3D } from "../core/geometrieEspace.types";

/**
 * Textes de gen100 (« Positions de deux droites et plan déterminé ») — écran ET papier : une seule
 * source. Notations du cours : (AB) pour une droite, (ABC) pour un plan, [AB] pour un segment.
 * Aucune coordonnée. Rien dans l'énoncé, les titres, les consignes ni les aides des écrans a et b
 * ne trahit le verdict : les consignes sont les mêmes quelle que soit la position.
 */

// ---------------------------------------------------------------------------------------------
// Notations
// ---------------------------------------------------------------------------------------------

export function droiteTexte(d: readonly string[]): string {
  return `(${d.join("")})`;
}

export function planTexte(nom: readonly string[]): string {
  return `(${nom.join("")})`;
}

const LIBELLES_SOLIDES: Record<string, (s: string[]) => string> = {
  cube: (s) => `le cube ${s.join("")}`,
  parallelepipede: (s) => `le parallélépipède rectangle ${s.join("")}`,
  prisme: (s) => `le prisme droit ${s.join("")}`,
  pyramideCarree: (s) => `la pyramide ${["S", ...s.filter((n) => n !== "S")].join("")}`,
  tetraedre: (s) => `le tétraèdre ${s.join("")}`,
};

/** « le cube ABCDEFGH », « la pyramide SABCD ». */
export function libelleSolide(e: ExerciceDeuxDroitesPlan): string {
  return LIBELLES_SOLIDES[e.solide.id]!(Object.keys(e.solide.sommets));
}

function majuscule(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** « I est le milieu de [EF] et J le centre de la face ABCD. » — vide sans point défini. */
export function definitionsTexte(e: ExerciceDeuxDroitesPlan): string {
  const p = e.pointsNommes;
  if (p.length === 0) return "";
  const morceaux = p.map((x, i) => (i === 0 ? `${x.nom} est ${x.definition}` : `${x.nom} ${x.definition}`));
  const liste = morceaux.length === 1 ? morceaux[0]! : `${morceaux.slice(0, -1).join(", ")} et ${morceaux[morceaux.length - 1]}`;
  return `${liste}.`;
}

/** « A, I et C ». */
export function listeEt(noms: readonly string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

export const LIBELLES_POSITION: Record<PositionDeuxDroites, string> = {
  secantes: "Sécantes",
  paralleles: "Parallèles",
  gauches: "Gauches",
};

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

/** Les données de l'exercice, en une phrase (« les droites (AB) et (GH) », « les points A, I et C »…). */
export function donneesTexte(e: ExerciceDeuxDroitesPlan): string {
  if (e.variante === "positions") return `les droites ${droiteTexte(e.d1)} et ${droiteTexte(e.d2)}`;
  const p = e.points;
  if (e.type === "troisPoints") return `les points ${listeEt(p)}`;
  if (e.type === "droitePoint") return `la droite ${droiteTexte(p.slice(0, 2))} et le point ${p[2]}`;
  return `les droites ${droiteTexte(p.slice(0, 2))} et ${droiteTexte(p.slice(2, 4))}`;
}

/** Consigne générale (écran et papier) : le solide, les points définis, les données. */
export function consigneGenerale(e: ExerciceDeuxDroitesPlan): string {
  const defs = definitionsTexte(e);
  return `Sur ${libelleSolide(e)} ci-dessous, on considère ${donneesTexte(e)}, en couleur sur le dessin.${defs ? ` ${defs}` : ""}`;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export type EcranDeuxDroitesPlan =
  | {
      type: "choix";
      titre: string;
      consigne: FragmentConsigne[];
      options: FragmentConsigne[][];
      bonne: number;
      aides: FragmentConsigne[][];
      reponse: FragmentConsigne[];
    }
  | {
      type: "nomPlan";
      titre: string;
      consigne: FragmentConsigne[];
      aides: FragmentConsigne[][];
      reponse: FragmentConsigne[];
    };

export function nombreEcrans(e: ExerciceDeuxDroitesPlan): number {
  return e.variante === "positions" ? 3 : 2;
}

function t(s: string): FragmentConsigne[] {
  return [texte(s)];
}

// --- famille « positions » ------------------------------------------------------------------

export function libelleOptionPlan(o: OptionPlanCommun): string {
  return o.type === "aucun" ? "Non : aucun plan ne contient ces deux droites" : `Oui : le plan ${planTexte(o.nom)}`;
}

export function questionPlanCommun(e: ExerciceDeuxDroites): string {
  return `Les droites ${droiteTexte(e.d1)} et ${droiteTexte(e.d2)} sont-elles contenues dans un même plan ? Si oui, lequel ?`;
}

export function reponsePlanCommun(e: ExerciceDeuxDroites): string {
  return e.planCommun ? `Oui : le plan ${planTexte(e.planCommun)} contient les deux droites.` : "Non : aucun plan ne contient ces deux droites.";
}

export function phrasePosition(e: ExerciceDeuxDroites): string {
  const nom = { secantes: "sécantes", paralleles: "parallèles", gauches: "gauches" }[e.position];
  return `Les droites ${droiteTexte(e.d1)} et ${droiteTexte(e.d2)} sont ${nom}.`;
}

/** Description du point commun de deux sécantes (corrigé, réponse attendue). */
export function lieuTexte(lieu: LieuPointCommun): string {
  switch (lieu.type) {
    case "nomme":
      return `au point ${lieu.nom}`;
    case "arete":
      return `en un point de l'arête [${lieu.arete.join("")}] qui n'est pas nommé`;
    case "face":
      return lieu.centre ? `au centre de la face ${lieu.face.join("")}, qui n'est pas nommé` : `en un point intérieur à la face ${lieu.face.join("")}, qui n'est pas nommé`;
    case "interieur":
      return lieu.centre ? "au centre du solide, qui n'est pas nommé" : "en un point intérieur au solide, qui n'est pas nommé";
    case "hors":
      return "en un point situé hors du solide dessiné : il faut prolonger les deux droites";
  }
}

export function libelleOptionPointCommun(o: OptionPointCommun): string {
  if (o.type === "point") return `Au point ${o.nom}`;
  if (o.type === "surSolide") return "En un point du solide qui n'est pas nommé (sur une arête, une face ou à l'intérieur)";
  return "En un point situé hors du solide dessiné (en prolongeant les droites)";
}

export function droitePercante(e: DeuxDroitesJustifiees): DroiteNommee {
  const j = e.justification;
  return j.type === "gauches" && j.contenue === 1 ? e.d2 : e.d1;
}

export function droiteContenue(e: DeuxDroitesJustifiees): DroiteNommee {
  const j = e.justification;
  return j.type === "gauches" && j.contenue === 1 ? e.d1 : e.d2;
}

export function questionJustification(e: ExerciceDeuxDroites): string {
  const j = e.justification;
  const d1 = droiteTexte(e.d1);
  const d2 = droiteTexte(e.d2);
  if (j.type === "secantes") return `Où les droites ${d1} et ${d2} se coupent-elles ?`;
  if (j.type === "paralleles") return `Elles sont dans le plan ${planTexte(e.planCommun!)}. Pour prouver qu'elles sont parallèles : quelle droite du solide est parallèle à chacune d'elles ?`;
  return `Pour prouver qu'elles sont gauches : la droite ${droiteTexte(droitePercante(e))} perce le plan ${planTexte(j.plan)}, qui contient ${droiteTexte(droiteContenue(e))}. En quel point ?`;
}

export function libellesOptionsJustification(e: ExerciceDeuxDroites): string[] {
  const j = e.justification;
  if (j.type === "secantes") return j.options.map(libelleOptionPointCommun);
  if (j.type === "paralleles") return j.options.map((d) => `La droite ${droiteTexte(d)}`);
  return j.options.map((n) => `Au point ${n}`);
}

export function reponseJustification(e: DeuxDroitesJustifiees): string {
  const j = e.justification;
  const d1 = droiteTexte(e.d1);
  const d2 = droiteTexte(e.d2);
  if (j.type === "secantes") return `Dans le plan ${planTexte(e.planCommun!)}, ${d1} et ${d2} ne sont pas parallèles : elles se coupent ${lieuTexte(j.lieu)}.`;
  if (j.type === "paralleles") {
    const ref = droiteTexte(j.options[j.bonne]!);
    return `${d1} et ${d2} sont toutes les deux parallèles à ${ref} : elles sont donc parallèles entre elles (et dans le plan ${planTexte(e.planCommun!)}).`;
  }
  const percante = droiteTexte(droitePercante(e));
  const contenue = droiteTexte(droiteContenue(e));
  return `${percante} perce le plan ${planTexte(j.plan)}, qui contient ${contenue}, au seul point ${j.point}, qui n'est pas sur ${contenue} : les deux droites n'ont aucun point commun. Elles ne sont pas parallèles non plus : une parallèle à ${contenue} serait parallèle au plan ${planTexte(j.plan)} (ou incluse dans ce plan), alors que ${percante} le perce. Elles sont donc gauches.`;
}

function ecransPositions(e: ExerciceDeuxDroites): EcranDeuxDroitesPlan[] {
  const quatre = [...e.d1, ...e.d2];
  const d1 = droiteTexte(e.d1);
  const d2 = droiteTexte(e.d2);
  const j = e.justification;
  const aidesJustification: FragmentConsigne[][] =
    j.type === "secantes"
      ? [
          t(`Leur point commun est dans le plan ${planTexte(e.planCommun!)} : il est à la fois sur ${d1} et sur ${d2}.`),
          t(`Suis chaque droite dans le plan ${planTexte(e.planCommun!)}, en la prolongeant au besoin au-delà de ses points nommés : où se rencontrent-elles ?`),
        ]
      : j.type === "paralleles"
        ? [
            t("Deux droites parallèles à une même troisième droite sont parallèles entre elles."),
            t(`Cherche d'abord, parmi les droites proposées, celle qui a la même direction que ${d1} ; vérifie ensuite qu'elle a aussi celle de ${d2}.`),
          ]
        : [
            t(`La droite ${droiteTexte(droitePercante(e))} n'est pas incluse dans le plan ${planTexte(j.plan)} : elle le perce en un seul point, qui est donc un point de ${droiteTexte(droitePercante(e))}.`),
            t(`Repère sur le dessin la face ou le plan diagonal ${planTexte(j.plan)}, puis cherche lequel des points de ${droiteTexte(droitePercante(e))} lui appartient.`),
          ];
  return [
    {
      type: "choix",
      titre: "Plan commun",
      consigne: t(questionPlanCommun(e)),
      options: e.optionsPlan.map((o) => t(libelleOptionPlan(o))),
      bonne: e.bonPlan,
      aides: [
        t(`Un plan contient une droite dès qu'il contient deux de ses points : le plan cherché doit contenir les quatre points ${listeEt(quatre)}.`),
        t("Pour chaque plan proposé, repère sur le dessin la face ou le plan diagonal qu'il désigne, puis vérifie si les quatre points y sont. Attention : deux droites qui se croisent sur le dessin ne sont pas forcément dans un même plan."),
      ],
      reponse: t(reponsePlanCommun(e)),
    },
    {
      type: "choix",
      titre: "Position",
      consigne: t(`Quelle est la position relative des droites ${d1} et ${d2} ?`),
      options: e.ordrePositions.map((p) => t(LIBELLES_POSITION[p])),
      bonne: e.ordrePositions.indexOf(e.position),
      aides: [
        t("Deux droites qui ne sont contenues dans aucun plan commun sont gauches."),
        t("Dans un même plan, deux droites distinctes sont soit sécantes (un point commun, parfois hors du dessin : prolonge-les), soit parallèles (même direction, aucun point commun)."),
      ],
      reponse: t(phrasePosition(e)),
    },
    {
      type: "choix",
      titre: "Justification",
      consigne: t(questionJustification(e)),
      options: libellesOptionsJustification(e).map(t),
      bonne: j.bonne,
      aides: aidesJustification,
      reponse: t(reponseJustification(e)),
    },
  ];
}

// --- famille « plan déterminé » --------------------------------------------------------------

export function questionPlanDetermine(): string {
  return "Ces données déterminent-elles un plan, et un seul ?";
}

export function libelleVerdictPlan(oui: boolean): string {
  return oui ? "Oui, elles déterminent un seul plan" : "Non";
}

function donneesPlan(e: ExercicePlanDetermine): { droite1: string; droite2: string; point: string; points: string } {
  const p = e.points;
  return { droite1: droiteTexte(p.slice(0, 2)), droite2: droiteTexte(p.slice(2, 4)), point: p[2] ?? "", points: listeEt(p.slice(0, 3)) };
}

export function texteRaison(e: ExercicePlanDetermine, id: IdRaisonPlan): string {
  const d = donneesPlan(e);
  if (e.type === "troisPoints") {
    if (id === "vraie") return `Les points ${d.points} sont alignés : une infinité de plans passent par ces trois points.`;
    if (id === "consequence") return `Les points ${d.points} sont alignés : aucun plan ne passe par ces trois points.`;
    return "Il faut au moins quatre points pour déterminer un plan.";
  }
  if (e.type === "droitePoint") {
    if (id === "vraie") return `Le point ${d.point} est sur la droite ${d.droite1} : une infinité de plans contiennent cette droite et ce point.`;
    if (id === "consequence") return `Le point ${d.point} est sur la droite ${d.droite1} : aucun plan ne contient cette droite et ce point.`;
    return "Une droite et un point ne déterminent jamais un plan.";
  }
  if (id === "vraie") return `Les droites ${d.droite1} et ${d.droite2} sont gauches : aucun plan ne les contient toutes les deux.`;
  if (id === "consequence") return `Les droites ${d.droite1} et ${d.droite2} sont gauches : une infinité de plans les contiennent toutes les deux.`;
  return "Deux droites ne déterminent un plan que si elles sont sécantes.";
}

/** Phrase-réponse de l'écran a (et conclusion du corrigé). */
export function reponseVerdictPlan(e: ExercicePlanDetermine): string {
  const d = donneesPlan(e);
  if (e.determine) {
    if (e.type === "troisPoints") return `Oui : les points ${d.points} ne sont pas alignés, ils déterminent un seul plan.`;
    if (e.type === "droitePoint") return `Oui : le point ${d.point} n'est pas sur la droite ${d.droite1}, ils déterminent un seul plan.`;
    return `Oui : les droites ${d.droite1} et ${d.droite2} sont ${e.positionDroites === "secantes" ? "sécantes" : "parallèles"}, elles déterminent un seul plan.`;
  }
  const raison = texteRaison(e, "vraie").replace(" : ", " ; ");
  return `Non : ${raison.charAt(0).toLowerCase()}${raison.slice(1)}`;
}

/** Tous les noms acceptés, en clair (« (AIC), (ABC)… : trois points non alignés parmi A, B, C, D, I »). */
export function reponseNomPlan(e: ExercicePlanDetermine): string {
  return `Le plan ${planTexte(e.nomPlan!)} — ou tout autre nom formé de trois points non alignés parmi ${listeEt(e.pointsDuPlan)}.`;
}

function aidesVerdictPlan(e: ExercicePlanDetermine): FragmentConsigne[][] {
  if (e.type === "troisPoints") {
    return [
      t("Trois points déterminent un seul plan s'ils ne sont pas alignés ; trois points alignés n'en déterminent pas."),
      t("Regarde où sont les points définis sur le dessin : un milieu est sur son arête ; le centre d'une face est sur ses diagonales et sur les droites qui joignent les milieux de deux côtés opposés."),
    ];
  }
  if (e.type === "droitePoint") {
    return [
      t("Une droite et un point déterminent un seul plan si le point n'est pas sur la droite."),
      t("Regarde où sont les points définis sur le dessin : un milieu est sur son arête ; le centre d'une face est sur ses diagonales et sur les droites qui joignent les milieux de deux côtés opposés."),
    ];
  }
  return [
    t("Deux droites déterminent un seul plan si elles sont sécantes ou parallèles ; deux droites gauches n'en déterminent aucun."),
    t("Cherche un plan qui contient les quatre points des deux droites. Attention : deux droites qui se croisent sur le dessin ne sont pas forcément dans un même plan."),
  ];
}

function ecransPlan(e: ExercicePlanDetermine): EcranDeuxDroitesPlan[] {
  const verdict: EcranDeuxDroitesPlan = {
    type: "choix",
    titre: "Plan déterminé ?",
    consigne: t(questionPlanDetermine()),
    options: e.ordreVerdict.map((oui) => t(libelleVerdictPlan(oui))),
    bonne: e.ordreVerdict.indexOf(e.determine),
    aides: aidesVerdictPlan(e),
    reponse: t(reponseVerdictPlan(e)),
  };
  if (e.determine) {
    return [
      verdict,
      {
        type: "nomPlan",
        titre: "Nom du plan",
        consigne: t("Nomme ce plan par trois de ses points (sommets ou points définis), par exemple (ABC)."),
        aides: [
          t("Un plan se désigne par trois de ses points, NON alignés, écrits entre parenthèses."),
          t("Les données sont dans ce plan ; d'autres sommets du solide peuvent y être aussi : n'importe quel trio de points non alignés du plan convient."),
        ],
        reponse: t(reponseNomPlan(e)),
      },
    ];
  }
  return [
    verdict,
    {
      type: "choix",
      titre: "Raison",
      consigne: t("Pourquoi ces données ne déterminent-elles pas un plan unique ?"),
      options: e.optionsRaison.map((id) => t(texteRaison(e, id))),
      bonne: e.bonneRaison,
      aides: [
        t("Deux cas : soit les données ne suffisent pas à fixer un plan (une infinité de plans les contiennent), soit aucun plan ne peut les contenir."),
        t(
          e.type === "deuxDroites"
            ? "Un plan qui contiendrait les deux droites contiendrait leurs quatre points."
            : "Par une droite passent une infinité de plans, comme les pages d'un livre tournent autour de sa reliure.",
        ),
      ],
      reponse: t(texteRaison(e, "vraie")),
    },
  ];
}

export function ecrans(e: ExerciceDeuxDroitesPlan): EcranDeuxDroitesPlan[] {
  return e.variante === "positions" ? ecransPositions(e) : ecransPlan(e);
}

// ---------------------------------------------------------------------------------------------
// Saisie du nom d'un plan
// ---------------------------------------------------------------------------------------------

export type VerdictNomPlan = { etat: "correct" } | { etat: "faux"; message: string } | { etat: "parse_error"; message: string };

/** Position 3D d'un point nommé (sommet ou point défini) — interne, jamais affichée. */
export function positionPoint(e: ExerciceDeuxDroitesPlan, nom: string): Point3D | null {
  return e.solide.sommets[nom] ?? e.pointsNommes.find((p) => p.nom === nom)?.position ?? null;
}

function alignes(a: Point3D, b: Point3D, c: Point3D): boolean {
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
  const w = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  return w.x * w.x + w.y * w.y + w.z * w.z < 1e-6;
}

/** Lit « (ABG) », « ABG », « (a, b, g) »… : trois lettres de points de la figure, dans n'importe
 * quel ordre. Juste si les trois points sont distincts, non alignés et tous dans le plan. */
export function verifierNomPlan(e: ExercicePlanDetermine, saisie: string): VerdictNomPlan {
  const lettres = saisie.replace(/[\s(),;.\-–—]/g, "").toUpperCase();
  if (!/^[A-Z]+$/.test(lettres)) return { etat: "parse_error", message: "Écris seulement trois lettres de points, par exemple (ABC)." };
  if (lettres.length !== 3) return { etat: "parse_error", message: "Un plan se nomme par trois points : écris exactement trois lettres, par exemple (ABC)." };
  const noms = lettres.split("");
  const inconnu = noms.find((n) => positionPoint(e, n) === null);
  if (inconnu) return { etat: "parse_error", message: `Il n'y a pas de point ${inconnu} sur la figure.` };
  if (new Set(noms).size < 3) return { etat: "parse_error", message: "Choisis trois points distincts." };
  const [a, b, c] = noms.map((n) => positionPoint(e, n)!) as [Point3D, Point3D, Point3D];
  if (alignes(a, b, c)) return { etat: "faux", message: `Les points ${listeEt(noms)} sont alignés : ils ne désignent aucun plan précis.` };
  const horsPlan = noms.filter((n) => !e.pointsDuPlan.includes(n));
  if (horsPlan.length > 0) return { etat: "faux", message: `${listeEt(horsPlan)} ${horsPlan.length > 1 ? "ne sont pas" : "n'est pas"} dans le plan déterminé par les données.` };
  return { etat: "correct" };
}

// ---------------------------------------------------------------------------------------------
// Corrigé (papier) — mêmes phrases que l'écran
// ---------------------------------------------------------------------------------------------

export function piegePositions(e: ExerciceDeuxDroites): string {
  if (e.position === "gauches") {
    return e.croisementApparent
      ? "Sur le dessin, les deux droites semblent se croiser : en perspective, des droites gauches peuvent se couper sur le papier sans avoir aucun point commun dans l'espace."
      : "Deux droites qui ne se coupent pas ne sont pas forcément parallèles : sans plan commun, elles sont gauches.";
  }
  if (e.position === "paralleles") return "Deux droites parallèles sont toujours dans un même plan, même si elles semblent appartenir à deux faces différentes du solide.";
  const j = e.justification;
  return j.type === "secantes" && j.lieu.type === "hors"
    ? "Le plan est infini : deux droites d'un même plan non parallèles se coupent toujours, éventuellement hors du solide dessiné."
    : "Le point commun n'est pas toujours un point nommé : il peut tomber au milieu d'une face, d'une arête, ou à l'intérieur du solide.";
}

/** Les deux droites de la famille « plan » (type deuxDroites), sous la forme attendue par
 * `reponseJustification` ; `null` pour les autres types. */
export function droitesDuPlan(e: ExercicePlanDetermine): DeuxDroitesJustifiees | null {
  if (e.type !== "deuxDroites" || !e.justificationDroites) return null;
  return { d1: [e.points[0]!, e.points[1]!], d2: [e.points[2]!, e.points[3]!], planCommun: e.nomPlan, justification: e.justificationDroites };
}

export function piegePlan(e: ExercicePlanDetermine): string {
  if (e.type === "deuxDroites") return "Deux droites qui se croisent sur le dessin ne sont pas forcément sécantes : des droites gauches ne déterminent aucun plan.";
  if (e.type === "troisPoints") return "Trois points alignés ne déterminent AUCUN plan précis, mais une infinité de plans passent par eux : ne pas confondre « aucun plan unique » et « aucun plan ».";
  return "Si le point est sur la droite, une infinité de plans contiennent la droite et le point : les données ne fixent alors aucun plan précis.";
}

/** Majuscule initiale (titres d'options repris en phrase). */
export function enPhrase(t: string): string {
  return majuscule(t);
}
