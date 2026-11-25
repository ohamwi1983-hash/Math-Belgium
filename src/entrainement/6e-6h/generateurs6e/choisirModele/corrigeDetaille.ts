import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCM } from "../../core6e/choisirModele";
import { bornesUniforme, lambda, pBinomiale, probabilite, probaAutreModele, zNormale } from "../../core6e/choisirModele";
import { phiTable } from "../../core6e/tablePhi";
import { evenementL, reponse, valeurProbaL } from "../../ui6e/formatChoisirModele";
import { C, entL, frL, fr } from "../../ui6e/nombresCombinatoireLotH2";
import { nL, p4L, phiL, zL } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen119`, partagé par l'appli et le papier : a) le modèle,
 * justifié par les indices de la situation ; b) les paramètres (λ ajusté par proportionnalité, p du
 * succès compté…) ou, pour « aucune », la raison ; c) la probabilité avec la formule du cours, valeur
 * exacte puis arrondie, vérifiée ; piège : la confusion de modèle la plus probable.
 */

type E = ExerciceCM;
const t = texte;
const f = latex;
const fr2 = (x: unknown) => x as FragmentConsigne[];

function justification(e: E): FragmentConsigne[] {
  const d = e.d;
  switch (e.variante) {
    case "binomiale":
      return [f(`${d.n}`), t(" épreuves identiques et indépendantes, deux issues (succès ou non), "), f("X"), t(" compte les succès : loi binomiale (cours, § 2).")];
    case "hypergeometrique":
      return [t("Tirages sans remise (ou simultanés) dans une population de "), f(`${d.N}`), t(" éléments dont "), f(`${d.K}`), t(" succès : la composition change, loi hypergéométrique (cours, § 1).")];
    case "poisson":
      return [t("Comptage d'événements rares et indépendants sur une durée (ou des pages), connu par une moyenne, sans nombre d'épreuves fixé : loi de Poisson (cours, § 8).")];
    case "normale":
      return [t("Mesure continue répartie en cloche, symétrique autour de sa moyenne : loi normale (cours, § 6).")];
    case "uniforme":
      return [t("Mesure continue dont toutes les valeurs de l'intervalle sont également possibles : loi uniforme continue (cours, § 5).")];
    case "aucune":
      return e.ctx === 1 ? [f("X"), t(" est une somme de deux résultats : ni un nombre de succès, ni un comptage, ni une mesure continue ; ses valeurs ne sont pas également probables.")] : [t("On s'arrête au premier succès : le nombre d'épreuves n'est pas fixé à l'avance, ce n'est pas une loi binomiale (ni aucune autre loi du cours).")];
  }
}

function lignesParametres(e: E): LigneCalcul[] {
  const d = e.d;
  switch (e.variante) {
    case "binomiale":
      return [ligne(`n=${d.n}`, "nombre d'épreuves"), ligne(`p=${frL(pBinomiale(e))}`, "probabilité du succès compté")];
    case "hypergeometrique":
      return [ligne(`N=${d.N}`, "population"), ligne(`K=${d.K}`, "succès"), ligne(`n=${d.n}`, "éléments tirés")];
    case "poisson": {
      const l = lambda(e);
      if (e.ctx === 0) return [ligne(`\\lambda=${d.r}\\times\\dfrac{${d.t}}{60}`, "taux horaire ramené à la durée"), ligne(`=${nL(l)}`)];
      if (e.ctx === 1) return [ligne(`\\lambda=${d.r}\\times\\dfrac{${d.m}}{10}`, "taux pour 10 pages ramené aux pages comptées"), ligne(`=${nL(l)}`)];
      return [ligne(`\\lambda=${d.r}\\times\\dfrac{${d.mois}}{12}`, "taux annuel ramené à la durée"), ligne(`=${nL(l)}`)];
    }
    case "normale":
      return [ligne(`\\mu=${nL(d.mu!)}`, "moyenne"), ligne(`\\sigma=${nL(d.sigma!)}`, "écart-type")];
    case "uniforme": {
      const [a, b] = bornesUniforme(e);
      return [ligne(`a=${a}`, "plus petite valeur"), ligne(`b=${b}`, "plus grande valeur")];
    }
    case "aucune":
      return [];
  }
}

function lignesProba(e: E): { utilise: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const d = e.d;
  const P = probabilite(e);
  const fin = valeurProbaL(e);
  const finLigne = (s: string) => (s.startsWith("\\approx") ? ligne(s, "arrondi au dix-millième") : ligne(`=${s}`));
  switch (e.variante) {
    case "binomiale": {
      const p = frL(pBinomiale(e));
      const q = frL(fr(pBinomiale(e).d - pBinomiale(e).n, pBinomiale(e).d));
      if (d.q === 1) return { utilise: [t("« Au moins un » : contraire de « aucun », "), f("P(X\\ge 1)=1-P(X=0)"), t(".")], lignes: [ligne(`P(X\\ge 1)=1-\\left(${q}\\right)^{${d.n}}`, "aucun succès"), finLigne(fin)] };
      return { utilise: [t("Loi binomiale : "), f("P(X=k)=C_n^k\\,p^k(1-p)^{n-k}"), t(".")], lignes: [ligne(`P(X=${d.k})=C_{${d.n}}^{${d.k}}\\left(${p}\\right)^{${d.k}}\\left(${q}\\right)^{${d.n! - d.k!}}`), ...(pBinomiale(e).d ** d.n! <= 1e6 ? [ligne(`=${entL(C(d.n!, d.k!))}\\cdot ${frL(fr(pBinomiale(e).n ** d.k! * (pBinomiale(e).d - pBinomiale(e).n) ** (d.n! - d.k!), pBinomiale(e).d ** d.n!))}`)] : []), finLigne(fin)] };
    }
    case "hypergeometrique":
      return {
        utilise: [t("Loi hypergéométrique : "), f("P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}"), t(".")],
        lignes: [ligne(`P(X=${d.k})=\\dfrac{C_{${d.K}}^{${d.k}}\\,C_{${d.N! - d.K!}}^{${d.n! - d.k!}}}{C_{${d.N}}^{${d.n}}}`), ligne(`=\\dfrac{${entL(C(d.K!, d.k!))}\\cdot ${entL(C(d.N! - d.K!, d.n! - d.k!))}}{${entL(C(d.N!, d.n!))}}`), finLigne(fin)],
      };
    case "poisson": {
      const l = nL(lambda(e));
      if (d.q === 1) return { utilise: [t("Loi de Poisson : "), f("P(X=k)=e^{-\\lambda}\\dfrac{\\lambda^k}{k!}"), t(" ; « au plus 1 » = deux cas.")], lignes: [ligne(`P(X\\le 1)=e^{-${l}}+e^{-${l}}\\cdot ${l}`, "k = 0 et k = 1"), ligne(`=e^{-${l}}(1+${l})`), finLigne(fin)] };
      return { utilise: [t("Loi de Poisson : "), f("P(X=k)=e^{-\\lambda}\\dfrac{\\lambda^k}{k!}"), t(".")], lignes: [ligne(`P(X=${d.k})=e^{-${l}}\\cdot\\dfrac{${l}^{${d.k}}}{${d.k}!}`), finLigne(fin)] };
    }
    case "normale": {
      const z = zNormale(e);
      const x0 = d.mu! + (d.zc! * d.sigma!) / 100;
      return {
        utilise: [t("Standardisation et table de "), f("\\Phi"), t(" (cours, § 6) ; "), f("\\Phi(-z)=1-\\Phi(z)"), t(".")],
        lignes: [
          ligne(`z=\\dfrac{${nL(x0)}-${nL(d.mu!)}}{${nL(d.sigma!)}}=${zL(z)}`, "standardisation"),
          ligne(`${phiL(z)}=${p4L(phiTable(z))}`, "table"),
          ...(d.q === 1 ? [ligne(`${evenementL(e)}=1-${p4L(phiTable(z))}`, "aire à droite")] : []),
          ligne(`${evenementL(e)}\\approx ${p4L(P.table!)}`),
        ],
      };
    }
    case "uniforme": {
      const [a, b] = bornesUniforme(e);
      const [c, dd] = d.q === 0 ? [d.c!, d.d!] : d.q === 1 ? [d.c!, b] : [a, d.c!];
      return { utilise: [t("Loi uniforme : seule la longueur compte, "), f("P(c\\le X\\le d)=\\dfrac{d-c}{b-a}"), t(".")], lignes: [ligne(`${evenementL(e)}=\\dfrac{${dd}-${c}}{${b}-${a}}`), ligne(`=\\dfrac{${dd - c}}{${b - a}}`), finLigne(fin)] };
    }
    case "aucune": {
      if (e.ctx === 0) return { utilise: [t("Chemin « pas de 6 » répété puis « 6 », lancers indépendants (règle du produit).")], lignes: [ligne(`P(X=${d.k})=\\left(\\dfrac{5}{6}\\right)^{${d.k! - 1}}\\cdot\\dfrac{1}{6}`), finLigne(fin)] };
      if (e.ctx === 1) return { utilise: [t("36 couples de dés équiprobables ; on compte ceux qui donnent la somme.")], lignes: [ligne(`P(X=${d.s})=\\dfrac{${6 - Math.abs(d.s! - 7)}}{36}`, "couples favorables"), finLigne(fin)] };
      const facteurs: string[] = [];
      for (let i = 0; i < d.k! - 1; i++) facteurs.push(`\\dfrac{${d.B! - i}}{${d.R! + d.B! - i}}`);
      facteurs.push(`\\dfrac{${d.R}}{${d.R! + d.B! - (d.k! - 1)}}`);
      return { utilise: [t("Chemin : blanche(s) puis rouge, sans remise (règle du produit, probabilités conditionnelles).")], lignes: [ligne(`P(X=${d.k})=${facteurs.join("\\cdot ")}`), finLigne(fin)] };
    }
  }
}

export function correctionDetailleeCM(e: E): EtapeCorrection[] {
  const pb = lignesProba(e);
  const v = probabilite(e).table ?? probabilite(e).valeur;
  const autre = probaAutreModele(e);
  const piegeTexte: FragmentConsigne[] =
    e.variante === "poisson"
      ? [t("Recopier le taux donné comme "), f("\\lambda"), t(" sans l'ajuster à l'échelle de la question.")]
      : e.variante === "hypergeometrique" && autre !== null
        ? [t("Prendre une loi binomiale (tirages avec remise) donnerait "), f(`\\approx ${p4L(Math.round(autre * 1e4) / 1e4)}`), t(" : ici, rien n'est remis.")]
        : e.variante === "aucune"
          ? [t("Forcer une loi binomiale : il n'y a ni nombre d'épreuves fixé ni « nombre de succès ».")]
          : e.variante === "uniforme"
            ? [t("Croire qu'une loi continue « en cloche » s'applique : ici, toutes les valeurs sont également possibles.")]
            : e.variante === "normale"
              ? [t("Confondre avec une loi uniforme : les valeurs se concentrent autour de la moyenne.")]
              : [t("Prendre une loi de Poisson : ici le nombre d'épreuves est fixé.")];
  return [
    utilise("a", [t("Indices du modèle : nombre d'épreuves fixé ou non, avec ou sans remise, comptage sur une durée, mesure continue en cloche ou également répartie.")]),
    { label: "Raisonnement", sousQuestion: "a", fragments: justification(e) },
    resultat("a", fr2(reponse(e, "modele"))),
    ...(e.variante === "aucune"
      ? [utilise("b", [t("Une loi binomiale exige un nombre d'épreuves fixé et "), f("X"), t(" = nombre de succès ; une loi uniforme, des valeurs également probables.")]), resultat("b", fr2(reponse(e, "raison")))]
      : [utilise("b", [t("On lit les paramètres dans la situation.")]), calcul("b", lignesParametres(e)), resultat("b", fr2(reponse(e, "parametres")))]),
    utilise("c", pb.utilise),
    calcul("c", pb.lignes),
    resultat("c", fr2(reponse(e, "proba"))),
    verification("c", [t("C'est bien une probabilité :")], [ligne(`0\\le ${p4L(Math.round(v * 1e4) / 1e4)}\\le 1`)]),
    piege("c", piegeTexte),
  ];
}
