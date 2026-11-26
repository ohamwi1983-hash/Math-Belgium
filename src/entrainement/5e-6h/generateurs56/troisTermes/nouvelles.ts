import type { AideEcran, DefinitionEcrans, Frag, ModeEcran, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { Fr56 } from "../../commun56/fraction56";
import { fr56, latexF, latexFP, mulF, negF, powF, valF } from "../../commun56/fraction56";
import { choisir, estDecimaleApprochee56, lireListe56, lireNombre56, nbL, nbT, proche, statutListe56, statutNombre56 } from "../../commun56/lecture56";
import { adaptateurEcrans56 } from "../../commun56/adaptateurEcrans56";

/**
 * 56gen5, variantes AJOUTÉES EN FIN de catalogue (5e (6h), étape 8) :
 * - « quatre termes, somme » : quatre nombres en progression arithmétique, somme S et 4ᵉ = k × 1ᵉʳ ;
 * - « quatre termes, produit » : quatre nombres en progression géométrique, produit P et 4ᵉ = k × 1ᵉʳ
 *   (deux suites : u₁ et −u₁, puisque u₁⁴ = …) ;
 * - « triangle rectangle à côtés en suite géométrique » : a, aq, aq² avec q⁴ = q² + 1, donc q² = Φ.
 * Écrans : système (ou équation) à choisir (choix fermé, une tentative, jugé ✗ / ✓), inconnues (champs),
 * puis les nombres demandés. Aucun verdict ; piège constant par variante (niveau et durée constants).
 */

export type Phase56gen5 = "systeme" | "inconnues" | "termes" | "carre" | "cote" | "moyen";

export interface ExerciceQuatreSomme {
  famille56: "quatre-somme";
  S: number;
  k: number;
  u1: number;
  r: number;
  ordre: number[];
}
export interface ExerciceQuatreProduit {
  famille56: "quatre-produit";
  P: Fr56;
  k: Fr56;
  q: Fr56;
  u1: Fr56;
  ordre: number[];
}
export interface ExerciceTriangle {
  famille56: "triangle";
  /** Côté donné : le plus petit (a) ou l'hypoténuse (h), en cm (entier pair). */
  donne: "petit" | "hypotenuse";
  valeur: number;
  ordre: number[];
}
export type ExerciceTermes56 = ExerciceQuatreSomme | ExerciceQuatreProduit | ExerciceTriangle;

export const CATALOGUE_TERMES56 = [
  { id: "quatre-somme", label: "Quatre termes consécutifs (arithmétique) : somme et rapport des extrêmes" },
  { id: "quatre-produit", label: "Quatre termes consécutifs (géométrique) : produit et rapport des extrêmes" },
  { id: "triangle", label: "Triangle rectangle à côtés en suite géométrique (q² = Φ)" },
];

export function estTermes56(x: unknown): x is ExerciceTermes56 {
  const f = !!x && (x as ExerciceTermes56).famille56;
  return f === "quatre-somme" || f === "quatre-produit" || f === "triangle";
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export function genererQuatreSomme(): ExerciceQuatreSomme {
  for (let essai = 0; essai < 200; essai++) {
    const u1 = choisir([1.5, 2, 2.5, 3, 3.5, 4.5, 6]);
    const k = choisir([2, 3, 4, 5, 7]);
    const r = ((k - 1) * u1) / 3;
    if (Math.abs(r * 100 - Math.round(r * 100)) > 1e-9) continue;
    return { famille56: "quatre-somme", S: (2 * k + 2) * u1, k, u1, r, ordre: melange(4) };
  }
  return { famille56: "quatre-somme", S: 35, k: 4, u1: 3.5, r: 3.5, ordre: melange(4) };
}

export function genererQuatreProduit(): ExerciceQuatreProduit {
  const [q, m] = choisir<[Fr56, number[]]>([
    [fr56(2), [1, 2, 3]],
    [fr56(3), [1, 2]],
    [fr56(-2), [1, 2, 3]],
    [fr56(1, 2), [4, 8]],
  ]);
  const u1 = fr56(choisir(m));
  const k = powF(q, 3);
  return { famille56: "quatre-produit", P: mulF(powF(u1, 4), powF(q, 6)), k, q, u1, ordre: melange(4) };
}

export function genererTriangle(): ExerciceTriangle {
  return { famille56: "triangle", donne: Math.random() < 0.5 ? "petit" : "hypotenuse", valeur: choisir([2, 4, 6, 10]), ordre: melange(4) };
}

export function genererTermes56(): ExerciceTermes56 {
  const x = Math.random();
  return x < 1 / 3 ? genererQuatreSomme() : x < 2 / 3 ? genererQuatreProduit() : genererTriangle();
}
export function varianteTermes56(id: string): ExerciceTermes56 {
  return id === "quatre-somme" ? genererQuatreSomme() : id === "quatre-produit" ? genererQuatreProduit() : genererTriangle();
}

const t = tx;
const l = lx;
const PHI = (1 + Math.sqrt(5)) / 2;
const d = (x: number) => nbL(x, 2);

// --- valeurs attendues ---------------------------------------------------------------------------
const termesSomme = (e: ExerciceQuatreSomme) => [0, 1, 2, 3].map((i) => e.u1 + i * e.r);
const termesProduit = (e: ExerciceQuatreProduit, u1 = e.u1) => [0, 1, 2, 3].map((i) => mulF(u1, powF(e.q, i)));
const petit = (e: ExerciceTriangle) => (e.donne === "petit" ? e.valeur : e.valeur / PHI);
const hyp = (e: ExerciceTriangle) => (e.donne === "petit" ? e.valeur * PHI : e.valeur);
const moyen = (e: ExerciceTriangle) => petit(e) * Math.sqrt(PHI);
/** Côté exact demandé à l'écran « cote » : l'hypoténuse a·Φ, ou le petit côté h/Φ = h(√5 − 1)/2. */
const coteExactL = (e: ExerciceTriangle) => (e.donne === "petit" ? `${e.valeur / 2 === 1 ? "" : e.valeur / 2}\\left(1+\\sqrt{5}\\right)` : `${e.valeur / 2 === 1 ? "" : e.valeur / 2}\\left(\\sqrt{5}-1\\right)`);
const coteDemande = (e: ExerciceTriangle) => (e.donne === "petit" ? "l'hypoténuse" : "le plus petit côté");

// --- systèmes proposés ---------------------------------------------------------------------------
function systemes(e: ExerciceTermes56): string[] {
  if (e.famille56 === "quatre-somme")
    return [
      `\\begin{cases} 4u_1+6r=${nbL(e.S, 2)} \\\\ u_1+3r=${e.k}u_1 \\end{cases}`,
      `\\begin{cases} 4u_1+4r=${nbL(e.S, 2)} \\\\ u_1+3r=${e.k}u_1 \\end{cases}`,
      `\\begin{cases} 4u_1+6r=${nbL(e.S, 2)} \\\\ u_1+4r=${e.k}u_1 \\end{cases}`,
      `\\begin{cases} 4u_1+10r=${nbL(e.S, 2)} \\\\ u_1+3r=${e.k}u_1 \\end{cases}`,
    ];
  if (e.famille56 === "quatre-produit")
    return [
      `\\begin{cases} u_1^{4}q^{6}=${latexF(e.P)} \\\\ q^{3}=${latexF(e.k)} \\end{cases}`,
      `\\begin{cases} u_1^{4}q^{4}=${latexF(e.P)} \\\\ q^{3}=${latexF(e.k)} \\end{cases}`,
      `\\begin{cases} u_1^{4}q^{6}=${latexF(e.P)} \\\\ q^{4}=${latexF(e.k)} \\end{cases}`,
      `\\begin{cases} u_1^{4}q^{10}=${latexF(e.P)} \\\\ q^{3}=${latexF(e.k)} \\end{cases}`,
    ];
  return ["q^{4}=q^{2}+1", "q^{2}=q+1", "q^{4}=q+1", "q^{4}+q^{2}=1"];
}
function options(e: ExerciceTermes56): OptionEcran[] {
  const s = systemes(e);
  return e.ordre.map((i) => ({ id: `s${i}`, fragments: [l(s[i])] }));
}

// --- textes --------------------------------------------------------------------------------------
function consigneGenerale(e: ExerciceTermes56): Frag[] {
  if (e.famille56 === "quatre-somme")
    return [t("Quatre nombres sont, dans cet ordre, les termes consécutifs "), l("u_1"), t(", "), l("u_2"), t(", "), l("u_3"), t(", "), l("u_4"), t(" d'une suite arithmétique de raison r. Leur somme vaut "), l(nbL(e.S, 2)), t(` et le quatrième vaut ${e.k} fois le premier.`)];
  if (e.famille56 === "quatre-produit")
    return [t("Quatre nombres sont, dans cet ordre, les termes consécutifs "), l("u_1"), t(", "), l("u_2"), t(", "), l("u_3"), t(", "), l("u_4"), t(" d'une suite géométrique de raison q. Leur produit vaut "), l(latexF(e.P)), t(" et le quatrième vaut "), l(latexF(e.k)), t(" fois le premier.")];
  return [
    t("Les longueurs des trois côtés d'un triangle rectangle forment, dans l'ordre croissant, une suite géométrique "),
    l("a"),
    t(", "),
    l("aq"),
    t(", "),
    l("aq^{2}"),
    t(" de raison "),
    l("q>1"),
    t(e.donne === "petit" ? ". Le plus petit côté mesure " : ". L'hypoténuse mesure "),
    l(`${e.valeur}`),
    t(" cm."),
  ];
}
const consignePapier = (e: ExerciceTermes56): Frag[] =>
  e.famille56 === "quatre-somme"
    ? [t("Détermine ces quatre nombres.")]
    : e.famille56 === "quatre-produit"
      ? [t("Détermine toutes les suites possibles de quatre nombres.")]
      : [t("Détermine la valeur exacte de "), l("q^{2}"), t(`, puis la valeur exacte de ${coteDemande(e)} et la longueur du côté moyen, arrondie au centième.`)];

export function phases56gen5(e: ExerciceTermes56): Phase56gen5[] {
  return e.famille56 === "triangle" ? ["systeme", "carre", "cote", "moyen"] : ["systeme", "inconnues", "termes"];
}

function consigne(e: ExerciceTermes56, p: Phase56gen5): Frag[] {
  if (p === "systeme") return e.famille56 === "triangle" ? [t("Quelle équation, obtenue par le théorème de Pythagore, la raison q vérifie-t-elle ?")] : [t("Quel système traduit l'énoncé ?")];
  if (p === "inconnues")
    return e.famille56 === "quatre-somme" ? [t("Résous le système : donne "), l("u_1"), t(" et r.")] : [t("Résous le système : donne q, puis la ou les valeurs possibles de "), l("u_1"), t(" (sépare-les par un point-virgule).")];
  if (p === "termes") return e.famille56 === "quatre-somme" ? [t("Écris les quatre nombres.")] : [t("Écris les quatre nombres de la suite dont le premier terme est positif.")];
  if (p === "carre") return [t("Donne la valeur exacte de "), l("q^{2}"), t(".")];
  if (p === "cote") return [t(`Donne la valeur exacte de ${coteDemande(e as ExerciceTriangle)} (en cm).`)];
  return [t("Donne la longueur du côté moyen, arrondie au centième (en cm).")];
}

function mode(e: ExerciceTermes56, p: Phase56gen5): ModeEcran {
  if (p === "systeme") return { type: "choix", options: options(e) };
  if (p === "inconnues")
    return e.famille56 === "quatre-somme"
      ? { type: "champs", champs: [{ label: "u1", labelLatex: "u_1=", placeholder: "nombre" }, { label: "r", labelLatex: "r=", placeholder: "nombre" }] }
      : { type: "champs", champs: [{ label: "q", labelLatex: "q=", placeholder: "nombre" }, { label: "u1", labelLatex: "u_1=", placeholder: "ex. : 2 ; −2" }] };
  if (p === "termes") return { type: "champs", champs: [1, 2, 3, 4].map((i) => ({ label: `u${i}`, labelLatex: `u_${i}=`, placeholder: "nombre" })) };
  if (p === "carre") return { type: "champs", champs: [{ label: "q au carré", labelLatex: "q^{2}=", placeholder: "valeur exacte, ex. (1+√5)/2", apercu: true }] };
  if (p === "cote") return { type: "champs", champs: [{ label: coteDemande(e as ExerciceTriangle), labelLatex: (e as ExerciceTriangle).donne === "petit" ? "aq^{2}=" : "a=", placeholder: "valeur exacte", unite: "cm", apercu: true }] };
  return { type: "champs", champs: [{ label: "côté moyen", labelLatex: "aq\\approx", placeholder: "au centième", unite: "cm" }] };
}

function diagnostiquer(e: ExerciceTermes56, p: Phase56gen5, v: string[]): StatutVerification[] {
  if (p === "systeme") return [v[0] === "s0" ? "correct" : "not_equivalent"];
  if (e.famille56 === "quatre-somme") {
    if (p === "inconnues") return [statutNombre56(v[0], e.u1), statutNombre56(v[1], e.r)];
    return termesSomme(e).map((x, i) => statutNombre56(v[i], x));
  }
  if (e.famille56 === "quatre-produit") {
    if (p === "inconnues") return [statutNombre56(v[0], valF(e.q)), statutListe56(v[1], [valF(e.u1), -valF(e.u1)])];
    return termesProduit(e).map((x, i) => statutNombre56(v[i], valF(x)));
  }
  if (p === "carre") return [statutNombre56(v[0], PHI)];
  if (p === "cote") return [statutNombre56(v[0], e.donne === "petit" ? hyp(e) : petit(e))];
  const m = moyen(e);
  return [statutNombre56(v[0], m, [m - 0.0051, m + 0.0051])];
}

function approchee(e: ExerciceTermes56, p: Phase56gen5, v: string[]): string | null {
  if (e.famille56 !== "triangle") return null;
  const cible = p === "carre" ? PHI : p === "cote" ? (e.donne === "petit" ? hyp(e) : petit(e)) : null;
  if (cible !== null && estDecimaleApprochee56(v[0], cible)) return "C'est une valeur approchée : la valeur exacte est demandée (avec √). Cette saisie ne compte pas comme une tentative.";
  return null;
}

function piege56gen5(e: ExerciceTermes56, p: Phase56gen5, v: string[]): Frag[] | null {
  if (p === "systeme") {
    if (v[0] === "s1") return e.famille56 === "triangle" ? [t("Pythagore porte sur les carrés des côtés : "), l("a^{2}+(aq)^{2}=(aq^{2})^{2}"), t(".")] : [t("Additionne vraiment les quatre termes : les écarts au premier terme sont 0, 1, 2 et 3 raisons.")];
    if (v[0] === "s2") return [t("Le quatrième terme est "), l(e.famille56 === "quatre-produit" ? "u_1q^{3}" : "u_1+3r"), t(" : il y a trois raisons entre le premier et le quatrième.")];
    if (v[0] === "s3") return e.famille56 === "triangle" ? [t("L'hypoténuse est le plus grand côté, "), l("aq^{2}"), t(".")] : [t("Les exposants (ou coefficients) s'additionnent : 0 + 1 + 2 + 3 = 6.")];
    return null;
  }
  if (e.famille56 === "quatre-produit" && p === "inconnues") {
    const xs = lireListe56(v[1]);
    if (xs && xs.length === 1 && proche(Math.abs(xs[0]), valF(e.u1))) return [l("u_1^{4}"), t(" est une puissance paire : "), l("u_1"), t(" et son opposé conviennent tous les deux.")];
  }
  if (e.famille56 === "triangle" && p === "carre") {
    const x = lireNombre56(v[0]);
    if (x !== null && proche(x, (1 - Math.sqrt(5)) / 2)) return [t("Cette solution est négative : un carré "), l("q^{2}"), t(" ne peut pas l'être.")];
    if (x !== null && proche(x, Math.sqrt(PHI))) return [t("C'est la valeur de q ; on demande "), l("q^{2}"), t(".")];
  }
  return null;
}

function reponseAttendue(e: ExerciceTermes56, p: Phase56gen5): Frag[] {
  if (p === "systeme") return [l(systemes(e)[0])];
  if (e.famille56 === "quatre-somme") return p === "inconnues" ? [l(`u_1=${nbL(e.u1)}`), t(" et "), l(`r=${nbL(e.r)}`)] : [l(termesSomme(e).map((x) => nbL(x)).join("\\,;\\ "))];
  if (e.famille56 === "quatre-produit")
    return p === "inconnues" ? [l(`q=${latexF(e.q)}`), t(" et "), l(`u_1=${latexF(e.u1)}`), t(" ou "), l(`u_1=${latexF(negF(e.u1))}`)] : [l(termesProduit(e).map(latexF).join("\\,;\\ "))];
  if (p === "carre") return [l("q^{2}=\\dfrac{1+\\sqrt{5}}{2}=\\Phi")];
  if (p === "cote") return [l(`${e.donne === "petit" ? "aq^{2}" : "a"}=${coteExactL(e)}`), t(" cm")];
  return [l(`aq\\approx ${d(moyen(e))}`), t(" cm")];
}

function aide1(e: ExerciceTermes56, p: Phase56gen5): AideEcran {
  if (p === "systeme") return e.famille56 === "triangle" ? { texte: [t("Dans un triangle rectangle, le carré de l'hypoténuse (le plus grand côté) est la somme des carrés des deux autres côtés.")] } : { texte: [t("Exprime les quatre termes à l'aide de "), l("u_1"), t(" et de la raison, puis traduis chaque phrase de l'énoncé.")] };
  if (p === "inconnues") return e.famille56 === "quatre-somme" ? { texte: [t("La deuxième équation donne r en fonction de "), l("u_1"), t(" ; remplace-le dans la première.")] } : { texte: [t("La deuxième équation donne q (racine cubique) ; remplace-le dans la première.")] };
  if (p === "termes") return { texte: [t("Chaque terme s'obtient à partir du précédent avec la raison.")] };
  if (p === "carre") return { texte: [t("Pose "), l("X=q^{2}"), t(" : l'équation devient du second degré en X.")], latex: "X^{2}-X-1=0" };
  if (p === "cote") return { texte: [t("Les côtés sont "), l("a"), t(", "), l("aq"), t(" et "), l("aq^{2}=a\\Phi"), t(".")] };
  return { texte: [t("Le côté moyen vaut "), l("aq=a\\sqrt{\\Phi}"), t(".")] };
}
function aide2(e: ExerciceTermes56, p: Phase56gen5): AideEcran | null {
  if (p === "systeme") return null;
  if (e.famille56 === "quatre-somme") return p === "inconnues" ? { texte: [t("De "), l(`u_1+3r=${e.k}u_1`), t(" on tire :")], latex: `r=\\dfrac{${e.k - 1}u_1}{3}` } : { texte: [l(`u_1=${nbL(e.u1)}`), t(", puis on ajoute "), l(`r=${nbL(e.r)}`), t(" à chaque fois.")] };
  if (e.famille56 === "quatre-produit") return p === "inconnues" ? { texte: [t("De "), l(`q^{3}=${latexF(e.k)}`), t(" on tire q ; puis "), l(`u_1^{4}=\\dfrac{${latexF(e.P)}}{q^{6}}`), t(".")] } : { texte: [t("Pars de "), l(`u_1=${latexF(e.u1)}`), t(" et multiplie par "), l(`q=${latexF(e.q)}`), t(".")] };
  if (p === "carre") return { texte: [t("Discriminant "), l("\\Delta=5"), t(" ; garde la solution positive.")] };
  if (p === "cote") return e.donne === "petit" ? { texte: [t("Ici "), l(`a=${e.valeur}`), t(" :")], latex: `aq^{2}=${e.valeur}\\cdot\\dfrac{1+\\sqrt{5}}{2}` } : { texte: [t("Ici "), l(`aq^{2}=${e.valeur}`), t(", donc "), l(`a=\\dfrac{${e.valeur}}{\\Phi}`), t(" ; rends le dénominateur rationnel.")] };
  return { texte: [t("Avec la calculatrice : "), l(`${d(petit(e))}\\cdot\\sqrt{\\Phi}`), t(` (le petit côté vaut environ ${nbT(petit(e), 3)} cm).`)] };
}

function correction(e: ExerciceTermes56): EtapeCorrection[] {
  if (e.famille56 === "quatre-somme") {
    const ts = termesSomme(e);
    return [
      utilise("a", [t("Termes d'une suite arithmétique : "), l("u_1"), t(", "), l("u_1+r"), t(", "), l("u_1+2r"), t(", "), l("u_1+3r"), t(".")]),
      calcul("a", [ligne(`u_1+(u_1+r)+(u_1+2r)+(u_1+3r)=4u_1+6r=${nbL(e.S, 2)}`), ligne(`u_4=${e.k}u_1 \\iff u_1+3r=${e.k}u_1`)]),
      calcul("b", [ligne(`3r=${e.k - 1}u_1 \\iff r=\\dfrac{${e.k - 1}u_1}{3}`), ligne(`4u_1+6\\cdot\\dfrac{${e.k - 1}u_1}{3}=${4 + 2 * (e.k - 1)}u_1=${nbL(e.S, 2)}`), ligne(`u_1=${nbL(e.u1)}`), ligne(`r=${nbL(e.r)}`)]),
      calcul("c", [ligne(`${ts.map((x) => nbL(x)).join("\\,;\\ ")}`), ligne(`${ts.map((x) => nbL(x)).join("+")}=${nbL(e.S, 2)}`, "vérification de la somme"), ligne(`${nbL(ts[3])}=${e.k}\\cdot ${nbL(ts[0])}`, "vérification du rapport")]),
      resultat("c", [t("Les quatre nombres sont "), l(ts.map((x) => nbL(x)).join("\\,;\\ ")), t(".")]),
      piege("a", [t("Compter quatre raisons dans la somme : les termes s'écartent du premier de 0, 1, 2 et 3 raisons, soit 6r au total.")]),
    ];
  }
  if (e.famille56 === "quatre-produit") {
    const ts = termesProduit(e);
    const ts2 = termesProduit(e, negF(e.u1));
    const u4 = powF(e.u1, 4);
    return [
      utilise("a", [t("Termes d'une suite géométrique : "), l("u_1"), t(", "), l("u_1q"), t(", "), l("u_1q^{2}"), t(", "), l("u_1q^{3}"), t(".")]),
      calcul("a", [ligne(`u_1\\cdot u_1q\\cdot u_1q^{2}\\cdot u_1q^{3}=u_1^{4}q^{6}=${latexF(e.P)}`), ligne(`u_4=${latexFP(e.k)}\\,u_1 \\iff q^{3}=${latexF(e.k)}`)]),
      calcul("b", [ligne(`q=\\sqrt[3]{${latexF(e.k)}}=${latexF(e.q)}`), ligne(`u_1^{4}=\\dfrac{${latexF(e.P)}}{${latexFP(e.q)}^{6}}=${latexF(u4)}`), ligne(`u_1=${latexF(e.u1)}\\ \\text{ou}\\ u_1=${latexF(negF(e.u1))}`, "puissance paire : deux solutions opposées")]),
      calcul("c", [ligne(`${ts.map(latexF).join("\\,;\\ ")}`), ligne(`${ts.map(latexFP).join("\\cdot ")}=${latexF(e.P)}`, "vérification du produit")]),
      resultat("c", [t("Deux suites conviennent : "), l(ts.map(latexF).join("\\,;\\ ")), t(" et "), l(ts2.map(latexF).join("\\,;\\ ")), t(".")]),
      piege("b", [t("Oublier la solution négative de "), l(`u_1^{4}=${latexF(u4)}`), t(" : la suite opposée a le même produit.")]),
    ];
  }
  const a = petit(e);
  return [
    utilise("a", [t("Théorème de Pythagore ; l'hypoténuse est le plus grand côté, "), l("aq^{2}"), t(" (car q > 1).")]),
    calcul("a", [ligne("a^{2}+(aq)^{2}=(aq^{2})^{2}"), ligne("a^{2}+a^{2}q^{2}=a^{2}q^{4}"), ligne("1+q^{2}=q^{4}", "on divise par a² ≠ 0")]),
    calcul("b", [ligne("X^{2}-X-1=0", "avec X = q²"), ligne("\\Delta=1+4=5"), ligne("X=\\dfrac{1+\\sqrt{5}}{2}\\ \\text{ou}\\ X=\\dfrac{1-\\sqrt{5}}{2}<0"), ligne("q^{2}=\\dfrac{1+\\sqrt{5}}{2}=\\Phi", "un carré est positif")]),
    calcul(
      "c",
      e.donne === "petit"
        ? [ligne(`aq^{2}=a\\Phi=${e.valeur}\\cdot\\dfrac{1+\\sqrt{5}}{2}=${coteExactL(e)}`)]
        : [ligne(`a=\\dfrac{${e.valeur}}{\\Phi}=\\dfrac{${2 * e.valeur}}{1+\\sqrt{5}}`), ligne(`a=\\dfrac{${2 * e.valeur}\\left(\\sqrt{5}-1\\right)}{\\left(1+\\sqrt{5}\\right)\\left(\\sqrt{5}-1\\right)}=\\dfrac{${2 * e.valeur}\\left(\\sqrt{5}-1\\right)}{4}=${coteExactL(e)}`)],
    ),
    calcul("d", [ligne(`aq=a\\sqrt{\\Phi}\\approx ${nbL(a, 4)}\\cdot ${nbL(Math.sqrt(PHI), 4)}\\approx ${d(moyen(e))}`)]),
    resultat("d", [l("q^{2}=\\Phi"), t(" ; côtés "), l(`${e.donne === "petit" ? e.valeur : coteExactL(e)}`), t(", "), l(`\\approx ${d(moyen(e))}`), t(" et "), l(`${e.donne === "petit" ? coteExactL(e) : e.valeur}`), t(" (en cm).")]),
    piege("b", [t("Garder la solution négative "), l("\\dfrac{1-\\sqrt{5}}{2}"), t(" : un carré ne peut pas être négatif.")]),
  ];
}

export const DEFINITION_TERMES56: DefinitionEcrans<ExerciceTermes56, Phase56gen5> = {
  phases: phases56gen5,
  estChoix: (_e, p) => p === "systeme",
  mode,
  libelle: (e, p) =>
    ({ systeme: e.famille56 === "triangle" ? "Équation de Pythagore" : "Système", inconnues: "Inconnues", termes: "Les quatre nombres", carre: "Valeur de q²", cote: "Côté exact", moyen: "Côté moyen" })[p],
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege: piege56gen5,
  messageIllisible: () => "Écris un nombre (entier, décimal, fraction comme 7/2, racine comme √5) ; pour deux valeurs, sépare-les par « ; ». Cette saisie ne compte pas comme une tentative.",
  reponseAttendue,
  recap: (e, p) => reponseAttendue(e, p),
  piegeChoixRevele: true,
  bonneOption: () => "s0",
  correction,
};

export const adaptateurTermes56 = adaptateurEcrans56<ExerciceTermes56, Phase56gen5>({
  def: DEFINITION_TERMES56,
  titreDocument: "Termes consécutifs d'une suite — Évaluation",
  nomFichierBase: "termes-consecutifs-suite",
  catalogue: CATALOGUE_TERMES56,
  genererLibre: genererTermes56,
  genererVariante: varianteTermes56,
  consignePapier,
  reponseBreve: (e) =>
    e.famille56 === "quatre-somme"
      ? reponseAttendue(e, "termes")
      : e.famille56 === "quatre-produit"
        ? [l(termesProduit(e).map(latexF).join("\\,;\\ ")), t(" ou "), l(termesProduit(e, negF(e.u1)).map(latexF).join("\\,;\\ "))]
        : [l("q^{2}=\\Phi=\\dfrac{1+\\sqrt{5}}{2}"), t(` ; ${coteDemande(e)} : `), l(coteExactL(e)), t(" cm ; côté moyen "), l(`\\approx ${d(moyen(e))}`), t(" cm")],
  critere: (e, p) => {
    if (p === "systeme") return { points: 1, critere: [t(e.famille56 === "triangle" ? "Pythagore traduit : " : "Système posé : "), l(systemes(e)[0])] };
    if (p === "inconnues") return { points: 1.5, critere: [t("Système résolu : "), ...reponseAttendue(e, "inconnues")] };
    if (p === "termes") return { points: 1.5, critere: [t("Nombres (vérifiés) : "), ...reponseAttendue(e, "termes")] };
    if (p === "carre") return { points: 1, critere: [t("Équation bicarrée résolue, solution négative rejetée : "), l("q^{2}=\\Phi")] };
    if (p === "cote") return { points: 1, critere: [t("Côté exact : "), ...reponseAttendue(e, "cote")] };
    return { points: 1, critere: [t("Côté moyen : "), ...reponseAttendue(e, "moyen")] };
  },
  erreursFrequentes: (e) =>
    e.famille56 === "quatre-somme"
      ? [{ description: [t("Somme écrite "), l("4u_1+4r"), t(" (ou "), l("u_4=u_1+4r"), t(")")], cout: "0 pt sur le système, suite jugée selon la démarche" }]
      : e.famille56 === "quatre-produit"
        ? [{ description: [t("Une seule suite donnée (solution "), l("-u_1"), t(" oubliée)")], cout: "0,5 pt" }]
        : [{ description: [t("Solution négative de l'équation en "), l("q^{2}"), t(" gardée")], cout: "0,5 pt" }, { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "moitié des points de l'étape" }],
  reponsesAcceptees: (e) => (e.famille56 === "triangle" ? [[t("Toute écriture exacte équivalente ; côté moyen à 0,01 près")]] : [[t("Écritures décimales ou fractionnaires équivalentes")]]),
  criteres: (e) => (e.famille56 === "triangle" ? { methode: 1, piege: 1, nombres: 1, sansCharge: true } : { methode: 1, piege: e.famille56 === "quatre-produit" ? 1 : 0, nombres: 0, sansCharge: true }),
  profil: (e) => (e.famille56 === "triangle" ? { casParticulier: null, forme: e.famille56, calcul: "calculatrice" } : { casParticulier: null, forme: e.famille56 }),
  calculatriceIndispensable: ["triangle"],
});
