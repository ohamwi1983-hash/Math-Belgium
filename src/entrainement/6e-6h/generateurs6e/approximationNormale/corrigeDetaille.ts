import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAN } from "../../core6e/approximationNormale";
import { bornesCorrigees, mu, pDe, probaExacte, probaSansCorrection, probaTable, sigma, sigma2, zArrondis } from "../../core6e/approximationNormale";
import { phiTable } from "../../core6e/tablePhi";
import { evenementL, evenementYL, pL, reponse } from "../../ui6e/formatApproximationNormale";
import { clocheSvg, nombreSvg } from "../../ui6e/figureCloche";
import { nL, p4L, phiL, zL } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen118`, partagé par l'appli et le papier — une lettre par
 * écran. Approximable : a) conditions ; b) μ et σ ; c) correction de continuité (la barre de la valeur
 * k = l'intervalle [k − 0,5 ; k + 0,5]) ; d) standardisation ; e) Φ lue dans la table, cloche de l'aire,
 * et en vérification les TROIS valeurs (exacte, sans correction, avec correction — audit C4). Non
 * approximable : a) conditions ; b) la condition en défaut ; c) la loi binomiale exacte.
 */

type E = ExerciceAN;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function lignesConditions(e: E): LigneCalcul[] {
  return [
    ligne(`n=${e.n}${e.n > 30 ? ">" : "\\le "}30`, e.n > 30 ? "condition remplie" : "condition non remplie (inégalité stricte)"),
    ligne(`p=${pL(e)}`, e.pc > 30 && e.pc < 70 ? "strictement entre 0,3 et 0,7 : remplie" : "pas strictement entre 0,3 et 0,7 : non remplie"),
  ];
}

function lignesExactes(e: E): LigneCalcul[] {
  const q = nL(1 - pDe(e));
  const terme = `C_{${e.n}}^{i}\\,(${pL(e)})^{i}\\,(${q})^{${e.n}-i}`;
  const v = p4L(Math.round(probaExacte(e) * 1e4) / 1e4);
  switch (e.variante) {
    case "exactement":
      return [ligne(`P(X=${e.k})=C_{${e.n}}^{${e.k}}\\,(${pL(e)})^{${e.k}}\\,(${q})^{${e.n - e.k}}`, "formule de la loi binomiale"), ligne(`\\approx ${v}`, "calculatrice")];
    case "auPlus":
      return [ligne(`P(X\\le ${e.k})=\\sum_{i=0}^{${e.k}}${terme}`, "somme des termes"), ligne(`\\approx ${v}`, "loi binomiale cumulée")];
    case "moinsDe":
      return [ligne(`P(X<${e.k})=P(X\\le ${e.k - 1})`, `X entier : on exclut ${e.k}`), ligne(`\\approx ${v}`, "loi binomiale cumulée")];
    case "auMoins":
      return [ligne(`P(X\\ge ${e.k})=1-P(X\\le ${e.k - 1})`, "événement contraire"), ligne(`\\approx ${v}`, "loi binomiale cumulée")];
    case "entre":
      return [ligne(`P(${e.k}\\le X\\le ${e.k2})=P(X\\le ${e.k2})-P(X\\le ${e.k - 1})`, "différence de deux cumuls"), ligne(`\\approx ${v}`, "loi binomiale cumulée")];
  }
}

function lignesBornes(e: E): LigneCalcul[] {
  const b = bornesCorrigees(e);
  switch (e.variante) {
    case "auPlus":
      return [ligne(`P(X\\le ${e.k})\\approx P(Y\\le ${e.k}+0{,}5)`, `la barre de ${e.k} est comprise`), ligne(`=P(Y\\le ${nL(b[0]!)})`)];
    case "moinsDe":
      return [ligne(`P(X<${e.k})=P(X\\le ${e.k - 1})`, "X entier"), ligne(`\\approx P(Y\\le ${e.k - 1}+0{,}5)`, `la barre de ${e.k - 1} est comprise`), ligne(`=P(Y\\le ${nL(b[0]!)})`)];
    case "auMoins":
      return [ligne(`P(X\\ge ${e.k})\\approx P(Y\\ge ${e.k}-0{,}5)`, `la barre de ${e.k} est comprise`), ligne(`=P(Y\\ge ${nL(b[0]!)})`)];
    case "exactement":
      return [ligne(`P(X=${e.k})\\approx P(${e.k}-0{,}5\\le Y\\le ${e.k}+0{,}5)`, `toute la barre de ${e.k}`), ligne(`=${evenementYL(e)}`)];
    case "entre":
      return [ligne(`${evenementL(e)}\\approx P(${e.k}-0{,}5\\le Y\\le ${e.k2}+0{,}5)`, "les deux barres extrêmes comprises"), ligne(`=${evenementYL(e)}`)];
  }
}

function clocheAN(e: E): string {
  const z = zArrondis(e);
  const zones = e.variante === "auMoins" ? [{ de: z[0]!, a: Infinity }] : z.length === 2 ? [{ de: z[0]!, a: z[1]! }] : [{ de: -Infinity, a: z[0]! }];
  return clocheSvg({ zones, reperes: [{ z: 0, etiquette: "0" }, ...z.map((x) => ({ z: x, etiquette: nombreSvg(x), trait: true }))].filter((_r, i, a) => i === 0 ? !a.slice(1).some((s) => Math.abs(s.z) < 0.3) : true), largeur: 300, titre: "Courbe de Gauss de Z, aire de la probabilité estimée" });
}

export function correctionDetailleeAN(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [
    utilise("a", [t("Conditions du cours (point 7, une convention) pour approcher "), f("\\mathcal{B}(n\\,;p)"), t(" par une loi normale : "), f("n>30"), t(" et "), f("0{,}3<p<0{,}7"), t(", inégalités strictes.")]),
    calcul("a", lignesConditions(e)),
    resultat("a", fr(reponse(e, "verdict"))),
  ];
  if (!e.approximable) {
    etapes.push(
      utilise("b", [t("Les deux conditions doivent être remplies en même temps.")]),
      { label: "Raisonnement", sousQuestion: "b", fragments: e.echec === "n" ? [t("Une seule condition suffit à empêcher l'approximation : ici "), f(`n=${e.n}`), t(" n'est pas strictement supérieur à 30.")] : [t("Une seule condition suffit à empêcher l'approximation : ici "), f(`p=${pL(e)}`), t(" n'est pas dans "), f("]0{,}3\\,;0{,}7["), t(".")] },
      resultat("b", fr(reponse(e, "condition"))),
      utilise("c", [t("On calcule alors avec la loi binomiale elle-même (cours, point 2) : "), f("P(X=i)=C_n^i\\,p^i(1-p)^{n-i}"), t(".")]),
      calcul("c", lignesExactes(e)),
      resultat("c", fr(reponse(e, "exacte"))),
      verification("c", [t("C'est bien une probabilité :")], [ligne(`0\\le ${p4L(Math.round(probaExacte(e) * 1e4) / 1e4)}\\le 1`)]),
      piege("c", [t("Approcher quand même par une loi normale : les conditions du cours sont des inégalités strictes ("), f("n=30"), t(", "), f("p=0{,}3"), t(" ou "), f("p=0{,}7"), t(" ne conviennent pas).")]),
    );
    return etapes;
  }
  const s = sigma(e);
  const z = zArrondis(e);
  const b = bornesCorrigees(e);
  const sR = Math.round(s * 100) / 100;
  const sExactL = Math.abs(s * 100 - Math.round(s * 100)) < 1e-9 ? nL(s) : `\\sqrt{${nL(sigma2(e))}}`;
  const lignesZ: LigneCalcul[] = b.flatMap((x, i) => {
    const nom = b.length === 2 ? `z_${i + 1}` : "z";
    return [ligne(`${nom}=\\dfrac{${nL(x)}-${nL(mu(e))}}{${sExactL}}`, "standardisation"), ligne(`\\approx ${zL(z[i]!)}`, "au centième")];
  });
  const phis = z.map((x) => ligne(`${phiL(x)}=${p4L(phiTable(x))}`, x < 0 ? "table et Φ(−z) = 1 − Φ(z)" : "lu dans la table"));
  const P = probaTable(e);
  const ecr = e.variante === "auMoins" ? `1-${p4L(phiTable(z[0]!))}` : z.length === 2 ? `${p4L(phiTable(z[1]!))}-${p4L(phiTable(z[0]!))}` : p4L(phiTable(z[0]!));
  const sansCorr = probaSansCorrection(e);
  etapes.push(
    utilise("b", [t("La loi normale qui approche "), f("\\mathcal{B}(n\\,;p)"), t(" a la même espérance et le même écart-type : "), f("\\mu=np"), t(", "), f("\\sigma=\\sqrt{np(1-p)}"), t(".")]),
    calcul("b", [ligne(`\\mu=${e.n}\\times ${pL(e)}=${nL(mu(e))}`), ligne(`\\sigma=\\sqrt{${e.n}\\times ${pL(e)}\\times ${nL(1 - pDe(e))}}=\\sqrt{${nL(sigma2(e))}}`), ...(Math.abs(s * 100 - Math.round(s * 100)) < 1e-9 ? [ligne(`=${nL(s)}`)] : [ligne(`\\approx ${nL(sR, 2)}`, "au centième")])]),
    resultat("b", fr(reponse(e, "parametres"))),
    utilise("c", [t("Correction de continuité (cours, point 7) : la valeur entière "), f("k"), t(" de "), f("X"), t(" est représentée par l'intervalle "), f("[k-0{,}5\\,;k+0{,}5]"), t(" de "), f("Y"), t(".")]),
    calcul("c", lignesBornes(e)),
    resultat("c", fr(reponse(e, "bornes"))),
    utilise("d", [f("Z=\\dfrac{Y-\\mu}{\\sigma}"), t(" suit "), f("\\mathcal{N}(0\\,;1)"), t(" ; "), f("z"), t(" au centième pour lire la table.")]),
    calcul("d", lignesZ),
    resultat("d", fr(reponse(e, "z"))),
    utilise("e", [t("Table de "), f("\\Phi"), t(" ; "), f("P(Y\\ge b)=1-\\Phi(z)"), t(" ; "), f("\\Phi(-z)=1-\\Phi(z)"), t(".")]),
    { ...calcul("e", [...phis, ligne(`${evenementL(e)}\\approx ${ecr}`, "on remplace"), ligne(`=${p4L(P)}`)]), figureHtml: clocheAN(e) },
    resultat("e", fr(reponse(e, "proba"))),
    verification(
      "e",
      [t("Valeur exacte (loi binomiale) : "), f(`${evenementL(e)}\\approx ${p4L(Math.round(probaExacte(e) * 1e4) / 1e4)}`), ...(e.variante === "exactement" ? [t(" ; sans correction, l'aire sous une seule valeur serait nulle.")] : [t(" ; sans correction, on trouverait "), f(`\\approx ${p4L(Math.round(sansCorr * 1e4) / 1e4)}`), t(" : la correction rapproche de la valeur exacte.")])],
    ),
    piege("e", [t("Oublier la correction de continuité (borne "), f(`${e.k}`), t(" au lieu de "), f(nL(b[0]!)), t(") ou la mettre du mauvais côté.")]),
  );
  return etapes;
}
