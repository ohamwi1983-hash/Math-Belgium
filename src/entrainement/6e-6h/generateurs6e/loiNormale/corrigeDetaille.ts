import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceLoiNormale, ExerciceLoiNormaleA, ExerciceLoiNormaleB, ExerciceLoiNormaleC, ExerciceLoiNormaleD, ExerciceLoiNormaleE, FormePhi } from "../../core6e/loiNormale.types";
import { valeurTablePhi } from "../../../../lib/tablePhi";
import { effectifReference, equationJusteDe, probabilitesAcceptees, zAcceptes } from "../../moteur6e/verificationLoiNormale";
import { aArrondis, equationLatex, evenementDirect, latexForme, xL, zL } from "../../ui6e/formatLoiNormale";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_NORMALE, dl } from "../../ui6e/corrigeVariablesAleatoires";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { arrondir, bornesZ, formeAttendue, POURCENTAGE_REGLE } from "./calculs";

/**
 * Corrigé détaillé « comme au tableau » de `6gen51` (6e ch. 8, § 6), une lettre par écran — même source
 * pour l'écran révélé et pour le papier. MÉTHODE DE LA TABLE (audit, E9) : z arrondi au centième, Φ lue
 * à 4 décimales dans la table de l'annexe (`lib/tablePhi.ts`), probabilité et effectif calculés avec ces
 * valeurs ; la valeur de la calculatrice est signalée quand elle diffère.
 * - A : a) écriture avec Φ (symétrie, complément) ; b) lecture de la table et calcul ;
 * - B : a) z = (x − μ) / σ ; b) écriture avec Φ ; c) table ; d) effectif = N × p (si un groupe est donné) ;
 * - C : a) égalité de table Φ(±t) = … ; b) lecture inverse (case la plus proche ; deux voisines acceptées) ;
 * - D : a) égalité de table ; b) z ; c) a = μ + zσ (centrée : d = zσ, a = μ + d) ;
 * - E : a) nombre d'écarts-types ; b) règle empirique (un côté : la moitié) ; c) effectif.
 */

type E = ExerciceLoiNormale;
type Fr = FragmentConsigne[];

const p4 = (x: number) => dl(arrondir(x, 4));
const zt = (z: number) => z.toFixed(2).replace(".", ",").replace("-", "−");

const RELATIONS = "La table donne $\\Phi(t)=P(Z\\leq t)$ pour $t\\geq 0$ ; la courbe est symétrique et l'aire totale vaut 1 : $P(Z\\geq t)=1-\\Phi(t)$ et $\\Phi(-t)=1-\\Phi(t)$";

function raisonForme(forme: FormePhi, z1: number): string {
  switch (forme) {
    case "phi":
      return z1 >= 0 ? "aire à gauche d'une borne positive : lecture directe" : "aire à droite d'une borne négative : par symétrie, aire à gauche de son opposé";
    case "unMoinsPhi":
      return z1 >= 0 ? "aire à droite d'une borne positive : complément à 1" : "aire à gauche d'une borne négative : par symétrie, complément de l'aire à gauche de son opposé";
    case "diff":
      return "deux bornes positives : différence des aires à gauche";
    case "sommeMoinsUn":
      return "une borne négative : Φ(z₂) − (1 − Φ(|z₁|))";
    case "diffInverse":
      return "deux bornes négatives : par symétrie, intervalle entre leurs opposés";
    default:
      return "";
  }
}

function lectures(z1: number, z2: number | null): LigneCalcul[] {
  const zs = [Math.abs(z1), ...(z2 === null ? [] : [Math.abs(z2)])];
  return [...new Set(zs)].map((z) => ligne(`\\Phi(${zL(z)})=${p4(valeurTablePhi(z))}`, `table : ligne ${zt(Math.floor(z * 10 + 1e-9) / 10).slice(0, -1)}, colonne ${zt((Math.round(z * 100) % 10) / 100)}`));
}

function calculTable(forme: FormePhi, z1: number, z2: number | null): string {
  const v1 = p4(valeurTablePhi(Math.abs(z1)));
  const v2 = z2 === null ? "" : p4(valeurTablePhi(Math.abs(z2)));
  switch (forme) {
    case "phi":
      return v1;
    case "unMoinsPhi":
      return `1-${v1}`;
    case "phiMoinsDemi":
      return `${v1}-0{,}5`;
    case "diff":
      return `${v2}-${v1}`;
    case "sommeMoinsUn":
      return `${v2}+${v1}-1`;
    case "diffInverse":
      return `${v1}-${v2}`;
  }
}

