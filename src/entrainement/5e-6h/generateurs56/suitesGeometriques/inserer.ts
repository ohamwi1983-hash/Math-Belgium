import type { DefinitionEcrans, Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { Fr56 } from "../../commun56/fraction56";
import { divF, egalF, fr56, latexF, latexFP, mulF, negF, powF, valF } from "../../commun56/fraction56";
import { choisir, lireListe56, lireNombre56, proche, statutListe56, statutNombre56 } from "../../commun56/lecture56";
import { adaptateurEcrans56 } from "../../commun56/adaptateurEcrans56";

/**
 * 56gen2, variante AJOUTÉE EN FIN de catalogue « Insérer k termes entre a et b » (5e (6h), étape 8 :
 * « insérer k termes », raison q telle que q^(k+1) = b/a). Écrans : valeur de q^(k+1) (champ), la ou les
 * raisons (liste), les termes insérés (k champs). Verdict « une ou deux raisons » (exposant k + 1 impair
 * ou pair) tiré à parts égales AVANT les nombres ; jamais dans la `forme`, jamais un cas particulier ;
 * niveau et durée constants (piège 1 dans les deux cas : la parité de l'exposant est à examiner).
 */

export type PhaseInserer = "puissance" | "raisons" | "termes";

export interface ExerciceInserer {
  famille56: "inserer";
  k: number;
  a: Fr56;
  /** Raison retenue pour les termes (la positive quand deux raisons conviennent). */
  q: Fr56;
  b: Fr56;
  deuxRaisons: boolean;
}

export const CATALOGUE_INSERER = [{ id: "inserer", label: "Insérer k termes entre deux nombres" }];

export function estInserer(x: unknown): x is ExerciceInserer {
  return !!x && (x as ExerciceInserer).famille56 === "inserer";
}

const RAISONS_POSITIVES: [number, number][] = [[2, 1], [3, 1], [1, 2], [3, 2], [2, 3], [1, 3], [5, 1]];
const RAISONS_TOUTES: [number, number][] = [...RAISONS_POSITIVES, [-2, 1], [-3, 1], [-1, 2], [-3, 2]];

export function genererInserer(): ExerciceInserer {
  const deuxRaisons = Math.random() < 0.5;
  for (let essai = 0; essai < 500; essai++) {
    const k = deuxRaisons ? choisir([1, 1, 3]) : choisir([2, 2, 4]);
    const [qn, qd] = choisir(deuxRaisons ? RAISONS_POSITIVES : RAISONS_TOUTES);
    const q = fr56(qn, qd);
    const m = choisir([1, 2, 3, 4, 5]) * (Math.random() < 0.2 ? -1 : 1);
    const a = fr56(m * Math.pow(q.d, k + 1));
    const b = mulF(a, powF(q, k + 1));
    if (Math.abs(valF(a)) > 2000 || Math.abs(valF(b)) > 2000 || b.d !== 1) continue;
    if (Math.abs(valF(a)) === Math.abs(valF(b))) continue;
    return { famille56: "inserer", k, a, q, b, deuxRaisons };
  }
  return { famille56: "inserer", k: 1, a: fr56(2), q: fr56(3), b: fr56(18), deuxRaisons: true };
}

const t = tx;
const l = lx;
const qk = (e: ExerciceInserer) => divF(e.b, e.a);
export const raisons = (e: ExerciceInserer): Fr56[] => (e.deuxRaisons ? [e.q, negF(e.q)] : [e.q]);
export const termes = (e: ExerciceInserer): Fr56[] => Array.from({ length: e.k }, (_, i) => mulF(e.a, powF(e.q, i + 1)));
const raisonsL = (e: ExerciceInserer) => raisons(e).map(latexF).join("\\ \\text{ou}\\ ");
const termesL = (e: ExerciceInserer) => termes(e).map(latexF).join("\\,;\\ ");
const nombres = (k: number) => (k === 1 ? "un nombre" : `${k} nombres`);

export const phasesInserer = (): PhaseInserer[] => ["puissance", "raisons", "termes"];

function consigneGenerale(e: ExerciceInserer): Frag[] {
  return [
    t(`On veut insérer ${nombres(e.k)} entre `),
    l(latexF(e.a)),
    t(" et "),
    l(latexF(e.b)),
    t(` pour que les ${e.k + 2} nombres forment, dans cet ordre, une suite géométrique : `),
    l(`u_1=${latexF(e.a)}`),
    t(" et "),
    l(`u_{${e.k + 2}}=${latexF(e.b)}`),
    t("."),
  ];
}

const consignePapier = (): Frag[] => [t("Détermine la ou les raisons possibles, puis écris les nombres insérés (avec la raison positive s'il y en a deux).")];

function consigne(e: ExerciceInserer, p: PhaseInserer): Frag[] {
  if (p === "puissance") return [t("Écris la relation entre "), l("u_1"), t(", "), l(`u_{${e.k + 2}}`), t(" et la raison q, puis calcule "), l(`q^{${e.k + 1}}`), t(".")];
  if (p === "raisons") return [t("Donne la ou les valeurs possibles de q (sépare-les par un point-virgule s'il y en a deux).")];
  return [t(e.k === 1 ? "Écris le nombre inséré" : "Écris les nombres insérés, dans l'ordre"), t(" (avec la raison positive s'il y en a deux).")];
}

const champsTermes = (e: ExerciceInserer) => Array.from({ length: e.k }, (_, i) => ({ label: `u${i + 2}`, labelLatex: `u_{${i + 2}}=`, placeholder: "nombre" }));

function diagnostiquer(e: ExerciceInserer, p: PhaseInserer, v: string[]) {
  if (p === "puissance") return [statutNombre56(v[0], valF(qk(e)))];
  if (p === "raisons") return [statutListe56(v[0], raisons(e).map(valF))];
  return termes(e).map((c, i) => statutNombre56(v[i], valF(c)));
}

function piegeInserer(e: ExerciceInserer, p: PhaseInserer, v: string[]): Frag[] | null {
  if (p === "puissance") {
    const x = lireNombre56(v[0]);
    if (x !== null && proche(x, valF(divF(e.a, e.b)))) return [t("Tu as divisé "), l("u_1"), t(" par "), l(`u_{${e.k + 2}}`), t(" : c'est le dernier terme qu'on divise par le premier.")];
    if (x !== null && proche(x, valF(e.b) - valF(e.a))) return [t("Dans une suite géométrique, on multiplie par q : on compare les termes par un quotient, pas par une différence.")];
    return null;
  }
  if (p === "raisons") {
    const xs = lireListe56(v[0]);
    if (!xs) return null;
    if (e.deuxRaisons && xs.length === 1 && proche(Math.abs(xs[0]), valF(e.q))) return [t("L'exposant "), l(`${e.k + 1}`), t(" est pair : un nombre et son opposé ont la même puissance paire. Il y a deux raisons.")];
    if (!e.deuxRaisons && xs.length === 2 && xs.some((x) => proche(x, valF(e.q)))) return [t("L'exposant "), l(`${e.k + 1}`), t(" est impair : une puissance impaire garde le signe, une seule raison convient.")];
    return null;
  }
  const xs = v.map(lireNombre56);
  if (xs.every((x, i) => x !== null && proche(x, valF(mulF(e.a, powF(negF(e.q), i + 1)))))) return [t("Ces termes correspondent à la raison négative ; on demande ceux de la raison positive.")];
  return null;
}

function reponseAttendue(e: ExerciceInserer, p: PhaseInserer): Frag[] {
  if (p === "puissance") return [l(`q^{${e.k + 1}}=${latexF(qk(e))}`)];
  if (p === "raisons") return [l(`q=${raisonsL(e)}`)];
  return [l(termesL(e))];
}

function correction(e: ExerciceInserer): EtapeCorrection[] {
  const n = e.k + 2;
  const exp = e.k + 1;
  const autres = termes(e).map((c, i) => ligne(`u_{${i + 2}}=${latexFP(e.a)}\\cdot ${latexFP(e.q)}${i === 0 ? "" : `^{${i + 1}}`}=${latexF(c)}`));
  return [
    utilise("a", [t("Terme général d'une suite géométrique : "), l("u_n=u_1\\cdot q^{n-1}"), t(`. Avec les ${nombres(e.k)} insérés, `), l(latexF(e.b)), t(` est le terme de rang ${n}.`)]),
    calcul("a", [ligne(`u_{${n}}=u_1\\cdot q^{${exp}}`), ligne(`${latexF(e.b)}=${latexFP(e.a)}\\cdot q^{${exp}}`), ligne(`q^{${exp}}=\\dfrac{${latexF(e.b)}}{${latexF(e.a)}}=${latexF(qk(e))}`)]),
    utilise("b", e.deuxRaisons ? [t("L'exposant "), l(`${exp}`), t(" est pair : deux nombres opposés ont la même puissance, d'où deux raisons.")] : [t("L'exposant "), l(`${exp}`), t(" est impair : une seule raison, du signe de "), l(latexF(qk(e))), t(".")]),
    calcul("b", [
      ligne(`q=${e.deuxRaisons ? "\\pm" : ""}${exp === 2 ? "\\sqrt" : `\\sqrt[${exp}]`}{${latexF(qk(e))}}`),
      ligne(`q=${raisonsL(e)}`),
      ligne(`${latexFP(e.q)}^{${exp}}=${latexF(qk(e))}`, "vérification"),
    ]),
    resultat("b", [l(`q=${raisonsL(e)}`)]),
    calcul("c", autres, [t(e.deuxRaisons ? "Avec la raison positive " : "Avec "), l(`q=${latexF(e.q)}`), t(" :")]),
    resultat("c", [t(`Suite : `), l(`${latexF(e.a)}\\,;\\ ${termesL(e)}\\,;\\ ${latexF(e.b)}`), ...(e.deuxRaisons ? [t(" ; avec "), l(`q=${latexF(negF(e.q))}`), t(" : "), l(`${latexF(e.a)}\\,;\\ ${termes(e).map((_, i) => latexF(mulF(e.a, powF(negF(e.q), i + 1)))).join("\\,;\\ ")}\\,;\\ ${latexF(e.b)}`), t(".")] : [t(".")])]),
    piege("b", [t("Avec un exposant pair, oublier la raison négative ; avec un exposant impair, en inventer une.")]),
  ];
}

export const DEFINITION_INSERER: DefinitionEcrans<ExerciceInserer, PhaseInserer> = {
  phases: phasesInserer,
  estChoix: () => false,
  mode: (e, p) =>
    p === "puissance"
      ? { type: "champs", champs: [{ label: `q puissance ${e.k + 1}`, labelLatex: `q^{${e.k + 1}}=`, placeholder: "nombre ou fraction" }] }
      : p === "raisons"
        ? { type: "champs", champs: [{ label: "q", labelLatex: "q=", placeholder: "ex. : 2 ou 2 ; −2" }] }
        : { type: "champs", champs: champsTermes(e) },
  libelle: (_e, p) => (p === "puissance" ? "Puissance de q" : p === "raisons" ? "Raison(s)" : "Termes insérés"),
  consigneGenerale,
  consigne,
  aide1: (_e, p) =>
    p === "puissance"
      ? { texte: [t("Terme général d'une suite géométrique :")], latex: "u_n=u_1\\cdot q^{n-1}" }
      : p === "raisons"
        ? { texte: [t("Pour un exposant pair, "), l("x^{2m}=c"), t(" (avec c > 0) a deux solutions opposées ; pour un exposant impair, une seule.")] }
        : { texte: [t("Chaque terme s'obtient en multipliant le précédent par la raison.")] },
  aide2: (e, p) =>
    p === "puissance"
      ? { texte: [t(`Ici, le dernier nombre est le terme de rang ${e.k + 2} :`)], latex: `${latexF(e.b)}=${latexFP(e.a)}\\cdot q^{${e.k + 1}}` }
      : p === "raisons"
        ? { texte: [t("On cherche les nombres dont la puissance "), l(`${e.k + 1}`), t("-ième vaut "), l(latexF(qk(e))), t(` ; l'exposant ${e.k + 1} est-il pair ?`)] }
        : { texte: [t("Commence par "), l(`u_2=${latexFP(e.a)}\\cdot q`), t(".")] },
  diagnostiquer,
  piege: piegeInserer,
  messageIllisible: () => "Écris un nombre (entier, décimal ou fraction comme 3/2) ; pour deux valeurs, sépare-les par « ; ». Cette saisie ne compte pas comme une tentative.",
  reponseAttendue,
  recap: (e, p) => reponseAttendue(e, p),
  correction,
};

export const adaptateurInserer = adaptateurEcrans56<ExerciceInserer, PhaseInserer>({
  def: DEFINITION_INSERER,
  titreDocument: "Insérer des termes dans une suite géométrique — Évaluation",
  nomFichierBase: "inserer-termes-geometrique",
  catalogue: CATALOGUE_INSERER,
  genererLibre: genererInserer,
  genererVariante: () => genererInserer(),
  consignePapier,
  reponseBreve: (e) => [l(`q=${raisonsL(e)}`), t(" ; nombres insérés : "), l(termesL(e)), ...(e.deuxRaisons ? [t(" (raison positive)")] : [])],
  critere: (e, p) =>
    p === "puissance"
      ? { points: 1, critere: [t("Relation "), l(`u_{${e.k + 2}}=u_1\\cdot q^{${e.k + 1}}`), t(" et "), l(`q^{${e.k + 1}}=${latexF(qk(e))}`)] }
      : p === "raisons"
        ? { points: 1.5, critere: [t("Parité de l'exposant examinée : "), l(`q=${raisonsL(e)}`)] }
        : { points: 1.5, critere: [t("Nombres insérés : "), l(termesL(e))] },
  erreursFrequentes: (e) => [
    { description: [t("Raison négative oubliée (exposant pair) ou ajoutée à tort (exposant impair)")], cout: "moitié des points de l'étape 2" },
    { description: [t("Exposant "), l(`${e.k + 2}`), t(" au lieu de "), l(`${e.k + 1}`), t(" (rang mal compté)")], cout: "0 pt sur l'étape 1, suite jugée selon la démarche" },
  ],
  reponsesAcceptees: () => [[t("Raisons écrites sous forme décimale exacte ; nombres insérés pour les deux raisons")]],
  criteres: () => ({ methode: 1, piege: 1, nombres: 0 }),
  profil: () => ({ casParticulier: null, forme: "inserer" }),
});

/** Contrôle de cohérence (outil de vérification) : les termes insérés et b forment bien la suite. */
export function verifierInserer(e: ExerciceInserer): boolean {
  const suite = [e.a, ...termes(e), e.b];
  for (let i = 1; i < suite.length; i++) if (!egalF(divF(suite[i], suite[i - 1]), e.q)) return false;
  return raisons(e).every((r) => egalF(powF(r, e.k + 1), qk(e)));
}
