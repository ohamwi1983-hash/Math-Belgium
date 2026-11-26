import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { centL, decimalL, eurT, lireNombre, MESSAGE_MONTANT, MESSAGE_TAUX, montantL, nL, pourcentFixeL, pourcentL, pourcentT, statutMontant, statutTaux, TOL_CENTIME, tropArrondi } from "../finance/commun";
import type { ExerciceTauxEquivalents, Periode, PhaseTauxEquivalents } from "./index";
import { annuelDe, depreciationAnnuelle, periodiqueDe, tauxMoyen, tauxNet, valeurDepreciee } from "./index";

/**
 * Couche texte de `56gen26` « Taux équivalents et taux réel » : situation, consignes, options (l'option
 * 0 est la bonne, ordre mélangé stocké dans l'instance), aides à deux niveaux, réponses, messages
 * ciblés et vérification (0,01 point sur un taux annuel, 0,001 point sur un taux périodique).
 */

type E = ExerciceTauxEquivalents;
type P = PhaseTauxEquivalents;

export const NOM_PERIODE: Record<Periode, { adj: string; indice: string; par: string; mois: number }> = {
  2: { adj: "semestriel", indice: "\\text{semestriel}", par: "par semestre", mois: 6 },
  4: { adj: "trimestriel", indice: "\\text{trimestriel}", par: "par trimestre", mois: 3 },
  12: { adj: "mensuel", indice: "\\text{mensuel}", par: "par mois", mois: 1 },
};
const iP = (k: Periode) => `i_{${NOM_PERIODE[k].indice}}`;
const IA = "i_{\\text{annuel}}";

/** Valeur attendue (en %) et précision de l'écran de taux. */
export function tauxAttendu(e: E, p: P): { valeur: number; dec: number } {
  switch (p) {
    case "taux":
      if (e.variante === "versAnnuel") return { valeur: annuelDe(e.k, e.taux), dec: 2 };
      if (e.variante === "depuisAnnuel") return { valeur: periodiqueDe(e.k, e.taux), dec: 3 };
      if (e.variante === "depreciation") return { valeur: depreciationAnnuelle(e), dec: 2 };
      return { valeur: tauxMoyen(e), dec: 2 };
    case "tauxA":
      return { valeur: annuelDe(e.k, e.taux), dec: 2 };
    case "tauxB":
      return { valeur: annuelDe(e.kB, e.tauxB), dec: 2 };
    case "tauxNet":
      return { valeur: tauxNet(e), dec: 3 };
    default:
      return { valeur: NaN, dec: 2 };
  }
}
const tol = (dec: number) => (dec === 2 ? 0.01 : 0.001);

function grandeurLongue(e: E): { sujet: string; evolution: string } {
  const b = e.baisse;
  return [
    b ? { sujet: "La surface d'un glacier alpin", evolution: `a diminué de ${pourcentT(e.taux)} en ${e.duree} ans` } : { sujet: "Le prix moyen d'un logement dans une ville", evolution: `a augmenté de ${pourcentT(e.taux)} en ${e.duree} ans` },
    b ? { sujet: "La population d'une espèce d'oiseaux", evolution: `a diminué de ${pourcentT(e.taux)} en ${e.duree} ans` } : { sujet: "Le nombre d'abonnés d'un club sportif", evolution: `a augmenté de ${pourcentT(e.taux)} en ${e.duree} ans` },
    b ? { sujet: "La valeur d'une machine", evolution: `a diminué de ${pourcentT(e.taux)} en ${e.duree} ans` } : { sujet: "Le chiffre d'affaires d'une entreprise", evolution: `a augmenté de ${pourcentT(e.taux)} en ${e.duree} ans` },
  ][e.contexte]!;
}

