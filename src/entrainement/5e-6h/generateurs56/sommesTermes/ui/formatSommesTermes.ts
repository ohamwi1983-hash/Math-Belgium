// Copie 5e (6h) de `5e-4h/ui5e/formatSommesTermes.ts` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { coefficientFormuleGeom, coefficientsFormuleArith, donneesSomme, facteursMultiples, termeArith, termeGeom } from "../core/sommesTermes.types";
import type { ExerciceArithExtension, ExerciceSommesTermes, RaisonQ } from "../core/sommesTermes.types";
import type { PhaseSommesTermes } from "../moteur/typesSommesTermes";

/**
 * Couche C (5e) — textes de `5gen45` « Sommes de termes consécutifs ». SOURCE UNIQUE des consignes,
 * champs, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs5e/sommesTermes/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 5e) : rang 1 = u₁, uₙ = u₁ + (n − 1)r, uₙ = u₁·qⁿ⁻¹,
 * « de uₚ à uₙ, il y a n − p + 1 termes », Sₙ = n(u₁ + uₙ)/2, Sₙ = u₁(1 − qⁿ)/(1 − q). Virgule
 * décimale, espace fine des milliers, jamais de prose dans le mode math ; aides = phrase terminée
 * par « : » puis la formule, sans la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (aria-label, historique). */
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres.
// ============================================================================

