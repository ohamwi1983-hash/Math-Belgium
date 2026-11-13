import type { ExerciceProblemesFonctionsReference, SensQuestion } from "../core/problemesFonctionsReference.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { decrireProbleme, ensembleLatex, morceauLatex, nombreLatex, type StatutQuestion } from "../moteur/problemesFonctionsReference";

/**
 * Textes de gen68 (énoncé, consignes des 4 écrans, aides, choix d'interprétation, messages ciblés)
 * — sources uniques partagées par l'appli et l'adaptateur papier. Prose en texte, formules en
 * LaTeX (jamais de notation clavier), « − » typographique, virgule décimale.
 */

/** Espace insécable entre un nombre et son unité (« 21 °C », « 2 h 30 min ») : jamais coupés en fin
 * de ligne. */
export function insecables(texte: string): string {
  return texte.replace(/(\d) (?=°C|km|m²|m\b|dm|L\b|cm|€|h\b|min\b)/g, "$1\u00a0").replace(/(\d\u00a0h) (?=\d)/g, "$1\u00a0");
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur: insecables(valeur) });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

type E = ExerciceProblemesFonctionsReference;

/** « 1 h 30 min », « 2 h », « 45 min ». */
export function dureeTexte(e: E): string {
  const h = e.p.heures!;
  const mi = e.p.minutes!;
  if (h === 0) return `${mi}\u00a0min`;
  return mi === 0 ? `${h}\u00a0h` : `${h}\u00a0h\u00a0${mi}\u00a0min`;
}

const QUANTITE: Record<SensQuestion, string> = { "<": "moins de", "≤": "au plus", ">": "plus de", "≥": "au moins" };
const COMPARATIF: Record<SensQuestion, string> = {
  "<": "strictement inférieur à",
  "≤": "inférieur ou égal à",
  ">": "strictement supérieur à",
  "≥": "supérieur ou égal à",
};

export function fonctionLatex(e: E): string {
  const d = decrireProbleme(e);
  return `${d.nomFonction}(${d.variable})`;
}

/** Libellé du champ de l'écran 1 (« t(v) = »), texte simple. */
export function libelleChampFonction(e: E): string {
  const d = decrireProbleme(e);
  return `${d.nomFonction}(${d.variable}) =`;
}

/** Exemple de saisie HORS tirage (forme d'une autre famille ou valeurs absentes des données). */
export function placeholderFonction(e: E): string {
  switch (e.famille) {
    case "trajet":
      return "ex : 7/(v+1)";
    case "potager":
      return "ex : rac(A+1)";
    case "aquarium":
      return "ex : rac3(V+1)";
    case "thermostat":
      return "ex : |T+1|";
    case "location":
      return "ex : 7/(x+1)";
    case "plaque":
      return "ex : (c+1)²";
  }
}

export function enonceFragments(e: E): FragmentConsigne[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        t(`Un automobiliste doit parcourir ${p.d} km sur une route où la vitesse est limitée à ${p.vmax} km/h, limitation qu'il respecte. On note `),
        l("v"),
        t(" sa vitesse moyenne (en km/h) et "),
        l("t(v)"),
        t(" la durée du trajet (en heures)."),
      ];
    case "potager":
      return [
        t(`On dispose d'une parcelle carrée de ${p.amax} m² pour y aménager un potager carré. On note `),
        l("A"),
        t(" l'aire du potager (en m²) et "),
        l("c(A)"),
        t(" la longueur de son côté (en m)."),
      ];
    case "aquarium":
      return [
        t(`Un fabricant produit des aquariums cubiques d'un volume de ${p.vmax} L au maximum. On note `),
        l("V"),
        t(" le volume d'un aquarium (en dm³, sachant que 1 dm³ = 1 L) et "),
        l("a(V)"),
        t(" la longueur de son arête (en dm)."),
      ];
    case "thermostat":
      return [
        t(`Le thermostat d'une salle de sport se règle de 10 °C à 30 °C (bornes comprises) ; la température conseillée est ${p.consigne} °C. On note `),
        l("T"),
        t(" la température réglée (en °C) et "),
        l("E(T)"),
        t(" son écart à la température conseillée (en °C)."),
      ];
    case "location":
      return [
        t(`Une entreprise loue une machine : ${p.forfait} € de forfait, puis ${p.prixHeure} € par heure d'utilisation, facturée à la minute près. On note `),
        l("x"),
        t(" la durée de location (en heures) et "),
        l("C(x)"),
        t(" le coût horaire moyen (en €/h), c'est-à-dire le coût total divisé par la durée."),
      ];
    case "plaque":
      return [
        t(`Dans une plaque carrée de ${p.cote} cm de côté, on découpe un carré de côté `),
        l("c"),
        t(" (en cm). On note "),
        l("A(c)"),
        t(" l'aire du carré découpé (en cm²)."),
      ];
  }
}

