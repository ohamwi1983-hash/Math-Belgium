import type {
  ExerciceDenombA_BorneSuperieure,
  ExerciceDenombA_ContientDeuxChiffres,
  ExerciceDenombA_ContientUnChiffre,
  ExerciceDenombA_Parite,
  ExerciceDenombA_PositionFixee,
  ExerciceDenombA_Total,
  ExerciceDenombrementC,
  ExerciceDenombrementD,
  ExerciceDenombrementE,
  ExerciceDenombrementFondamental,
} from "../core6e/denombrementFondamental.types";
import type { PhaseDenombrementFondamental, ResultatExerciceDenombrementFondamental } from "../moteur6e/typesDenombrementFondamental";
import { phasesPourExercice } from "../moteur6e/typesDenombrementFondamental";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen43`. Dispatch sur
 * `exercice.famille` PUIS `sousType` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37),
 * jamais importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** (bug déjà
 * rencontré et corrigé sur plusieurs générateurs 6e, documenté par CLAUDE.md) — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * Couverture de régression : `formatDenombrementFondamental.test.ts`, scan sur de nombreux tirages
 * aléatoires à la recherche d'un `++`/`+-`/`--`/groupe `{}` vide.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

function rangePositions(debut: number, fin: number): number[] {
  const r: number[] = [];
  for (let p = debut; p <= fin; p++) r.push(p);
  return r;
}

function ordinal(n: number): string {
  return n === 1 ? "1ʳᵉ" : `${n}ᵉ`;
}

function champsPositions(positions: number[], placeholderDepart = 8): ChampDef[] {
  return positions.map((p, i) => champTexte(`Choix position ${p} (${ordinal(p)}) =`, `ex : ${Math.max(1, placeholderDepart - i)}`));
}

// ============================================================================
// Famille A — Principe des cases juxtaposées.
// ============================================================================

export function consigneGeneraleA(): string {
  return "On considère les nombres à n chiffres, tous différents, dont le premier chiffre n'est pas nul. Détermine, en comptant position par position (principe multiplicatif), le nombre de tels nombres vérifiant la contrainte donnée.";
}

function blocDonneesA_Total(e: ExerciceDenombA_Total): string[] {
  return [`n=${e.n}`, "\\text{Aucune contrainte supplémentaire.}"];
}
function blocDonneesA_PositionFixee(e: ExerciceDenombA_PositionFixee): string[] {
  const clauses = e.chiffresFixes.map((c) => `\\text{Chiffre en position }${c.position}\\text{ fixé à }${c.valeur}`);
  return [`n=${e.n}`, ...clauses];
}
function blocDonneesA_ContientUnChiffre(e: ExerciceDenombA_ContientUnChiffre): string[] {
  return [`n=${e.n}`, `\\text{Le nombre doit contenir le chiffre }${e.chiffre}`, `\\text{Rappel — total sans aucune contrainte : }T=${e.total}`];
}
function blocDonneesA_ContientDeuxChiffres(e: ExerciceDenombA_ContientDeuxChiffres): string[] {
  return [
    `n=${e.n}`,
    `\\text{Doit contenir }${e.chiffre1}\\text{ ET }${e.chiffre2}`,
    `T=${e.total}`,
    `\\bar A=${e.sansChiffre1}\\text{ (sans }${e.chiffre1}\\text{)}`,
    `\\bar B=${e.sansChiffre2}\\text{ (sans }${e.chiffre2}\\text{)}`,
  ];
}
function blocDonneesA_BorneSuperieure(e: ExerciceDenombA_BorneSuperieure): string[] {
  return [`n=${e.n}`, `\\text{1ᵉʳ chiffre non nul et}`, `\\text{strictement inférieur à }${e.borne}`];
}
function blocDonneesA_Parite(e: ExerciceDenombA_Parite): string[] {
  return [`n=${e.n}`, `\\text{Le dernier chiffre doit être }\\textbf{${e.labelEnsemble}}\\text{ : }\\{${e.ensembleDernierChiffre.join(",")}\\}`];
}

export function blocDonneesA(e: ExerciceDenombrementFondamental & { famille: "A" }): string[] {
  switch (e.sousType) {
    case "total":
      return blocDonneesA_Total(e);
    case "positionFixee":
      return blocDonneesA_PositionFixee(e);
    case "contientUnChiffre":
      return blocDonneesA_ContientUnChiffre(e);
    case "contientDeuxChiffres":
      return blocDonneesA_ContientDeuxChiffres(e);
    case "borneSuperieure":
      return blocDonneesA_BorneSuperieure(e);
    case "parite":
      return blocDonneesA_Parite(e);
  }
}

export function consigneEcranA(e: ExerciceDenombrementFondamental & { famille: "A" }, phase: PhaseDenombrementFondamental): string {
  switch (e.sousType) {
    case "total":
      if (phase === "aTotalEcran1") return "Combien de choix as-tu pour le premier chiffre (non nul) ?";
      return "Combien de choix restent, position par position, pour les chiffres suivants (les chiffres déjà utilisés ne sont plus disponibles) ? Termine en donnant le nombre TOTAL de tels nombres.";
    case "positionFixee":
      if (phase === "aPositionFixeeEcran1") {
        return e.variante === "dernier" ? "Combien de choix as-tu pour le chiffre fixé, puis pour le premier chiffre (non nul, et différent du chiffre déjà fixé) ?" : "Combien de choix as-tu pour chacun des chiffres déjà fixés ?";
      }
      return "Combien de choix restent pour les positions NON fixées, position par position ? Termine en donnant le nombre TOTAL de tels nombres.";
    case "contientUnChiffre":
      if (phase === "aContientUnEcran1") return "Pour compter les nombres NE contenant PAS ce chiffre : combien de choix as-tu pour le premier chiffre ?";
      if (phase === "aContientUnEcran2") return "Combien de choix restent pour les positions suivantes ? Termine en donnant le nombre de nombres ne contenant PAS ce chiffre.";
      return "En utilisant la technique du complément (total moins le nombre CONFIRMÉ ne contenant pas ce chiffre), donne le résultat final.";
    case "contientDeuxChiffres":
      if (phase === "aContientDeuxEcran1") return "Pour compter les nombres NE contenant NI l'un NI l'autre chiffre : combien de choix as-tu pour le premier chiffre ?";
      if (phase === "aContientDeuxEcran2") return "Combien de choix restent pour les positions suivantes ? Termine en donnant le nombre de nombres ne contenant aucun des deux chiffres.";
      return "En utilisant l'inclusion-exclusion (T − Ā − B̄ + Ā∩B̄, à partir des valeurs CONFIRMÉES), donne le résultat final.";
    case "borneSuperieure":
      if (phase === "aBorneEcran1") return "Combien de choix as-tu pour le premier chiffre, sachant qu'il doit être non nul et strictement inférieur à la borne donnée ?";
      return "Combien de choix restent pour les positions suivantes ? Termine en donnant le nombre TOTAL de tels nombres.";
    case "parite":
      if (phase === "aPariteEcran1") return "Distingue les 2 cas possibles pour le dernier chiffre : donne le nombre de choix pour le premier chiffre SI le dernier chiffre vaut 0, puis SI le dernier chiffre est non nul.";
      if (phase === "aPariteEcran2") return "Combien de choix restent pour les positions du milieu (ni la première, ni la dernière) ? Cette séquence est LA MÊME dans les 2 cas.";
      return "Combine les 2 cas CONFIRMÉS (dernier chiffre = 0, puis dernier chiffre non nul) pour obtenir le résultat final.";
  }
}

export function etatActuelA(e: ExerciceDenombrementFondamental & { famille: "A" }, phase: PhaseDenombrementFondamental): string[] | null {
  switch (e.sousType) {
    case "total":
      if (phase === "aTotalEcran2") return [`\\text{Choix pour le 1ᵉʳ chiffre : }${e.choixPosition1}\\text{ (confirmé)}`];
      return null;
    case "positionFixee":
      if (phase === "aPositionFixeeEcran2") {
        if (e.variante === "dernier") return [`\\text{Chiffre fixé : }${e.choixPositionsFixees[0]}\\text{ choix (confirmé)}`, `\\text{1ᵉʳ chiffre : }${e.choixPosition1}\\text{ choix (confirmé)}`];
        return [`\\text{Positions fixées : }${e.choixPositionsFixees.join(",\\,")}\\text{ (confirmées)}`];
      }
      return null;
    case "contientUnChiffre":
      if (phase === "aContientUnEcran2") return [`\\text{Choix 1ᵉʳ chiffre (sans }${e.chiffre}\\text{) : }${e.choixPosition1SansD}\\text{ (confirmé)}`];
      if (phase === "aContientUnEcran3")
        return [
          `\\text{Choix 1ᵉʳ chiffre (sans }${e.chiffre}\\text{) : }${e.choixPosition1SansD}\\text{ (confirmé)}`,
          `\\bar A=${e.sansD}\\text{ (confirmé) ; }T=${e.total}`,
        ];
      return null;
    case "contientDeuxChiffres":
      if (phase === "aContientDeuxEcran2") return [`\\text{Choix 1ᵉʳ chiffre (sans les 2) : }${e.choixPosition1SansLesDeux}\\text{ (confirmé)}`];
      if (phase === "aContientDeuxEcran3")
        return [
          `\\text{Choix 1ᵉʳ chiffre (sans les 2) : }${e.choixPosition1SansLesDeux}\\text{ (confirmé)}`,
          `\\bar A\\cap\\bar B=${e.sansLesDeux}\\text{ (confirmé)}`,
          `T=${e.total}\\text{, }\\bar A=${e.sansChiffre1}\\text{, }\\bar B=${e.sansChiffre2}`,
        ];
      return null;
    case "borneSuperieure":
      if (phase === "aBorneEcran2") return [`\\text{Choix pour le 1ᵉʳ chiffre : }${e.choixPosition1}\\text{ (confirmé)}`];
      return null;
    case "parite":
      if (phase === "aPariteEcran2") return [`\\text{Si dernier=0 : }${e.choixPremierSiDernierZero}\\text{ choix}`, `\\text{Si dernier}\\neq 0\\text{ : }${e.choixPremierSiDernierNonZero}\\text{ choix (confirmés)}`];
      if (phase === "aPariteEcran3")
        return [
          `\\text{Si dernier=0 : }${e.choixPremierSiDernierZero}\\text{ choix}`,
          `\\text{Si dernier}\\neq 0\\text{ : }${e.choixPremierSiDernierNonZero}\\text{ choix (confirmés)}`,
          `\\text{Positions du milieu : }${e.choixPositionsMilieu.join(",\\,")}\\text{ (confirmées)}`,
        ];
      return null;
  }
}

export function champsA(e: ExerciceDenombrementFondamental & { famille: "A" }, phase: PhaseDenombrementFondamental): ChampDef[] {
  switch (e.sousType) {
    case "total":
      if (phase === "aTotalEcran1") return [champTexte("Choix pour le 1ᵉʳ chiffre =", "ex : 9")];
      return [...champsPositions(rangePositions(2, e.n)), champTexte("Total =", "ex : 4536")];
    case "positionFixee":
      if (phase === "aPositionFixeeEcran1") {
        if (e.variante === "dernier") return [champTexte("Choix chiffre fixé =", "ex : 1"), champTexte("Choix 1ᵉʳ chiffre =", "ex : 8")];
        return e.chiffresFixes.map((c) => champTexte(`Choix position ${c.position} =`, "ex : 1"));
      }
      return [...champsPositions(rangePositions(e.variante === "dernier" ? 2 : e.chiffresFixes.length + 1, e.variante === "dernier" ? e.n - 1 : e.n)), champTexte("Total =", "ex : 448")];
    case "contientUnChiffre":
      if (phase === "aContientUnEcran1") return [champTexte("Choix 1ᵉʳ chiffre (sans le chiffre) =", "ex : 8")];
      if (phase === "aContientUnEcran2") return [...champsPositions(rangePositions(2, e.n)), champTexte("Nombres sans ce chiffre (Ā) =", "ex : 2688")];
      return [champTexte("Résultat final =", "ex : 1848")];
    case "contientDeuxChiffres":
      if (phase === "aContientDeuxEcran1") return [champTexte("Choix 1ᵉʳ chiffre (sans les 2 chiffres) =", "ex : 7")];
      if (phase === "aContientDeuxEcran2") return [...champsPositions(rangePositions(2, e.n)), champTexte("Nombres sans les 2 chiffres (Ā∩B̄) =", "ex : 1470")];
      return [champTexte("Résultat final =", "ex : 504")];
    case "borneSuperieure":
      if (phase === "aBorneEcran1") return [champTexte("Choix pour le 1ᵉʳ chiffre =", "ex : 3")];
      return [...champsPositions(rangePositions(2, e.n)), champTexte("Total =", "ex : 2016")];
    case "parite":
      if (phase === "aPariteEcran1") return [champTexte("Choix 1ᵉʳ chiffre SI dernier=0 =", "ex : 9"), champTexte("Choix 1ᵉʳ chiffre SI dernier≠0 =", "ex : 8")];
      if (phase === "aPariteEcran2") return champsPositions(rangePositions(2, e.n - 1));
      return [champTexte("Résultat final =", "ex : 2296")];
  }
}

export function niveauAideMaxA(phase: PhaseDenombrementFondamental): number {
  return phase.endsWith("Ecran1") ? 2 : 0;
}

export function aideNiveau1A(e: ExerciceDenombrementFondamental & { famille: "A" }): AideAvecLatex {
  if (e.sousType === "parite") {
    return { texte: "Le nombre de choix pour le premier chiffre dépend de si le dernier chiffre déjà utilisé est 0 ou non : distingue bien les 2 cas avant de continuer.", latex: null };
  }
  return { texte: "Traite en priorité les positions les plus contraintes (une position fixée à une valeur précise, ou soumise à une restriction comme « chiffre non nul ») : leur nombre de choix conditionne tout le reste du comptage.", latex: null };
}

export function aideNiveau2A(e: ExerciceDenombrementFondamental & { famille: "A" }): AideAvecLatex {
  switch (e.sousType) {
    case "total":
      return { texte: "Choix pour le premier chiffre (tous les chiffres sauf 0) :", latex: `${e.choixPosition1}` };
    case "positionFixee":
      return e.variante === "dernier"
        ? { texte: "Choix pour le chiffre déjà fixé (une seule valeur possible) — le premier chiffre reste à déterminer :", latex: `${e.choixPositionsFixees[0]}` }
        : { texte: "Choix pour chaque position déjà fixée (une seule valeur possible chacune) :", latex: `${e.choixPositionsFixees[0]}` };
    case "contientUnChiffre":
      return { texte: "Choix pour le premier chiffre dans le scénario « sans ce chiffre » :", latex: `${e.choixPosition1SansD}` };
    case "contientDeuxChiffres":
      return { texte: "Choix pour le premier chiffre dans le scénario « sans les 2 chiffres » :", latex: `${e.choixPosition1SansLesDeux}` };
    case "borneSuperieure":
      return { texte: "Choix pour le premier chiffre (chiffres non nuls strictement inférieurs à la borne) :", latex: `${e.choixPosition1}` };
    case "parite":
      return { texte: "Cas « dernier chiffre non nul » (le plus délicat des 2) — le cas « dernier=0 » reste à déterminer :", latex: `${e.choixPremierSiDernierNonZero}` };
  }
}

// ============================================================================
// Famille B — Diagonales d'un polygone.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Un polygone convexe à n côtés possède D(n)=n(n-3)/2 diagonales.";
}
export function blocDonneesB(e: ExerciceDenombrementFondamental & { famille: "B" }): string[] {
  if (e.sousType === "direct") return [`n=${e.n}`, "D(n)=\\,?"];
  return [`D=${e.diagonales}`, "n=\\,?"];
}
export function consigneEcranB(e: ExerciceDenombrementFondamental & { famille: "B" }, phase: PhaseDenombrementFondamental): string {
  if (e.sousType === "direct") return "Calcule D(n)=n(n-3)/2.";
  if (phase === "bInverseEcran1") return "Pose n(n-3)/2=D, multiplie par 2 puis développe : complète l'équation du second degré n² − 3n − ⬚ = 0.";
  return "Résous l'équation CONFIRMÉE pour n>0 entier (formule quadratique).";
}
export function etatActuelB(e: ExerciceDenombrementFondamental & { famille: "B" }, phase: PhaseDenombrementFondamental): string[] | null {
  if (e.sousType === "inverse" && phase === "bInverseEcran2") return [`n^2-3n-${e.constanteEquation}=0\\text{ (confirmé)}`];
  return null;
}
export function champsB(e: ExerciceDenombrementFondamental & { famille: "B" }, phase: PhaseDenombrementFondamental): ChampDef[] {
  if (e.sousType === "direct") return [champTexte("D(n) =", "ex : 9")];
  if (phase === "bInverseEcran1") return [champTexte("n² − 3n − ⬚ = 0, ⬚ =", "ex : 18")];
  return [champTexte("n =", "ex : 6")];
}
export function niveauAideMaxB(): number {
  return 0;
}
export function aideNiveau1B(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2B(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Arrangements et combinaisons classiques.
// ============================================================================

const LIBELLE_FORMULE_C: Record<ExerciceDenombrementC["formule"], string> = {
  permutation: "Permutation (n!)",
  combinaison: "Combinaison (Cₙᵏ)",
  puissance: "Puissance (n^k)",
};

export function consigneGeneraleC(): string {
  return "Identifie la technique de dénombrement appropriée (l'ordre compte-t-il ?), puis calcule le résultat.";
}
export function blocDonneesC(e: ExerciceDenombrementC): string[] {
  switch (e.sousType) {
    case "cartesContraintes": {
      const clause = e.varianteCartes === "inclues" ? `\\text{dont }${e.m}\\text{ déjà incluses}` : `\\text{en excluant }${e.m}\\text{ cartes}`;
      return [`\\text{Jeu de }${e.n}\\text{ cartes}`, `\\text{Choisir }${e.k}\\text{ cartes, }${clause}`];
    }
    case "motsLettresDistinctes":
      return [`\\text{Mot de }${e.n}\\text{ lettres toutes différentes}`, `\\text{Combien d'ordres possibles ?}`];
    case "motsRepetition":
      return [`\\text{Alphabet de }${e.n}\\text{ lettres}`, `\\text{Mots de }${e.k}\\text{ lettres, répétition autorisée}`];
    case "motsPositionFixee": {
      const clauses = (e.lettresFixees ?? []).map((l) => `\\text{position }${l.position}\\text{ : }${l.lettre}`);
      return [`\\text{Mot de }${e.n}\\text{ lettres toutes différentes}`, `\\text{Fixées : }${clauses.join("\\text{, }")}`];
    }
  }
}
export function consigneEcranC(phase: PhaseDenombrementFondamental): string {
  if (phase === "cEcran1") return "L'ordre des éléments choisis a-t-il de l'importance dans ce contexte ? Choisis la formule appropriée.";
  return "Calcule le résultat à partir de la formule CONFIRMÉE.";
}
export function etatActuelC(e: ExerciceDenombrementC, phase: PhaseDenombrementFondamental): string[] | null {
  if (phase === "cEcran2") return [`\\text{Formule confirmée : }${LIBELLE_FORMULE_C[e.formule]}`];
  return null;
}
export function champsC(_e: ExerciceDenombrementC, phase: PhaseDenombrementFondamental): ChampDef[] {
  if (phase === "cEcran1") {
    return [
      {
        type: "choix",
        label: "Formule =",
        options: (["permutation", "combinaison", "puissance"] as const).map((v) => ({ valeur: v, label: LIBELLE_FORMULE_C[v] })),
      },
    ];
  }
  return [champTexte("Résultat =", "ex : 120")];
}
export function niveauAideMaxC(phase: PhaseDenombrementFondamental): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Demande-toi si l'ordre des éléments choisis a de l'importance dans le contexte donné (former un mot ≠ choisir un groupe).", latex: null };
}
export function aideNiveau2C(e: ExerciceDenombrementC, phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return e.formule === "combinaison" ? { texte: "Il s'agit ici de CHOISIR des éléments (l'ordre n'a pas d'importance) — formule précise non donnée.", latex: null } : { texte: "Il s'agit ici d'ORDONNER des éléments (l'ordre a de l'importance) — formule précise non donnée.", latex: null };
}

