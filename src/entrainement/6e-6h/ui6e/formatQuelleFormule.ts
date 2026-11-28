import type { Exercice100, Phase100, Type100 } from "../core6e/quelleFormule";
import { REPONSES_100, estCollier, phases100, valeur100 } from "../core6e/quelleFormule";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { AL, CL, GL, mil, multinomialeLatex } from "./nombresCombinatoireLotH";
import { descriptionLettres } from "../core6e/motsLotH";

/**
 * Couche C — textes de `6gen100` « Quelle formule ? Reconnaître le groupement » : situation, trois
 * questions du cours (choix fermés oui / non), type parmi les sept lignes du tableau (choix fermé),
 * calcul (champ libre). Raisons et « tests » par contexte : la raison sert au message d'un choix faux
 * et au corrigé, le test à l'aide de niveau 2 (posée pour l'instance, jamais la réponse). Notation
 * du cours : Aₙᵖ, Cₙᵖ, Pₙ = n!, Bₙᵖ = nᵖ, Γₙᵖ, n!/(n₁!…nₖ!), (n − 1)!.
 */

type E = Exercice100;
type P = Phase100;
const t = tx;
const l = lx;

const COURS = "(cours, point 1)";
const COURS_MULTI = "(cours, point 2)";

const MATIERES = ["natation", "tennis", "escalade"];
const COULEURS = ["rouges", "bleues", "vertes"];
const RESULTATS = ["victoires", "matchs nuls", "défaites"];

