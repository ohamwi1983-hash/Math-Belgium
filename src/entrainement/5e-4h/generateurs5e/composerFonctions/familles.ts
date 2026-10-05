import type { DonneeFonction, FonctionComposable } from "../../core5e/composerFonctions.types";
import type { Polynome } from "../../core5e/domaineDefinition.types";
import { entierAleatoire, entierNonNulAleatoire } from "../domaineDefinition/aleatoire";
import { formatPolynomeLatex, multiplierPolynomes, polynomeLineaire, reduireNumerateurConstant } from "../domaineDefinition/polynome";
import { intersecterEnsembles } from "./intervalles";
import { resoudrePolynomeComparateur } from "./solveur";

/**
 * Construction des 4 familles composables de 5gen3 — toujours des polynômes de degré 1
 * (radicandes/dénominateurs), condition suffisante pour que toute composition f∘g/g∘f se ramène à
 * un polynôme de degré ≤2 (voir `solveur.ts`). Générateur FRAIS, indépendant des objets
 * `ExerciceXxx` de 5gen1 (qui ne conservent jamais le numérateur/l'habillage réel de f(x), voir
 * CLAUDE.md section 5gen3) — chaque famille construit directement un `FonctionComposable` +
 * `DonneeFonction` complet (formule/latex/domaine), jamais une extraction a posteriori.
 */

export type Formule = "rationnelle" | "irrationnelleSimple" | "racineSurFraction" | "fractionSousRacine";
export const FAMILLES_COMPOSABLES: Formule[] = ["rationnelle", "irrationnelleSimple", "racineSurFraction", "fractionSousRacine"];

function formatTermeFormule(coeff: number, degre: number, variable: string): string | null {
  if (coeff === 0) return null;
  const abs = Math.abs(coeff);
  const partieVariable = degre === 0 ? "" : degre === 1 ? variable : `${variable}^${degre}`;
  const partieCoeff = degre === 0 ? String(abs) : abs === 1 ? "" : `${abs}*`;
  return `${coeff < 0 ? "-" : ""}${partieCoeff}${partieVariable}`;
}

/** Rendu texte (syntaxe `evaluerExpressionGenerale`) d'un polynôme — même principe que
 * `formatPolynomeLatex` (jamais de coefficient nul/±1 littéral), mais `*`/`^` explicites plutôt que
 * du LaTeX. */
export function formatPolynomeFormule(coeffs: Polynome, variable = "x"): string {
  const termes: string[] = [];
  for (let degre = coeffs.length - 1; degre >= 0; degre--) {
    const terme = formatTermeFormule(coeffs[degre], degre, variable);
    if (terme === null) continue;
    if (termes.length === 0) termes.push(terme);
    else if (terme.startsWith("-")) termes.push(`-${terme.slice(1)}`);
    else termes.push(`+${terme}`);
  }
  return termes.length === 0 ? "0" : termes.join("");
}

function domaineDeFonction(f: FonctionComposable) {
  if (f.type === "rationnelle") return resoudrePolynomeComparateur(f.denominateur, "ne");
  if (f.type === "irrationnelleSimple") return resoudrePolynomeComparateur(f.radicande, "ge");
  if (f.type === "racineSurFraction") {
    return intersecterEnsembles(resoudrePolynomeComparateur(f.radicande, "ge"), resoudrePolynomeComparateur(f.denominateur, "ne"));
  }
  const quotientSigne = multiplierPolynomes(f.numerateur, f.denominateur);
  return intersecterEnsembles(resoudrePolynomeComparateur(quotientSigne, "ge"), resoudrePolynomeComparateur(f.denominateur, "ne"));
}

function construireFonction(f: FonctionComposable, nom: "f" | "g"): DonneeFonction {
  let corpsLatex: string;
  let formule: string;
  if (f.type === "rationnelle") {
    corpsLatex = `\\dfrac{${formatPolynomeLatex(f.numerateur)}}{${formatPolynomeLatex(f.denominateur)}}`;
    formule = `(${formatPolynomeFormule(f.numerateur)})/(${formatPolynomeFormule(f.denominateur)})`;
  } else if (f.type === "irrationnelleSimple") {
    corpsLatex = `\\sqrt{${formatPolynomeLatex(f.radicande)}}`;
    formule = `sqrt(${formatPolynomeFormule(f.radicande)})`;
  } else if (f.type === "racineSurFraction") {
    corpsLatex = `\\dfrac{\\sqrt{${formatPolynomeLatex(f.radicande)}}}{${formatPolynomeLatex(f.denominateur)}}`;
    formule = `sqrt(${formatPolynomeFormule(f.radicande)})/(${formatPolynomeFormule(f.denominateur)})`;
  } else {
    corpsLatex = `\\sqrt{\\dfrac{${formatPolynomeLatex(f.numerateur)}}{${formatPolynomeLatex(f.denominateur)}}}`;
    formule = `sqrt((${formatPolynomeFormule(f.numerateur)})/(${formatPolynomeFormule(f.denominateur)}))`;
  }
  return { fonction: f, latex: `${nom}(x) = ${corpsLatex}`, corpsLatex, formule, domaine: domaineDeFonction(f) };
}