// ============================================================================
// Famille D — Arrangements par blocs ou groupes.
// ============================================================================

export function consigneGeneraleD(): string {
  return "Certains éléments doivent rester groupés (traités comme un seul bloc) — détermine le nombre total d'arrangements possibles.";
}
export function blocDonneesD(e: ExerciceDenombrementD): string[] {
  if (e.sousType === "grouper") {
    const clauses = (e.groupes ?? []).map((g) => `\\text{${g.nom} : }${g.taille}\\text{ objets}`);
    return [`\\text{Groupes devant chacun rester rassemblés :}`, ...clauses];
  }
  const clause = e.sousType === "consecutivesOrdreFixe" ? `\\text{dans CET ORDRE PRÉCIS}` : `\\text{dans un ordre QUELCONQUE entre elles}`;
  return [`\\text{Mot de }${(e.mot ?? "").length}\\text{ lettres : }${e.mot}`, `\\text{Consécutives : }${e.lettresConsecutives}`, clause];
}
export function consigneEcranD(phase: PhaseDenombrementFondamental): string {
  if (phase === "dEcran1") return "Combien d'unités distinctes (blocs + éléments isolés éventuels) doivent être arrangées, en traitant chaque bloc comme une seule unité ?";
  if (phase === "dEcran2") return "Combien d'arrangements possibles pour ces unités entre elles (nombre d'unités CONFIRMÉ, factorielle) ?";
  return "Combine avec les arrangements INTERNES à chaque bloc (1 seul si l'ordre interne est imposé, k! si libre) pour obtenir le résultat final.";
}
export function etatActuelD(e: ExerciceDenombrementD, phase: PhaseDenombrementFondamental): string[] | null {
  if (phase === "dEcran2") return [`\\text{Nombre d'unités : }${e.nombreUnites}\\text{ (confirmé)}`];
  if (phase === "dEcran3")
    return [
      `\\text{Nombre d'unités : }${e.nombreUnites}\\text{ (confirmé)}`,
      `\\text{Arrangements des unités : }${e.arrangementsBlocs}\\text{ (confirmé)}`,
    ];
  return null;
}
export function champsD(phase: PhaseDenombrementFondamental): ChampDef[] {
  if (phase === "dEcran1") return [champTexte("Nombre d'unités =", "ex : 3")];
  if (phase === "dEcran2") return [champTexte("Arrangements des unités =", "ex : 6")];
  return [champTexte("Résultat final =", "ex : 12")];
}
export function niveauAideMaxD(phase: PhaseDenombrementFondamental): number {
  return phase === "dEcran3" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "dEcran3") return AUCUNE_AIDE;
  return { texte: "Vérifie, pour CHAQUE bloc, si l'ordre à l'intérieur est imposé (1 seul arrangement) ou libre (k! arrangements) — ne l'oublie pas dans le résultat final.", latex: null };
}
export function aideNiveau2D(e: ExerciceDenombrementD, phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "dEcran3") return AUCUNE_AIDE;
  const premier = e.internesParGroupe[0];
  return { texte: "Arrangements internes du premier bloc (les autres restent à déterminer) :", latex: `${premier}` };
}

