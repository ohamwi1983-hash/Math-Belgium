import type { Point3D } from "../core/geometrieEspace.types";
import type {
  CandidatParallelisme,
  DroiteNommee2,
  ExerciceDemontrerParallelisme,
  ExerciceDeuxPlansParalleles,
  ExerciceDroitePlanParallele,
  OptionDemonstration,
  RaisonParallele,
} from "../core/demontrerParallelisme.types";
import { distance3D, EPSILON_3D, sontParalleles3D, soustraire3D } from "../moteur/geometrieEspace";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, NOMS_COULEURS_PLANS, pointsPlan, positionNommee, type DroiteFigure, type OptionsFigure } from "./figurePositionsPlans";
import { descriptionPlan, descriptionSolide, minusculeInitiale, nomPlan, phraseMilieux } from "./formatPositionsPlans";
import { pointAppartientAuPlan } from "../moteur/geometrieEspace";
import { CRITERE_DEUX_PLANS, CRITERE_DROITE_PLAN, libelle, texteRaison } from "../generateurs/demontrerParallelisme";

/**
 * Textes de gen103 (« Démontrer un parallélisme ») : énoncé, consignes, aides, explications,
 * réponses attendues et éléments de la figure finale. UNE seule source pour l'écran interactif et
 * l'adaptateur papier (`generateurs/demontrerParallelisme/exportEvaluation.ts`).
 *
 * Vocabulaire et critères du cours (section 7 « Critères de parallélisme dans l'espace ») repris mot
 * pour mot : « une droite est parallèle à un plan si elle est parallèle à une droite de ce plan » ;
 * « deux plans sont parallèles si deux droites sécantes du premier sont parallèles à deux droites du
 * second ». Énoncé = ce qu'il faut démontrer, jamais la méthode (décision de l'utilisateur) : le
 * critère, les droites témoins et les justifications sont les étapes, à l'écran et dans le corrigé.
 * Aides : jamais la réponse.
 */

export { libelle };

// --- Énoncé -----------------------------------------------------------------------------------------

export function nomP(e: ExerciceDemontrerParallelisme, i = 0): string {
  return nomPlan(e, i);
}

/** Énoncé (sans la consigne) : solide, milieux, droite et plan(s) représentés. */
export function enonce(e: ExerciceDemontrerParallelisme): string {
  const milieux = phraseMilieux(e);
  const debut = `Voici ${descriptionSolide(e)}.${milieux ? ` ${milieux}` : ""}`;
  if (e.variante === "droite-plan") {
    return `${debut} On considère la droite ${libelle(e.droite)}, tracée en rouge, et le plan ${nomP(e)}, représenté par le triangle ${e.plans[0].join("")} (${NOMS_COULEURS_PLANS[0]}).`;
  }
  return `${debut} On considère les plans ${nomP(e, 0)} et ${nomP(e, 1)}, représentés par les triangles ${e.plans[0].join("")} (${NOMS_COULEURS_PLANS[0]}) et ${e.plans[1].join("")} (${NOMS_COULEURS_PLANS[1]}).`;
}

/** Consigne globale (écran et papier) : ce qu'il faut démontrer, sans la méthode. */
export function consigneGlobale(e: ExerciceDemontrerParallelisme): string {
  if (e.variante === "droite-plan") return `Démontre que la droite ${libelle(e.droite)} est parallèle au plan ${nomP(e)}.`;
  return `Démontre que les plans ${nomP(e, 0)} et ${nomP(e, 1)} sont parallèles.`;
}

// --- Géométrie de présentation ------------------------------------------------------------------

function points(e: ExerciceDemontrerParallelisme, d: DroiteNommee2): [Point3D, Point3D] {
  return [positionNommee(e, d[0]), positionNommee(e, d[1])];
}

function paralleles(e: ExerciceDemontrerParallelisme, a: DroiteNommee2, b: DroiteNommee2): boolean {
  const [a1, a2] = points(e, a);
  const [b1, b2] = points(e, b);
  return sontParalleles3D(soustraire3D(a2, a1), soustraire3D(b2, b1));
}

function memeDroite(e: ExerciceDemontrerParallelisme, a: DroiteNommee2, b: DroiteNommee2): boolean {
  const [a1, a2] = points(e, a);
  const [b1, b2] = points(e, b);
  const d = soustraire3D(a2, a1);
  return sontParalleles3D(d, soustraire3D(b2, b1)) && (distance3D(b1, a1) < EPSILON_3D || sontParalleles3D(d, soustraire3D(b1, a1)));
}

/** Point nommé commun à deux droites (« sécantes en F »), sinon `null`. */
function pointCommunNomme(a: DroiteNommee2, b: DroiteNommee2): string | null {
  return a.find((n) => b.includes(n)) ?? null;
}

