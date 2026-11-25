import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import type { ExerciceExtA, ExerciceExtD, ExerciceExtF, ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { bayesD, esperanceF, pA, probabilitesF, totaleD, totalF } from "../../moteur6e/verificationExtensionsBinomialeNormaleBayes";
import { versNombre } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_BINOMIALE_8, COURS_DISCRETES, COURS_EXTENSIONS, ar, dl } from "../../ui6e/corrigeVariablesAleatoires";
import { fractionLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { frontiereA } from "./familles";

/**
 * Corrigé détaillé « comme au tableau » de `6gen52` (6e ch. 8, § 7, Transférer), une lettre par écran —
 * même source pour l'écran révélé et pour le papier :
 * - A : a) p d'une répétition (produit de deux événements indépendants, ou cas favorables / possibles) ;
 *   b) 1 − (1 − p)ⁿ > seuil ; c) logarithme, le sens change ; d) n minimal, contrôle des voisins ;
 * - D : a) probabilités totales P(S) ; b) P(Cⱼ ∩ S) ; c) Bayes P(Cⱼ ∣ S), comparé à P(Cⱼ) ;
 * - F : a) loi de X (la troisième probabilité par différence) ; b) E(X) ; c) total attendu = N × E(X).
 */

type E = ExerciceExtensionsBinomialeNormaleBayes;

function fracOuDec(num: number, den: number): string {
  if (den === 100 || den === 10) return dl(num / den);
  return `\\dfrac{${num}}{${den}}`;
}

/** Probabilité exacte : décimal court, sinon fraction ≈ arrondi au millième. */
function proba(r: Rationnel): string {
  const x = versNombre(r);
  if (Math.abs(Number(x.toFixed(6)) - x) < 1e-12) return dl(x);
  return `${fractionLatex(r)}\\approx ${ar(x, 3)}`;
}

const C = (i: number) => `C_{${i + 1}}`;

function corrigeA(e: ExerciceExtA): EtapeCorrection[] {
  const p = fracOuDec(e.pNum, e.pDen);
  const q0 = fracOuDec(e.pDen - e.pNum, e.pDen);
  const q = q0.startsWith("\\dfrac") ? `\\left(${q0}\\right)` : q0;
  const lnq = q0.startsWith("\\dfrac") ? `\\ln\\left(${q0}\\right)` : `\\ln(${q0})`;
  const s = dl(e.seuil);
  const u = dl(1 - e.seuil);
  const fr = frontiereA(pA(e), e.seuil);
  const n = e.valeurN;
  const pp = pA(e);
  const out: EtapeCorrection[] =
    e.sousType === "compose" && e.facteurs
      ? [
          utiliseCours("a", fx("Deux événements indépendants : la probabilité qu'ils se réalisent tous les deux est le produit $P(A\\cap B)=P(A)\\times P(B)$"), COURS_EXTENSIONS),
          calcul("a", [ligne(`p=${e.facteurs.join("\\times ")}`, "les deux événements doivent se produire, ils sont indépendants"), ligne(`=${p}`)]),
          resultat("a", fx(`Une répétition est un succès avec la probabilité $p=${p}$.`)),
          piege("a", fx("Additionner les deux probabilités : « réussir les deux » est une intersection, pas une réunion.")),
        ]
      : [
          utiliseCours("a", fx("Issues équiprobables : $p$ = nombre de cas favorables ÷ nombre de cas possibles (ou probabilité donnée par la situation)"), COURS_DISCRETES),
          calcul("a", [ligne(`p=${p}`, "probabilité de gagner une répétition")]),
          resultat("a", fx(`$p=${p}$.`)),
        ];
  out.push(
    utiliseCours("b", fx("Répétitions indépendantes de même probabilité $p$ : « au moins un succès » est le contraire de « aucun succès », $P=1-(1-p)^n$"), COURS_BINOMIALE_8),
    calcul("b", [ligne(`1-p=${q0}`, "probabilité d'un échec"), ligne(`P(\\text{au moins un succès})=1-${q}^{n}`, "événement contraire de « aucun succès »")]),
    resultat("b", fx(`On cherche le plus petit entier $n$ tel que $1-${q}^{n}>${s}$.`)),
    utiliseCours("c", fx("On isole la puissance, puis on prend le logarithme ; diviser par un logarithme négatif change le sens de l'inégalité"), COURS_BINOMIALE_8),
    calcul("c", [
      ligne(`${q}^{n}<${u}`, "on isole la puissance"),
      ligne(`n\\,${lnq}<\\ln(${u})`, "logarithme des deux membres"),
      ligne(`n>\\dfrac{\\ln(${u})}{${lnq}}`, "le logarithme de 1 − p est négatif : le sens change"),
      ligne(`n>${ar(fr, 2)}`, "valeur approchée"),
    ]),
    resultat("c", fx(`$n>${ar(fr, 2)}$ (environ).`)),
    ...(e.sousType === "compose" ? [] : [piege("c", fx("Garder le sens « $<$ » après la division par un logarithme négatif."))]),
    utiliseCours("d", fx("$n$ est entier : on prend le premier entier qui vérifie l'inéquation"), COURS_BINOMIALE_8),
    calcul("d", [ligne(`n=${n}`, `premier entier au-delà de ${ar(fr, 2).replace("{,}", ",")}`)]),
    resultat("d", fx(`Il faut au minimum ${n} ${e.unite}.`)),
    verification("d", fx(`$1-${q}^{${n - 1}}\\approx ${ar(1 - (1 - pp) ** (n - 1), 4)}<${s}$ et $1-${q}^{${n}}\\approx ${ar(1 - (1 - pp) ** n, 4)}>${s}$.`)),
  );
  return out;
}

function corrigeD(e: ExerciceExtD): EtapeCorrection[] {
  const qs = e.q.map((x) => dl(x / 100));
  const rs = e.r.map((x) => dl(x / 100));
  const termes = [0, 1, 2].map((i) => `${qs[i]}\\times ${rs[i]}`);
  const produits = [0, 1, 2].map((i) => dl((e.q[i] * e.r[i]) / 10000));
  const tot = totaleD(e);
  const j = e.j;
  return [
    utiliseCours("a", fx("Probabilités totales : les catégories se partagent la population, $P(S)=\\sum_{i=1}^{3}P(C_i)\\,P(S\\mid C_i)$"), COURS_EXTENSIONS),
    calcul("a", [
      ligne(`P(${C(2)})=1-${qs[0]}-${qs[1]}=${qs[2]}`, "la troisième catégorie est le reste"),
      ligne(`P(S)=${termes.join("+")}`, "une branche de l'arbre par catégorie"),
      ligne(`=${produits.join("+")}`),
      ligne(`=${dl(versNombre(tot))}`),
    ]),
    resultat("a", fx(`$P(S)=${dl(versNombre(tot))}$.`)),
    utiliseCours("b", fx(`Probabilité d'un « et » le long d'une branche : $P(${C(j)}\\cap S)=P(${C(j)})\\times P(S\\mid ${C(j)})$`), COURS_EXTENSIONS),
    calcul("b", [ligne(`P(${C(j)}\\cap S)=${termes[j]}`, `catégorie « ${e.contexte.categories[j]} »`), ligne(`=${produits[j]}`)]),
    resultat("b", fx(`$P(${C(j)}\\cap S)=${produits[j]}$.`)),
    utiliseCours("c", fx(`Théorème de Bayes : $P(${C(j)}\\mid S)=\\dfrac{P(${C(j)}\\cap S)}{P(S)}$`), COURS_EXTENSIONS),
    calcul("c", [ligne(`P(${C(j)}\\mid S)=\\dfrac{${produits[j]}}{${dl(versNombre(tot))}}`, "on sait que S est réalisé"), ligne(`=${proba(bayesD(e))}`, versNombre(bayesD(e)) === Number(versNombre(bayesD(e)).toFixed(6)) ? undefined : "arrondi au millième")]),
    resultat("c", fx(`$P(${C(j)}\\mid S)=${proba(bayesD(e))}$ : sachant $S$, la part de $${C(j)}$ passe de $${qs[j]}$ à environ $${ar(versNombre(bayesD(e)), 3)}$.`)),
    verification("c", fx(`$P(${C(j)}\\mid S)\\times P(S)=${produits[j]}=P(${C(j)}\\cap S)$.`)),
    piege("c", fx(`Confondre $P(${C(j)}\\mid S)$ avec $P(S\\mid ${C(j)})=${rs[j]}$ (conditionnement inversé) ou avec $P(${C(j)})=${qs[j]}$.`)),
  ];
}

function corrigeF(e: ExerciceExtF): EtapeCorrection[] {
  const pr = probabilitesF(e);
  const esp = esperanceF(e);
  const pct3 = 100 - e.pourcentage1 - e.pourcentage2;
  return [
    utiliseCours("a", fx(`On note $X$ ${e.definitionX}. La probabilité d'un montant est la proportion des ${e.individus} qui l'ont choisi ; la somme des probabilités vaut 1`), COURS_DISCRETES),
    calcul("a", [
      ligne(`P(X=${e.valeurs[0]})=${dl(pr[0])}`, `${e.pourcentage1} % : ${e.labels[0]}`),
      ligne(`P(X=${e.valeurs[1]})=${dl(pr[1])}`, `${e.pourcentage2} % : ${e.labels[1]}`),
      ligne(`P(X=${e.valeurs[2]})=1-${dl(pr[0])}-${dl(pr[1])}=${dl(pr[2])}`, `les autres (${pct3} %) : ${e.labels[2]}`),
    ]),
    resultat("a", fx(`Loi de $X$ : $P(X=${e.valeurs[0]})=${dl(pr[0])}$ ; $P(X=${e.valeurs[1]})=${dl(pr[1])}$ ; $P(X=${e.valeurs[2]})=${dl(pr[2])}$.`)),
    utiliseCours("b", fx("Espérance : moyenne des valeurs pondérée par leurs probabilités, $E(X)=\\sum x_i\\,P(X=x_i)$"), COURS_DISCRETES),
    calcul("b", [
      ligne(`E(X)=${e.valeurs.map((v, i) => `${v}\\times ${dl(pr[i])}`).join("+")}`, "valeurs × probabilités"),
      ligne(`=${e.valeurs.map((v, i) => dl(v * pr[i])).join("+")}`),
      ligne(`=${dl(esp)}`),
    ]),
    resultat("b", fx(`$E(X)=${dl(esp)}$ € : c'est le montant moyen payé par une personne.`)),
    piege("b", fx("Faire la moyenne simple des trois montants : chacun doit être pondéré par sa probabilité.")),
    utiliseCours("c", fx("Chaque personne paie en moyenne $E(X)$ : le total attendu est la taille de la population multipliée par $E(X)$"), COURS_DISCRETES),
    calcul("c", [ligne(`${milliers(e.population)}\\times ${dl(esp)}=${dl(totalF(e))}`, `${e.individus} × montant moyen`)]),
    resultat("c", fx(`On peut attendre environ $${dl(totalF(e))}$ € par mois.`)),
  ];
}

export function correctionDetailleeExtensions(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : e.famille === "D" ? corrigeD(e) : corrigeF(e));
}