/** Situation (avec la question), sans la consigne globale. */
export function situation100(e: E): Frag[] {
  const ef = e.effectifs ?? [];
  switch (e.contexte) {
    case "podium":
      return [t(`${e.n} coureurs participent à une course. Combien de podiums différents (un premier, un deuxième et un troisième) sont possibles ?`)];
    case "bureau":
      return e.p === 2
        ? [t(`Un club de ${e.n} membres élit un président et un trésorier, deux personnes différentes. Combien de bureaux différents sont possibles ?`)]
        : [t(`Un club de ${e.n} membres élit un président, un secrétaire et un trésorier, trois personnes différentes. Combien de bureaux différents sont possibles ?`)];
    case "codeDistinct":
      return [t(`Un cadenas s'ouvre avec un code de ${e.p} chiffres (de 0 à 9) tous différents. Combien de codes différents existe-t-il ?`)];
    case "comite":
      return [t(`Dans une classe de ${e.n} élèves, on choisit ${e.p} élèves pour former un comité, sans rôle particulier. Combien de comités différents peut-on former ?`)];
    case "cartes":
      return [t(`On tire ${e.p} cartes d'un coup dans un jeu de 32 cartes. Combien de mains différentes peut-on obtenir ?`)];
    case "pizza":
      return [t(`Une pizzeria propose ${e.n} garnitures. Tu choisis ${e.p} garnitures différentes pour ta pizza. Combien de pizzas différentes peux-tu composer ?`)];
    case "poignees":
      return [t(`${e.n} personnes se rencontrent et chacune serre une fois la main de chacune des autres. Combien de poignées de main sont échangées ?`)];
    case "livres":
      return [t(`Tu ranges ${e.n} livres différents côte à côte sur une étagère. De combien de façons peux-tu les ranger ?`)];
    case "oral":
      return [t(`${e.n} élèves passent un oral l'un après l'autre. Combien d'ordres de passage différents sont possibles ?`)];
    case "photo":
      return [t(`${e.n} amis s'alignent côte à côte pour une photo. Combien de photos différentes peut-on prendre ?`)];
    case "pin":
      return [t(`Un téléphone se déverrouille avec un code de ${e.p} chiffres (de 0 à 9) ; un chiffre peut revenir plusieurs fois. Combien de codes différents existe-t-il ?`)];
    case "motsLettres":
      return [t(`Avec les ${e.n} lettres ${"ABCDEF".slice(0, e.n).split("").join(", ")}, on écrit des mots de ${e.p} lettres (ayant un sens ou non) ; une lettre peut être utilisée plusieurs fois. Combien de mots différents peut-on écrire ?`)];
    case "urneRemise":
      return [t(`Une urne contient ${e.n} boules numérotées de 1 à ${e.n}. On tire ${e.p} boules une à une, en remettant chaque boule dans l'urne, et on note les numéros dans l'ordre du tirage. Combien de résultats différents peut-on noter ?`)];
    case "glaces":
      return [t(`Un glacier propose ${e.n} parfums. Tu commandes une coupe de ${e.p} boules ; plusieurs boules peuvent être du même parfum, et l'ordre des boules dans la coupe ne compte pas. Combien de coupes différentes peux-tu commander ?`)];
    case "dominos":
      return [t(`Un domino porte deux nombres choisis de 0 à ${e.n - 1} (les deux nombres peuvent être égaux : c'est un double ; le domino 2-5 est le même que le domino 5-2). Combien de dominos différents peut-on fabriquer ?`)];
    case "desIdentiques":
      return [t(`On lance ensemble ${e.p} dés à 6 faces identiques, qu'on ne peut pas distinguer : on note seulement quelles faces sont sorties, et combien de fois chacune. Combien de résultats différents peut-on noter ?`)];
    case "mot":
      return [t(`Combien de mots différents (ayant un sens ou non, le mot ${e.mot} compris) peut-on écrire en utilisant une fois chacune toutes les lettres du mot ${e.mot} ?`)];
    case "boules":
      return [t(`On aligne ${ef[0]} boules ${COULEURS[0]}, ${ef[1]} boules ${COULEURS[1]} et ${ef[2]} boules ${COULEURS[2]} ; deux boules de même couleur sont identiques. Combien d'alignements différents peut-on obtenir ?`)];
    case "groupes":
      return [t(`${e.n} élèves sont répartis en trois groupes : ${ef[0]} en ${MATIERES[0]}, ${ef[1]} en ${MATIERES[1]} et ${ef[2]} en ${MATIERES[2]}. Combien de répartitions différentes sont possibles ?`)];
    case "saison":
      return [t(`Une équipe a joué ${e.n} matchs : ${ef[0]} ${RESULTATS[0]}, ${ef[1]} ${RESULTATS[1]} et ${ef[2]} ${RESULTATS[2]}. Combien de suites de résultats différentes (dans l'ordre des matchs) ont pu donner ce bilan ?`)];
    case "table":
      return [t(`${e.n} personnes s'installent autour d'une table ronde. Deux dispositions sont les mêmes si chacun a les mêmes voisins (l'une se déduit de l'autre en tournant). Combien de dispositions différentes sont possibles ?`)];
    case "bracelet":
      return [t(`On enfile ${e.n} perles toutes différentes sur un fil qu'on ferme pour faire un bracelet ; le bracelet peut être tourné et retourné. Combien de bracelets différents peut-on fabriquer ?`)];
    case "ronde":
      return [t(`${e.n} enfants forment une ronde en se donnant la main. Deux rondes sont les mêmes si chaque enfant a les mêmes voisins à sa gauche et à sa droite. Combien de rondes différentes sont possibles ?`)];
  }
}