/* ----------------------------------------------------------------------------------------------
 * Énoncé
 * -------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  const p = e.prenom;
  switch (e.variante) {
    case "versAnnuel":
      return [tx(`Une banque propose à ${p} un placement à intérêts composés au taux ${NOM_PERIODE[e.k].adj} de ${pourcentT(e.taux)} (intérêts capitalisés à la fin de chaque ${e.k === 2 ? "semestre" : e.k === 4 ? "trimestre" : "mois"}).`)];
    case "depuisAnnuel":
      return [tx(`Un placement à intérêts composés rapporte ${pourcentT(e.taux)} par an. ${p} préférerait que les intérêts soient capitalisés à la fin de chaque ${e.k === 2 ? "semestre" : e.k === 4 ? "trimestre" : "mois"}, sans rien changer à ce que rapporte le placement sur un an.`)];
    case "comparer":
      return e.emprunt
        ? [tx(`Pour un emprunt, ${p} hésite entre deux organismes. L'offre A est à un taux ${NOM_PERIODE[e.k].adj} de ${pourcentT(e.taux)}, l'offre B à un taux ${NOM_PERIODE[e.kB].adj} de ${pourcentT(e.tauxB)} (intérêts composés dans les deux cas).`)]
        : [tx(`Pour placer son épargne, ${p} hésite entre deux banques. L'offre A rapporte ${pourcentT(e.taux)} ${NOM_PERIODE[e.k].par}, l'offre B ${pourcentT(e.tauxB)} ${NOM_PERIODE[e.kB].par} (intérêts composés dans les deux cas).`)];
    case "precompte":
      return [tx(`${p} place ${eurT(e.C0)} pendant un an au taux annuel brut de ${pourcentT(e.taux)}. Sur les intérêts, la banque retient un précompte de ${pourcentT(e.precompte)} (taux donné pour cet exercice).`)];
    case "depreciation":
      return [tx(`Une voiture neuve vaut ${eurT(e.C0)}. Sa valeur diminue de ${pourcentT(e.taux)} par mois (chaque mois, elle perd ce pourcentage de sa valeur du mois précédent).`)];
    case "longuePeriode": {
      const g = grandeurLongue(e);
      return [tx(`${g.sujet} ${g.evolution}.`)];
    }
  }
}

export function question(e: E): Frag[] {
  switch (e.variante) {
    case "versAnnuel":
      return [tx("Quel est le taux annuel équivalent (taux réel), en %, au centième ?")];
    case "depuisAnnuel":
      return [tx(`Quel taux ${NOM_PERIODE[e.k].adj} équivalent la banque doit-elle appliquer (en %, au millième) ?`)];
    case "comparer":
      return [tx("Quelle offre est la plus avantageuse pour "), tx(e.prenom), tx(" ? Justifie par les taux annuels équivalents (au centième).")];
    case "precompte":
      return [tx("Calcule l'intérêt net perçu et le taux annuel net de ce placement (en %, au millième).")];
    case "depreciation":
      return [tx(`Quel est le taux annuel de dépréciation (en %, au centième) ? Quelle sera la valeur de la voiture au bout de ${e.duree} mois ?`)];
    case "longuePeriode":
      return [tx(`Quel est le taux annuel moyen de cette ${e.baisse ? "baisse" : "hausse"} (en %, au centième) ?`)];
  }
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" "), ...question(e)];
}

export function libelle(e: E, p: P): string {
  return {
    relation: "Relation entre les taux",
    taux: e.variante === "depuisAnnuel" ? "Taux périodique" : e.variante === "longuePeriode" ? "Taux annuel moyen" : e.variante === "depreciation" ? "Dépréciation annuelle" : "Taux annuel équivalent",
    tauxA: "Taux annuel de l'offre A",
    tauxB: "Taux annuel de l'offre B",
    choix: "Offre la plus avantageuse",
    brut: "Intérêt brut",
    net: "Intérêt net",
    tauxNet: "Taux net",
    valeur: "Valeur après dépréciation",
  }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "relation":
      if (e.variante === "depreciation") return [tx("Quelle relation lie le taux mensuel "), lx("d_{\\text{mensuel}}"), tx(" et le taux annuel "), lx("d_{\\text{annuel}}"), tx(" de dépréciation ?")];
      if (e.variante === "longuePeriode") return [tx(`Quelle équation donne le taux annuel moyen `), lx("t"), tx(" (en écriture décimale) ?")];
      return [tx("Quelle relation lie les deux taux équivalents ?")];
    case "taux":
      return e.variante === "depuisAnnuel" ? [tx(`Calcule le taux ${NOM_PERIODE[e.k].adj} équivalent, en %, au millième.`)] : [tx("Calcule ce taux annuel, en %, au centième.")];
    case "tauxA":
      return [tx("Calcule le taux annuel équivalent à l'offre A, en %, au centième.")];
    case "tauxB":
      return [tx("Calcule le taux annuel équivalent à l'offre B, en %, au centième.")];
    case "choix":
      return [tx("Quelle offre est la plus avantageuse ?")];
    case "brut":
      return [tx("Calcule l'intérêt brut rapporté en un an (au centime).")];
    case "net":
      return [tx("Calcule l'intérêt net, une fois le précompte retenu (au centime).")];
    case "tauxNet":
      return [tx("Calcule le taux annuel net du placement, en %, au millième.")];
    case "valeur":
      return [tx(`Calcule la valeur de la voiture au bout de ${e.duree} mois (au centime).`)];
  }
}

export function champs(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "taux":
    case "tauxA":
    case "tauxB":
    case "tauxNet":
      return [{ label: "taux", labelLatex: "", unite: "%", placeholder: "ex. : 5,72" }];
    case "brut":
      return [{ label: "intérêt brut", labelLatex: "I_{\\text{brut}}=", unite: "€", placeholder: "ex. : 87,50" }];
    case "net":
      return [{ label: "intérêt net", labelLatex: "I_{\\text{net}}=", unite: "€", placeholder: "ex. : 61,25" }];
    case "valeur":
      return [{ label: "valeur", labelLatex: "V=", unite: "€", placeholder: "ex. : 14 532,18" }];
    default:
      return [];
  }
}

/* ----------------------------------------------------------------------------------------------
 * Choix fermés (option 0 = la bonne)
 * -------------------------------------------------------------------------------------------- */

