import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceEchellesLogarithmiques, IdVarianteEchelles } from "../../core6e/echellesLogarithmiques.types";
import { typeQuestion } from "../../core6e/echellesLogarithmiques.types";
import { PHASES_ECHELLES } from "../../moteur6e/typesEchellesLogarithmiques";
import type { PhaseEchelles } from "../../moteur6e/typesEchellesLogarithmiques";
import { fiche, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEchellesLogarithmiques";
import { COURS_PROBLEMES, fragmentsAide } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen90` (échelles logarithmiques : rapports et sommes) —
 * règle `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) la relation entre
 * l'écart sur l'échelle et le rapport des grandeurs, b) le calcul de l'écart (ou du logarithme du
 * rapport), c) la réponse. Les chaînes de calcul sont celles de l'écran (`fiche(e).calculs`),
 * éclatées une transformation par ligne (`lignesDepuisChaine`, coupure aux « ⟺ ») avec la règle
 * utilisée à droite ; résultats : `formatReponseAttenduePhaseLatex`.
 */

type E = ExerciceEchellesLogarithmiques;
const t = texte;
const f = latex;
const LETTRES: Record<PhaseEchelles, string> = { traduire: "a", calcul: "b", reponse: "c" };

/** Règles utilisées par la chaîne « traduire » de chaque variante (une par égalité ou équivalence). */
type Regle = string | FragmentConsigne[];
const QUOTIENT: Regle = [f("\\log\\left(\\dfrac{a}{b}\\right)=\\log a-\\log b")];
const DIFF = (nom: string): Regle => [f("\\log a-\\log b=\\log\\dfrac{a}{b}"), t(` : ${nom} disparaît`)];
const PUISSANCE10 = (v: string): Regle => [f(`\\log(${v})=y\\iff ${v}=10^{y}`)];

const REGLES_TRADUIRE: Record<IdVarianteEchelles, Regle[]> = {
  "db-sources": ["n sources identiques : intensité n·I₁", "log(ab) = log a + log b", "définition de L₁"],
  "db-reduire": ["intensité divisée par k", QUOTIENT, "définition de L₁"],
  "db-combien": ["n sources identiques : intensité n·I₁", "log(ab) = log a + log b et définition de L₁", "niveau à atteindre"],
  "db-comparer": ["on écrit la différence des deux niveaux", DIFF("I₀")],
  "seisme-amplitude": ["on écrit la différence des deux magnitudes", DIFF("A₀")],
  "seisme-energie": ["on soustrait les deux relations", DIFF("le terme 4,8")],
  "seisme-magnitude": ["différence des deux relations de l'énergie", "on isole M₂"],
  "ph-comparer": [QUOTIENT, "log(c) = −pH"],
  "ph-diluer": ["concentration divisée par k", QUOTIENT, "définition de pH₀"],
  "etoiles-eclat": ["on écrit la différence des deux magnitudes", [f("-\\log(x)=\\log\\dfrac{1}{x}")], "on divise par 2,5", [f("\\dfrac{1}{2{,}5}=0{,}4")]],
  "etoiles-magnitude": ["on écrit la différence des deux magnitudes", "rapport des éclats"],
};

/** Éclate une chaîne de l'écran : coupure aux « ⟺ » et à « \ \text{donc}\ » (nouvelle ligne), puis aux « = » et
 * « \approx » de niveau 0 (une transformation par ligne, la ligne suivante commence par sa relation). */
function eclater(chaine: string, regles: Regle[]): LigneCalcul[] {
  const morceaux = chaine.split(/\\iff|\\ \\text\{donc\}\\ /).map((x) => x.trim()).filter((x) => x !== "");
  const lignes: LigneCalcul[] = [];
  let r = 0;
  for (const m of morceaux) {
    const membres = membresNiveau0(m);
    if (membres.length === 1) {
      lignes.push(ligne(m, regles[r++]));
      continue;
    }
    membres.slice(1).forEach((x, k) => {
      lignes.push(ligne(k === 0 ? `${membres[0]!.s}${x.rel}${x.s}` : `${x.rel}${x.s}`, regles[r++]));
    });
  }
  return lignes;
}

/** Membres d'une chaîne, coupés aux « = », « \approx », « \geq », « \leq » de niveau 0, avec la relation qui précède. */
function membresNiveau0(s: string): { rel: string; s: string }[] {
  const out: { rel: string; s: string }[] = [];
  let prof = 0;
  let debut = 0;
  let rel = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      const m = /^\\(approx|geq|leq)(?![a-zA-Z])/.exec(s.slice(i));
      if (m && prof === 0) {
        out.push({ rel, s: s.slice(debut, i) });
        rel = `${m[0]} `;
        debut = i + m[0].length;
        i += m[0].length - 1;
        continue;
      }
      i++;
      continue;
    }
    if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (c === "=" && prof === 0) {
      out.push({ rel, s: s.slice(debut, i) });
      rel = "=";
      debut = i + 1;
    }
  }
  out.push({ rel, s: s.slice(debut) });
  return out.map((x) => ({ rel: x.rel, s: x.s.trim() }));
}

function reglesCalcul(e: E): Regle[] {
  const q = typeQuestion(e.variante);
  if (q === "facteur") return ["on remplace le facteur par sa valeur", "calculatrice"];
  if (q === "combien") return ["niveau voulu − niveau d'un seul", "on divise par 10"];
  return ["on remplace par les données", "calcul"];
}

function reglesReponse(e: E): Regle[] {
  const q = typeQuestion(e.variante);
  if (q === "facteur") return ["valeur de départ et écart de l'étape 2", "arrondi demandé"];
  if (q === "combien") return [[f("\\log(n)\\geq y\\iff n\\geq 10^{y}")], "calculatrice", "plus petit entier qui convient"];
  return [PUISSANCE10("x"), "calculatrice"];
}

export function correctionDetailleeEchellesLogarithmiques(e: E): EtapeCorrection[] {
  const fi = fiche(e);
  return PHASES_ECHELLES.flatMap((phase): EtapeCorrection[] => {
    const sq = LETTRES[phase];
    const regles = phase === "traduire" ? REGLES_TRADUIRE[e.variante] : phase === "calcul" ? reglesCalcul(e) : reglesReponse(e);
    const lignes = eclater(fi.calculs[phase], regles);
    const rep = formatReponseAttenduePhaseLatex(e, phase).map(f);
    return [
      utilise(sq, fragmentsAide(fi.aides[phase][0], COURS_PROBLEMES)),
      calcul(sq, lignes),
      resultat(sq, phase === "traduire" ? [t("Relation : "), ...rep] : phase === "reponse" && typeQuestion(e.variante) === "combien" ? [t("Nombre minimal : "), ...rep] : rep),
      piege(sq, [t(fi.pieges[phase])]),
    ];
  });
}

