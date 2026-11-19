import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceProblemesFraction } from "../core/problemesFraction.types";
import { CONTEXTES_PRIX, CONTEXTES_ROBINETS, CONTEXTES_TRAJET, reponseFinale, trinomeObtenu, valeursInterdites } from "../generateurs/problemesFraction";
import { nombreLatex } from "../moteur/algebreTransfertSecondDegre";
import type { EcranTSD, Fragments } from "./ecransTransfertSecondDegre";
import { polynome, q as qx } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen119 (« Problèmes avec une fraction »). Une seule source pour l'écran, les
 * aides, le papier et le corrigé : énoncé (`recit`), équation (`equationLatex`), trinôme obtenu,
 * valeurs interdites, réponse finale.
 *
 * Écrans : 1. poser l'équation (choix fermé, les 3 fausses = pièges classiques) ; 2. CE (valeurs
 * interdites) ; 3. résoudre (équation du second degré obtenue + ses solutions) ; 4. rejeter (CE, puis
 * contexte : choix fermé) ; 5. répondre au problème (grandeur demandée, avec son unité).
 */

type E = ExerciceProblemesFraction;

export const CONSIGNE_GENERALE = "Résous le problème : mets-le en équation, pose la condition d'existence, résous l'équation, puis réponds à la question.";

/** Nombre en texte : virgule décimale, « − » typographique. */
export function fr(v: number): string {
  const r = Math.round(v * 1e6) / 1e6;
  return String(r).replace(".", ",").replace(/^-/, "−");
}

export function euros(v: number): string {
  return Number.isInteger(v) ? `${v} €` : `${v.toFixed(2).replace(".", ",")} €`;
}

