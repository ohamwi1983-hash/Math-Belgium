import type { Exercice102, Phase102, Propriete102 } from "../core6e/trianglePascal";
import { identite, ligneTriangle, phases102, valeur102 } from "../core6e/trianglePascal";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { CL, comb, mil } from "./nombresCombinatoireLotH";

/**
 * Couche C — textes et figure de `6gen102` « Triangle de Pascal et propriétés de Cₙᵏ » : énoncé,
 * consignes d'écran, champs ou choix, aides à deux niveaux (propriété du cours, puis posée pour
 * l'instance — jamais le résultat), réponses. Source unique de l'écran, du papier et du corrigé.
 * Figure : deux lignes du triangle, les cases cherchées écrites « ? » (SVG sans identifiant).
 */

type E = Exercice102;
type P = Phase102;
const t = tx;
const l = lx;

export { phases102 };

const COURS = "(cours, § 3)";

/** Figure : ligne n complète, ligne n + 1 avec « ? » en k et en n + 1 − k (énoncé « ligne »). */
export function figurePascal(e: E, complete = false): string | null {
  if (e.variante !== "ligne") return null;
  const n = e.n;
  const haut = ligneTriangle(n).map((v) => mil(v).replace(/\\,/g, " "));
  const cherche = (k: number) => k === e.k || k === n + 1 - e.k;
  const bas = ligneTriangle(n + 1).map((v, k) => (cherche(k) && !complete ? "?" : `${v}`));
  const pas = 36;
  const L = (n + 2) * pas + 70;
  const H = 104;
  const cellule = (x: number, y: number, s: string, inconnue: boolean) =>
    `<rect x="${x - 16}" y="${y - 15}" width="32" height="26" rx="5" fill="${inconnue ? "#fff3e6" : "#ffffff"}" stroke="${inconnue ? "#b65c1f" : "#9aa5b1"}" stroke-width="1.2"/>` +
    `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="Georgia, serif" font-size="${s.length > 2 ? 12 : 14}" font-weight="${inconnue ? 700 : 400}" fill="${inconnue ? "#b65c1f" : "#1d2733"}">${s}</text>`;
  const x0h = 64 + pas / 2 + pas / 2;
  const x0b = 64 + pas / 2;
  const lh = haut.map((s, i) => cellule(x0h + i * pas, 34, s, false)).join("");
  const lb = bas.map((s, i) => cellule(x0b + i * pas, 78, s, cherche(i))).join("");
  const etiq = `<text x="6" y="38" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#1d2733">n = ${n}</text><text x="6" y="82" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#1d2733">n = ${n + 1}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" role="img" aria-label="Lignes ${n} et ${n + 1} du triangle de Pascal"><rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>${etiq}${lh}${lb}</svg>`;
}

const NOMS_ENSEMBLE: Record<E["contexte"], { ensemble: string; partie: string }> = {
  pizza: { ensemble: "garnitures", partie: "pizza" },
  options: { ensemble: "options", partie: "voiture" },
  invites: { ensemble: "amis", partie: "fête" },
};

/** Situation (texte avant la figure). */
export function situation102(e: E): Frag[] {
  switch (e.variante) {
    case "ligne":
      return [t(`Voici la ligne ${e.n} du triangle de Pascal (les nombres `), l(`${CL(e.n, 0)},\\ ${CL(e.n, 1)},\\ \\ldots,\\ ${CL(e.n, e.n)}`), t(`) et la ligne ${e.n + 1}, où deux nombres sont remplacés par « ? ».`)];
    case "symetrie":
      return [t("On sait que "), l(`${CL(e.n, e.k)}=${mil(comb(e.n, e.k))}`), t(" et "), l(`${CL(e.n, e.k + 1)}=${mil(comb(e.n, e.k + 1))}`), t(".")];
    case "parties": {
      const nm = NOMS_ENSEMBLE[e.contexte];
      if (e.contexte === "pizza") return [t(`Une pizzeria propose ${e.n} garnitures différentes ; une pizza peut en avoir autant qu'on veut, de aucune (pizza nature) à toutes.`)];
      if (e.contexte === "options") return [t(`Une voiture peut recevoir ${e.n} options différentes ; on peut n'en prendre aucune, ou plusieurs, ou toutes.`)];
      return [t(`Tu as ${e.n} ${nm.ensemble} ; tu peux inviter n'importe quel groupe d'entre eux à ta fête, de personne à tous.`)];
    }
    case "identite":
      return [t("On considère l'égalité "), l(`${identite(e).gauche}=${identite(e).droite}`), t(".")];
  }
}