function textesOptions(e: E, p: P): Frag[][] {
  if (p === "choix") {
    const g = e.gagnante;
    const autre = g === "A" ? "B" : "A";
    return [
      [tx(`L'offre ${g} : son taux annuel équivalent est ${e.emprunt ? "le plus bas (on paie moins d'intérêts)" : "le plus élevé (le placement rapporte plus)"}.`)],
      [tx(`L'offre ${autre} : son taux annuel équivalent est ${e.emprunt ? "le plus élevé" : "le plus bas"}.`)],
      [tx("Les deux offres se valent : des taux de périodes différentes sont toujours équivalents.")],
      [tx("On ne peut pas comparer des taux qui ne portent pas sur la même période.")],
    ];
  }
  if (e.variante === "depreciation")
    return [[lx("1-d_{\\text{annuel}}=(1-d_{\\text{mensuel}})^{12}")], [lx("d_{\\text{annuel}}=12\\,d_{\\text{mensuel}}")], [lx("1+d_{\\text{annuel}}=(1+d_{\\text{mensuel}})^{12}")], [lx("d_{\\text{annuel}}=(d_{\\text{mensuel}})^{12}")]];
  if (e.variante === "longuePeriode") {
    const P2 = decimalL(e.taux / 100);
    const N = e.duree;
    return e.baisse
      ? [[lx(`(1-t)^{${N}}=1-${P2}`)], [lx(`${N}\\,t=${P2}`)], [lx(`(1+t)^{${N}}=1+${P2}`)], [lx(`1-${N}\\,t=1-${P2}`)]]
      : [[lx(`(1+t)^{${N}}=1+${P2}`)], [lx(`${N}\\,t=${P2}`)], [lx(`(1-t)^{${N}}=1-${P2}`)], [lx(`t^{${N}}=${P2}`)]];
  }
  const k = e.k;
  return [[lx(`(1+${iP(k)})^{${k}}=1+${IA}`)], [lx(`${k}\\,${iP(k)}=${IA}`)], [lx(`1+${iP(k)}=(1+${IA})^{${k}}`)], [lx(`(1+${iP(k)})^{${k === 12 ? 11 : k + 1}}=1+${IA}`)]];
}

export function options(e: E, p: P): OptionEcran[] {
  const t = textesOptions(e, p);
  return e.ordre.map((k) => ({ id: `o${k}`, fragments: t[k]! }));
}
export const BONNE = "o0";
export const optionJuste = (e: E, p: P) => textesOptions(e, p)[0]!;

/* ----------------------------------------------------------------------------------------------
 * Réponses
 * -------------------------------------------------------------------------------------------- */