/** Raisons (message d'un choix faux, corrigé) : ordre, répétition, tous utilisés. */
export function raisons100(e: E): { ordre: string; repetition: string; tous: string } {
  const ef = e.effectifs ?? [];
  switch (e.contexte) {
    case "podium":
      return { ordre: "Oui : échanger le premier et le deuxième donne un autre podium.", repetition: "Non : un coureur ne peut pas occuper deux places du podium.", tous: `Non : on ne place que 3 coureurs sur ${e.n}.` };
    case "bureau":
      return { ordre: "Oui : les postes sont différents ; échanger le président et le trésorier donne un autre bureau.", repetition: "Non : une même personne n'occupe pas deux postes.", tous: `Non : on ne choisit que ${e.p} membres sur ${e.n}.` };
    case "codeDistinct":
      return { ordre: "Oui : 1-2-3 et 3-2-1 sont deux codes différents.", repetition: "Non : les chiffres du code sont tous différents.", tous: `Non : on n'utilise que ${e.p} chiffres sur 10.` };
    case "comite":
      return { ordre: "Non : sans rôle particulier, échanger deux élèves choisis donne le même comité.", repetition: "Non : un élève ne peut pas être choisi deux fois.", tous: "" };
    case "cartes":
      return { ordre: "Non : une main est la même quel que soit l'ordre dans lequel on tient les cartes.", repetition: "Non : une carte ne peut pas être tirée deux fois.", tous: "" };
    case "pizza":
      return { ordre: "Non : l'ordre des garnitures ne change pas la pizza.", repetition: "Non : les garnitures choisies sont différentes.", tous: "" };
    case "poignees":
      return { ordre: "Non : « A serre la main de B » et « B serre la main de A » sont la même poignée de main.", repetition: "Non : on ne se serre pas la main à soi-même ; une poignée de main relie deux personnes différentes.", tous: "" };
    case "livres":
      return { ordre: "Oui : échanger deux livres donne un autre rangement.", repetition: "Non : chaque livre n'est placé qu'une fois.", tous: `Oui : on range les ${e.n} livres.` };
    case "oral":
      return { ordre: "Oui : échanger deux élèves change l'ordre de passage.", repetition: "Non : chaque élève passe une seule fois.", tous: `Oui : les ${e.n} élèves passent.` };
    case "photo":
      return { ordre: "Oui : échanger deux amis donne une autre photo.", repetition: "Non : chaque ami est à une seule place.", tous: `Oui : les ${e.n} amis sont sur la photo.` };
    case "pin":
      return { ordre: "Oui : 1-2-3 et 3-2-1 sont deux codes différents.", repetition: "Oui : un chiffre peut revenir plusieurs fois.", tous: `Non : le code a ${e.p} chiffres, choisis parmi les 10 possibles.` };
    case "motsLettres":
      return { ordre: "Oui : ABC et CBA sont deux mots différents.", repetition: "Oui : une lettre peut être utilisée plusieurs fois.", tous: `Non : un mot a ${e.p} lettres, choisies parmi les ${e.n} disponibles.` };
    case "urneRemise":
      return { ordre: "Oui : on note les numéros dans l'ordre du tirage.", repetition: "Oui : la boule est remise, elle peut ressortir.", tous: `Non : on tire ${e.p} fois, parmi ${e.n} numéros.` };
    case "glaces":
      return { ordre: "Non : l'ordre des boules dans la coupe ne compte pas.", repetition: "Oui : plusieurs boules peuvent être du même parfum.", tous: "" };
    case "dominos":
      return { ordre: "Non : le domino 2-5 est le même que le domino 5-2.", repetition: "Oui : les doubles (deux nombres égaux) existent.", tous: "" };
    case "desIdentiques":
      return { ordre: "Non : les dés sont identiques, on ne peut pas dire lequel est « le premier ».", repetition: "Oui : plusieurs dés peuvent montrer la même face.", tous: "" };
    case "mot":
      return { ordre: "Oui : changer l'ordre des lettres change le mot.", repetition: `Oui : certaines lettres reviennent plusieurs fois (${descriptionLettres(e.mot ?? "")}).`, tous: "Oui : on utilise toutes les lettres du mot." };
    case "boules":
      return { ordre: "Oui : échanger une boule rouge et une boule bleue donne un autre alignement.", repetition: "Oui : une même couleur revient plusieurs fois (les boules de même couleur sont identiques).", tous: `Oui : on aligne les ${e.n} boules.` };
    case "groupes":
      return {
        ordre: "Oui : écris, pour chaque élève de la liste de classe, le nom de son groupe ; échanger deux élèves de groupes différents donne une autre répartition.",
        repetition: `Oui : dans cette liste, chaque nom de groupe revient plusieurs fois (${ef.join(", ")} fois).`,
        tous: `Oui : les ${e.n} élèves sont tous placés.`,
      };
    case "saison":
      return { ordre: "Oui : on regarde la suite des résultats dans l'ordre des matchs.", repetition: "Oui : un même résultat (victoire, nul, défaite) revient plusieurs fois.", tous: `Oui : les ${e.n} résultats du bilan sont tous placés.` };
    case "table":
      return { ordre: "Oui : qui est à côté de qui change la disposition.", repetition: "Non : chaque personne n'a qu'une place.", tous: `Oui : les ${e.n} personnes sont assises.` };
    case "bracelet":
      return { ordre: "Oui : l'ordre des perles autour du fil change le bracelet.", repetition: "Non : les perles sont toutes différentes, chacune est utilisée une fois.", tous: `Oui : les ${e.n} perles sont enfilées.` };
    case "ronde":
      return { ordre: "Oui : qui donne la main à qui change la ronde.", repetition: "Non : chaque enfant n'a qu'une place.", tous: `Oui : les ${e.n} enfants sont dans la ronde.` };
  }
}