function texteContrainte(e: E): string {
  const nm = NOMS_ENSEMBLE[e.contexte];
  switch (e.contrainte) {
    case "auMoinsUn":
      return e.contexte === "pizza" ? "avec au moins une garniture" : e.contexte === "options" ? "avec au moins une option" : "où tu invites au moins un ami";
    case "auMoinsDeux":
      return e.contexte === "pizza" ? "avec au moins deux garnitures" : e.contexte === "options" ? "avec au moins deux options" : "où tu invites au moins deux amis";
    case "pasTous":
      return e.contexte === "pizza" ? `qui n'ont pas toutes les ${e.n} garnitures` : e.contexte === "options" ? `qui n'ont pas toutes les ${e.n} options` : `où tu n'invites pas tous tes ${e.n} ${nm.ensemble}`;
  }
}

const motChoix = (e: E) => (e.contexte === "pizza" ? "pizzas" : e.contexte === "options" ? "équipements" : "invitations");

/** Question de l'exercice (consigne globale, papier et écran). */
export function consigneGlobale102(e: E): Frag[] {
  switch (e.variante) {
    case "ligne":
      return [t(`Retrouve les deux nombres manquants et la somme des nombres de la ligne ${e.n + 1}, sans calculatrice, en citant les propriétés du cours.`)];
    case "symetrie":
      return [t("Sans calculatrice, déduis-en "), l(CL(e.n, e.n - e.k)), t(" et "), l(CL(e.n + 1, e.k + 1)), t(", en citant les propriétés du cours.")];
    case "parties":
      return [t(`Combien de ${motChoix(e)} différentes ${texteContrainte(e)} sont possibles ? Justifie.`)];
    case "identite":
      return [t("Cette égalité est-elle vraie ou fausse ? Justifie sans calculatrice, par une propriété du cours.")];
  }
}

export const consigneGenerale102 = (e: E): Frag[] => [...situation102(e), t(" "), ...consigneGlobale102(e)];

export function libelle102(_e: E, p: P): string {
  switch (p) {
    case "pascal":
      return "Premier « ? »";
    case "symetrique":
      return "Second « ? »";
    case "somme":
      return "Somme de la ligne";
    case "partenaire":
      return "Par la symétrie";
    case "suivant":
      return "Par Pascal";
    case "toutes":
      return "Toutes les parties";
    case "contrainte":
      return "Avec la contrainte";
    case "propriete":
      return "Propriété en jeu";
    case "verdict":
      return "Vrai ou faux ?";
  }
}

export function consigne102(e: E, p: P): Frag[] {
  const n = e.n;
  switch (p) {
    case "pascal":
      return [t("Calcule le « ? » de gauche, "), l(CL(n + 1, e.k)), t(", à partir de la ligne au-dessus.")];
    case "symetrique":
      return [t("Donne le « ? » de droite, "), l(CL(n + 1, n + 1 - e.k)), t(".")];
    case "somme":
      return [t(`Que vaut la somme de tous les nombres de la ligne ${n + 1} ?`)];
    case "partenaire":
      return [t("Que vaut "), l(CL(n, n - e.k)), t(" ?")];
    case "suivant":
      return [t("Que vaut "), l(CL(n + 1, e.k + 1)), t(" ?")];
    case "toutes":
      return [t(`Combien de ${motChoix(e)} différentes sont possibles en tout (sans contrainte, le choix de « rien » compris) ?`)];
    case "contrainte":
      return [t(`Combien de ${motChoix(e)} différentes ${texteContrainte(e)} sont possibles ?`)];
    case "propriete":
      return [t("Quelle propriété du cours permet de juger cette égalité ?")];
    case "verdict":
      return [t("L'égalité est-elle vraie ou fausse ?")];
  }
}