/** « G et H sont deux points du plan (ABG), le plan ABGH. » — pourquoi la droite est dans le plan i. */
export function raisonDansPlan(e: ExerciceDemontrerParallelisme, d: DroiteNommee2, i: number): string {
  const nom = e.plans[i]!;
  const description = descriptionPlan(e, i);
  if (d.every((n) => nom.includes(n))) return `${d[0]} et ${d[1]} font partie des trois points qui nomment le plan ${nomP(e, i)}`;
  return `${d[0]} et ${d[1]} sont deux points du plan ${nomP(e, i)}${description ? ` (${description})` : ""}`;
}

// --- Écrans ---------------------------------------------------------------------------------------

export interface EcranChoixParallelisme {
  genre: "choix";
  titre: string;
  consigne: string;
  options: { id: string; texte: string }[];
  attendue: string;
  aides: string[];
}

export interface EcranPairesParallelisme {
  genre: "paires";
  titre: string;
  consigne: string;
  aides: string[];
}

export type EcranDemontrerParallelisme = EcranChoixParallelisme | EcranPairesParallelisme;

const AIDES_CRITERE_DROITE = [
  "Relis les trois critères de parallélisme du cours : lequel conclut qu'une DROITE est parallèle à un PLAN ?",
  "Le cours ramène toujours un parallélisme dans l'espace à un parallélisme entre deux droites.",
];
const AIDES_CRITERE_PLANS = [
  "Relis les trois critères de parallélisme du cours : lequel conclut que deux PLANS sont parallèles ?",
  "Compte les directions : une seule direction commune ne suffit jamais, deux plans sécants en ont une aussi.",
];
const AIDES_TEMOIN = [
  "La droite cherchée doit vérifier DEUX conditions : être une droite du plan, et être parallèle à la droite de l'énoncé.",
  "Une droite est dans le plan si deux de ses points y sont. Une droite parallèle à celle de l'énoncé mais qui passe hors du plan ne convient pas.",
];
const AIDES_PAIRES = [
  "Pour chaque parallélisme proposé, vérifie que la première droite est dans le premier plan, que la seconde est dans le second plan, et qu'elles sont vraiment parallèles.",
  "Les deux droites choisies dans le premier plan doivent être sécantes : deux droites parallèles entre elles (ou deux fois la même) ne donnent qu'une seule direction.",
];
const AIDES_JUSTIFICATION = [
  "Pour prouver que deux droites de l'espace sont parallèles, cherche une figure plane qui les contient toutes les deux : une face, un plan diagonal, un triangle.",
  "Dans cette figure plane, utilise une propriété connue : côtés opposés d'un rectangle ou d'un parallélogramme, droite des milieux d'un triangle.",
];

function optionsDe(liste: OptionDemonstration[]): { options: { id: string; texte: string }[]; attendue: string } {
  return { options: liste.map((o, i) => ({ id: String(i), texte: o.texte })), attendue: String(liste.findIndex((o) => o.valide)) };
}

function ecranJustification(raison: RaisonParallele, justifications: OptionDemonstration[], titre: string): EcranChoixParallelisme {
  return {
    genre: "choix",
    titre,
    consigne: `Quelle affirmation justifie que ${libelle(raison.droite1)} ∥ ${libelle(raison.droite2)} ?`,
    ...optionsDe(justifications),
    aides: AIDES_JUSTIFICATION,
  };
}

/** Écrans de l'exercice. `paires` : les deux parallélismes confirmés à l'écran 2 de `deux-plans`
 * (ceux de l'élève s'ils sont justes, sinon la paire attendue) — ils fixent les écrans 3 et 4. */
export function ecransExercice(e: ExerciceDemontrerParallelisme, paires: [number, number] | null = null): EcranDemontrerParallelisme[] {
  if (e.variante === "droite-plan") {
    return [
      {
        genre: "choix",
        titre: "Critère",
        consigne: `Quel critère du cours permet de démontrer que ${libelle(e.droite)} est parallèle au plan ${nomP(e)} ?`,
        ...optionsDe(e.criteres),
        aides: AIDES_CRITERE_DROITE,
      },
      {
        genre: "choix",
        titre: "Droite témoin",
        consigne: `Quelle droite permet d'appliquer ce critère ?`,
        options: e.candidats.map((c, i) => ({ id: String(i), texte: libelle(c) })),
        attendue: String(e.temoin),
        aides: AIDES_TEMOIN,
      },
      ecranJustification(e.raison, e.justifications, "Justification"),
    ];
  }
  const [a, b] = paires ?? e.paireAttendue;
  const ca = e.candidats[a]!;
  const cb = e.candidats[b]!;
  return [
    {
      genre: "choix",
      titre: "Critère",
      consigne: `Quel critère du cours permet de démontrer que les plans ${nomP(e, 0)} et ${nomP(e, 1)} sont parallèles ?`,
      ...optionsDe(e.criteres),
      aides: AIDES_CRITERE_PLANS,
    },
    {
      genre: "paires",
      titre: "Droites témoins",
      consigne: `Choisis les deux parallélismes « droite de ${nomP(e, 0)} ∥ droite de ${nomP(e, 1)} » qui permettent d'appliquer ce critère.`,
      aides: AIDES_PAIRES,
    },
    ecranJustification(ca.raison!, ca.justifications, "Justification 1"),
    ecranJustification(cb.raison!, cb.justifications, "Justification 2"),
  ];
}