const interetBrut = (e: E) => (e.C0 * e.taux) / 100;
const interetNet = (e: E) => interetBrut(e) * (1 - e.precompte / 100);
export { interetBrut, interetNet };

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "relation":
    case "choix":
      return optionJuste(e, p);
    case "taux":
    case "tauxA":
    case "tauxB":
    case "tauxNet": {
      const { valeur, dec } = tauxAttendu(e, p);
      const nom = p === "tauxNet" ? "i_{\\text{net}}" : p !== "taux" || e.variante === "versAnnuel" ? IA : e.variante === "depuisAnnuel" ? iP(e.k) : e.variante === "depreciation" ? "d_{\\text{annuel}}" : "t";
      return [lx(`${nom}\\approx ${pourcentFixeL(valeur, dec)}`)];
    }
    case "brut":
      return [lx(`I_{\\text{brut}}=${centL(interetBrut(e))}`), tx(" €")];
    case "net":
      return [lx(`I_{\\text{net}}=${centL(interetNet(e))}`), tx(" €")];
    case "valeur":
      return [lx(`V\\approx ${centL(valeurDepreciee(e))}`), tx(" €")];
  }
}

export function recap(e: E, p: P): Frag[] {
  if (p === "choix") return [tx(`L'offre ${e.gagnante}`)];
  return reponse(e, p);
}

/* ----------------------------------------------------------------------------------------------
 * Aides
 * -------------------------------------------------------------------------------------------- */

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "relation":
      if (e.variante === "depreciation") return { texte: [tx("Perdre un pourcentage, c'est multiplier par 1 moins ce pourcentage ; sur un an, on applique douze fois la baisse mensuelle.")] };
      if (e.variante === "longuePeriode") return { texte: [tx("Une évolution annuelle de taux t, répétée chaque année, multiplie la grandeur par "), lx(e.baisse ? "1-t" : "1+t"), tx(" par an : sur plusieurs années, les facteurs se multiplient.")] };
      return { texte: [tx("Deux taux sont équivalents s'ils donnent la même valeur acquise au bout d'un an :")], latex: `(1+i_{\\text{semestriel}})^2=(1+i_{\\text{trimestriel}})^4=(1+i_{\\text{mensuel}})^{12}=1+${IA}` };
    case "taux":
    case "tauxA":
    case "tauxB":
      if (e.variante === "depuisAnnuel") return { texte: [tx("Isole le taux périodique : prends la racine k-ième (ou la puissance "), lx("\\frac{1}{k}"), tx(") de "), lx(`1+${IA}`), tx(", puis retire 1.")] };
      if (e.variante === "depreciation") return { texte: [tx("Calcule "), lx("(1-d_{\\text{mensuel}})^{12}"), tx(" : c'est la part de valeur qui reste au bout d'un an ; le taux de dépréciation est ce qui est perdu.")] };
      if (e.variante === "longuePeriode") return { texte: [tx("Isole "), lx(e.baisse ? "1-t" : "1+t"), tx(" par la racine N-ième, puis déduis t et écris-le en %.")] };
      return { texte: [tx("Élève le facteur périodique "), lx("1+i"), tx(" à la puissance du nombre de périodes dans l'année, retire 1, puis écris le résultat en %.")] };
    case "choix":
      return { texte: [tx(e.emprunt ? "Pour un emprunt, l'offre la plus avantageuse est celle qui coûte le moins : le taux annuel équivalent le plus bas." : "Pour un placement, l'offre la plus avantageuse est celle qui rapporte le plus : le taux annuel équivalent le plus élevé.")] };
    case "brut":
      return { texte: [tx("Sur un an, l'intérêt brut est le capital multiplié par le taux annuel brut (écriture décimale).")] };
    case "net":
      return { texte: [tx("Le précompte est un pourcentage des intérêts : on n'en garde que 100 % moins ce pourcentage.")] };
    case "tauxNet":
      return { texte: [tx("Le taux net est ce que rapporte réellement le placement, une fois le précompte retenu : intérêt net divisé par le capital, ou taux brut multiplié par la part gardée.")] };
    case "valeur":
      return { texte: [tx("Chaque mois, la valeur est multipliée par "), lx("1-d_{\\text{mensuel}}"), tx(" : c'est une suite géométrique.")], latex: "V_n=V_0\\,(1-d)^n" };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "relation":
      if (e.variante === "depreciation") return { texte: [tx("Ici, chaque mois, la valeur est multipliée par "), lx(decimalL(1 - e.taux / 100)), tx(".")] };
      if (e.variante === "longuePeriode") return { texte: [tx(`Ici, sur ${e.duree} ans, la grandeur est multipliée par `), lx(decimalL(e.baisse ? 1 - e.taux / 100 : 1 + e.taux / 100)), tx(".")] };
      return { texte: [tx(`Ici, il y a ${e.k} ${e.k === 2 ? "semestres" : e.k === 4 ? "trimestres" : "mois"} dans une année.`)] };
    case "taux":
      if (e.variante === "versAnnuel") return { texte: [tx("Ici :")], latex: `1+${IA}=${decimalL(1 + e.taux / 100)}^{${e.k}}` };
      if (e.variante === "depuisAnnuel") return { texte: [tx("Ici :")], latex: `1+${iP(e.k)}=\\sqrt[${e.k}]{${decimalL(1 + e.taux / 100)}}` };
      if (e.variante === "depreciation") return { texte: [tx("Ici :")], latex: `1-d_{\\text{annuel}}=${decimalL(1 - e.taux / 100)}^{12}` };
      return { texte: [tx("Ici :")], latex: e.baisse ? `1-t=\\sqrt[${e.duree}]{${decimalL(1 - e.taux / 100)}}` : `1+t=\\sqrt[${e.duree}]{${decimalL(1 + e.taux / 100)}}` };
    case "tauxA":
      return { texte: [tx("Ici :")], latex: `1+${IA}=${decimalL(1 + e.taux / 100)}^{${e.k}}` };
    case "tauxB":
      return { texte: [tx("Ici :")], latex: `1+${IA}=${decimalL(1 + e.tauxB / 100)}^{${e.kB}}` };
    case "choix":
      return { texte: [tx("Compare les deux taux annuels que tu as calculés ; des taux de périodes différentes ne se comparent qu'une fois ramenés à la même période.")] };
    case "brut":
      return { texte: [tx("Ici :")], latex: `I_{\\text{brut}}=${montantL(e.C0)}\\cdot ${decimalL(e.taux / 100)}` };
    case "net":
      return { texte: [tx(`Ici, on garde ${100 - e.precompte} % de l'intérêt brut :`)], latex: `I_{\\text{net}}=I_{\\text{brut}}\\cdot ${decimalL(1 - e.precompte / 100)}` };
    case "tauxNet":
      return { texte: [tx("Ici :")], latex: `i_{\\text{net}}=${pourcentL(e.taux)}\\cdot ${decimalL(1 - e.precompte / 100)}` };
    case "valeur":
      return { texte: [tx("Ici :")], latex: `V=${montantL(e.C0)}\\cdot ${decimalL(1 - e.taux / 100)}^{${e.duree}}` };
  }
}