const NOMS_PROP: Record<Propriete102, string> = { pascal: "Relation de Pascal", symetrie: "Symétrie", somme: "Somme d'une ligne" };

export function options102(p: P): OptionEcran[] {
  if (p === "verdict")
    return [
      { id: "vrai", fragments: [t("Vraie")] },
      { id: "faux", fragments: [t("Fausse")] },
    ];
  return [
    { id: "pascal", fragments: [t("Relation de Pascal : "), l(`${CL("n", "k")}+${CL("n", "k+1")}=${CL("n+1", "k+1")}`)] },
    { id: "symetrie", fragments: [t("Symétrie : "), l(`${CL("n", "k")}=${CL("n", "n-k")}`)] },
    { id: "somme", fragments: [t("Somme d'une ligne : "), l(`${CL("n", 0)}+${CL("n", 1)}+\\cdots+${CL("n", "n")}=2^n`)] },
  ];
}

export const bonneOption102 = (e: E, p: P): string => (p === "verdict" ? (e.vrai ? "vrai" : "faux") : e.propriete);

export function champs102(e: E, p: P): ChampEcran[] {
  return [{ label: libelle102(e, p), labelLatex: "N=", placeholder: "nombre ou calcul" }];
}

export function reponse102(e: E, p: P): Frag[] {
  const n = e.n;
  switch (p) {
    case "pascal":
      return [l(`${CL(n + 1, e.k)}=${CL(n, e.k - 1)}+${CL(n, e.k)}=${mil(valeur102(e, p))}`)];
    case "symetrique":
      return [l(`${CL(n + 1, n + 1 - e.k)}=${CL(n + 1, e.k)}=${mil(valeur102(e, p))}`)];
    case "somme":
      return [l(`2^{${n + 1}}=${mil(valeur102(e, p))}`)];
    case "partenaire":
      return [l(`${CL(n, n - e.k)}=${CL(n, e.k)}=${mil(valeur102(e, p))}`)];
    case "suivant":
      return [l(`${CL(n + 1, e.k + 1)}=${CL(n, e.k)}+${CL(n, e.k + 1)}=${mil(valeur102(e, p))}`)];
    case "toutes":
      return [l(`2^{${n}}=${mil(valeur102(e, p))}`)];
    case "contrainte":
      return e.contrainte === "auMoinsDeux" ? [l(`2^{${n}}-1-${n}=${mil(valeur102(e, p))}`)] : [l(`2^{${n}}-1=${mil(valeur102(e, p))}`)];
    case "propriete":
      return [t(NOMS_PROP[e.propriete])];
    case "verdict": {
      const id = identite(e);
      return e.vrai ? [t("Vraie : "), l(`${id.gauche}=${id.droite}`)] : [t("Fausse : "), l(`${id.gauche}\\neq ${id.droite}`)];
    }
  }
}

export function recap102(e: E, p: P): Frag[] {
  if (p === "verdict") return [t(e.vrai ? "Vraie" : "Fausse")];
  return reponse102(e, p);
}

export const messageIllisible102 = (): string => "Nombre non reconnu : écris un entier (par exemple 35) ou un calcul (par exemple 15 + 20). Cette saisie ne compte pas comme une tentative.";