/** Entier ou décimal en LaTeX : virgule `{,}`, espace fine des milliers dès 10 000. */
export function nb(x: number, decimales = 2): string {
  const facteur = 10 ** decimales;
  const arrondi = Math.round(x * facteur) / facteur;
  const [ent, dec] = Math.abs(arrondi).toFixed(decimales).replace(/\.?0+$/, "").split(".");
  const groupe = ent.length >= 5 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent;
  return `${arrondi < 0 ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Même chose en texte brut (moins typographique, espace fine insécable). */
export function nbTexte(x: number): string {
  const s = String(Math.abs(x));
  const groupe = s.length >= 5 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : s;
  return `${x < 0 ? "−" : ""}${groupe}`;
}

/** Nombre négatif entre parenthèses dans un calcul substitué. */
export function jeton(x: number): string {
  return x < 0 ? `(${nb(x)})` : nb(x);
}

export function qLatex(q: RaisonQ): string {
  if (q.den === 1) return nb(q.num);
  return `${q.num < 0 ? "-" : ""}\\dfrac{${Math.abs(q.num)}}{${q.den}}`;
}

/** q entre parenthèses quand il est négatif ou fractionnaire. */
function qJeton(q: RaisonQ): string {
  return q.den === 1 && q.num > 0 ? nb(q.num) : `\\left(${qLatex(q)}\\right)`;
}

/** q^{exposant}, parenthèses si q est négatif ou fractionnaire. */
export function qPuissance(q: RaisonQ, exposant: number | string): string {
  return `${qJeton(q)}^{${exposant}}`;
}

/** Valeur exacte de qᵏ (fraction si q est fractionnaire). */
function puissanceValeurLatex(q: RaisonQ, k: number): string {
  const num = q.num ** k;
  const den = q.den ** k;
  if (den === 1) return nb(num);
  return `${num < 0 ? "-" : ""}\\dfrac{${nb(Math.abs(num))}}{${nb(den)}}`;
}

function u(indice: number | string): string {
  return `u_{${indice}}`;
}

/** a·n + b en LaTeX (variable `v`, n par défaut). */
function affineLatex(a: number, b: number, v = "n"): string {
  const terme = a === 1 ? v : a === -1 ? `-${v}` : `${nb(a)}${v}`;
  if (b === 0) return terme;
  return `${terme}${b > 0 ? "+" : "-"}${nb(Math.abs(b))}`;
}

/** a × k + b (substitution), en LaTeX. */
function affineSubstitueLatex(a: number, b: number, k: number): string {
  const produit = `${nb(a)}\\times ${k}`;
  if (b === 0) return produit;
  return `${produit}${b > 0 ? "+" : "-"}${nb(Math.abs(b))}`;
}

/** k × q^{exposant} (formule d'une suite géométrique). */
function formuleGeomLatex(k: number, q: RaisonQ, exposant: string): string {
  const puissance = qPuissance(q, exposant);
  if (k === 1) return puissance;
  if (k === -1) return `-${puissance}`;
  return `${nb(k)}\\times ${puissance}`;
}

/** Somme écrite en extension : trois premiers termes, points de suspension, dernier terme. */
function extensionLatex(termes: number[], dernier: number): string {
  const morceaux = termes.map((x, i) => (i === 0 ? nb(x) : x < 0 ? `-${nb(-x)}` : `+${nb(x)}`));
  return `${morceaux.join("")}+\\ldots${dernier < 0 ? `-${nb(-dernier)}` : `+${nb(dernier)}`}`;
}

/** Les premiers termes de la somme : trois, ou quatre quand les signes alternent (q < 0), pour que
 * l'alternance se lise avant les points de suspension. */
function premiersTermes(e: ExerciceSommesTermes): number[] {
  const d = donneesSomme(e);
  if (e.variante === "geom-extension" || e.variante === "geom-indices") return (e.q.num < 0 ? [0, 1, 2, 3] : [0, 1, 2]).map((i) => termeGeom(d.premier, e.q, i + 1));
  const r = e.r;
  return [0, 1, 2].map((i) => d.premier + i * r);
}

/** Expression de la somme : « S = u₅ + u₆ + … + u₂₀ » ou « S = 7 + 11 + 15 + … + 203 ». */
export function sommeLatex(e: ExerciceSommesTermes): string {
  if (e.variante === "arith-indices" || e.variante === "geom-indices") return `S=${u(e.p)}+${u(e.p + 1)}+\\ldots+${u(e.n)}`;
  const d = donneesSomme(e);
  return `S=${extensionLatex(premiersTermes(e), d.dernier)}`;
}

/** Terme général des impairs/pairs : uₙ = premier + (n − 1)·2. */
function formuleNaturels(e: ExerciceArithExtension, v = "n"): string {
  return affineLatex(e.r, e.premier - e.r, v);
}

/** Formule de la suite (variantes « indices »). */
export function formuleDonneeLatex(e: ExerciceSommesTermes): string {
  if (e.variante === "arith-indices") {
    const { a, b } = coefficientsFormuleArith(e);
    return `u_n=${affineLatex(a, b)}`;
  }
  if (e.variante === "geom-indices") return `u_n=${formuleGeomLatex(coefficientFormuleGeom(e), e.q, e.exposant === "n" ? "n" : "n-1")}`;
  return "";
}

// ============================================================================
// Consigne générale et écrans.
// ============================================================================

export function consigneGenerale(e: ExerciceSommesTermes): FragmentConsigne[] {
  const d = donneesSomme(e);
  switch (e.variante) {
    case "arith-indices":
    case "geom-indices": {
      const nature = e.variante === "arith-indices" ? "arithmétique" : "géométrique";
      const donnees: FragmentConsigne[] =
        e.donnee === "formule"
          ? [t(`La suite ${nature} `), l("(u_n)"), t(" est définie par "), l(formuleDonneeLatex(e)), t(".")]
          : [
              t(`Une suite ${nature} `),
              l("(u_n)"),
              t(" a pour premier terme "),
              l(`u_1=${nb(e.u1)}`),
              t(" et pour raison "),
              l(e.variante === "arith-indices" ? `r=${nb(e.r)}` : `q=${qLatex(e.q)}`),
              t("."),
            ];
      return [...donnees, t(" On considère la somme "), l(sommeLatex(e)), t(".")];
    }
    case "arith-extension":
      if (e.sousCas === "naturels") return [t(`On considère la somme des nombres ${e.parite} de ${nbTexte(d.premier)} à ${nbTexte(d.dernier)} : `), l(sommeLatex(e)), t(".")];
      if (e.sousCas === "multiples" && e.bornes) return [t("On considère la somme "), l("S"), t(` de tous les multiples de ${e.r} compris entre ${nbTexte(e.bornes[0])} et ${nbTexte(e.bornes[1])}.`)];
      return [t("On considère la somme "), l(sommeLatex(e)), t(", dont les termes sont des termes consécutifs d'une suite arithmétique.")];
    case "geom-extension":
      return [t("On considère la somme "), l(sommeLatex(e)), t(", dont les termes sont des termes consécutifs d'une suite géométrique.")];
  }
}

export function libellePhase(phase: PhaseSommesTermes): string {
  switch (phase) {
    case "nombreTermes":
      return "Nombre de termes";
    case "termesExtremes":
      return "Premier et dernier terme";
    case "premierTerme":
      return "Premier terme de la somme";
    case "raison":
      return "Raison";
    case "formuleGenerale":
      return "Terme général";
    case "bornesMultiples":
      return "Premier et dernier multiple";
    case "somme":
      return "Somme";
  }
}

function estGeom(e: ExerciceSommesTermes): boolean {
  return e.variante === "geom-indices" || e.variante === "geom-extension";
}

export function consigneEcran(e: ExerciceSommesTermes, phase: PhaseSommesTermes): FragmentConsigne[] {
  switch (phase) {
    case "nombreTermes":
      return [t("Combien de termes la somme "), l("S"), t(" compte-t-elle ? Note "), l("N"), t(" ce nombre.")];
    case "termesExtremes":
      if (e.variante !== "arith-indices") return [];
      return [t("Calcule le premier et le dernier terme de la somme : "), l(u(e.p)), t(" et "), l(u(e.n)), t(".")];
    case "premierTerme":
      if (e.variante !== "geom-indices") return [];
      return [t("Calcule le premier terme de la somme, "), l(u(e.p)), t(".")];
    case "raison":
      return estGeom(e)
        ? [t("Quelle est la raison "), l("q"), t(" de cette suite géométrique ?")]
        : [t("Quelle est la raison "), l("r"), t(" de cette suite arithmétique ?")];
    case "formuleGenerale":
      if (e.variante !== "arith-extension") return [];
      return [
        t("Les termes de "),
        l("S"),
        t(" forment une suite arithmétique "),
        l("(u_n)"),
        t(" de premier terme "),
        l(`u_1=${nb(e.premier)}`),
        t(". Donne son terme général "),
        l("u_n"),
        t(" en fonction de "),
        l("n"),
        t("."),
      ];
    case "bornesMultiples":
      if (e.variante !== "arith-extension" || !e.bornes) return [];
      return [t(`Quels sont le plus petit et le plus grand multiple de ${e.r} compris entre ${nbTexte(e.bornes[0])} et ${nbTexte(e.bornes[1])} ?`)];
    case "somme":
      return [t("Calcule la somme "), l("S"), t(".")];
  }
}

export function champsEcran(e: ExerciceSommesTermes, phase: PhaseSommesTermes): ChampDef[] {
  switch (phase) {
    case "nombreTermes":
      return [{ label: "Nombre de termes N", labelLatex: "N=", placeholder: "nombre de termes" }];
    case "termesExtremes":
      return e.variante === "arith-indices"
        ? [
            { label: `u${e.p}`, labelLatex: `${u(e.p)}=`, placeholder: "premier terme" },
            { label: `u${e.n}`, labelLatex: `${u(e.n)}=`, placeholder: "dernier terme" },
          ]
        : [];
    case "premierTerme":
      return e.variante === "geom-indices" ? [{ label: `u${e.p}`, labelLatex: `${u(e.p)}=`, placeholder: "premier terme de la somme" }] : [];
    case "raison":
      return estGeom(e) ? [{ label: "q", labelLatex: "q=", placeholder: "ex. 3 ou 1/3" }] : [{ label: "r", labelLatex: "r=", placeholder: "raison" }];
    case "formuleGenerale":
      return [{ label: "un", labelLatex: "u_n=", placeholder: "expression en n" }];
    case "bornesMultiples":
      return [
        { label: "Plus petit multiple", placeholder: "premier terme" },
        { label: "Plus grand multiple", placeholder: "dernier terme" },
      ];
    case "somme":
      return [{ label: "S", labelLatex: "S=", placeholder: "valeur exacte" }];
  }
}

// ============================================================================
// Réponses attendues.
// ============================================================================

/** qᴺ⁻¹ = dernier / premier, écrit comme puissance de q. */
function rapportGeomLatex(e: ExerciceSommesTermes): string {
  if (!estGeom(e) || (e.variante !== "geom-extension" && e.variante !== "geom-indices")) return "";
  const d = donneesSomme(e);
  const quotient = d.premier === 1 ? "" : `\\dfrac{${nb(d.dernier)}}{${nb(d.premier)}}=`;
  return `${qPuissance(e.q, "N-1")}=${quotient}${puissanceValeurLatex(e.q, d.nombre - 1)}=${qPuissance(e.q, d.nombre - 1)}`;
}

/** Calcul de N (avec sa justification), en LaTeX. */
export function calculNombreLatex(e: ExerciceSommesTermes): string {
  const d = donneesSomme(e);
  switch (e.variante) {
    case "arith-indices":
    case "geom-indices":
      return `N=${e.n}-${e.p}+1=${d.nombre}`;
    case "arith-extension":
      if (e.sousCas === "naturels") return `${formuleNaturels(e, "N")}=${nb(d.dernier)}\\ \\Rightarrow\\ N=${d.nombre}`;
      if (e.sousCas === "multiples") {
        const [k1, k2] = facteursMultiples(e);
        return `${nb(d.premier)}=${e.r}\\times ${k1},\\ ${nb(d.dernier)}=${e.r}\\times ${k2}\\ \\Rightarrow\\ N=${k2}-${k1}+1=${d.nombre}`;
      }
      return `N-1=\\dfrac{${nb(d.dernier)}-${jeton(d.premier)}}{${nb(e.r)}}=${d.nombre - 1}\\ \\Rightarrow\\ N=${d.nombre}`;
    case "geom-extension":
      return `${rapportGeomLatex(e)}\\ \\Rightarrow\\ N-1=${d.nombre - 1}\\ \\Rightarrow\\ N=${d.nombre}`;
  }
}

/** Calcul de S (formule substituée, étape intermédiaire, résultat), en LaTeX. */
export function calculSommeLatex(e: ExerciceSommesTermes): string {
  const d = donneesSomme(e);
  if (!estGeom(e)) {
    return `S=\\dfrac{${d.nombre}\\times(${nb(d.premier)}+${jeton(d.dernier)})}{2}=\\dfrac{${d.nombre}\\times ${jeton(d.premier + d.dernier)}}{2}=${nb(d.somme)}`;
  }
  if (e.variante !== "geom-indices" && e.variante !== "geom-extension") return "";
  const q = e.q;
  const formule = `S=${jeton(d.premier)}\\times\\dfrac{1-${qPuissance(q, d.nombre)}}{1-${q.den === 1 ? jeton(q.num) : `\\left(${qLatex(q)}\\right)`}}`;
  if (q.den === 1) {
    const num = 1 - q.num ** d.nombre;
    const den = 1 - q.num;
    return `${formule}=${jeton(d.premier)}\\times\\dfrac{${nb(num)}}{${nb(den)}}=${nb(d.somme)}`;
  }
  // q = ±1/2 : 1 − qᴺ = (2ᴺ − (±1)ᴺ)/2ᴺ et 1 − q = (2 ∓ 1)/2.
  const deuxN = q.den ** d.nombre;
  const numPuissance = deuxN - q.num ** d.nombre;
  const numQ = q.den - q.num;
  const inverse = numQ === 1 ? `${q.den}` : `\\dfrac{${q.den}}{${numQ}}`;
  return `${formule}=${jeton(d.premier)}\\times\\dfrac{${nb(numPuissance)}}{${nb(deuxN)}}\\times ${inverse}=${nb(d.somme)}`;
}

/** Réponse d'un écran (bloc de validation, conclusion du corrigé) : calcul et résultat. */
export function reponseFragments(e: ExerciceSommesTermes, phase: PhaseSommesTermes): FragmentConsigne[] {
  const d = donneesSomme(e);
  switch (phase) {
    case "nombreTermes":
      return [l(calculNombreLatex(e))];
    case "termesExtremes": {
      if (e.variante !== "arith-indices") return [];
      const [gauche, droite] = (aideNiveau2(e, phase).latex ?? "").split("\\qquad ");
      return [l(`${gauche}=${nb(d.premier)}\\qquad ${droite}=${nb(d.dernier)}`)];
    }
    case "premierTerme":
      return e.variante === "geom-indices" ? [l(`${aideNiveau2(e, phase).latex ?? ""}=${nb(d.premier)}`)] : [];
    case "raison":
      if (e.variante === "geom-extension") return [l(`q=\\dfrac{${nb(premiersTermes(e)[1])}}{${nb(d.premier)}}=${qLatex(e.q)}`)];
      if (e.variante === "arith-extension") return [l(`r=${nb(premiersTermes(e)[1])}-${jeton(d.premier)}=${nb(e.r)}`)];
      return [];
    case "formuleGenerale":
      return e.variante === "arith-extension" ? [l(`u_n=${nb(e.premier)}+(n-1)\\times ${e.r}=${formuleNaturels(e)}`)] : [];
    case "bornesMultiples": {
      if (e.variante !== "arith-extension") return [];
      const [k1, k2] = facteursMultiples(e);
      return [l(`${nb(d.premier)}=${e.r}\\times ${k1}\\qquad ${nb(d.dernier)}=${e.r}\\times ${k2}`)];
    }
    case "somme":
      return [l(calculSommeLatex(e))];
  }
}

/** Valeurs confirmées (récapitulatif « Ce qu'on sait déjà », réponse brève). */
export function reponseRecap(e: ExerciceSommesTermes, phase: PhaseSommesTermes): string[] {
  const d = donneesSomme(e);
  switch (phase) {
    case "nombreTermes":
      return [`N=${d.nombre}`];
    case "termesExtremes":
      return e.variante === "arith-indices" ? [`${u(e.p)}=${nb(d.premier)}`, `${u(e.n)}=${nb(d.dernier)}`] : [];
    case "premierTerme":
      return e.variante === "geom-indices" ? [`${u(e.p)}=${nb(d.premier)}`] : [];
    case "raison":
      return [e.variante === "geom-extension" ? `q=${qLatex(e.q)}` : e.variante === "arith-extension" ? `r=${nb(e.r)}` : ""];
    case "formuleGenerale":
      return e.variante === "arith-extension" ? [`u_n=${formuleNaturels(e)}`] : [];
    case "bornesMultiples":
      return [nb(d.premier), nb(d.dernier)];
    case "somme":
      return [`S=${nb(d.somme)}`];
  }
}

// ============================================================================
// Aides (deux niveaux, jamais la réponse finale).
// ============================================================================

function nomsExtremes(e: ExerciceSommesTermes): [string, string] {
  if (e.variante === "arith-indices" || e.variante === "geom-indices") return [u(e.p), u(e.n)];
  return ["u_1", "u_N"];
}

export function aideNiveau1(e: ExerciceSommesTermes, phase: PhaseSommesTermes): AideAvecLatex {
  switch (phase) {
    case "nombreTermes":
      switch (e.variante) {
        case "arith-indices":
        case "geom-indices":
          return { texte: "De uₚ à uₙ, on compte les rangs p, p + 1, …, n — un de plus que l'écart entre les rangs :", latex: "N=n-p+1" };
        case "arith-extension":
          if (e.sousCas === "naturels") return { texte: "Le dernier terme est le terme de rang N : écris que le terme général, pour n = N, vaut ce dernier terme :", latex: `u_N=${nb(donneesSomme(e).dernier)}` };
          if (e.sousCas === "multiples") return { texte: `Écris le premier multiple ${e.r} × k₁ et le dernier ${e.r} × k₂ : il y a autant de termes que d'entiers de k₁ à k₂ :`, latex: "N=k_2-k_1+1" };
          return { texte: "Le dernier terme est le terme de rang N d'une suite arithmétique dont le premier terme est celui de la somme :", latex: "u_N=u_1+(N-1)\\,r" };
        case "geom-extension":
          return { texte: "Le dernier terme est le terme de rang N d'une suite géométrique dont le premier terme est celui de la somme :", latex: "u_N=u_1\\times q^{N-1}" };
      }
      return { texte: "" };
    case "termesExtremes":
      if (e.variante !== "arith-indices") return { texte: "" };
      return e.donnee === "u1r"
        ? { texte: "Formule générale d'une suite arithmétique :", latex: "u_n=u_1+(n-1)\\,r" }
        : { texte: "Remplace n par le rang voulu dans la formule de la suite :", latex: formuleDonneeLatex(e) };
    case "premierTerme":
      if (e.variante !== "geom-indices") return { texte: "" };
      return e.donnee === "u1q"
        ? { texte: "Formule générale d'une suite géométrique :", latex: "u_n=u_1\\times q^{n-1}" }
        : { texte: "Remplace n par le rang du premier terme de la somme dans la formule de la suite :", latex: formuleDonneeLatex(e) };
    case "raison":
      return estGeom(e)
        ? { texte: "La raison est le quotient d'un terme par le terme précédent :", latex: "q=\\dfrac{u_2}{u_1}" }
        : { texte: "La raison est la différence entre un terme et le terme précédent :", latex: "r=u_2-u_1" };
    case "formuleGenerale":
      return { texte: "Formule générale d'une suite arithmétique :", latex: "u_n=u_1+(n-1)\\,r" };
    case "bornesMultiples": {
      if (e.variante !== "arith-extension" || !e.bornes) return { texte: "" };
      const [A, B] = e.bornes;
      const quotient = (x: number) => `\\dfrac{${nb(x)}}{${e.r}}${Number.isInteger((x / e.r) * 100) ? "=" : "\\approx "}${nb(x / e.r)}`;
      return { texte: `Divise chaque borne par ${e.r} : le premier multiple vient de l'entier qui suit le premier quotient, le dernier de l'entier qui précède le second :`, latex: `${quotient(A)}\\qquad ${quotient(B)}` };
    }
    case "somme": {
      const [a, b] = nomsExtremes(e);
      return estGeom(e)
        ? { texte: "Somme de N termes consécutifs d'une suite géométrique — devant la fraction, le PREMIER terme de la somme :", latex: `S=${a}\\times\\dfrac{1-q^{N}}{1-q}` }
        : { texte: "Somme de N termes consécutifs d'une suite arithmétique — N fois la moyenne du premier et du dernier terme :", latex: `S=\\dfrac{N\\,(${a}+${b})}{2}` };
    }
  }
}

