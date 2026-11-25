import type { ExerciceAMU, PhaseAMU, StrategieAMU } from "../core6e/auMoinsUnComplement";
import { N, PHASES_AMU, resultat, strategieJuste, termes } from "../core6e/auMoinsUnComplement";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { cL, entL } from "./nombresCombinatoireLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationAuMoinsUnComplement";
import { correctionDetailleeAMU } from "../generateurs6e/auMoinsUnComplement/corrigeDetaille";

/**
 * Couche C — textes de `6gen105` « Au moins un : le complément » : situation, question, stratégies,
 * consignes, champs, aides à deux niveaux (règle du cours, puis posée pour l'instance — jamais le
 * résultat), réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours : Cₙᵏ.
 */

type E = ExerciceAMU;
type P = PhaseAMU;
const t = tx;
const l = lx;

interface Noms {
  /** « comité » / « comités » ; féminin ? */
  groupe: string;
  groupes: string;
  groupeFem: boolean;
  /** « femme » / « femmes » ; féminin ? */
  cible: string;
  cibles: string;
  cibleFem: boolean;
  /** « hommes », « autres cartes »… */
  autres: string;
  /** « personnes », « cartes », « ampoules », « élèves ». */
  elements: string;
  /** « comptent » / « contiennent ». */
  verbe: string;
}

export function noms(e: E): Noms {
  switch (e.variante) {
    case "comite":
      return { groupe: "comité", groupes: "comités", groupeFem: false, cible: "femme", cibles: "femmes", cibleFem: true, autres: "hommes", elements: "personnes", verbe: "comptent" };
    case "cartes":
      return { groupe: "main", groupes: "mains", groupeFem: true, cible: "as", cibles: "as", cibleFem: false, autres: "autres cartes", elements: "cartes", verbe: "contiennent" };
    case "defectueuses":
      return { groupe: "échantillon", groupes: "échantillons", groupeFem: false, cible: "ampoule défectueuse", cibles: "ampoules défectueuses", cibleFem: true, autres: "ampoules en bon état", elements: "ampoules", verbe: "contiennent" };
    case "delegation":
      return { groupe: "délégation", groupes: "délégations", groupeFem: true, cible: "élève de 6e", cibles: "élèves de 6e", cibleFem: false, autres: "élèves de 5e", elements: "élèves", verbe: "comptent" };
  }
}

/** Les éléments (« personnes », « cartes », « ampoules ») sont-ils féminins ? (« élèves » : non) */
const elemFem = (n: Noms) => n.elements !== "élèves";
const un = (n: Noms) => (n.cibleFem ? "une" : "un");
const aucun = (n: Noms) => (n.cibleFem ? "aucune" : "aucun");

/** « au moins une femme », « au plus un as », « exactement 2 ampoules défectueuses ». */
export function quantificateur(e: E): Frag[] {
  const n = noms(e);
  if (e.evenement === "auMoinsUn") return [t(`au moins ${un(n)} ${n.cible}`)];
  if (e.evenement === "auPlusUn") return [t(`au plus ${un(n)} ${n.cible}`)];
  if (e.j === 1) return [t(`exactement ${un(n)} ${n.cible}`)];
  return [t("exactement "), l(`${e.j}`), t(` ${n.cibles}`)];
}

/** Situation (sans la question). */
export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "comite":
      return [t("Un club compte "), l(`${e.a}`), t(" femmes et "), l(`${e.b}`), t(" hommes. On y forme un comité de "), l(`${e.k}`), t(" membres, sans fonctions particulières.")];
    case "cartes":
      return [t("On tire simultanément "), l(`${e.k}`), t(" cartes d'un jeu de "), l("32"), t(" cartes, qui contient "), l("4"), t(" as. Une main est l'ensemble des "), l(`${e.k}`), t(" cartes tirées.")];
    case "defectueuses":
      return [t("Un lot de "), l(`${N(e)}`), t(" ampoules contient "), l(`${e.a}`), t(" ampoules défectueuses. On en prélève simultanément un échantillon de "), l(`${e.k}`), t(" ampoules.")];
    case "delegation":
      return [t("Une école choisit une délégation de "), l(`${e.k}`), t(" élèves parmi "), l(`${e.a}`), t(" élèves de 6e et "), l(`${e.b}`), t(" élèves de 5e.")];
  }
}

/** Question posée (« Combien de comités différents comptent au moins une femme ? »). */
export function question(e: E): Frag[] {
  const n = noms(e);
  const de = /^[aeéiou]/i.test(n.groupes) ? "d'" : "de ";
  return [t(`Combien ${de}${n.groupes} ${n.groupeFem ? "différentes" : "différents"} ${n.verbe} `), ...quantificateur(e), t(" ?")];
}

export const CONSIGNE_PAPIER = "Explique la stratégie de dénombrement choisie, puis calcule ce nombre.";

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];