export function aide1_102(_e: E, p: P): AideEcran {
  switch (p) {
    case "pascal":
    case "suivant":
      return { texte: [t(`Relation de Pascal ${COURS} : un nombre est la somme des deux nombres juste au-dessus de lui :`)], latex: `${CL("n+1", "k+1")}=${CL("n", "k")}+${CL("n", "k+1")}` };
    case "symetrique":
    case "partenaire":
      return { texte: [t(`Symétrie ${COURS} : chaque ligne se lit de la même façon dans les deux sens :`)], latex: `${CL("n", "k")}=${CL("n", "n-k")}` };
    case "somme":
      return { texte: [t(`Somme d'une ligne ${COURS} :`)], latex: `${CL("n", 0)}+${CL("n", 1)}+\\cdots+${CL("n", "n")}=2^n` };
    case "toutes":
      return { texte: [t(`Un ensemble de `), l("n"), t(` éléments a autant de parties que la somme de la ligne `), l("n"), t(` ${COURS} : on choisit 0, 1, 2… ou `), l("n"), t(" éléments.")], latex: `${CL("n", 0)}+${CL("n", 1)}+\\cdots+${CL("n", "n")}=2^n` };
    case "contrainte":
      return { texte: [t("Pars de toutes les parties et retire celles qui ne respectent pas la contrainte (complément).")] };
    case "propriete":
      return { texte: [t("Regarde la forme de l'égalité : une somme de deux coefficients voisins, deux coefficients d'une même ligne, ou la somme de toute une ligne ?")] };
    case "verdict":
      return { texte: [t("Compare l'égalité à la propriété du cours, indice par indice.")] };
  }
}

export function aide2_102(e: E, p: P): AideEcran | null {
  const n = e.n;
  switch (p) {
    case "pascal":
      return { texte: [t("Ici, lis les deux nombres au-dessus de la case :")], latex: `${CL(n + 1, e.k)}=${CL(n, e.k - 1)}+${CL(n, e.k)}` };
    case "symetrique":
      return { texte: [t("Ici, la case symétrique est celle d'indice :")], latex: `${n + 1}-${n + 1 - e.k}=${e.k}` };
    case "somme":
      return { texte: [t(`Ici, la ligne ${n + 1} :`)], latex: `2^{${n + 1}}` };
    case "partenaire":
      return { texte: [t("Ici, l'indice symétrique de "), l(`${n - e.k}`), t(" sur la ligne "), l(`${n}`), t(" est "), l(`${n}-${n - e.k}=${e.k}`), t(".")] };
    case "suivant":
      return { texte: [t("Ici :")], latex: `${CL(n + 1, e.k + 1)}=${CL(n, e.k)}+${CL(n, e.k + 1)}` };
    case "toutes":
      return { texte: [t(`Ici, il y a ${n} éléments :`)], latex: `2^{${n}}` };
    case "contrainte":
      if (e.contrainte === "auMoinsDeux") return { texte: [t("Retire la partie vide (aucun élément) et les "), l(`${n}`), t(" parties à un seul élément.")] };
      if (e.contrainte === "pasTous") return { texte: [t("Retire la seule partie qui contient tous les éléments.")] };
      return { texte: [t("Retire la seule partie vide (aucun élément).")] };
    case "propriete":
      return { texte: [t(e.propriete === "somme" ? "Ici, le membre de gauche additionne tous les coefficients d'une ligne." : e.propriete === "pascal" ? "Ici, le membre de gauche additionne deux coefficients voisins d'une même ligne." : "Ici, les deux membres sont des coefficients de la même ligne.")] };
    case "verdict": {
      const id = identite(e);
      if (e.propriete === "pascal") return { texte: [t("Ici, "), l(id.gauche), t(" additionne deux voisins de la ligne "), l(`${n}`), t(" : sous quelle case de la ligne "), l(`${n + 1}`), t(" tombe leur somme ? Compare avec le membre de droite.")] };
      if (e.propriete === "symetrie") return { texte: [t("Ici, sur la ligne "), l(`${n}`), t(", les indices de deux coefficients symétriques ont pour somme "), l(`${n}`), t(" : vérifie si c'est le cas pour les deux membres.")] };
      return { texte: [t("Ici, écris la somme de la ligne "), l(`${n}`), t(" comme une puissance de 2 et compare avec le membre de droite.")] };
    }
  }
}