export function aideNiveau2(e: ExerciceSommesTermes, phase: PhaseSommesTermes): AideAvecLatex {
  const d = donneesSomme(e);
  switch (phase) {
    case "nombreTermes":
      switch (e.variante) {
        case "arith-indices":
        case "geom-indices":
          return { texte: `Ici, la somme va du rang ${e.p} au rang ${e.n} :`, latex: `N=${e.n}-${e.p}+1` };
        case "arith-extension":
          if (e.sousCas === "naturels") return { texte: "Avec le terme général trouvé à l'étape précédente, résous :", latex: `${formuleNaturels(e, "N")}=${nb(d.dernier)}` };
          if (e.sousCas === "multiples") {
            const [k1, k2] = facteursMultiples(e);
            return { texte: "Ici :", latex: `${nb(d.premier)}=${e.r}\\times ${k1}\\qquad ${nb(d.dernier)}=${e.r}\\times ${k2}` };
          }
          return { texte: "Avec les valeurs de la somme, isole N − 1 :", latex: `N-1=\\dfrac{${nb(d.dernier)}-${jeton(d.premier)}}{${nb(e.r)}}` };
        case "geom-extension":
          return { texte: "Avec les valeurs de la somme, divise par le premier terme et reconnais une puissance de q :", latex: `${qPuissance(e.q, "N-1")}=${d.premier === 1 ? nb(d.dernier) : `\\dfrac{${nb(d.dernier)}}{${nb(d.premier)}}`}` };
      }
      return { texte: "" };
    case "termesExtremes": {
      if (e.variante !== "arith-indices") return { texte: "" };
      if (e.donnee === "u1r") {
        return { texte: "Pour les deux rangs de la somme :", latex: `${u(e.p)}=${nb(e.u1)}+(${e.p}-1)\\times ${jeton(e.r)}\\qquad ${u(e.n)}=${nb(e.u1)}+(${e.n}-1)\\times ${jeton(e.r)}` };
      }
      const { a, b } = coefficientsFormuleArith(e);
      return { texte: "Pour les deux rangs de la somme :", latex: `${u(e.p)}=${affineSubstitueLatex(a, b, e.p)}\\qquad ${u(e.n)}=${affineSubstitueLatex(a, b, e.n)}` };
    }
    case "premierTerme": {
      if (e.variante !== "geom-indices") return { texte: "" };
      if (e.donnee === "u1q") return { texte: "Pour le premier rang de la somme :", latex: `${u(e.p)}=${jeton(e.u1)}\\times ${qPuissance(e.q, e.p - 1)}` };
      const k = coefficientFormuleGeom(e);
      return { texte: "Pour le premier rang de la somme :", latex: `${u(e.p)}=${jeton(k)}\\times ${qPuissance(e.q, e.exposant === "n" ? e.p : e.p - 1)}` };
    }
    case "raison": {
      const [t1, t2] = premiersTermes(e);
      return estGeom(e) ? { texte: "Avec les deux premiers termes de la somme :", latex: `q=\\dfrac{${nb(t2)}}{${nb(t1)}}` } : { texte: "Avec les deux premiers termes de la somme :", latex: `r=${nb(t2)}-${jeton(t1)}` };
    }
    case "formuleGenerale":
      return e.variante === "arith-extension" ? { texte: "Ici, le premier terme et la raison valent :", latex: `u_1=${nb(e.premier)}\\qquad r=${e.r}` } : { texte: "" };
    case "bornesMultiples": {
      if (e.variante !== "arith-extension") return { texte: "" };
      const [k1, k2] = facteursMultiples(e);
      return { texte: `Le premier multiple est donc ${e.r} × k₁ et le dernier ${e.r} × k₂, avec :`, latex: `k_1=${k1}\\qquad k_2=${k2}` };
    }
    case "somme": {
      if (!estGeom(e)) return { texte: "Avec les valeurs trouvées :", latex: `S=\\dfrac{${d.nombre}\\times(${nb(d.premier)}+${jeton(d.dernier)})}{2}` };
      if (e.variante !== "geom-indices" && e.variante !== "geom-extension") return { texte: "" };
      const q = e.q;
      return {
        texte: "Avec les valeurs trouvées :",
        latex: `S=${jeton(d.premier)}\\times\\dfrac{1-${qPuissance(q, d.nombre)}}{1-${q.den === 1 ? jeton(q.num) : `\\left(${qLatex(q)}\\right)`}}`,
      };
    }
  }
}

/** Terme de rang k de la suite d'une variante « indices » (corrigé). */
export function termeIndices(e: ExerciceSommesTermes, k: number): number {
  if (e.variante === "arith-indices") return termeArith(e.u1, e.r, k);
  if (e.variante === "geom-indices") return termeGeom(e.u1, e.q, k);
  return Number.NaN;
}