export const phases = (): P[] => PHASES_AMU;

export function libelle(_e: E, p: P): string {
  return p === "strategie" ? "Stratégie" : p === "termes" ? "Les deux nombres" : "Résultat";
}

export function texteStrategie(e: E, s: StrategieAMU): Frag[] {
  const n = noms(e);
  switch (s) {
    case "complement":
      return [t(`Passer par le contraire : compter tous les ${n.groupes}, puis retirer ceux qui ne ${n.verbe} ${aucun(n)} ${n.cible}.`)];
    case "somme":
      return [t(`Séparer en cas selon le nombre exact de ${n.cibles} (des cas qui ne se chevauchent pas), puis additionner.`)];
    case "direct":
      return [t(`Un seul produit : choisir d'abord les ${n.cibles}, puis le reste parmi les ${n.autres}.`)];
    case "imposer":
      return [t(`Choisir d'abord ${un(n)} ${n.cible} (`), l(`${e.a}`), t(" choix), puis compléter librement avec "), l(`${e.k - 1}`), t(` ${n.elements} parmi les `), l(`${N(e) - 1}`), t(elemFem(n) ? " restantes." : " restants.")];
  }
}

/** Libellé court de la stratégie juste (récapitulatif, réponse attendue). */
export function strategieCourte(e: E): Frag[] {
  const n = noms(e);
  switch (strategieJuste(e)) {
    case "complement":
      return [t(`Le contraire : tous les ${n.groupes} moins ceux sans ${n.cible}.`)];
    case "somme":
      return [t(`Deux cas disjoints : ${aucun(n)} ${n.cible}, puis exactement ${un(n)} ${n.cible}.`)];
    default:
      return [t(`Un seul produit : les ${n.cibles}, puis les ${n.autres}.`)];
  }
}

export function consigne(e: E, p: P): Frag[] {
  const n = noms(e);
  if (p === "strategie") return [t(`Quelle stratégie donne ce nombre le plus directement, sans compter un même ${n.groupe} plusieurs fois ?`)];
  if (p === "resultat") return [t(`Déduis-en le nombre de ${n.groupes} qui ${n.verbe} `), ...quantificateur(e), t(".")];
  switch (strategieJuste(e)) {
    case "complement":
      return [t(`Calcule le nombre total de ${n.groupes}, puis le nombre de ${n.groupes} qui ne ${n.verbe} ${aucun(n)} ${n.cible}.`)];
    case "somme":
      return [t(`Calcule le nombre de ${n.groupes} sans ${n.cible}, puis le nombre de ${n.groupes} avec exactement ${un(n)} ${n.cible}.`)];
    default:
      return [t("Calcule le nombre de façons de choisir les "), l(`${e.j}`), t(` ${e.j === 1 ? n.cible : n.cibles}, puis le nombre de façons de choisir les `), l(`${e.k - e.j}`), t(` autres ${n.elements} parmi les ${n.autres}.`)];
  }
}

export function options(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: texteStrategie(e, id) }));
}

/** Libellés des deux champs de l'écran 2. */
export function libellesTermes(e: E): [string, string] {
  const n = noms(e);
  const G = n.groupes.charAt(0).toUpperCase() + n.groupes.slice(1);
  switch (strategieJuste(e)) {
    case "complement":
      return [`Tous les ${n.groupes}`, `${G} sans ${n.cible}`];
    case "somme":
      return [`${G} sans ${n.cible}`, `${G} avec exactement ${un(n)} ${n.cible}`];
    default:
      return [`Choix des ${n.cibles}`, `Choix des autres ${n.elements}`];
  }
}

const PLACEHOLDER = "un nombre, ou C(n, k)";

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "termes") {
    const [l1, l2] = libellesTermes(e);
    return [
      { label: l1, placeholder: PLACEHOLDER },
      { label: l2, placeholder: PLACEHOLDER },
    ];
  }
  return [{ label: `Nombre de ${noms(e).groupes}`, placeholder: PLACEHOLDER }];
}

/** Écriture des deux nombres de l'écran 2 avec leur combinaison (« C_{13}^{4}=715 »). */
export function termesL(e: E): [string, string] {
  const [t1, t2] = termes(e);
  switch (strategieJuste(e)) {
    case "complement":
      return [`${cL(N(e), e.k)}=${entL(t1)}`, `${cL(e.b, e.k)}=${entL(t2)}`];
    case "somme":
      return [`${cL(e.b, e.k)}=${entL(t1)}`, `${e.a}\\times ${cL(e.b, e.k - 1)}=${entL(t2)}`];
    default:
      return [`${cL(e.a, e.j)}=${entL(t1)}`, `${cL(e.b, e.k - e.j)}=${entL(t2)}`];
  }
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "strategie") return strategieCourte(e);
  if (p === "termes") {
    const [a, b] = termesL(e);
    return [l(a), t(" et "), l(b)];
  }
  return [l(entL(resultat(e))), t(` ${noms(e).groupes}`)];
}

