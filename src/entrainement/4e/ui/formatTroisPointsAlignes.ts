import type { DroiteNommee2, ExerciceTroisPointsAlignes, OptionDemonstration } from "../core/demontrerParallelisme.types";
import type { EcranChoixParallelisme } from "./formatDemontrerParallelisme";

/**
 * Textes de la variante « trois points alignés » de gen103 (manuel, ex. 11) : énoncé, consigne,
 * écrans, aides, conclusions des écrans, réponses attendues, légende de la figure. UNE seule source
 * pour l'écran interactif, le corrigé et l'adaptateur papier.
 *
 * Vocabulaire du cours : « s'ils sont sécants, leur intersection [...] est toujours une droite
 * entière » (§ 5 « Positions de deux plans ») ; théorème du toit (§ 8). Énoncé = ce qu'il faut
 * démontrer, jamais la méthode : l'idée, les points communs et la conclusion sont les étapes, à
 * l'écran et dans le corrigé. Aides : jamais la réponse.
 */

type E = ExerciceTroisPointsAlignes;

export const dA = (x: readonly string[]) => `(${x[0]}${x[1]})`;

/** « I, J et K » / « I et J ». */
export function listeEt(noms: string[]): string {
  return noms.length <= 1 ? noms.join("") : `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

export function nomsConstruits(e: E): string {
  return listeEt(e.construits.map((x) => x.nom));
}

/** Droite (IJ) du cas toit (ou droite qui porte les points). */
export function droiteFinale(e: E): DroiteNommee2 {
  return [e.construits[0]!.nom, e.construits[e.construits.length - 1]!.nom];
}

// --- Énoncé -----------------------------------------------------------------------------------------

export function enonceAlignes(e: E): string {
  const debut = "Voici une pyramide SABC, de sommet S et de base le triangle ABC.";
  const parallele = e.paralleles ? `, de sorte que les droites ${dA(e.paralleles[0])} et ${dA(e.paralleles[1])} sont parallèles` : "";
  const points = `Les points M, N et P sont situés sur les arêtes [SA], [SB] et [SC]${parallele} ; le triangle MNP est tracé sur la figure.`;
  const morceaux = e.construits.map((x, i) => (i === 0 ? `les droites ${dA(x.droiteHaut)} et ${dA(x.droiteBase)} se coupent en ${x.nom}` : `les droites ${dA(x.droiteHaut)} et ${dA(x.droiteBase)} en ${x.nom}`));
  const inter = `${morceaux.length === 3 ? `${morceaux[0]}, ${morceaux[1]}, et ${morceaux[2]}` : `${morceaux[0]}, et ${morceaux[1]}`}.`;
  return `${debut} ${points} ${inter.charAt(0).toUpperCase()}${inter.slice(1)}`;
}

export function consigneAlignes(e: E): string {
  if (e.cas === "general") return `Démontre que les points ${nomsConstruits(e)} sont alignés.`;
  return `Démontre que la droite ${dA(droiteFinale(e))} est parallèle à la droite ${dA(e.paralleles![1])}.`;
}

// --- Écrans ---------------------------------------------------------------------------------------

function optionsDe(liste: OptionDemonstration[]): { options: { id: string; texte: string }[]; attendue: string } {
  return { options: liste.map((o, i) => ({ id: String(i), texte: o.texte })), attendue: String(liste.findIndex((o) => o.valide)) };
}

export function titresAlignes(e: E): [string, string, string] {
  return ["Méthode", "Points communs", e.cas === "general" ? "Conclusion" : "Théorème du toit"];
}

export function ecransAlignes(e: E): EcranChoixParallelisme[] {
  const noms = nomsConstruits(e);
  const [t1, t2, t3] = titresAlignes(e);
  const D = dA(droiteFinale(e));
  const general = e.cas === "general";
  const base = e.paralleles?.[1];
  const haut = e.paralleles?.[0];
  return [
    {
      genre: "choix",
      titre: t1,
      consigne: general ? `Quelle idée permet de démontrer que les points ${noms} sont alignés ?` : `Quelle idée permet de démontrer que la droite ${D} est parallèle à la droite ${dA(base!)} ?`,
      ...optionsDe(e.methodes),
      aides: general
        ? [
            "Relis le cours sur les positions de deux plans : que sais-tu de l'ensemble des points communs à deux plans sécants ?",
            `Chacun des points ${noms} est sur un côté prolongé du triangle MNP et sur un côté prolongé du triangle ABC : à quels plans appartient-il ?`,
          ]
        : [
            "Relis le théorème du toit (cours, § 8) : que dit-il de la droite d'intersection de deux plans qui contiennent deux droites parallèles ?",
            `${dA(haut!)} est une droite du plan (MNP) et ${dA(base!)} une droite du plan (ABC) : quelle est la droite commune à ces deux plans ?`,
          ],
    },
    {
      genre: "choix",
      titre: t2,
      consigne: `Pourquoi les points ${noms} appartiennent-ils à la fois au plan (MNP) et au plan (ABC) ?`,
      ...optionsDe(e.communs),
      aides: [
        "Un point d'une droite incluse dans un plan appartient à ce plan ; une droite est dans un plan dès que deux de ses points y sont.",
        "Relis la définition de chaque point dans l'énoncé : il est sur un côté prolongé du triangle MNP et sur un côté prolongé du triangle ABC.",
      ],
    },
    {
      genre: "choix",
      titre: t3,
      consigne: general ? "Que peut-on dire des plans (MNP) et (ABC), et qu'en conclure ?" : `Pourquoi la droite ${D} est-elle parallèle à la droite ${dA(base!)} ?`,
      ...optionsDe(e.conclusions),
      aides: general
        ? [
            "Deux plans distincts qui ont un point commun sont sécants : leur intersection est une droite entière (cours, § 5).",
            "Le point M est-il dans le plan (ABC) ? Et sur quelle droite se trouve un point commun aux deux plans ?",
          ]
        : [
            "Théorème du toit : si deux plans sécants contiennent chacun une droite, et que ces deux droites sont parallèles, leur droite d'intersection est parallèle à ces deux droites.",
            "Quelles droites parallèles l'énoncé donne-t-il, et dans quels plans sont-elles ?",
          ],
    },
  ];
}

/** Phrase qui conclut l'explication de l'écran (après le choix, juste ou faux). */
export function conclusionEcranAlignes(e: E, ecran: number): string {
  const noms = nomsConstruits(e);
  const D = dA(droiteFinale(e));
  if (e.cas === "general") {
    if (ecran === 0) return `Il reste à montrer que ${noms} sont communs à deux plans sécants : les plans (MNP) et (ABC).`;
    if (ecran === 1) return `${noms} sont trois points communs aux plans (MNP) et (ABC). Il reste à voir que ces plans sont sécants.`;
    return `Les points ${noms} sont sur la droite d'intersection des plans (MNP) et (ABC) : ils sont alignés.`;
  }
  if (ecran === 0) return `Il reste à montrer que ${D} est la droite commune aux plans (MNP) et (ABC).`;
  if (ecran === 1) return `M n'est pas dans le plan (ABC) : les deux plans sont distincts. ${noms} sont deux points communs distincts : ${D} est la droite d'intersection des plans (MNP) et (ABC).`;
  return `${D} est parallèle à ${dA(e.paralleles![1])}.`;
}