// ============================================================================
// Famille E — Permutations circulaires.
// ============================================================================

const LIBELLE_SOUS_TYPE_E: Record<ExerciceDenombrementE["sousType"], string> = {
  table: "Table ronde — (n-1)!",
  collier: "Collier/bracelet — (n-1)!/2",
};

export function consigneGeneraleE(): string {
  return "n objets distincts sont disposés en cercle. Identifie si seules les rotations sont équivalentes, ou aussi les réflexions (retournement), puis calcule le résultat.";
}
export function blocDonneesE(e: ExerciceDenombrementE): string[] {
  if (e.sousType === "table") {
    return [`n=${e.n}`, "\\text{Personnes autour d'une table ronde}", "\\text{(seules les rotations sont équivalentes)}"];
  }
  return [`n=${e.n}`, "\\text{Perles enfilées en bracelet}", "\\text{(le bracelet peut être retourné)}"];
}
export function consigneEcranE(phase: PhaseDenombrementFondamental): string {
  if (phase === "eEcran1") return "Le contexte autorise-t-il aussi le retournement (réflexion) ? Choisis la formule appropriée.";
  return "Calcule le résultat à partir de la formule CONFIRMÉE.";
}
export function etatActuelE(e: ExerciceDenombrementE, phase: PhaseDenombrementFondamental): string[] | null {
  if (phase === "eEcran2") return [`\\text{Formule confirmée : }${LIBELLE_SOUS_TYPE_E[e.sousType]}`];
  return null;
}
export function champsE(phase: PhaseDenombrementFondamental): ChampDef[] {
  if (phase === "eEcran1") {
    return [
      {
        type: "choix",
        label: "Formule =",
        options: (["table", "collier"] as const).map((v) => ({ valeur: v, label: LIBELLE_SOUS_TYPE_E[v] })),
      },
    ];
  }
  return [champTexte("Résultat =", "ex : 24")];
}
export function niveauAideMaxE(phase: PhaseDenombrementFondamental): number {
  return phase === "eEcran1" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: "(n-1)! compte les rotations comme équivalentes, mais PAS les réflexions — divise encore par 2 si le retournement rend deux dispositions identiques.", latex: null };
}
export function aideNiveau2E(phase: PhaseDenombrementFondamental): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: "Le type de disposition (table ou collier) est déjà identifié dans l'énoncé — la formule précise reste à choisir.", latex: null };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceDenombrementFondamental): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
  }
}