export const recap = reponse;

/** Cas possibles « 0, 1, 2, …, m » éléments ciblés (aide de l'écran 1). */
function casPossibles(e: E): string {
  const m = Math.min(e.a, e.k);
  return Array.from({ length: m + 1 }, (_, i) => `${i}`).join(", ").replace(/, (\d+)$/, " ou $1");
}

export function aide1(e: E, p: P): AideEcran {
  const n = noms(e);
  if (p === "strategie") return { texte: [t("Lis la condition : « au moins », « au plus » ou « exactement ». Pour chaque stratégie, combien de nombres faudrait-il calculer ? Et un même "), t(`${n.groupe} risque-t-il d'être compté plusieurs fois ?`)] };
  if (p === "termes") return { texte: [t("Combinaisons (cours, § 1) : l'ordre ne compte pas et il n'y a pas de répétition, donc on choisit "), l("p"), t(" éléments parmi "), l("n"), t(" de "), l("C_n^p"), t(" façons (principe de multiplication si l'on choisit en deux temps).")] };
  switch (strategieJuste(e)) {
    case "complement":
      return { texte: [t("Événement contraire (cours, § 2) : « au moins un » est le contraire de « aucun ». Le nombre cherché est donc le nombre total moins le nombre de groupes sans aucun élément de cette sorte.")] };
    case "somme":
      return { texte: [t("Des cas qui ne se chevauchent pas s'additionnent (principe d'addition, cours, § 2) : « au plus un » = « aucun » ou « exactement un ».")] };
    default:
      return { texte: [t("Principe de multiplication (cours, § 1) : un choix en deux temps indépendants se compte par un produit.")] };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  const n = noms(e);
  if (p === "strategie")
    return { texte: [t(`Un ${n.groupe} de `), l(`${e.k}`), t(` ${n.elements} peut contenir ${casPossibles(e)} ${n.cibles}. Repère les cas demandés et les cas exclus : quel groupe de cas est le plus court à compter ?`)] };
  if (p === "termes") {
    switch (strategieJuste(e)) {
      case "complement":
        return { texte: [t(`Tous les ${n.groupes} : on choisit `), l(`${e.k}`), t(` ${n.elements} parmi les `), l(`${N(e)}`), t(`. Sans ${n.cible} : les `), l(`${e.k}`), t(` ${n.elements} sont ${elemFem(n) ? "toutes choisies" : "tous choisis"} parmi les `), l(`${e.b}`), t(` ${n.autres}.`)] };
      case "somme":
        return { texte: [t(`Sans ${n.cible} : tout le ${n.groupe} est choisi parmi les `), l(`${e.b}`), t(` ${n.autres}. Exactement ${un(n)} : `), l(`${e.a}`), t(` choix pour ${n.cibleFem ? "elle" : "lui"}, puis les `), l(`${e.k - 1}`), t(" autres parmi les "), l(`${e.b}`), t(` ${n.autres}.`)] };
      default:
        return { texte: [t("Les "), l(`${e.j}`), t(` ${e.j === 1 ? n.cible : n.cibles} se choisissent parmi les `), l(`${e.a}`), t(", les "), l(`${e.k - e.j}`), t(" autres parmi les "), l(`${e.b}`), t(` ${n.autres}.`)] };
    }
  }
  switch (strategieJuste(e)) {
    case "complement":
      return { texte: [t(`Retire du nombre total de ${n.groupes} ceux qui n'ont ${aucun(n)} ${n.cible} (les deux nombres de l'écran précédent).`)] };
    case "somme":
      return { texte: [t("Additionne les deux nombres de l'écran précédent : les deux cas ne se chevauchent pas.")] };
    default:
      return { texte: [t("Chaque choix des "), l(`${e.j}`), t(` ${e.j === 1 ? n.cible : n.cibles} se combine avec chaque choix des autres : multiplie les deux nombres de l'écran précédent.`)] };
  }
}

export function explicationChoix(e: E, p: P): string {
  if (p !== "strategie") return "";
  const n = noms(e);
  if (e.evenement === "auMoinsUn") return `« Au moins ${un(n)} » a pour contraire « ${aucun(n)} » : un seul cas à retirer du total.`;
  if (e.evenement === "auPlusUn") return `« Au plus ${un(n)} » regroupe deux cas seulement : « ${aucun(n)} » et « exactement ${un(n)} ».`;
  return "Le nombre d'éléments de chaque sorte est imposé : un seul produit suffit.";
}

/** `6gen105` sur le socle d'écrans partagé : stratégie (choix fermé jugé ✗ / ✓), deux nombres
 * (deux champs, trois tentatives), résultat (un champ, trois tentatives). */
export const DEFINITION_AMU: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "strategie",
  mode: (e, p) => (p === "strategie" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => strategieJuste(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeAMU,
};