// --- Écran 2 de « deux plans » : validation de la paire ---------------------------------------------

export function libelleCandidat(c: CandidatParallelisme): string {
  return `${libelle(c.gauche)} ∥ ${libelle(c.droite)}`;
}

/** Paire juste : deux parallélismes valables dont les droites de (P) sont sécantes. */
export function paireCorrecte(e: ExerciceDeuxPlansParalleles, a: number, b: number): boolean {
  const ca = e.candidats[a];
  const cb = e.candidats[b];
  if (!ca || !cb || a === b || ca.defaut !== null || cb.defaut !== null) return false;
  return !paralleles(e, ca.gauche, cb.gauche);
}

/** Phrase « (FH) et (AF) sont sécantes en F » (ou sans point nommé). */
export function phraseSecantes(e: ExerciceDeuxPlansParalleles, a: number, b: number): string {
  const ga = e.candidats[a]!.gauche;
  const gb = e.candidats[b]!.gauche;
  const pc = pointCommunNomme(ga, gb);
  return pc
    ? `${libelle(ga)} et ${libelle(gb)} sont deux droites du plan ${nomP(e, 0)} sécantes en ${pc}`
    : `${libelle(ga)} et ${libelle(gb)} sont deux droites du plan ${nomP(e, 0)} qui ne sont pas parallèles : elles sont sécantes`;
}

export function explicationPaires(e: ExerciceDeuxPlansParalleles, choix: [number, number]): string[] {
  const [a, b] = choix;
  if (paireCorrecte(e, a, b)) return [`${libelleCandidat(e.candidats[a]!)} et ${libelleCandidat(e.candidats[b]!)} : ${phraseSecantes(e, a, b)}. Le critère s'applique.`];
  const lignes: string[] = [];
  for (const i of choix) {
    const c = e.candidats[i]!;
    if (c.defaut) lignes.push(`« ${libelleCandidat(c)} » ne convient pas : ${minusculeInitiale(c.defaut)}`);
  }
  if (lignes.length === 0) {
    const ga = e.candidats[a]!.gauche;
    const gb = e.candidats[b]!.gauche;
    lignes.push(
      memeDroite(e, ga, gb)
        ? `C'est deux fois la même droite du plan ${nomP(e, 0)} : une seule direction. Le critère demande deux droites SÉCANTES.`
        : `${libelle(ga)} et ${libelle(gb)} sont parallèles entre elles : elles ne donnent qu'une seule direction. Le critère demande deux droites SÉCANTES du plan ${nomP(e, 0)}.`,
    );
  }
  const [x, y] = e.paireAttendue;
  lignes.push(`Par exemple : ${libelleCandidat(e.candidats[x]!)} et ${libelleCandidat(e.candidats[y]!)} ; ${phraseSecantes(e, x, y)}.`);
  return lignes;
}

// --- Explications des choix fermés ---------------------------------------------------------------

export function explicationOption(liste: OptionDemonstration[], choix: string, conclusion: string): string[] {
  const choisie = liste[Number(choix)]!;
  const valable = liste.find((o) => o.valide)!;
  if (choisie.valide) return [`C'est juste. ${conclusion}`];
  return [`« ${choisie.texte} » ne convient pas : ${minusculeInitiale(choisie.defaut)}`, `Il fallait choisir : ${valable.texte}`, conclusion];
}

export function conclusionCritere(e: ExerciceDemontrerParallelisme): string {
  if (e.variante === "droite-plan") return `Le cours : une droite est parallèle à un plan si elle est parallèle à une droite de ce plan. Il reste à trouver cette droite.`;
  return `Le cours : deux plans sont parallèles si deux droites sécantes du premier sont parallèles à deux droites du second. Il reste à trouver ces droites.`;
}

export function explicationTemoin(e: ExerciceDroitePlanParallele, choix: string): string[] {
  const i = Number(choix);
  const W = e.candidats[e.temoin]!;
  const ok = `${libelle(W)} est une droite du plan : ${raisonDansPlan(e, W, 0)}. Elle est parallèle à ${libelle(e.droite)} : il reste à le justifier.`;
  if (i === e.temoin) return [`C'est juste. ${ok}`];
  return [`« ${libelle(e.candidats[i]!)} » ne convient pas : ${minusculeInitiale(e.defautsCandidats[i]!)}`, `La droite témoin : ${ok}`];
}

