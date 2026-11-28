import type { SituationCorrelation, TypeExplication } from "../core5e/banqueCorrelationCausalite";
import { BANQUE_CORRELATION } from "../core5e/banqueCorrelationCausalite";
import type { ExerciceCorrelationCausalite } from "../generateurs5e/correlationCausalite";
import type { AideEcran, DefinitionEcrans, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { EtapeCorrection, FragmentConsigne } from "../../export/genererFeuilleExercices";
import { piege as piegeC, resultat, texte, utilise, verification } from "../../export/corrigeTableau";

/**
 * Couche C — textes, définition d'écrans et corrigé de `5gen80` « Corrélation ou causalité ? ». Deux
 * choix fermés jugés (une tentative chacun) : le TYPE d'explication (cinq options fixes, communes à
 * toutes les situations), puis l'explication PRÉCISE (quatre options propres à la situation : la
 * troisième variable pour une cause commune, le bon sens de la causalité, le retard, le mécanisme…).
 * Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceCorrelationCausalite;
export type PhaseCorrelation = "type" | "precision";
export const PHASES_CORRELATION: PhaseCorrelation[] = ["type", "precision"];

/** Mini-syntaxe « texte $formule$ texte » → fragments. */
export function frags(s: string): Frag[] {
  return s
    .split("$")
    .map((m, i) => (i % 2 ? lx(m) : tx(m)))
    .filter((f) => f.valeur !== "");
}

export const situationDe = (e: E): SituationCorrelation => BANQUE_CORRELATION[e.variante][e.indice]!;

export function enonce(e: E): Frag[] {
  const s = situationDe(e);
  return [...frags(s.texte), tx(` On en conclut : « ${s.conclusion} »`)];
}

export const CONSIGNE_PAPIER =
  "Cette corrélation traduit-elle une relation de cause à effet ? Explique-la : causalité plausible, cause commune (nomme-la), coïncidence, causalité inverse ou effet décalé dans le temps.";

export const LIBELLES_TYPE: Record<TypeExplication, Frag[]> = {
  causeCommune: [tx("Cause commune : une troisième grandeur fait varier les deux.")],
  coincidence: [tx("Coïncidence : aucun lien réel, les deux grandeurs ont varié ensemble par hasard.")],
  causaliteInverse: [tx("Causalité inverse : c'est la seconde grandeur qui agit sur la première, pas l'inverse.")],
  effetDecale: [tx("Effet décalé dans le temps : la cause agit, mais plus tard ; il faut décaler les données.")],
  causalitePlausible: [tx("Causalité plausible : un mécanisme connu explique que la première grandeur agit sur la seconde.")],
};
const ORDRE_TYPES: TypeExplication[] = ["causalitePlausible", "causeCommune", "coincidence", "causaliteInverse", "effetDecale"];

export const optionsType = (): OptionEcran[] => ORDRE_TYPES.map((id) => ({ id, fragments: LIBELLES_TYPE[id] }));

function textesPrecision(e: E): string[] {
  const s = situationDe(e);
  return [s.bonne, ...s.leurres];
}
export const optionsPrecision = (e: E): OptionEcran[] => e.ordre.map((k) => ({ id: `E${k}`, fragments: frags(textesPrecision(e)[k]!) }));

export function libelle(_e: E, p: PhaseCorrelation): string {
  return p === "type" ? "Type d'explication" : "Explication précise";
}

export function consigne(e: E, p: PhaseCorrelation): Frag[] {
  if (p === "type") return [tx("Quelle est l'explication la plus raisonnable de cette corrélation ?")];
  return e.variante === "causeCommune" ? [tx("Quelle troisième grandeur explique les deux ?")] : [tx("Quelle phrase explique le mieux la situation ?")];
}

const AIDE_TYPE: AideEcran = {
  texte: [
    tx("Une corrélation, même forte (r proche de 1 ou de −1), ne prouve pas que l'une des grandeurs agit sur l'autre. Demande-toi : une troisième grandeur peut-elle faire varier les deux ? Le lien est-il plausible ou dû au hasard ? Dans quel sens irait la cause ? L'effet pourrait-il arriver plus tard ?"),
  ],
};

export function aide1(_e: E, p: PhaseCorrelation): AideEcran {
  if (p === "type") return AIDE_TYPE;
  return { texte: [tx("Garde la seule phrase qui explique vraiment les deux grandeurs observées, sans rien inventer.")] };
}

const AIDE2_TYPE: Record<TypeExplication, string> = {
  causeCommune: "Cherche ce qui, dans la situation, pourrait faire augmenter (ou diminuer) les deux grandeurs en même temps.",
  coincidence: "Existe-t-il le moindre mécanisme qui relierait ces deux grandeurs ? Si aucun n'est imaginable, pense au hasard.",
  causaliteInverse: "Relis la conclusion : la cause et la conséquence ne seraient-elles pas échangées ?",
  effetDecale: "Compare les deux coefficients de corrélation : pourquoi le second, calculé avec un décalage, est-il bien plus fort ?",
  causalitePlausible: "Connais-tu un mécanisme (physique, biologique…) qui explique directement le lien ? Les données viennent-elles d'une expérience ?",
};

export function aide2(e: E, p: PhaseCorrelation): AideEcran | null {
  if (p === "type") return { texte: [tx(AIDE2_TYPE[e.variante])] };
  return { texte: [tx("Élimine les phrases qui inventent un mécanisme, qui inversent le sens de la cause, ou qui proposent une grandeur qui ne fait varier qu'une des deux.")] };
}

export function reponse(e: E, p: PhaseCorrelation): Frag[] {
  if (p === "type") return LIBELLES_TYPE[e.variante];
  return frags(situationDe(e).bonne);
}

export function recap(e: E, p: PhaseCorrelation): Frag[] {
  if (p === "type") return [tx(CATALOGUE_COURT[e.variante])];
  return frags(situationDe(e).bonne);
}

export const CATALOGUE_COURT: Record<TypeExplication, string> = {
  causeCommune: "Cause commune",
  coincidence: "Coïncidence",
  causaliteInverse: "Causalité inverse",
  effetDecale: "Effet décalé dans le temps",
  causalitePlausible: "Causalité plausible",
};

const fr = (x: unknown) => x as FragmentConsigne[];

export function correctionDetailleeCorrelationCausalite(e: E): EtapeCorrection[] {
  const s = situationDe(e);
  return [
    utilise("a", [texte("Corrélation ne signifie pas causalité (cours, point 6) : avant de conclure à une cause, on cherche une cause commune, une coïncidence, une causalité inverse ou un effet décalé ; on ne retient la causalité que si un mécanisme connu (ou une expérience) l'explique.")]),
    resultat("a", fr(LIBELLES_TYPE[e.variante])),
    utilise("b", [texte("On précise l'explication dans la situation.")]),
    resultat("b", fr(frags(s.bonne))),
    verification("b", fr(frags(s.corrige))),
    piegeC("b", [texte(e.variante === "causalitePlausible" ? "Refuser toute causalité par principe : ici, le mécanisme est connu et confirmé." : "Conclure « donc l'une cause l'autre » parce que r est proche de 1 ou de −1.")]),
  ];
}

export const DEFINITION_CORRELATION_CAUSALITE: DefinitionEcrans<E, PhaseCorrelation> = {
  phases: () => PHASES_CORRELATION,
  estChoix: () => true,
  mode: (e, p) => ({ type: "choix", options: p === "type" ? optionsType() : optionsPrecision(e) }),
  libelle,
  consigneGenerale: enonce,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer: (e, p, v) => [v[0] === (p === "type" ? e.variante : "E0") ? "correct" : "not_equivalent"],
  piege: () => null,
  bonneOption: (e, p) => (p === "type" ? e.variante : "E0"),
  messageIllisible: () => "Choisis une réponse.",
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e, p) => (p === "type" ? situationDe(e).corrige.replace(/\$[^$]*\$/g, "") : ""),
  correction: correctionDetailleeCorrelationCausalite,
  apercuEnonce: (e) => frags(`${situationDe(e).texte.split(/ : \$/)[0]!.trim().replace(/\.$/, "")}.`),
};
