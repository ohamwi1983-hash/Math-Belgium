import type { AideEcran, DefinitionEcrans, Frag, ModeEcran, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { Fr56 } from "../../commun56/fraction56";
import { addF, fr56, latexF, latexFP, mulF, powF, subF, valF } from "../../commun56/fraction56";
import { choisir, estDecimaleApprochee56, lireNombre56, nbL, proche, statutNombre56 } from "../../commun56/lecture56";
import { adaptateurEcrans56 } from "../../commun56/adaptateurEcrans56";

/**
 * 56gen12, variante AJOUTÉE EN FIN de catalogue « Point fixe et erreur d'arrondi » (5e (6h), étape 6,
 * « Calculatrice… prudence ! » : u₁ = 1/7, uₙ₊₁ = 29uₙ − 4). La suite exacte est constante (u₁ est le
 * point fixe) ; la calculatrice part d'une valeur ARRONDIE de u₁ ; l'écart eₙ = uₙ − L est multiplié par a
 * à chaque pas. Verdict « l'écart explose (|a| > 1, point fixe instable) / l'écart s'éteint (|a| < 1) »
 * tiré à parts égales AVANT les nombres ; jamais dans la `forme` ; niveau et durée constants.
 * Écrans : u₂ exact (champ), facteur de l'écart (champ), écart au rang n (champ, à 1 % près),
 * comportement (choix fermé, une tentative, jugé ✗ / ✓).
 */

export type PhaseInstable = "u2" | "facteur" | "ecart" | "comportement";

export interface ExerciceInstable {
  famille56: "instable";
  a: Fr56;
  b: number;
  L: Fr56;
  dec: number;
  /** u₁ arrondi (valeur entrée dans la calculatrice). */
  u1Arrondi: Fr56;
  n: number;
  instable: boolean;
  ordre: number[];
}

export const CATALOGUE_INSTABLE = [{ id: "instable", label: "Point fixe et erreur d'arrondi : instable si |a| > 1" }];

export function estInstable(x: unknown): x is ExerciceInstable {
  return !!x && (x as ExerciceInstable).famille56 === "instable";
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Facteurs a possibles ; b est tiré parmi de petits entiers et L = b/(1 − a) doit avoir une écriture
 * décimale illimitée (dénominateur avec un facteur premier autre que 2 et 5) : l'arrondi de u₁ est alors
 * forcément inexact. */
const INSTABLES: Fr56[] = [fr56(29), fr56(4), fr56(-2), fr56(10), fr56(7), fr56(8), fr56(-6), fr56(12)];
const STABLES: Fr56[] = [fr56(1, 10), fr56(-1, 2), fr56(1, 4), fr56(-1, 5), fr56(7, 10), fr56(2, 5)];

function decimalLimite(d: number): boolean {
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

export function genererInstable(): ExerciceInstable {
  const instable = Math.random() < 0.5;
  for (let essai = 0; essai < 500; essai++) {
    const a = choisir(instable ? INSTABLES : STABLES);
    const b = choisir([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    // L = b / (1 − a) avec a = n/d : L = b·d / (d − n).
    const L = fr56(b * a.d, a.d - a.n);
    if (decimalLimite(L.d) || Math.abs(valF(L)) > 20) continue;
    const dec = choisir([2, 3, 4]);
    const u1Arrondi = fr56(Math.round(valF(L) * Math.pow(10, dec)), Math.pow(10, dec));
    const n = Math.abs(valF(a)) >= 20 ? 5 : 6;
    return { famille56: "instable", a, b, L, dec, u1Arrondi, n, instable, ordre: melange(4) };
  }
  return { famille56: "instable", a: fr56(29), b: -4, L: fr56(1, 7), dec: 3, u1Arrondi: fr56(143, 1000), n: 5, instable: true, ordre: melange(4) };
}

const t = tx;
const l = lx;
export const ecart1 = (e: ExerciceInstable) => subF(e.u1Arrondi, e.L);
export const ecartN = (e: ExerciceInstable) => mulF(powF(e.a, e.n - 1), ecart1(e));
const u2Exact = (e: ExerciceInstable) => addF(mulF(e.a, e.L), fr56(e.b));

/** Écriture approchée lisible : décimale (3 chiffres significatifs) ou « m · 10ᵏ » si très petite / grande. */
export function approxL(x: number): string {
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 0.001 && ax < 1e6) {
    const k = Math.floor(Math.log10(ax));
    const dec = Math.max(0, 2 - k);
    return nbL(Number(x.toPrecision(3)), dec);
  }
  const k = Math.floor(Math.log10(ax));
  const m = Number((x / Math.pow(10, k)).toPrecision(3));
  return `${nbL(m, 2)}\\cdot 10^{${k}}`;
}
const recurrenceL = (e: ExerciceInstable) => `u_{n+1}=${latexF(e.a)}\\,u_n${e.b < 0 ? "-" : "+"}${Math.abs(e.b)}`;
const dL = (e: ExerciceInstable) => nbL(valF(e.u1Arrondi), e.dec);

function consigneGenerale(e: ExerciceInstable): Frag[] {
  return [
    t("On considère la suite définie par "),
    l(`u_1=${latexF(e.L)}`),
    t(" et "),
    l(recurrenceL(e)),
    t(". Pour calculer ses termes, une calculatrice part de la valeur arrondie "),
    l(dL(e)),
    t(" de "),
    l("u_1"),
    t(" ; on note "),
    l("e_n"),
    t(" l'écart entre le terme calculé et le terme exact au rang n (avec "),
    l(`e_1=${dL(e)}-${latexF(e.L)}`),
    t(")."),
  ];
}
const consignePapier = (e: ExerciceInstable): Frag[] => [
  t("Montre que la suite exacte est constante. Exprime "),
  l("e_{n+1}"),
  t(" en fonction de "),
  l("e_n"),
  t(", calcule "),
  l(`e_{${e.n}}`),
  t(" et explique ce que devient l'écart quand n augmente."),
];

const OPTIONS: Frag[][] = [
  [t("L'écart est multiplié par un nombre de valeur absolue supérieure à 1 : il grandit sans fin, les termes calculés s'éloignent du point fixe.")],
  [t("L'écart est multiplié par un nombre de valeur absolue inférieure à 1 : il tend vers 0, les termes calculés se rapprochent du point fixe.")],
  [t("L'écart reste égal à l'erreur d'arrondi de départ.")],
  [t("L'écart augmente de la même quantité à chaque pas.")],
];
const bonne = (e: ExerciceInstable) => (e.instable ? "o0" : "o1");
const options = (e: ExerciceInstable): OptionEcran[] => e.ordre.map((i) => ({ id: `o${i}`, fragments: OPTIONS[i] }));

function consigne(e: ExerciceInstable, p: PhaseInstable): Frag[] {
  if (p === "u2") return [t("Calcule la valeur exacte de "), l("u_2"), t(".")];
  if (p === "facteur") return [t("Par quel nombre l'écart est-il multiplié à chaque pas ? ("), l("e_{n+1}=k\\cdot e_n"), t(" : donne k.)")];
  if (p === "ecart") return [t("Calcule "), l(`e_1`), t(" puis "), l(`e_{${e.n}}`), t(" ; donne "), l(`e_{${e.n}}`), t(" (valeur approchée à 1 % près, avec son signe).")];
  return [t("Que devient l'écart quand n augmente ?")];
}
function mode(e: ExerciceInstable, p: PhaseInstable): ModeEcran {
  if (p === "comportement") return { type: "choix", options: options(e) };
  if (p === "u2") return { type: "champs", champs: [{ label: "u2", labelLatex: "u_2=", placeholder: "valeur exacte (fraction)" }] };
  if (p === "facteur") return { type: "champs", champs: [{ label: "k", labelLatex: "k=", placeholder: "nombre" }] };
  return { type: "champs", champs: [{ label: `e${e.n}`, labelLatex: `e_{${e.n}}\\approx`, placeholder: "ex. 2930 ou 0,0003" }] };
}
function diagnostiquer(e: ExerciceInstable, p: PhaseInstable, v: string[]): StatutVerification[] {
  if (p === "comportement") return [v[0] === bonne(e) ? "correct" : "not_equivalent"];
  if (p === "u2") return [statutNombre56(v[0], valF(u2Exact(e)))];
  if (p === "facteur") return [statutNombre56(v[0], valF(e.a))];
  const x = valF(ecartN(e));
  const m = Math.abs(x) * 0.01;
  return [statutNombre56(v[0], x, [x - m, x + m])];
}
function approchee(e: ExerciceInstable, p: PhaseInstable, v: string[]): string | null {
  if (p === "u2" && estDecimaleApprochee56(v[0], valF(u2Exact(e)))) return "C'est une valeur approchée : la valeur exacte est demandée (une fraction). Cette saisie ne compte pas comme une tentative.";
  return null;
}
function piegeInstable(e: ExerciceInstable, p: PhaseInstable, v: string[]): Frag[] | null {
  if (p === "comportement") return e.instable ? [t("Ici "), l(`|a|=${latexF(fr56(Math.abs(e.a.n), e.a.d))}>1`), t(" : l'écart est multiplié par plus de 1 en valeur absolue à chaque pas.")] : [t("Ici "), l(`|a|=${latexF(fr56(Math.abs(e.a.n), e.a.d))}<1`), t(" : l'écart est multiplié par moins de 1 en valeur absolue à chaque pas.")];
  const x = lireNombre56(v[0]);
  if (x === null) return null;
  if (p === "facteur" && proche(x, e.b)) return [t("Le terme constant b disparaît dans la différence "), l("u_{n+1}-L=(au_n+b)-(aL+b)"), t(".")];
  if (p === "ecart") {
    const exact = valF(ecartN(e));
    if (proche(x, -exact, 0.01)) return [t("Attention au signe : "), l("e_1=u_1^{\\ast}-u_1"), t(" puis on multiplie par "), l(latexF(e.a)), t(" à chaque pas.")];
    if (proche(x, valF(mulF(powF(e.a, e.n), ecart1(e))), 0.01)) return [t("De "), l("e_1"), t(" à "), l(`e_{${e.n}}`), t(" il y a "), l(`${e.n - 1}`), t(" pas, donc "), l(`e_{${e.n}}=a^{${e.n - 1}}e_1`), t(".")];
  }
  return null;
}
function reponseAttendue(e: ExerciceInstable, p: PhaseInstable): Frag[] {
  if (p === "u2") return [l(`u_2=${latexF(u2Exact(e))}`)];
  if (p === "facteur") return [l(`k=a=${latexF(e.a)}`)];
  if (p === "ecart") return [l(`e_{${e.n}}=${latexFP(e.a)}^{${e.n - 1}}\\cdot ${latexFP(ecart1(e))}\\approx ${approxL(valF(ecartN(e)))}`)];
  return OPTIONS[e.instable ? 0 : 1];
}
function aide1(e: ExerciceInstable, p: PhaseInstable): AideEcran {
  if (p === "u2") return { texte: [t("Remplace "), l("u_1"), t(" dans la relation de récurrence.")], latex: `u_2=${latexFP(e.a)}\\cdot u_1${e.b < 0 ? "-" : "+"}${Math.abs(e.b)}` };
  if (p === "facteur") return { texte: [t("Le point fixe L vérifie "), l("L=aL+b"), t(". Soustrais membre à membre de "), l("u_{n+1}=au_n+b"), t(".")] };
  if (p === "ecart") return { texte: [t("L'écart est multiplié par a à chaque pas : c'est une suite géométrique.")], latex: "e_n=a^{n-1}\\,e_1" };
  return { texte: [t("Compare la valeur absolue du facteur k avec 1.")] };
}
function aide2(e: ExerciceInstable, p: PhaseInstable): AideEcran | null {
  if (p === "u2") return { texte: [t("Calcule "), l(`${latexFP(e.a)}\\cdot ${latexF(e.L)}`), t(" puis ajoute "), l(`${e.b}`), t(".")] };
  if (p === "facteur") return { texte: [t("Tu obtiens "), l("u_{n+1}-L=a(u_n-L)"), t(".")] };
  if (p === "ecart") return { texte: [t("Ici "), l(`e_1=${dL(e)}-${latexF(e.L)}=${latexF(ecart1(e))}`), t(".")], latex: `e_{${e.n}}=${latexFP(e.a)}^{${e.n - 1}}\\cdot ${latexFP(ecart1(e))}` };
  return null;
}
function correction(e: ExerciceInstable): EtapeCorrection[] {
  const aAbs = fr56(Math.abs(e.a.n), e.a.d);
  return [
    calcul("a", [ligne(`u_2=${latexFP(e.a)}\\cdot ${latexF(e.L)}${e.b < 0 ? "-" : "+"}${Math.abs(e.b)}=${latexF(mulF(e.a, e.L))}${e.b < 0 ? "-" : "+"}${Math.abs(e.b)}=${latexF(u2Exact(e))}`)]),
    resultat("a", [l("u_2=u_1"), t(", donc tous les termes valent "), l(latexF(e.L)), t(" : la suite exacte est constante, "), l(`L=${latexF(e.L)}`), t(" est son point fixe.")]),
    utilise("b", [t("Le point fixe vérifie "), l("L=aL+b"), t(".")]),
    calcul("b", [ligne("u_{n+1}-L=(au_n+b)-(aL+b)"), ligne("e_{n+1}=a(u_n-L)=a\\,e_n")]),
    calcul("c", [ligne(`e_1=${dL(e)}-${latexF(e.L)}=${latexF(ecart1(e))}`), ligne(`e_{${e.n}}=a^{${e.n - 1}}e_1=${latexFP(e.a)}^{${e.n - 1}}\\cdot ${latexFP(ecart1(e))}`), ligne(`e_{${e.n}}\\approx ${approxL(valF(ecartN(e)))}`)]),
    resultat(
      "d",
      e.instable
        ? [l(`|a|=${latexF(aAbs)}>1`), t(" : l'écart est une suite géométrique de raison de valeur absolue supérieure à 1, il grandit sans fin. Le point fixe est instable : la calculatrice s'en éloigne alors que la suite exacte est constante.")]
        : [l(`|a|=${latexF(aAbs)}<1`), t(" : l'écart tend vers 0. Le point fixe est stable : l'erreur d'arrondi s'efface.")],
    ),
    piege("d", [t("Faire confiance aux valeurs de la calculatrice : une erreur d'arrondi minuscule peut être multipliée à chaque pas.")]),
  ];
}

export const DEFINITION_INSTABLE: DefinitionEcrans<ExerciceInstable, PhaseInstable> = {
  phases: () => ["u2", "facteur", "ecart", "comportement"],
  estChoix: (_e, p) => p === "comportement",
  mode,
  libelle: (_e, p) => ({ u2: "Valeur exacte de u₂", facteur: "Facteur de l'écart", ecart: "Écart au rang n", comportement: "Comportement de l'écart" })[p],
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege: piegeInstable,
  messageIllisible: () => "Écris un nombre (entier, décimal, fraction comme 1/7 ; puissance de 10 permise). Cette saisie ne compte pas comme une tentative.",
  reponseAttendue,
  recap: (e, p) => reponseAttendue(e, p),
  piegeChoixRevele: true,
  bonneOption: bonne,
  correction,
};

export const adaptateurInstable = adaptateurEcrans56<ExerciceInstable, PhaseInstable>({
  def: DEFINITION_INSTABLE,
  titreDocument: "Point fixe et erreur d'arrondi — Évaluation",
  nomFichierBase: "point-fixe-erreur-arrondi",
  catalogue: CATALOGUE_INSTABLE,
  genererLibre: genererInstable,
  genererVariante: () => genererInstable(),
  consignePapier,
  reponseBreve: (e) => [t("Suite constante ("), l(`u_2=u_1=${latexF(e.L)}`), t(") ; "), l(`e_{n+1}=${latexF(e.a)}\\,e_n`), t(" ; "), l(`e_{${e.n}}\\approx ${approxL(valF(ecartN(e)))}`), t(e.instable ? " ; l'écart grandit sans fin (point fixe instable)." : " ; l'écart tend vers 0 (point fixe stable).")],
  critere: (e, p) =>
    p === "u2"
      ? { points: 0.5, critere: [t("Suite constante : "), l(`u_2=${latexF(e.L)}`)] }
      : p === "facteur"
        ? { points: 1, critere: [t("Relation "), l("e_{n+1}=a\\,e_n"), t(" démontrée")] }
        : p === "ecart"
          ? { points: 1.5, critere: [t("Écart : "), ...reponseAttendue(e, "ecart")] }
          : { points: 1, critere: [t("Conclusion justifiée par "), l("|a|"), t(" comparé à 1")] },
  erreursFrequentes: (e) => [
    { description: [t("Exposant "), l(`${e.n}`), t(" au lieu de "), l(`${e.n - 1}`), t(" dans "), l(`e_{${e.n}}`)], cout: "0,5 pt" },
    { description: [t("Conclusion tirée des seules valeurs de la calculatrice, sans la relation entre les écarts")], cout: "0 pt sur la conclusion" },
  ],
  reponsesAcceptees: () => [[t("Écart donné à 1 % près, en écriture décimale ou scientifique")]],
  criteres: () => ({ methode: 1, piege: 1, nombres: 1, sansCharge: true }),
  profil: () => ({ casParticulier: null, forme: "instable", calcul: "calculatrice" }),
  calculatriceIndispensable: ["instable"],
});