export function conclusionJustification(e: ExerciceDemontrerParallelisme, numero: number): string {
  if (e.variante === "droite-plan") {
    return `${libelle(e.droite)} est parallèle à ${libelle(e.raison.droite2)}, une droite du plan ${nomP(e)} : la droite ${libelle(e.droite)} est parallèle au plan ${nomP(e)}.`;
  }
  return numero === 1 ? "Premier parallélisme justifié. Il reste le second." : `Deux droites sécantes du plan ${nomP(e, 0)} sont parallèles à deux droites du plan ${nomP(e, 1)} : les plans ${nomP(e, 0)} et ${nomP(e, 1)} sont parallèles.`;
}

// --- Réponses attendues (fiches de l'historique) -----------------------------------------------------

export function reponseEcran(e: ExerciceDemontrerParallelisme, ecran: number, paires: [number, number] | null = null): string {
  if (ecran === 0) return e.criteres.find((c) => c.valide)!.texte;
  if (e.variante === "droite-plan") {
    if (ecran === 1) return libelle(e.candidats[e.temoin]!);
    return texteRaison(e.raison);
  }
  const [a, b] = paires ?? e.paireAttendue;
  if (ecran === 1) {
    const [x, y] = e.paireAttendue;
    return `Par exemple ${libelleCandidat(e.candidats[x]!)} et ${libelleCandidat(e.candidats[y]!)}.`;
  }
  return texteRaison(e.candidats[ecran === 2 ? a : b]!.raison!);
}

export function critereValable(e: ExerciceDemontrerParallelisme): string {
  return e.variante === "droite-plan" ? CRITERE_DROITE_PLAN(libelle(e.droite), nomP(e)) : CRITERE_DEUX_PLANS(nomP(e, 0), nomP(e, 1));
}

// --- Figure ----------------------------------------------------------------------------------------

function droiteFigure(e: ExerciceDemontrerParallelisme, d: DroiteNommee2, couleur: string): DroiteFigure {
  const [a, b] = points(e, d);
  return { a, b, couleur };
}

/** Éléments de la figure : la droite (T) en rouge (énoncé) ; une fois les témoins confirmés, la
 * droite témoin en bleu (droite-plan) ou les deux parallélismes (bleu, rouge) ; à la fin, les sections
 * complètes des plans. */
export function elementsFigure(e: ExerciceDemontrerParallelisme, temoins: [number, number] | number | null, fin: boolean): Omit<OptionsFigure, "mode"> {
  if (e.variante === "droite-plan") {
    const droites = [droiteFigure(e, e.droite, COULEUR_DROITE)];
    if (typeof temoins === "number") droites.push(droiteFigure(e, e.candidats[temoins]!, COULEUR_CONSTRUCTION));
    return { sections: fin, droites };
  }
  if (!Array.isArray(temoins)) return { sections: fin };
  const [a, b] = temoins;
  const droites = [
    droiteFigure(e, e.candidats[a]!.gauche, COULEUR_CONSTRUCTION),
    droiteFigure(e, e.candidats[a]!.droite, COULEUR_CONSTRUCTION),
    droiteFigure(e, e.candidats[b]!.gauche, COULEUR_DROITE),
    droiteFigure(e, e.candidats[b]!.droite, COULEUR_DROITE),
  ];
  return { sections: fin, droites };
}

export function legendeFigure(e: ExerciceDemontrerParallelisme, temoins: [number, number] | number | null, fin: boolean): string {
  const sections = fin ? (e.variante === "droite-plan" ? " En pointillés : la section complète du plan dans le solide." : " En pointillés : la section complète de chaque plan dans le solide.") : "";
  if (e.variante === "droite-plan") {
    return typeof temoins === "number" ? `En rouge, la droite ${libelle(e.droite)} ; en bleu, la droite témoin ${libelle(e.candidats[temoins]!)}, dans le plan ${nomP(e)}.${sections}` : "";
  }
  if (!Array.isArray(temoins)) return sections.trim();
  const [a, b] = temoins;
  return `En bleu : ${libelleCandidat(e.candidats[a]!)} ; en rouge : ${libelleCandidat(e.candidats[b]!)}.${sections}`;
}

/** Le point nommé appartient-il au plan i ? (corrigé) */
export function nommeDansPlan(e: ExerciceDemontrerParallelisme, nom: string, i: number): boolean {
  return pointAppartientAuPlan(positionNommee(e, nom), pointsPlan(e, i));
}