function droiteNonNulle(min = -4, max = 4, pMin = -6, pMax = 6): Polynome {
  return polynomeLineaire(entierNonNulAleatoire(min, max), entierAleatoire(pMin, pMax));
}

/**
 * Deux droites `ax+b` à COEFFICIENTS DIRECTEURS DE SIGNES OPPOSÉS (l'une croissante, l'autre
 * décroissante) ET non proportionnelles — pour `fractionSousRacine`, garantit que le domaine du
 * quotient N(x)/D(x)≥0 est TOUJOURS un unique intervalle BORNÉ (jamais 2 morceaux, jamais une
 * demi-droite) : preuve algébrique — soit N croissante (racine rN) et D décroissante (racine rD),
 * N/D≥0 ⟺ (N≥0 ET D>0) OU (N≤0 ET D<0) ⟺ (u≥rN ET u<rD) OU (u≤rN ET u>rD) — exactement UNE des 2
 * disjonctions est non vide (rN≠rD, garanti par la non-proportionnalité), donnant toujours un seul
 * intervalle borné entre rN et rD. Nécessaire pour `composition.ts::conditionsExterieurSurG` (D.4,
 * pipeline "riche") — quand `fractionSousRacine` joue le rôle d'EXTÉRIEURE, ses 2 conditions sur
 * `interieure(x)` sont lues directement sur ce domaine déjà résolu, jamais reconstruites depuis N/D
 * indépendamment (mathématiquement invalide, le signe du quotient dépend des 2 à la fois — voir la
 * note d'en-tête de `core5e/composerFonctions.types.ts`), donc SANS cette garantie de forme, la
 * lecture à 2 bornes échouerait dès que le domaine réel compte 2 morceaux disjoints ou est une
 * demi-droite. Appliquée à TOUTE instance de `fractionSousRacine` (pas seulement celles qui
 * joueront ce rôle précis, inconnu au moment du tirage) — un domaine à intervalle borné unique
 * reste un choix pédagogique parfaitement valide dans n'importe quel autre rôle également.
 */
function deuxDroitesSignesOpposes(): [Polynome, Polynome] {
  let d1 = droiteNonNulle();
  let d2 = droiteNonNulle();
  while (Math.sign(d1[1]) === Math.sign(d2[1]) || Math.abs(d1[1] * d2[0] - d2[1] * d1[0]) < 1e-9) {
    d1 = droiteNonNulle();
    d2 = droiteNonNulle();
  }
  return [d1, d2];
}

/** Numérateur constant réduit par PGCD avec le dénominateur avant affichage (A.7, voir
 * `reduireNumerateurConstant`) — sinon ~15% des tirages affichaient une fraction non réduite (ex.
 * 6/(2x+4) au lieu de 3/(x+2)). */
function construireRationnelle(): FonctionComposable {
  const { numerateur, denominateur } = reduireNumerateurConstant(entierNonNulAleatoire(1, 9), droiteNonNulle());
  return { type: "rationnelle", numerateur: [numerateur], denominateur };
}

function construireIrrationnelleSimple(): FonctionComposable {
  return { type: "irrationnelleSimple", radicande: droiteNonNulle() };
}

function construireRacineSurFraction(): FonctionComposable {
  return { type: "racineSurFraction", radicande: droiteNonNulle(), denominateur: droiteNonNulle() };
}

function construireFractionSousRacine(): FonctionComposable {
  const [numerateur, denominateur] = deuxDroitesSignesOpposes();
  return { type: "fractionSousRacine", numerateur, denominateur };
}

const CONSTRUCTEURS: Record<Formule, () => FonctionComposable> = {
  rationnelle: construireRationnelle,
  irrationnelleSimple: construireIrrationnelleSimple,
  racineSurFraction: construireRacineSurFraction,
  fractionSousRacine: construireFractionSousRacine,
};

export function genererDonneeFonction(nom: "f" | "g", famille?: Formule): DonneeFonction {
  const f = (famille ?? FAMILLES_COMPOSABLES[entierAleatoire(0, FAMILLES_COMPOSABLES.length - 1)]);
  return construireFonction(CONSTRUCTEURS[f](), nom);
}