export function blocDonnees(exercice: ExerciceDenombrementFondamental): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
  }
}

export function consigneEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(phase);
  }
}

export function etatActuel(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB();
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
  }
}

export function aideNiveau1(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau1A(exercice);
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B();
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseDenombrementFondamental, string> = {
  aTotalEcran1: "Étape 1 (position la plus contrainte)",
  aTotalEcran2: "Étape 2 (positions restantes + total)",
  aPositionFixeeEcran1: "Étape 1 (positions fixées/contraintes)",
  aPositionFixeeEcran2: "Étape 2 (positions restantes + total)",
  aContientUnEcran1: "Étape 1 (sans le chiffre — 1ᵉʳ chiffre)",
  aContientUnEcran2: "Étape 2 (sans le chiffre — positions restantes)",
  aContientUnEcran3: "Étape 3 (complément)",
  aContientDeuxEcran1: "Étape 1 (sans les 2 chiffres — 1ᵉʳ chiffre)",
  aContientDeuxEcran2: "Étape 2 (sans les 2 chiffres — positions restantes)",
  aContientDeuxEcran3: "Étape 3 (inclusion-exclusion)",
  aBorneEcran1: "Étape 1 (1ᵉʳ chiffre borné)",
  aBorneEcran2: "Étape 2 (positions restantes + total)",
  aPariteEcran1: "Étape 1 (les 2 cas du 1ᵉʳ chiffre)",
  aPariteEcran2: "Étape 2 (positions du milieu)",
  aPariteEcran3: "Étape 3 (combinaison des cas)",
  bDirectEcran1: "Étape unique (calcul direct)",
  bInverseEcran1: "Étape 1 (équation posée)",
  bInverseEcran2: "Étape 2 (résolution en n)",
  cEcran1: "Étape 1 (formule identifiée)",
  cEcran2: "Étape 2 (calcul)",
  dEcran1: "Étape 1 (structure en blocs)",
  dEcran2: "Étape 2 (arrangement des blocs)",
  dEcran3: "Étape 3 (arrangements internes + résultat)",
  eEcran1: "Étape 1 (formule identifiée)",
  eEcran2: "Étape 2 (calcul)",
};

export const LIBELLE_FAMILLE: Record<ExerciceDenombrementFondamental["famille"], string> = {
  A: "A — Principe des cases juxtaposées",
  B: "B — Diagonales d'un polygone",
  C: "C — Arrangements et combinaisons classiques",
  D: "D — Arrangements par blocs ou groupes",
  E: "E — Permutations circulaires",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental): string[] {
  if (exercice.famille === "A") {
    switch (exercice.sousType) {
      case "total":
        if (phase === "aTotalEcran1") return [`${exercice.choixPosition1}`];
        return [`${[...exercice.choixPositionsRestantes].join("\\times ")}\\text{, total}=${exercice.total}`];
      case "positionFixee":
        if (phase === "aPositionFixeeEcran1") {
          const champs = exercice.choixPosition1 === null ? exercice.choixPositionsFixees : [...exercice.choixPositionsFixees, exercice.choixPosition1];
          return [champs.join(",\\,")];
        }
        return [`\\text{total}=${exercice.total}`];
      case "contientUnChiffre":
        if (phase === "aContientUnEcran1") return [`${exercice.choixPosition1SansD}`];
        if (phase === "aContientUnEcran2") return [`\\bar A=${exercice.sansD}`];
        return [`${exercice.resultatFinal}`];
      case "contientDeuxChiffres":
        if (phase === "aContientDeuxEcran1") return [`${exercice.choixPosition1SansLesDeux}`];
        if (phase === "aContientDeuxEcran2") return [`\\bar A\\cap\\bar B=${exercice.sansLesDeux}`];
        return [`${exercice.resultatFinal}`];
      case "borneSuperieure":
        if (phase === "aBorneEcran1") return [`${exercice.choixPosition1}`];
        return [`\\text{total}=${exercice.total}`];
      case "parite":
        if (phase === "aPariteEcran1") return [`${exercice.choixPremierSiDernierZero},\\,${exercice.choixPremierSiDernierNonZero}`];
        if (phase === "aPariteEcran2") return [exercice.choixPositionsMilieu.join(",\\,")];
        return [`${exercice.resultatFinal}`];
    }
  }
  if (exercice.famille === "B") {
    if (exercice.sousType === "direct") return [`${exercice.diagonales}`];
    if (phase === "bInverseEcran1") return [`${exercice.constanteEquation}`];
    return [`${exercice.n}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [LIBELLE_FORMULE_C[exercice.formule]];
    return [`${exercice.resultat}`];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [`${exercice.nombreUnites}`];
    if (phase === "dEcran2") return [`${exercice.arrangementsBlocs}`];
    return [`${exercice.resultatFinal}`];
  }
  // famille E
  if (phase === "eEcran1") return [LIBELLE_SOUS_TYPE_E[exercice.sousType]];
  return [`${exercice.resultat}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsDenombrementFondamental(resultat: ResultatExerciceDenombrementFondamental): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