/** Étapes « écriture avec Φ » puis « table » (A : a, b ; B : b, c). */
function formeEtTable(e: ExerciceLoiNormaleA | ExerciceLoiNormaleB, lf: string, lp: string): EtapeCorrection[] {
  const { z1, z2 } = bornesZ(e);
  const forme = formeAttendue(e.sousType, z1, z2);
  const ev = evenementDirect(e);
  const ecriture = latexForme(forme, z1, z2);
  const [pt, exacte] = probabilitesAcceptees(e);
  const evZ = e.famille === "A" ? ev : e.sousType === "inferieur" ? `P(Z\\leq ${zL(z1)})` : e.sousType === "superieur" ? `P(Z\\geq ${zL(z1)})` : `P(${zL(z1)}\\leq Z\\leq ${zL(z2 as number)})`;
  const calc = calculTable(forme, z1, z2);
  const out: EtapeCorrection[] = [
    utiliseCours(lf, fx(RELATIONS), COURS_NORMALE),
    calcul(lf, [...(e.famille === "B" ? [ligne(`${ev}=${evZ}`, "on standardise")] : []), ligne(`${e.famille === "B" ? "" : ev}=${ecriture}`, raisonForme(forme, z1))]),
    resultat(lf, fx(`$${ev}=${ecriture}$.`)),
  ];
  // Un seul piège par exercice : la symétrie si une borne est négative ; sinon le complément, l'ordre de
  // la différence ou la case de la table ; en B sans borne négative, celui de la standardisation (étape a).
  const negatif = z1 < 0 || (z2 !== null && z2 < 0);
  if (negatif) out.push(piege(lf, fx("Lire $\\Phi$ d'un nombre négatif : la table ne donne que $t\\geq 0$, on passe par $\\Phi(-t)=1-\\Phi(t)$.")));
  else if (e.famille === "A" && forme === "unMoinsPhi") out.push(piege(lf, fx("Oublier le complément : $\\Phi(t)$ est l'aire à gauche de $t$.")));
  else if (e.famille === "A" && forme === "diff") out.push(piege(lf, fx("Soustraire dans le mauvais ordre : une probabilité n'est jamais négative.")));
  else if (e.famille === "A") out.push(piege(lf, fx("Lire la mauvaise case : ligne = unités et dixième de $t$, colonne = centième.")));
  out.push(
    utiliseCours(lp, fx("On lit chaque $\\Phi(t)$ dans la table (ligne : unités et dixième ; colonne : centième), puis on calcule"), COURS_NORMALE),
    calcul(lp, [...lectures(z1, z2), ligne(`${ev}=${calc}`, "valeurs de la table"), ...(calc === p4(pt) ? [] : [ligne(`=${p4(pt)}`)])]),
    resultat(lp, fx(`$${ev}\\approx ${p4(pt)}$.`)),
  );
  if (p4(exacte) !== p4(pt)) out.push(verification(lp, fx(`La calculatrice (loi normale) donne $${p4(exacte)}$ : l'écart vient des arrondis de la table, les deux valeurs sont acceptées.`)));
  return out;
}

function corrigeA(e: ExerciceLoiNormaleA): EtapeCorrection[] {
  return formeEtTable(e, "a", "b");
}

function corrigeB(e: ExerciceLoiNormaleB): EtapeCorrection[] {
  const { z1, z2 } = bornesZ(e);
  const ligneZ = (x: number, z: number, nom: string) => ligne(`${nom}=\\dfrac{${xL(x)}-${xL(e.mu)}}{${xL(e.sigma)}}=${zL(z)}`, "on centre (− μ) puis on réduit (÷ σ)");
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx("Si $X\\sim\\mathcal{N}(\\mu\\,;\\sigma)$, alors $Z=\\dfrac{X-\\mu}{\\sigma}$ suit $\\mathcal{N}(0\\,;1)$"), COURS_NORMALE),
    calcul("a", z2 === null ? [ligneZ(e.x1, z1, "z")] : [ligneZ(e.x1, z1, "z_1"), ligneZ(e.x2 as number, z2, "z_2")]),
    resultat("a", fx(z2 === null ? `$z=${zL(z1)}$.` : `$z_1=${zL(z1)}$ et $z_2=${zL(z2)}$.`)),
    ...(z1 < 0 || (z2 !== null && z2 < 0) ? [] : [piege("a", fx("Diviser par la variance au lieu de l'écart-type : $z=\\dfrac{x-\\mu}{\\sigma}$."))]),
    ...formeEtTable(e, "b", "c"),
  ];
  if (e.population !== null) {
    const pt = probabilitesAcceptees(e)[0];
    out.push(
      utiliseCours("d", fx("Effectif attendu = taille du groupe × proportion"), COURS_NORMALE),
      calcul("d", [ligne(`${milliers(e.population)}\\times ${p4(pt)}=${dl(arrondir(e.population * pt, 2))}`, "probabilité de l'étape précédente")]),
      resultat("d", fx(`Environ ${effectifReference(e)} ${e.contexte.individus}.`)),
    );
  }
  return out;
}