/** « 3 h 30 min », « 4 h », « 45 min ». */
export function duree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}\u00a0min`;
  return m === 0 ? `${h}\u00a0h` : `${h}\u00a0h\u00a0${m}\u00a0min`;
}

/** Décimal en LaTeX (virgule). */
export function dec(v: number): string {
  return fr(v).replace(",", "{,}").replace("−", "-");
}

/** `x`, `x+3`, `x-5`. */
export function xPlus(s: number, v = "x"): string {
  return s === 0 ? v : s > 0 ? `${v}+${s}` : `${v}-${-s}`;
}

export function uniteInconnue(e: E): string {
  if (e.variante === "prix") return "";
  if (e.variante === "trajet") return "km/h";
  return e.unite;
}

/** Second membre p/q en LaTeX (décimal pour un prix, fraction sinon). */
export function secondMembreLatex(e: E): string {
  if (e.variante === "prix") return dec(e.baisse);
  return qx(e.p / e.q);
}

export function equationLatex(e: E): string {
  const n = e.variante === "robinets" ? "1" : String(e.N);
  return `\\dfrac{${n}}{x}${e.sigma > 0 ? "+" : "-"}\\dfrac{${n}}{${xPlus(e.s)}}=${secondMembreLatex(e)}`;
}

/** Les trois équations fausses (pièges classiques de la mise en équation). */
export function equationsFausses(e: E): string[] {
  const n = e.variante === "robinets" ? "1" : String(e.N);
  const rhs = secondMembreLatex(e);
  if (e.variante === "prix") {
    return [`\\dfrac{${n}}{${xPlus(e.s)}}-\\dfrac{${n}}{x}=${rhs}`, `\\dfrac{${n}}{x}-\\dfrac{${n}}{${xPlus(-e.s)}}=${rhs}`, `\\dfrac{x}{${n}}-\\dfrac{${xPlus(e.s)}}{${n}}=${rhs}`];
  }
  if (e.variante === "trajet") {
    const w = e.ecart;
    const decimal = e.dureeMinutes % 60 !== 0 ? `${Math.floor(e.dureeMinutes / 60)}{,}${String(e.dureeMinutes % 60).padStart(2, "0")}` : null;
    return [
      `\\dfrac{x}{${n}}+\\dfrac{${xPlus(-w)}}{${n}}=${rhs}`,
      `${n}x+${n}(${xPlus(-w)})=${rhs}`,
      decimal ? `\\dfrac{${n}}{x}+\\dfrac{${n}}{${xPlus(-w)}}=${decimal}` : `\\dfrac{${n}}{x}+\\dfrac{${n}}{${xPlus(w)}}=${rhs}`,
    ];
  }
  const T = e.unite === "h" ? e.ensembleMinutes / 60 : e.ensembleMinutes;
  const tDecimal = e.unite === "h" && e.ensembleMinutes % 60 !== 0 ? `${Math.floor(e.ensembleMinutes / 60)}{,}${String(e.ensembleMinutes % 60).padStart(2, "0")}` : null;
  return [
    `x+(${xPlus(e.s)})=${qx(T)}`,
    tDecimal ? `\\dfrac{1}{x}+\\dfrac{1}{${xPlus(e.s)}}=\\dfrac{1}{${tDecimal}}` : `\\dfrac{1}{x}+\\dfrac{1}{${xPlus(-e.s)}}=${rhs}`,
    `\\dfrac{1}{x}+\\dfrac{1}{${xPlus(e.s)}}=${qx(T)}`,
  ];
}

export interface Recit {
  phrases: string[];
  question: string;
  /** Ce que désigne x. */
  inconnue: string;
  /** Grandeur demandée, son unité (texte) et la phrase-réponse. */
  libelleReponse: string;
  uniteReponse: string;
  phraseReponse: string;
}

export function recit(e: E): Recit {
  if (e.variante === "prix") {
    const c = CONTEXTES_PRIX[e.contexte]!;
    const il = c.elle ? "elle" : "il";
    const phrases = [
      `${c.prenom} a dépensé ${euros(e.total)} pour acheter des ${c.pluriel}, ${c.fem ? "toutes" : "tous"} au même prix.`,
      `Si chaque ${c.singulier} avait coûté ${euros(e.baisse)} de moins, ${il} en aurait acheté ${e.enPlus} de plus pour la même somme.`,
    ];
    const prix = e.total / e.solution;
    return e.forme === "directe"
      ? {
          phrases,
          question: `Combien de ${c.pluriel} ${c.prenom} a-t-${il} ${c.fem ? "achetées" : "achetés"} ?`,
          inconnue: `le nombre de ${c.pluriel} ${c.fem ? "achetées" : "achetés"}`,
          libelleReponse: `Nombre de ${c.pluriel} :`,
          uniteReponse: "",
          phraseReponse: `${c.prenom} a acheté ${e.solution} ${c.pluriel}.`,
        }
      : {
          phrases,
          question: `Quel était le prix d'${c.article === "une" ? "une" : "un"} ${c.singulier} ?`,
          inconnue: `le nombre de ${c.pluriel} ${c.fem ? "achetées" : "achetés"}`,
          libelleReponse: `Prix d'${c.article === "une" ? "une" : "un"} ${c.singulier} :`,
          uniteReponse: "€",
          phraseReponse: `${c.article === "une" ? "Une" : "Un"} ${c.singulier} coûtait ${euros(prix)}.`,
        };
  }
  if (e.variante === "trajet") {
    const c = CONTEXTES_TRAJET[e.contexte]!;
    const elle = c.qui.startsWith("Une");
    const il = elle ? "elle" : "il";
    const phrases = [
      `${c.qui} fait l'aller-retour entre ${c.entre} de ${e.distance} km.`,
      `Au retour, ${c.cause}, ${il} roule ${e.ecart} km/h moins vite qu'à l'aller.`.replace("roule", c.qui.includes("coureur") ? "court" : "roule"),
      `L'aller-retour, sans pause, dure ${duree(e.dureeMinutes)}.`,
    ];
    return e.forme === "directe"
      ? {
          phrases,
          question: `Quelle était sa vitesse à l'aller ?`,
          inconnue: "la vitesse à l'aller, en km/h",
          libelleReponse: "Vitesse à l'aller :",
          uniteReponse: "km/h",
          phraseReponse: `À l'aller, ${il} roulait à ${fr(e.solution)} km/h.`.replace("roulait", c.qui.includes("coureur") ? "courait" : "roulait"),
        }
      : {
          phrases,
          question: `Quelle était sa vitesse au retour ?`,
          inconnue: "la vitesse à l'aller, en km/h",
          libelleReponse: "Vitesse au retour :",
          uniteReponse: "km/h",
          phraseReponse: `Au retour, ${il} roulait à ${fr(e.solution - e.ecart)} km/h.`.replace("roulait", c.qui.includes("coureur") ? "courait" : "roulait"),
        };
  }
  const c = CONTEXTES_ROBINETS[e.contexte]!;
  const u = e.unite === "h" ? "h" : "min";
  const uMot = e.unite === "h" ? "heures" : "minutes";
  const phrases = [
    `${c.qui}, ensemble, ${c.verbe} ${c.objet} en ${duree(e.ensembleMinutes)}.`,
    `Seul${c.premier.startsWith("la") ? "e" : ""}, ${c.premier} met ${e.ecart} ${u} de plus que ${c.second}.`,
  ];
  const de = (t: string) => (t.startsWith("le ") ? `du ${t.slice(3)}` : `de ${t}`);
  const a = (t: string) => (t.startsWith("le ") ? `au ${t.slice(3)}` : `à ${t}`);
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  return e.forme === "directe"
    ? {
        phrases,
        question: `Combien de temps faut-il ${a(c.second)}, seul${c.second.startsWith("la") ? "e" : ""}, pour ${c.verbeSeul} ${c.objetDefini} ?`,
        inconnue: `la durée de travail ${de(c.second)} seul${c.second.startsWith("la") ? "e" : ""}, en ${uMot}`,
        libelleReponse: `Durée pour ${c.second} seul${c.second.startsWith("la") ? "e" : ""} :`,
        uniteReponse: u,
        phraseReponse: `${cap(c.second)}, seul${c.second.startsWith("la") ? "e" : ""}, met ${fr(e.solution)} ${u}.`,
      }
    : {
        phrases,
        question: `Combien de temps faut-il ${a(c.premier)}, seul${c.premier.startsWith("la") ? "e" : ""}, pour ${c.verbeSeul} ${c.objetDefini} ?`,
        inconnue: `la durée de travail ${de(c.second)} seul${c.second.startsWith("la") ? "e" : ""}, en ${uMot}`,
        libelleReponse: `Durée pour ${c.premier} seul${c.premier.startsWith("la") ? "e" : ""} :`,
        uniteReponse: u,
        phraseReponse: `${cap(c.premier)}, seul${c.premier.startsWith("la") ? "e" : ""}, met ${fr(e.solution + e.ecart)} ${u}.`,
      };
}