export function consigneFonction(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  return [t("Exprime "), l(fonctionLatex(e)), t(" en fonction de "), l(d.variable), t(".")];
}

export function consigneDomaine(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  return [t("Quelles valeurs de "), l(d.variable), t(" ont un sens dans cette situation ?")];
}

/** La question concrète du problème (sans la consigne de réponse). */
export function questionConcrete(e: E): FragmentConsigne[] {
  const p = e.p;
  const q = QUANTITE[e.sens];
  switch (e.famille) {
    case "trajet":
      return [t(`À quelles vitesses moyennes l'automobiliste peut-il rouler pour que le trajet dure ${q} ${dureeTexte(e)} ?`)];
    case "potager":
      return [t(`Pour quelles aires le côté du potager mesure-t-il ${q} ${p.k} m ?`)];
    case "aquarium":
      return [t(`Pour quels volumes l'arête de l'aquarium mesure-t-elle ${q} ${p.k} dm ?`)];
    case "thermostat":
      return [t(`Pour quelles températures réglées l'écart à la température conseillée est-il ${COMPARATIF[e.sens]} ${p.k} °C ?`)];
    case "location":
      return [t(`Pour quelles durées de location le coût horaire moyen est-il ${COMPARATIF[e.sens]} ${p.seuil} € ?`)];
    case "plaque":
      return [t("Pour quelles longueurs "), l("c"), t(` l'aire du carré découpé vaut-elle ${q} ${p.k! * p.k!} cm² ?`)];
  }
}

export function consigneQuestion(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  return [...questionConcrete(e), t(" Donne l'ensemble des valeurs de "), l(d.variable), t(" qui conviennent.")];
}

export function questionInterpretation(e: E): FragmentConsigne[] {
  const c = e.p.consigne;
  switch (e.famille) {
    case "trajet":
      return [t("Si l'automobiliste roule deux fois plus vite, que devient la durée du trajet ?")];
    case "potager":
      return [t("Si on multiplie l'aire du potager par 4, que devient la longueur de son côté ?")];
    case "aquarium":
      return [t("Si on multiplie le volume de l'aquarium par 8, que devient la longueur de son arête ?")];
    case "thermostat":
      return [t(`Que peut-on dire des écarts des températures ${c! - 2} °C et ${c! + 2} °C à la température conseillée ?`)];
    case "location":
      return [t("Que devient le coût horaire moyen quand la durée de location devient très grande ?")];
    case "plaque":
      return [t("Si on double le côté du carré découpé, que devient son aire ?")];
  }
}

/** Les 4 interprétations proposées — la première est la bonne (l'ordre affiché vient de
 * `ordreInterpretation`). */
export function optionsInterpretation(e: E): string[] {
  return optionsBrutes(e).map(insecables);
}