/** Tests posés pour l'instance (aide de niveau 2), une question concrète par écran. */
function tests100(e: E): { ordre: string; repetition: string; tous: string } {
  switch (e.contexte) {
    case "podium":
      return { ordre: "Le podium (Léa 1re, Malik 2e, Inès 3e) est-il le même que (Malik 1er, Léa 2e, Inès 3e) ?", repetition: "Un même coureur peut-il être à la fois premier et deuxième ?", tous: `Combien de coureurs monte-t-on sur le podium, sur les ${e.n} ?` };
    case "bureau":
      return { ordre: "Le bureau (Anna présidente, Bilal trésorier) est-il le même que (Bilal président, Anna trésorière) ?", repetition: "Une même personne peut-elle occuper deux postes ?", tous: `Combien de membres choisit-on, sur les ${e.n} ?` };
    case "codeDistinct":
    case "pin":
      return { ordre: "Le code 1-2-3 est-il le même que le code 3-2-1 ?", repetition: "Le code 7-7-1 est-il permis ?", tous: `Combien de chiffres a le code, et combien de chiffres différents existe-t-il ?` };
    case "comite":
      return { ordre: "Le comité {Anna, Bilal} est-il le même que {Bilal, Anna} ?", repetition: "Un élève peut-il occuper deux places du comité ?", tous: "" };
    case "cartes":
      return { ordre: "La main (as de cœur, roi de pique) est-elle la même que (roi de pique, as de cœur) ?", repetition: "Peut-on tirer deux fois la même carte ?", tous: "" };
    case "pizza":
      return { ordre: "La pizza « jambon puis olives » est-elle la même que « olives puis jambon » ?", repetition: "Peut-on choisir deux fois la même garniture ?", tous: "" };
    case "poignees":
      return { ordre: "Combien de poignées de main y a-t-il entre Anna et Bilal : une ou deux ?", repetition: "Peut-on se serrer la main à soi-même ?", tous: "" };
    case "livres":
    case "oral":
    case "photo":
      return { ordre: "Si on échange les deux premiers, obtient-on le même résultat ?", repetition: "Quelqu'un (ou un livre) peut-il apparaître deux fois ?", tous: "Laisse-t-on quelqu'un (ou un livre) de côté ?" };
    case "motsLettres":
      return { ordre: "Les mots ABC et CBA sont-ils les mêmes ?", repetition: "Le mot AAB est-il permis ?", tous: `Combien de lettres a un mot, et combien de lettres sont disponibles ?` };
    case "urneRemise":
      return { ordre: "Le tirage 1-2-3 est-il le même que 3-2-1, si on note l'ordre du tirage ?", repetition: "Le numéro 4 peut-il sortir deux fois ?", tous: "Combien de tirages fait-on, et combien y a-t-il de numéros ?" };
    case "glaces":
      return { ordre: "La coupe « vanille, fraise » est-elle la même que « fraise, vanille » ?", repetition: "La coupe « vanille, vanille » est-elle permise ?", tous: "" };
    case "dominos":
      return { ordre: "Le domino 2-5 est-il différent du domino 5-2 ?", repetition: "Le domino 3-3 existe-t-il ?", tous: "" };
    case "desIdentiques":
      return { ordre: "Peut-on dire quel dé est sorti en premier ?", repetition: "Deux dés peuvent-ils montrer le même nombre ?", tous: "" };
    case "mot":
      return { ordre: "Échanger deux lettres différentes du mot donne-t-il le même mot ?", repetition: "Une même lettre apparaît-elle plusieurs fois ?", tous: "Laisse-t-on des lettres de côté ?" };
    case "boules":
      return { ordre: "Échanger une boule rouge et une boule bleue donne-t-il le même alignement ?", repetition: "Une même couleur apparaît-elle plusieurs fois ?", tous: "Laisse-t-on des boules de côté ?" };
    case "groupes":
      return { ordre: "Écris pour chaque élève le nom de son groupe : échanger deux élèves de groupes différents donne-t-il la même répartition ?", repetition: "Dans cette liste, un même nom de groupe revient-il plusieurs fois ?", tous: "Laisse-t-on des élèves sans groupe ?" };
    case "saison":
      return { ordre: "« Victoire puis défaite » et « défaite puis victoire » sont-ils la même suite ?", repetition: "Un même résultat revient-il plusieurs fois ?", tous: "Laisse-t-on des résultats du bilan de côté ?" };
    case "table":
    case "bracelet":
    case "ronde":
      return { ordre: "Si on échange deux voisins, obtient-on la même disposition ?", repetition: "Un même élément peut-il occuper deux places ?", tous: "Laisse-t-on quelqu'un (ou une perle) de côté ?" };
  }
}