/** Multiplicateur commun q·x(x + s) en LaTeX. */
export function multiplicateurLatex(e: E): string {
  return `${e.q === 1 ? "" : `${e.q}`}x(${xPlus(e.s)})`;
}

export function trinomeLatex(e: E): string {
  return polynome(trinomeObtenu(e));
}

export function solutionsTriees(e: E): [number, number] {
  return e.solution < e.autre ? [e.solution, e.autre] : [e.autre, e.solution];
}

/** Pourquoi l'autre racine est rejetée (texte). */
export function raisonRejet(e: E): string {
  if (e.variante === "prix") return "un nombre d'objets ne peut pas être négatif";
  if (e.variante === "trajet") return "la vitesse au retour serait négative";
  return "une durée ne peut pas être négative";
}

export function ecrans(e: E): EcranTSD[] {
  const r = recit(e);
  const eq = equationLatex(e);
  const fausses = equationsFausses(e);
  const options = melangeStable([eq, ...fausses], e);
  const interdits = valeursInterdites(e);
  const [x1, x2] = solutionsTriees(e);
  const poly = trinomeObtenu(e);
  const reponse = reponseFinale(e);

  const aidesEquation: Fragments[] =
    e.variante === "prix"
      ? [
          [texte("Le prix d'un objet, c'est la somme dépensée divisée par le nombre d'objets : "), latex(`\\dfrac{${e.total}}{x}`), texte(".")],
          [texte("Avec les objets en plus, chaque objet coûte "), latex(`\\dfrac{${e.total}}{${xPlus(e.s)}}`), texte(" : lequel des deux prix est le plus grand ? Leur différence vaut la baisse de prix.")],
        ]
      : e.variante === "trajet"
        ? [
            [texte("La durée d'un trajet, c'est la distance divisée par la vitesse : "), latex("t=\\dfrac{d}{v}"), texte(".")],
            [texte("Convertis la durée totale en heures (en fraction : 30 min, c'est "), latex("\\dfrac{1}{2}"), texte(" h), puis additionne la durée de l'aller et celle du retour.")],
          ]
        : [
            [texte("En une unité de temps, celui qui fait tout le travail seul en x unités en fait la fraction : "), latex("\\dfrac{1}{x}"), texte(".")],
            [texte("Ensemble, en une unité de temps, ils font la fraction "), latex("\\dfrac{1}{T}"), texte(e.unite === "h" ? " du travail, avec T, la durée ensemble, convertie en heures." : " du travail, avec T, la durée ensemble.")],
          ];

  const rejet = [
    [texte(`Seulement `), latex(`x=${nombreLatex(e.solution)}`), texte(` : l'autre valeur respecte la CE, mais ${raisonRejet(e)}.`)],
    [texte("Les deux valeurs : elles respectent toutes les deux la CE.")],
    [texte(`Seulement `), latex(`x=${nombreLatex(e.autre)}`), texte(" : l'autre valeur est trop grande pour le contexte.")],
    [texte("Aucune : il y a une valeur interdite par la CE parmi elles.")],
  ];
  const ordreRejet = melangeStable([0, 1, 2, 3], e, 7);

  return [
    {
      type: "choix",
      titre: "Poser l'équation",
      consigne: [texte(`On note x ${r.inconnue}. Quelle équation traduit la situation ?`)],
      options: options.map((o) => [latex(o)]),
      bonne: options.indexOf(eq),
      aides: aidesEquation,
      messageFaux: "Ce n'est pas la bonne équation : relis chaque phrase de l'énoncé et traduis-la avec x.",
    },
    {
      type: "champs",
      titre: "La condition d'existence",
      consigne: [texte("Écris les valeurs de x interdites par la condition d'existence (CE) de l'équation "), latex(eq), texte(".")],
      champs: [
        {
          type: "liste",
          id: "ce",
          libelle: [texte("Valeurs interdites : "), latex("x\\neq")],
          cibles: interdits,
          videPermis: false,
          pieges: [{ valeurs: [0, e.s], message: `Résous $${xPlus(e.s)}\\neq 0$ : attention au signe.` }],
          messageSiFaux: "Chaque dénominateur doit être différent de 0.",
        },
      ],
      aides: [
        [texte("Un dénominateur ne peut jamais être nul : écris chaque dénominateur "), latex("\\neq 0"), texte(".")],
        [texte("Il y a deux dénominateurs : "), latex("x"), texte(" et "), latex(xPlus(e.s)), texte(".")],
      ],
      reponse: [latex(`x\\neq ${nombreLatex(interdits[0]!)}`), texte(" et "), latex(`x\\neq ${nombreLatex(interdits[1]!)}`)],
    },
    {
      type: "champs",
      titre: "Résoudre",
      consigne: [texte("Multiplie les deux membres par le dénominateur commun, ramène tout dans un membre, puis résous l'équation du second degré obtenue.")],
      champs: [
        {
          type: "equation",
          id: "eq2",
          libelle: [texte("Équation du second degré :")],
          variable: "x",
          cible: poly,
          pieges: [],
          messageSiFaux: "Multiplie CHAQUE terme par le dénominateur commun, développe, puis regroupe tout dans un membre.",
        },
        {
          type: "liste",
          id: "sol",
          libelle: [texte("Ses solutions : "), latex("x=")],
          cibles: [x1, x2],
          videPermis: false,
          pieges: [{ valeurs: [-x1, -x2], message: "Ce sont les opposées des solutions : dans la formule, c'est $-b$, pas $b$." }],
          messageSiFaux: "Calcule $\\Delta=b^2-4ac$, puis $x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$.",
        },
      ],
      aides: [
        [texte("Multiplie les deux membres par "), latex(multiplicateurLatex(e)), texte(", qui n'est pas nul grâce à la CE.")],
        [texte("Ramène tout dans un membre, puis calcule : "), latex("\\Delta=b^2-4ac")],
      ],
      reponse: [latex(`${trinomeLatex(e)}=0`), texte(", solutions "), latex(`x=${nombreLatex(x1)}`), texte(" et "), latex(`x=${nombreLatex(x2)}`)],
    },
    {
      type: "choix",
      titre: "Rejeter",
      consigne: [texte("Quelle(s) valeur(s) de x garde-t-on comme solution du problème ? Vérifie la CE, puis le contexte.")],
      options: ordreRejet.map((i) => rejet[i]!),
      bonne: ordreRejet.indexOf(0),
      aides: [
        [texte("Une solution doit respecter la CE et avoir un sens dans le contexte.")],
        e.variante === "trajet" ? [texte("Calcule la vitesse au retour, "), latex(`x-${e.ecart}`), texte(", pour chaque valeur.")] : [texte("Regarde le signe de chaque valeur.")],
      ],
      messageFaux: "Ce n'est pas le bon tri : les deux valeurs respectent la CE, mais une seule a un sens dans le contexte.",
    },
    {
      type: "champs",
      titre: "Répondre",
      consigne: [texte(`Réponds à la question : ${r.question}`)],
      champs: [
        {
          type: "nombre",
          id: "rep",
          libelle: [texte(r.libelleReponse)],
          unite: r.uniteReponse || undefined,
          cible: reponse,
          pieges:
            e.forme === "deduite"
              ? [{ valeur: e.solution, message: "C'est la valeur de x : relis ce que demande la question." }]
              : [{ valeur: e.autre, message: "Cette valeur a été rejetée à l'écran précédent." }],
          messageSiFaux: "Pars de la valeur de x gardée et relis ce que demande la question.",
        },
      ],
      aides:
        e.forme === "deduite"
          ? [[texte(`La question ne demande pas x (${r.inconnue}) : déduis la grandeur demandée de la valeur de x gardée.`)], aideDeduction(e)]
          : [[texte(`x désigne ${r.inconnue} : la réponse est la valeur de x gardée.`)]],
      reponse: [texte(r.phraseReponse)],
    },
  ];
}

function aideDeduction(e: E): Fragments {
  if (e.variante === "prix") return [texte("Prix d'un objet = somme dépensée ÷ nombre d'objets.")];
  if (e.variante === "trajet") return [texte("Au retour, la vitesse vaut "), latex(`x-${e.ecart}`), texte(".")];
  return [texte(`L'autre met ${e.ecart} ${e.unite} de plus : `), latex(`x+${e.ecart}`), texte(".")];
}

/** Mélange déterministe (dérivé des nombres de l'exercice) : l'ordre des options ne change pas
 * d'un rendu à l'autre. */
function melangeStable<T>(t: T[], e: E, sel = 0): T[] {
  let graine = (e.N * 31 + e.s * 17 + e.p * 13 + e.q * 7 + e.contexte * 3 + sel) >>> 0;
  const alea = () => {
    graine = (graine * 1103515245 + 12345) % 2147483648;
    return graine / 2147483648;
  };
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}