function raisonEquation(id: string, l: string): string {
  switch (id) {
    case "phiP":
      return `probabilité à gauche, au moins 0,5 : $\\Phi(${l})=p$`;
    case "phiOpposeUnMoinsP":
      return `probabilité à gauche, moins de 0,5 : la borne est négative et $\\Phi(-${l})=1-p$`;
    case "phiUnMoinsP":
      return `probabilité à droite, au plus 0,5 : $\\Phi(${l})=1-p$`;
    case "phiOpposeP":
      return `probabilité à droite, plus de 0,5 : la borne est négative et $\\Phi(-${l})=p$`;
    case "phiCentre":
      return `$2\\Phi(${l})-1=p$, donc $\\Phi(${l})=\\dfrac{1+p}{2}$`;
    default:
      return `$\\Phi(${l})-0{,}5=p$, donc $\\Phi(${l})=0{,}5+p$`;
  }
}

/** Piège de l'égalité de table, propre à la forme de la donnée. */
function piegeEquation(id: string, l: string): string {
  switch (id) {
    case "phiOpposeUnMoinsP":
    case "phiOpposeP":
      return `La borne est négative : la table ne lit que des valeurs positives, on écrit l'égalité avec $\\Phi(-${l})$ puis on change le signe.`;
    case "phiUnMoinsP":
      return `Écrire $\\Phi(${l})=p$ : $\\Phi$ donne l'aire à gauche, la probabilité donnée est à droite.`;
    case "phiCentre":
      return `Écrire $\\Phi(${l})=p$ : l'intervalle centré vaut $2\\Phi(${l})-1$, pas $\\Phi(${l})$.`;
    case "phiDemiPlusP":
      return `Écrire $\\Phi(${l})=p$ : $\\Phi(${l})$ part de $-\\infty$, il faut retirer la moitié gauche ($0{,}5$).`;
    default:
      return `Écrire $\\Phi(${l})=1-p$ : la probabilité donnée est déjà l'aire à gauche de la borne.`;
  }
}

/** Étapes « égalité de table » puis « lecture inverse » (C : a, b ; D : a, b). */
function equationEtLecture(e: ExerciceLoiNormaleC | ExerciceLoiNormaleD): EtapeCorrection[] {
  const q = equationJusteDe(e);
  const l = e.famille === "C" ? "t" : "z";
  const zs = zAcceptes(e).exactes;
  const lus = zs.map((z) => zL(Math.abs(z))).join("\\ \\text{ou}\\ ");
  const valeurs: Fr = fx(raisonEquation(q.id, l));
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx(`${RELATIONS} ; $P(-t\\leq Z\\leq t)=2\\Phi(t)-1$ et $P(0\\leq Z\\leq t)=\\Phi(t)-0{,}5$`), COURS_NORMALE),
    calcul("a", [
      ...(e.famille === "D" ? [ligne(`z=\\dfrac{a-${xL(e.mu)}}{${xL(e.sigma)}}`, "on standardise la borne cherchée")] : []),
      ligne(equationLatex(q, l), valeurs),
    ]),
    resultat("a", fx(`$${equationLatex(q, l)}$.`)),
    piege("a", fx(piegeEquation(q.id, l))),
    utiliseCours("b", fx("Lecture inverse : on cherche dans la table la case égale (ou la plus proche) de la valeur ; la borne vaut ligne + colonne"), COURS_NORMALE),
    calcul("b", [
      ligne(`\\Phi(${lus})\\approx ${p4(q.valeur)}`, zs.length > 1 ? "la valeur tombe entre deux cases : les deux sont acceptées" : "case la plus proche"),
      ...(q.oppose ? [ligne(`-${l}=${zL(Math.abs(zs[0]))}`, "la table donne l'opposé"), ligne(`${l}=${zL(zs[0])}`, "on change le signe")] : []),
    ]),
    resultat("b", fx(`$${l}\\approx ${zs.map(zL).join("\\ \\text{ou}\\ ")}$.`)),
  ];
  return out;
}

function corrigeC(e: ExerciceLoiNormaleC): EtapeCorrection[] {
  return equationEtLecture(e);
}