export const consigneGlobale100 = (): Frag[] => [
  t("Reconnais le type de groupement en répondant aux trois questions du cours (l'ordre compte-t-il ? la répétition est-elle permise ? tous les éléments sont-ils utilisés ?), puis calcule le nombre demandé."),
];

export const consigneGenerale100 = (e: E): Frag[] => [...situation100(e), t(" "), ...consigneGlobale100()];

export function libelle100(_e: E, p: P): string {
  switch (p) {
    case "ordre":
      return "Ordre";
    case "repetition":
      return "Répétition";
    case "tous":
      return "Tous utilisés";
    case "type":
      return "Type de groupement";
    case "calcul":
      return "Nombre cherché";
  }
}

export function consigne100(_e: E, p: P): Frag[] {
  switch (p) {
    case "ordre":
      return [t("Question 1 : l'ordre compte-t-il ? (Si on échange deux des éléments choisis, obtient-on un résultat différent ?)")];
    case "repetition":
      return [t("Question 2 : la répétition est-elle permise ? (Un même élément peut-il être choisi, ou apparaître, plusieurs fois ?)")];
    case "tous":
      return [t("Question 3 : tous les éléments disponibles sont-ils utilisés (on les place tous) ?")];
    case "type":
      return [t("Quel est le type de groupement ?")];
    case "calcul":
      return [t("Calcule le nombre demandé. Tu peux écrire un calcul (avec « ! » pour une factorielle) au lieu du résultat.")];
  }
}

const OUI_NON: OptionEcran[] = [
  { id: "oui", fragments: [t("Oui")] },
  { id: "non", fragments: [t("Non")] },
];

const NOMS_TYPES: Record<Type100, { nom: string; formule: string }> = {
  arrangement: { nom: "Arrangement simple", formule: AL("n", "p") },
  combinaison: { nom: "Combinaison simple", formule: CL("n", "p") },
  permutation: { nom: "Permutation simple", formule: "P_n=n!" },
  arrRep: { nom: "Arrangement avec répétition", formule: "B_n^p=n^p" },
  combRep: { nom: "Combinaison avec répétition", formule: GL("n", "p") },
  permRep: { nom: "Permutation avec répétition (répartition multinomiale)", formule: "\\dfrac{n!}{n_1!\\cdots n_k!}" },
  circulaire: { nom: "Permutation circulaire", formule: "(n-1)!" },
};

export const nomType = (ty: Type100) => NOMS_TYPES[ty].nom;
export const formuleType = (ty: Type100) => NOMS_TYPES[ty].formule;

export function options100(p: P): OptionEcran[] {
  if (p !== "type") return OUI_NON;
  return (Object.keys(NOMS_TYPES) as Type100[]).map((ty) => ({ id: ty, fragments: [t(`${NOMS_TYPES[ty].nom} : `), l(NOMS_TYPES[ty].formule)] }));
}

export function bonneOption100(e: E, p: P): string {
  const r = REPONSES_100[e.type];
  if (p === "ordre") return r.ordre ? "oui" : "non";
  if (p === "repetition") return r.repetition ? "oui" : "non";
  if (p === "tous") return r.tous ? "oui" : "non";
  return e.type;
}