function optionsBrutes(e: E): string[] {
  const c = e.p.consigne!;
  switch (e.famille) {
    case "trajet":
      return ["Elle est divisée par 2.", "Elle est multipliée par 2.", "Elle diminue de 2 heures.", "Elle est divisée par 4."];
    case "potager":
      return ["Elle est multipliée par 2.", "Elle est multipliée par 4.", "Elle est multipliée par 16.", "Elle augmente de 2 m."];
    case "aquarium":
      return ["Elle est multipliée par 2.", "Elle est multipliée par 8.", "Elle est multipliée par 4.", "Elle augmente de 2 dm."];
    case "thermostat":
      return ["Ils sont égaux.", `Celui de ${c + 2} °C est le plus grand.`, "Ils sont opposés : −2 °C et 2 °C.", "Ils se compensent : leur somme est nulle."];
    case "location":
      return [`Il se rapproche de ${e.p.prixHeure} € sans jamais l'atteindre.`, `Il finit par valoir exactement ${e.p.prixHeure} €.`, "Il se rapproche de 0 €.", "Il augmente sans limite."];
    case "plaque":
      return ["Elle est multipliée par 4.", "Elle est multipliée par 2.", "Elle augmente de 4 cm².", "Elle est multipliée par 8."];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (niveaux successifs, jamais la réponse)
// ---------------------------------------------------------------------------------------------

export function aidesFonction(e: E): FragmentConsigne[][] {
  switch (e.famille) {
    case "trajet":
      return [
        [t("Durée, distance et vitesse moyenne sont liées : la durée s'obtient en divisant la distance par la vitesse moyenne.")],
        [t("Ici la distance est fixe : la durée est de la forme "), l("\\dfrac{k}{v}"), t(", une fonction de référence inverse.")],
      ];
    case "potager":
      return [
        [t("Un carré de côté "), l("c"), t(" a pour aire "), l("A = c^2"), t(".")],
        [t("Il faut retrouver le côté à partir de l'aire : cherche l'opération qui défait l'élévation au carré pour un nombre positif.")],
      ];
    case "aquarium":
      return [
        [t("Un cube d'arête "), l("a"), t(" a pour volume "), l("V = a^3"), t(".")],
        [t("Il faut retrouver l'arête à partir du volume : cherche l'opération qui défait l'élévation au cube.")],
      ];
    case "thermostat":
      return [
        [t("L'écart entre deux températures est la distance qui les sépare : il est toujours positif ou nul.")],
        [t("La distance entre deux nombres "), l("p"), t(" et "), l("q"), t(" s'écrit "), l("|p - q|"), t(".")],
      ];
    case "location":
      return [
        [t("Coût total pour "), l("x"), t(" heures : le forfait, plus le prix d'une heure multiplié par "), l("x"), t(".")],
        [t("Le coût horaire moyen est ce coût total divisé par "), l("x"), t(" ; sépare ensuite la fraction en deux termes.")],
      ];
    case "plaque":
      return [
        [t("L'aire d'un carré est le produit de son côté par lui-même.")],
        [t("Écris ce produit avec un exposant : c'est une fonction de référence.")],
      ];
  }
}

export function aidesDomaine(e: E): FragmentConsigne[][] {
  const d = decrireProbleme(e);
  const niveau1 = [t("Le domaine algébrique (là où "), l(d.expressionLatex), t(" existe) ne suffit pas : ne garde que les valeurs qui ont un sens concret.")];
  const niveau2: Record<E["famille"], string> = {
    trajet: "Une vitesse moyenne nulle ou négative n'a pas de sens pour un trajet, et l'énoncé fixe une vitesse maximale.",
    potager: "Un potager a une aire strictement positive, et il doit tenir dans la parcelle : regarde l'aire de la parcelle, pas son côté.",
    aquarium: "Un aquarium a un volume strictement positif, et l'énoncé fixe un volume maximal, pas une arête maximale.",
    thermostat: "La température réglée ne peut prendre que les valeurs permises par le thermostat.",
    location: "Une durée de location est strictement positive ; rien ne la limite vers le haut, et elle n'est pas forcément entière.",
    plaque: "Le côté du carré découpé est strictement positif et ne peut pas dépasser le côté de la plaque.",
  };
  return [niveau1, [t(niveau2[e.famille])]];
}

export function aidesQuestion(e: E): FragmentConsigne[][] {
  const d = decrireProbleme(e);
  const p = e.p;
  const auDessus = e.sens === ">" || e.sens === "≥";
  const niveau1 = [t("Traduis la question par une inéquation portant sur "), l(fonctionLatex(e)), t(", puis résous-la.")];
  const debut = [t("Inéquation à résoudre : "), l(d.inequationLatex)];
  let methode: FragmentConsigne[];
  switch (e.famille) {
    case "trajet":
      methode = [t(". Comme "), l("v > 0"), t(", tu peux multiplier les deux membres par "), l("v"), t(" sans changer le sens de l'inégalité.")];
      break;
    case "location":
      methode = [t(". Soustrais d'abord "), l(String(p.prixHeure)), t(" ; comme "), l("x > 0"), t(", tu peux ensuite multiplier par "), l("x"), t(" sans changer le sens.")];
      break;
    case "potager":
      methode = [t(". Les deux membres sont positifs : tu peux les élever au carré sans changer le sens de l'inégalité.")];
      break;
    case "aquarium":
      methode = [t(". La fonction cube est croissante : tu peux élever les deux membres au cube sans changer le sens de l'inégalité.")];
      break;
    case "thermostat":
      methode = auDessus
        ? [t(". Les températures qui conviennent sont loin de "), l(String(p.consigne)), t(", d'un côté ou de l'autre : la réponse a deux morceaux.")]
        : [t(". Les températures qui conviennent sont proches de "), l(String(p.consigne)), t(", de part et d'autre de cette valeur.")];
      break;
    case "plaque":
      methode = [t(". Sur "), l("\\mathbb{R}"), t(", ses solutions sont symétriques par rapport à 0.")];
      break;
  }
  const niveau3 = [t("Ne garde que les valeurs du domaine imposé par la situation : "), l(morceauLatex(d.domaineContexte)), t(".")];
  return [niveau1, [...debut, ...methode], niveau3];
}

export function aidesInterpretation(e: E): FragmentConsigne[][] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        [t("Compare "), l("t(v)"), t(" et "), l("t(2v)"), t(".")],
        [l(`t(2v) = \\dfrac{${p.d}}{2v}`), t(" : compare cette fraction à "), l(`\\dfrac{${p.d}}{v}`), t(".")],
      ];
    case "potager":
      return [
        [t("Compare "), l("c(A)"), t(" et "), l("c(4A)"), t(".")],
        [l("c(4A) = \\sqrt{4A} = \\sqrt{4} \\cdot \\sqrt{A}")],
      ];
    case "aquarium":
      return [
        [t("Compare "), l("a(V)"), t(" et "), l("a(8V)"), t(".")],
        [l("a(8V) = \\sqrt[3]{8V} = \\sqrt[3]{8} \\cdot \\sqrt[3]{V}")],
      ];
    case "thermostat": {
      const c = p.consigne!;
      return [
        [t("Calcule l'écart pour chacune des deux températures.")],
        [l(`E(${c - 2}) = |${c - 2} - ${c}|`), t(" et "), l(`E(${c + 2}) = |${c + 2} - ${c}|`)],
      ];
    }
    case "location":
      return [
        [t("Calcule le coût horaire moyen pour de grandes durées, par exemple "), l("x = 100"), t(" puis "), l("x = 1000"), t(".")],
        [t("Quand "), l("x"), t(" devient très grand, "), l(`\\dfrac{${p.forfait}}{x}`), t(" se rapproche de 0 tout en restant strictement positif.")],
      ];
    case "plaque":
      return [
        [t("Compare "), l("A(c)"), t(" et "), l("A(2c)"), t(".")],
        [l("A(2c) = (2c)^2 = 2^2 \\cdot c^2")],
      ];
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues et messages
// ---------------------------------------------------------------------------------------------

export function fonctionAttendueLatex(e: E): string {
  return `${fonctionLatex(e)} = ${decrireProbleme(e).expressionLatex}`;
}

export function domaineAttenduLatex(e: E): string {
  return decrireProbleme(e).optionsDomaine[0]!;
}

export function solutionAttendueLatex(e: E): string {
  return ensembleLatex(decrireProbleme(e).solution);
}

/** Message d'un écran 3 refusé : piège ciblé (crochets, domaine du contexte, sens, unité), jamais
 * la réponse. */
export function messageQuestion(statut: StatutQuestion, e: E): string {
  switch (statut) {
    case "crochets":
      return "Les bornes sont justes : vérifie si chacune est comprise ou non (inégalité stricte ou large, domaine).";
    case "hors_contexte":
      return "Ta réponse contient des valeurs qui n'ont pas de sens dans cette situation : garde seulement celles du domaine.";
    case "sens":
      return "Ta réponse donne exactement les valeurs qui ne conviennent pas : vérifie le sens de l'inégalité.";
    case "unite": {
      const h = e.p.heures!;
      const mi = e.p.minutes!;
      return `Attention aux unités : ${dureeTexte(e)} ne vaut pas ${h},${String(mi).padStart(2, "0")} h.`;
    }
    default:
      return "Ce n'est pas le bon ensemble.";
  }
}

/** Durée en heures écrite en LaTeX (« 1{,}5 »). */
export function dureeLatex(e: E): string {
  return nombreLatex(e.p.heures! + e.p.minutes! / 60);
}