export function listeEcranAlignes(e: E, ecran: number): OptionDemonstration[] {
  return ecran === 0 ? e.methodes : ecran === 1 ? e.communs : e.conclusions;
}

export function reponseEcranAlignes(e: E, ecran: number): string {
  return listeEcranAlignes(e, ecran).find((o) => o.valide)!.texte;
}

export function messageFauxAlignes(ecran: number): string {
  return ecran === 0 ? "Ce n'était pas la bonne idée." : ecran === 1 ? "Ce n'était pas la bonne justification." : "Ce n'était pas la bonne conclusion.";
}

// --- Figure ------------------------------------------------------------------------------------------

/** Côtés prolongés et points construits : visibles une fois l'écran « Points communs » clos. */
export function constructionVisible(ecran: number, clos: boolean): boolean {
  return ecran >= 2 || (ecran === 1 && clos);
}

export function legendeAlignes(e: E, construction: boolean, finale: boolean): string {
  if (!construction) return "";
  const noms = nomsConstruits(e);
  const debut = `En bleu, les côtés prolongés ; en rouge, les points ${noms}.`;
  if (!finale) return debut;
  const droite = e.cas === "general" ? `la droite qui porte ${noms}` : `la droite ${dA(droiteFinale(e))}`;
  const paralleles = e.paralleles ? ` En vert, les droites parallèles ${dA(e.paralleles[0])} et ${dA(e.paralleles[1])}.` : "";
  return `${debut} En trait rouge, ${droite} : l'intersection des plans (MNP) et (ABC).${paralleles}`;
}