export function champs100(): ChampEcran[] {
  return [{ label: "Nombre cherché", labelLatex: "N=", placeholder: "nombre ou calcul", raccourcis: [{ libelle: "!", texte: "!" }] }];
}

/** Formule du type appliquée à l'instance (LaTeX, sans le résultat). */
export function formuleInstance(e: E): string {
  switch (e.type) {
    case "arrangement":
      return AL(e.n, e.p);
    case "combinaison":
      return CL(e.n, e.p);
    case "permutation":
      return `P_{${e.n}}=${e.n}!`;
    case "arrRep":
      return `B_{${e.n}}^{${e.p}}=${e.n}^{${e.p}}`;
    case "combRep":
      return `${GL(e.n, e.p)}=${CL(e.n + e.p - 1, e.p)}`;
    case "permRep":
      return multinomialeLatex(e.n, e.effectifs ?? []);
    case "circulaire":
      return estCollier(e) ? `\\dfrac{(${e.n}-1)!}{2}` : `(${e.n}-1)!`;
  }
}

export function reponse100(e: E, p: P): Frag[] {
  if (p === "calcul") return [l(`${formuleInstance(e)}=${mil(valeur100(e))}`)];
  if (p === "type") return [t(`${nomType(e.type)}${estCollier(e) ? " (collier : rotations et retournements)" : ""}`)];
  const r = raisons100(e);
  return [t(p === "ordre" ? r.ordre : p === "repetition" ? r.repetition : r.tous)];
}

export function recap100(e: E, p: P): Frag[] {
  if (p === "calcul" || p === "type") return reponse100(e, p);
  return [t(bonneOption100(e, p) === "oui" ? "Oui" : "Non")];
}

export const messageIllisible100 = (): string =>
  "Nombre non reconnu : écris un entier (par exemple 336) ou un calcul (par exemple 8!/5!). Cette saisie ne compte pas comme une tentative.";

export function aide1_100(_e: E, p: P): AideEcran {
  switch (p) {
    case "ordre":
      return { texte: [t(`Question 1 ${COURS} : échange deux des éléments choisis. Si le résultat change, l'ordre compte.`)] };
    case "repetition":
      return { texte: [t(`Question 2 ${COURS} : un même élément peut-il être choisi, ou apparaître, plusieurs fois ?`)] };
    case "tous":
      return { texte: [t(`Question 3 ${COURS}, posée seulement quand l'ordre compte : place-t-on tous les éléments disponibles (`), l("p=n"), t(") ?")] };
    case "type":
      return { texte: [t(`Le tableau des groupements ${COURS} : tes trois réponses donnent sa ligne. Deux cas à part : une disposition en cercle (table, ronde, bracelet) et la répartition en groupes nommés ${COURS_MULTI}.`)] };
    case "calcul":
      return aide1Calcul(_e);
  }
}

export function aide1Calcul(e: E): AideEcran {
  const f = e.type === "circulaire" ? (estCollier(e) ? "\\dfrac{(n-1)!}{2}\\ \\text{(collier)}" : "(n-1)!") : e.type === "combRep" ? `${GL("n", "p")}=${CL("n+p-1", "p")}` : formuleType(e.type);
  return { texte: [t(`${nomType(e.type)} ${COURS} :`)], latex: f };
}

export function aide2_100(e: E, p: P): AideEcran | null {
  const te = tests100(e);
  switch (p) {
    case "ordre":
      return { texte: [t(`Ici, demande-toi : « ${te.ordre} »`)] };
    case "repetition":
      return { texte: [t(`Ici, demande-toi : « ${te.repetition} »`)] };
    case "tous":
      return { texte: [t(`Ici, demande-toi : « ${te.tous} »`)] };
    case "type": {
      const r = REPONSES_100[e.type];
      const oui = (b: boolean | null) => (b ? "oui" : "non");
      return { texte: [t(`Tes réponses : ordre ${oui(r.ordre)}, répétition ${oui(r.repetition)}${r.tous === null ? "" : `, tous utilisés ${oui(r.tous)}`}. Cherche la ligne correspondante du tableau, et demande-toi si les éléments sont disposés en cercle ou répartis en groupes nommés.`)] };
    }
    case "calcul":
      return { texte: [t("Ici :")], latex: formuleInstance(e) };
  }
}

export { phases100 };