export function messageIllisible(_e: E, p: P): string {
  return p === "brut" || p === "net" || p === "valeur" ? MESSAGE_MONTANT : MESSAGE_TAUX;
}

export function explicationChoix(e: E, p: P): string {
  if (p === "choix") return `Taux annuels équivalents : A ≈ ${nL(annuelDe(e.k, e.taux), 2).replace("{,}", ",")} %, B ≈ ${nL(annuelDe(e.kB, e.tauxB), 2).replace("{,}", ",")} %.`;
  if (e.variante === "depreciation") return "Chaque mois, la valeur est multipliée par 1 − d ; sur douze mois, par (1 − d)¹².";
  if (e.variante === "longuePeriode") return "Les facteurs annuels se multiplient : sur N ans, la grandeur est multipliée par le facteur annuel à la puissance N.";
  return "Un an, c'est k périodes : le facteur annuel est le facteur périodique à la puissance k.";
}

/* ----------------------------------------------------------------------------------------------
 * Vérification
 * -------------------------------------------------------------------------------------------- */

const CHOIX: P[] = ["relation", "choix"];

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  if (CHOIX.includes(p)) return [s === BONNE ? "correct" : "not_equivalent"];
  if (p === "brut") return [statutMontant(s, [interetBrut(e)])];
  if (p === "net") return [statutMontant(s, [interetNet(e)])];
  if (p === "valeur") return [statutMontant(s, [valeurDepreciee(e)])];
  const { valeur, dec } = tauxAttendu(e, p);
  return [statutTaux(s, [valeur], tol(dec))];
}