function corrigeD(e: ExerciceLoiNormaleD): EtapeCorrection[] {
  const zs = zAcceptes(e).exactes;
  const z = zs[0];
  const as = aArrondis(e);
  const lignes: LigneCalcul[] =
    e.sousType === "centre"
      ? [ligne(`d=z\\,\\sigma=${zL(z)}\\times ${xL(e.sigma)}=${dl(arrondir(z * e.sigma, 4))}`, "demi-largeur de l'intervalle"), ligne(`a=${xL(e.mu)}+${dl(arrondir(z * e.sigma, 4))}=${dl(arrondir(e.mu + z * e.sigma, 4))}`, "borne supérieure"), ligne(`a\\approx ${xL(as[0])}`, "au dixième")]
      : [ligne(`a=\\mu+z\\,\\sigma=${xL(e.mu)}+${z < 0 ? `(${zL(z)})` : zL(z)}\\times ${xL(e.sigma)}`, "on revient à la variable de départ"), ligne(`=${dl(arrondir(e.mu + z * e.sigma, 4))}`), ...(arrondir(e.mu + z * e.sigma, 4) === as[0] ? [] : [ligne(`\\approx ${xL(as[0])}`, "au dixième")])];
  return [
    ...equationEtLecture(e),
    utiliseCours("c", fx("On revient à la variable de départ : $a=\\mu+z\\,\\sigma$"), COURS_NORMALE),
    calcul("c", lignes),
    resultat("c", fx(`$a\\approx ${as.map(xL).join("\\ \\text{ou}\\ ")}$ (${e.contexte.unite}).`)),
  ];
}

function corrigeE(e: ExerciceLoiNormaleE): EtapeCorrection[] {
  const bas = arrondir(e.mu - e.k * e.sigma, 2);
  const haut = arrondir(e.mu + e.k * e.sigma, 2);
  const prop = probabilitesAcceptees(e)[0];
  const hors = arrondir(1 - POURCENTAGE_REGLE[e.k], 3);
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx("Nombre d'écarts-types = écart à la moyenne divisé par $\\sigma$"), COURS_NORMALE),
    calcul("a", [ligne(`\\dfrac{${xL(haut)}-${xL(e.mu)}}{${xL(e.sigma)}}=${e.k}`, "borne supérieure"), ...(e.unCote && e.coteDemande === "superieur" ? [] : [ligne(`\\dfrac{${xL(e.mu)}-${xL(bas)}}{${xL(e.sigma)}}=${e.k}`, "borne inférieure (symétrique)")])]),
    resultat("a", fx(`Les bornes sont à $${e.k}$ écart${e.k > 1 ? "s" : ""}-type${e.k > 1 ? "s" : ""} de la moyenne : intervalle $[\\mu-${e.k}\\sigma\\,;\\mu+${e.k}\\sigma]$.`)),
    utiliseCours("b", fx("Règle empirique : environ 68,3 % des valeurs à moins d'un écart-type de la moyenne, 95,4 % à moins de deux, 99,7 % à moins de trois ; la courbe est symétrique"), COURS_NORMALE),
    calcul("b", [
      ligne(`P(\\text{hors de l'intervalle})\\approx 1-${dl(POURCENTAGE_REGLE[e.k])}=${dl(hors)}`, "complément de la règle"),
      ...(e.unCote ? [ligne(`P(${e.coteDemande === "superieur" ? `X>${xL(haut)}` : `X<${xL(bas)}`})\\approx ${dl(hors)}\\div 2=${dl(prop)}`, "un seul côté : la moitié, par symétrie")] : []),
    ]),
    resultat("b", fx(`Proportion cherchée : environ $${dl(prop)}$, soit $${dl(arrondir(prop * 100, 3))}$ %.`)),
    piege("b", fx(e.unCote ? "Oublier de diviser par 2 : on ne veut qu'un côté de l'intervalle." : "Donner la proportion dans l'intervalle : on veut celle qui est en dehors.")),
  ];
  if (e.population !== null)
    out.push(
      utiliseCours("c", fx("Effectif attendu = taille du groupe × proportion"), COURS_NORMALE),
      calcul("c", [ligne(`${milliers(e.population)}\\times ${dl(prop)}=${dl(arrondir(e.population * prop, 2))}`, "proportion de l'étape précédente")]),
      resultat("c", fx(`Environ ${effectifReference(e)} ${e.contexte.individus}.`)),
    );
  return out;
}

export function correctionDetailleeLoiNormale(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
    case "E":
      return finaliserCombinatoire(corrigeE(e));
  }
}
