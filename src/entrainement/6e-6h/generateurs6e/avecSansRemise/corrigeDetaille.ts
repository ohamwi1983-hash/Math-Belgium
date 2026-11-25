import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceASR } from "../../core6e/avecSansRemise";
import { autreModele, loi, probaEvenement, probaJuste } from "../../core6e/avecSansRemise";
import { evenementL, nomModele, reponse } from "../../ui6e/formatAvecSansRemise";
import { C, decL, entL, fr, frL, frVal } from "../../ui6e/nombresCombinatoireLotH2";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen108`, partagé par l'appli et le papier — une lettre
 * par écran : a) le modèle (avec remise → binomiale ; sans remise → hypergéométrique), justifié par la
 * façon de tirer ; b) les paramètres ; c) la probabilité (formule du cours, complément ou somme de deux
 * cas, valeur exacte puis arrondie), vérifiée ; piège : la valeur qu'aurait donnée l'autre modèle.
 */

type E = ExerciceASR;
const t = texte;
const f = latex;
const fr2 = (x: Frag[]) => x as unknown as FragmentConsigne[];

/** Écriture d'un terme P(X = i) avec ses nombres (« C_{4}^{1}\left(\dfrac{1}{4}\right)^{1}… »). */
function termeL(e: E, i: number): string {
  if (e.modele === "binomiale") {
    const p = frL(fr(e.K, e.N));
    const q = frL(fr(e.N - e.K, e.N));
    return `C_{${e.n}}^{${i}}\\left(${p}\\right)^{${i}}\\left(${q}\\right)^{${e.n - i}}`;
  }
  return `\\dfrac{C_{${e.K}}^{${i}}\\,C_{${e.N - e.K}}^{${e.n - i}}}{C_{${e.N}}^{${e.n}}}`;
}
/** Même terme, combinaisons calculées (« \dfrac{4\cdot 378}{4960} »). */
function termeNombresL(e: E, i: number): string {
  if (e.modele === "binomiale") {
    const p = fr(e.K, e.N);
    return `\\dfrac{${entL(C(e.n, i))}\\cdot ${entL(p.n ** i)}\\cdot ${entL((p.d - p.n) ** (e.n - i))}}{${entL(p.d ** e.n)}}`;
  }
  return `\\dfrac{${entL(C(e.K, i))}\\cdot ${entL(C(e.N - e.K, e.n - i))}}{${entL(C(e.N, e.n))}}`;
}

function lignesTerme(e: E, i: number, prefixe: string): LigneCalcul[] {
  const x = loi(e, e.modele, i);
  return [ligne(`${prefixe}P(X=${i})=${termeL(e, i)}`), ligne(`=${termeNombresL(e, i)}`), ligne(`=${frL(x)}`)];
}

export function correctionDetailleeASR(e: E): EtapeCorrection[] {
  const bin = e.modele === "binomiale";
  const P = probaJuste(e);
  const etapes: EtapeCorrection[] = [
    utilise("a", [t("Tirages avec remise (ou répétés dans les mêmes conditions) : identiques et indépendants, loi binomiale (cours, § 6). Tirages sans remise ou simultanés : la composition change, loi hypergéométrique (cours, § 5).")]),
    {
      label: "Raisonnement",
      sousQuestion: "a",
      fragments: bin
        ? [t("Ici, chaque élément tiré est remis avant le tirage suivant : la probabilité d'un succès reste "), f(frL(fr(e.K, e.N))), t(" à chacun des "), f(`${e.n}`), t(" tirages.")]
        : [t("Ici, les éléments tirés ne sont pas remis : après un succès, il n'en reste que "), f(`${e.K - 1}`), t(" sur "), f(`${e.N - 1}`), t(" ; les tirages ne sont pas indépendants.")],
    },
    resultat("a", fr2(reponse(e, "modele"))),
    utilise("b", bin ? [t("Paramètres d'une loi binomiale : "), f("n"), t(" tirages, probabilité "), f("p"), t(" d'un succès.")] : [t("Paramètres d'une loi hypergéométrique : population "), f("N"), t(", succès "), f("K"), t(", éléments tirés "), f("n"), t(".")]),
    calcul("b", bin ? [ligne(`n=${e.n}`, "nombre de tirages"), ligne(`p=\\dfrac{${e.K}}{${e.N}}`, "succès sur population"), ...(frL(fr(e.K, e.N)) !== `\\dfrac{${e.K}}{${e.N}}` ? [ligne(`=${frL(fr(e.K, e.N))}`, "on simplifie")] : [])] : [ligne(`N=${e.N}`, "population"), ligne(`K=${e.K}`, "succès"), ligne(`n=${e.n}`, "éléments tirés")]),
    resultat("b", fr2(reponse(e, "parametres"))),
  ];
  const formule = bin ? "P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}" : "P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}";
  const v = frVal(P);
  const approx = P.d === 1 ? [] : [ligne(`\\approx ${decL(v)}`, "arrondi au dix-millième")];
  if (e.evenement === "exactement") {
    etapes.push(utilise("c", [t(`Formule de la ${nomModele(e.modele)} : `), f(formule), t(".")]), calcul("c", [...lignesTerme(e, e.j, ""), ...approx]));
  } else if (e.evenement === "auMoinsUn") {
    const p0 = loi(e, e.modele, 0);
    etapes.push(
      utilise("c", [t("« Au moins un » : événement contraire, "), f("P(X\\ge 1)=1-P(X=0)"), t(", avec "), f(formule), t(".")]),
      calcul("c", [...lignesTerme(e, 0, ""), ligne(`P(X\\ge 1)=1-${frL(p0)}`, "contraire"), ligne(`=${frL(P)}`), ...approx]),
    );
  } else {
    const p0 = loi(e, e.modele, 0);
    const p1 = loi(e, e.modele, 1);
    etapes.push(
      utilise("c", [t("« Au plus un » : deux cas disjoints, "), f("P(X\\le 1)=P(X=0)+P(X=1)"), t(", avec "), f(formule), t(".")]),
      calcul("c", [...lignesTerme(e, 0, ""), ...lignesTerme(e, 1, ""), ligne(`P(X\\le 1)=${frL(p0)}+${frL(p1)}`, "deux cas disjoints"), ligne(`=${frL(P)}`), ...approx]),
    );
  }
  etapes.push(resultat("c", fr2(reponse(e, "proba"))));
  etapes.push(verification("c", [t("La valeur est bien une probabilité :")], [ligne(`0\\le ${decL(v)}\\le 1`)]));
  const autre = frVal(probaEvenement(e, autreModele(e.modele)));
  etapes.push(
    piege("c", [
      t(`Prendre l'autre modèle (${nomModele(autreModele(e.modele))}) donnerait `),
      f(`${evenementL(e)}\\approx ${decL(autre)}`),
      t(" : la façon de tirer (avec ou sans remise) change le résultat."),
    ]),
  );
  return etapes;
}