export function approchee(e: E, p: P, v: string[]): string | null {
  const s = v[0] ?? "";
  if (CHOIX.includes(p)) return null;
  if (p === "brut") return tropArrondi(s, [interetBrut(e)], 2, TOL_CENTIME, "au centime");
  if (p === "net") return tropArrondi(s, [interetNet(e)], 2, TOL_CENTIME, "au centime");
  if (p === "valeur") return tropArrondi(s, [valeurDepreciee(e)], 2, TOL_CENTIME, "au centime");
  const { valeur, dec } = tauxAttendu(e, p);
  return tropArrondi(s, [valeur], dec, tol(dec), dec === 2 ? "au centième (en %)" : "au millième (en %)");
}

export function piege(e: E, p: P, v: string[]): Frag[] | null {
  const s = v[0] ?? "";
  if (!CHOIX.includes(p) && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const x = lireNombre(s);
  if (x === null && !CHOIX.includes(p)) return null;
  const pres = (c: number, t = 0.011) => x !== null && Math.abs(x - c) <= t;
  switch (p) {
    case "taux":
    case "tauxA":
    case "tauxB": {
      const [k, t] = p === "tauxB" ? [e.kB, e.tauxB] : [e.k, e.taux];
      if (e.variante === "versAnnuel" || p === "tauxA" || p === "tauxB") {
        if (pres(k * t)) return [tx("Multiplier le taux périodique par le nombre de périodes ne donne pas le taux équivalent : les intérêts sont composés, il faut une puissance.")];
        if (pres(100 * facteurAnnuelBrut(k, t), 0.02)) return [tx("Retire 1 au facteur annuel : "), lx("(1+i)^k"), tx(" est le facteur, pas le taux.")];
      }
      if (e.variante === "depuisAnnuel") {
        if (pres(e.taux / e.k, 0.0011)) return [tx("Diviser le taux annuel par le nombre de périodes ne donne pas le taux équivalent : prends la racine k-ième de "), lx(`1+${IA}`), tx(".")];
        if (pres(100 * Math.pow(1 + e.taux / 100, 1 / e.k), 0.002)) return [tx("Retire 1 : la racine donne le facteur périodique, pas le taux.")];
      }
      if (e.variante === "depreciation") {
        if (pres(12 * e.taux)) return [tx("Douze baisses successives ne s'additionnent pas : chaque baisse porte sur une valeur déjà diminuée.")];
        if (pres(100 * Math.pow(1 - e.taux / 100, 12), 0.02)) return [tx("C'est la part de valeur qui reste : le taux de dépréciation est ce qui est perdu (100 % moins ce nombre).")];
        if (pres(annuelDe(12, e.taux))) return [tx("C'est un taux de hausse : pour une baisse, le facteur mensuel est "), lx("1-d"), tx(".")];
      }
      if (e.variante === "longuePeriode") {
        if (pres(e.taux / e.duree)) return [tx("Diviser l'évolution totale par le nombre d'années, c'est oublier que les évolutions annuelles se composent.")];
      }
      return null;
    }
    case "tauxNet":
      if (pres(e.taux - e.precompte, 0.0011)) return [tx("Le précompte est un pourcentage des intérêts, pas un nombre de points à retirer du taux.")];
      if (pres((e.taux * e.precompte) / 100, 0.0011)) return [tx("C'est la part retenue par le précompte : le taux net est ce qui reste.")];
      return null;
    case "net":
      if (pres((interetBrut(e) * e.precompte) / 100)) return [tx("C'est le montant du précompte : l'intérêt net est ce qui reste après l'avoir retenu.")];
      return null;
    case "valeur":
      if (pres(e.C0 * (1 - (e.duree * e.taux) / 100))) return [tx("Les baisses mensuelles ne s'additionnent pas : multiplie par "), lx("1-d"), tx(" chaque mois (suite géométrique).")];
      if (pres(e.C0 - valeurDepreciee(e))) return [tx("C'est la perte de valeur : on demande la valeur restante.")];
      return null;
    default:
      return null;
  }
}

const facteurAnnuelBrut = (k: number, t: number) => Math.pow(1 + t / 100, k);
