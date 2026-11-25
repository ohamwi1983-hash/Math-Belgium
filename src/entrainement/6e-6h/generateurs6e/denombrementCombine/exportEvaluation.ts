import type { ExerciceDenombrementCombine } from "../../core6e/denombrementCombine.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_PAPIER_44, FORMAT_6GEN44, formuleB44, formuleMultinomiale44, situationPapier44, termesD44 } from "../../ui6e/formatDenombrementCombine";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombine";
import type { PhaseDenombrementCombine } from "../../moteur6e/typesDenombrementCombine";
import { combinaisonBig } from "../../moteur6e/saisieCombinatoire";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeDenombrementCombine } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombine } from "./index";

/**
 * Adaptateur papier de `6gen44` (dénombrement combiné) — refonte du lot E (audit 6e ch. 7) : énoncé =
 * situation en prose avec sa question + « Réponds en justifiant ta démarche. » (regroupable a), b),
 * c)) ; corrigé « comme au tableau » partagé avec l'écran ; barème par écran ; niveau et durée mesurés.
 *
 * Profil (tirage équilibré, Casio Graph Math+) :
 * - A (multinomiale) : `calculatrice` (consigne du lot E : calculatrice indispensable pour les
 *   multinomiales ; `calculatriceIndispensable`) ; cas particulier « deux groupes » (une seule
 *   combinaison) ;
 * - B, D : `calculatrice` quand une combinaison à calculer dépasse 2 000, sinon rien ;
 * - C : rien (petits nombres) ; E : `calculatrice` à partir de 9 lettres (9! et plus à la main).
 * Groupes à verdict (le nom de la variante dit la structure) : `groupe_structure` (B), `groupe_contrainte`
 * (D) ; niveau et durée constants dans chaque groupe (`sansCharge`, nombres 0).
 */

type E = ExerciceDenombrementCombine;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN44 = "Inclure un cas particulier (répartition en deux groupes)";
const SEUIL_CALCULATRICE = 2000n;

function plusGrandeCombinaison(e: E): bigint {
  switch (e.famille) {
    case "B":
      return [combinaisonBig(e.n - 1, e.k), combinaisonBig(e.n1, e.k1), combinaisonBig(e.n2, e.k2), combinaisonBig(e.n1, e.k), combinaisonBig(e.n2, e.k), combinaisonBig(e.n, e.k)].reduce((a, b) => (b > a ? b : a), 0n);
    case "D":
      return BigInt(Math.max(e.terme1, e.terme2));
    default:
      return 0n;
  }
}

export function profilDenombrementCombine(e: E): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.k === 2 ? "deux-groupes" : null, calcul: "calculatrice" };
    case "B":
    case "D":
      return plusGrandeCombinaison(e) > SEUIL_CALCULATRICE ? { casParticulier: null, calcul: "calculatrice" } : { casParticulier: null };
    case "E":
      return e.n >= 9 ? { casParticulier: null, calcul: "calculatrice" } : { casParticulier: null };
    default:
      return { casParticulier: null };
  }
}

function valeur(e: E): number {
  switch (e.famille) {
    case "D":
      return e.resultatFinal;
    case "E":
      return e.nombreMots - 1;
    default:
      return e.resultat;
  }
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.famille === "E" ? [l(milliers(valeur(e))), t(" anagrammes")] : [l(`N=${milliers(valeur(e))}`)];
}

function criteres(e: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeDenombrementCombine(e), []);
  // Méthode 1 partout : reconnaître la structure parmi celles du cours. Aucune donnée piège.
  // Groupes à verdict (B, D) et verdict de C « comparaison » : `sansCharge` et nombres 0, pour que le
  // niveau imprimé ne trahisse pas la structure.
  if (e.famille === "B" || e.famille === "D" || (e.famille === "C" && e.sousType === "comparaison")) return { ...base, methode: 1, piege: 0, nombres: 0, sansCharge: true };
  return { ...base, methode: 1, piege: 0 };
}

function bareme(e: E): BaremeExercice {
  const rep = reponseBreve(e);
  const exact = [[t("Le résultat écrit sous forme de calcul exact (produit de combinaisons, quotient de factorielles) quand la calculatrice est interdite")]];
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Formule des groupes nommés : "), l(formuleMultinomiale44(e.n, e.tailles))], points: 2 },
          { sousQuestion: "b", critere: [t("Calcul : "), l(milliers(e.resultat))], points: 2 },
        ],
        erreursFrequentes: [{ description: [l(`${e.n}!`), t(" sans diviser par les factorielles des tailles")], cout: "0 pt sur l'étape 1" }],
        reponsesAcceptees: [[t("Le produit des combinaisons des équipes choisies l'une après l'autre")], ...exact],
      };
    case "B":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Structure reconnue : "), l(formuleB44(e))], points: 1.5 },
          { sousQuestion: "b", critere: [t("Calcul : "), l(milliers(e.resultat))], points: 2.5 },
        ],
        erreursFrequentes: [{ description: [t("Somme et produit confondus (« et » / « ou »)")], cout: "0 pt sur l'étape 1, étape 2 jugée sur la formule choisie" }],
        reponsesAcceptees: exact,
      };
    case "C":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Groupement reconnu : "), l(e.sousType === "comparaison" && e.discernables ? `${e.n}^{${e.p}}` : `\\Gamma_{${e.n}}^{${e.p}}=C_{${e.n + e.p - 1}}^{${e.p}}`)], points: 2 },
          { sousQuestion: "b", critere: [t("Calcul : "), l(milliers(e.resultat))], points: 2 },
        ],
        erreursFrequentes: [{ description: [t("Combinaison sans répétition, ou ordre compté à tort")], cout: "0 pt sur l'étape 1" }],
      };
    case "D": {
      const [a, b] = termesD44(e);
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Contrainte traduite : "), l(e.typeContrainte === "exclusion" ? `${a}-${b}` : `${a}+${b}`)], points: 1 },
          { sousQuestion: "b", critere: [t("Deux termes : "), l(`${milliers(e.terme1)}`), t(" et "), l(milliers(e.terme2))], points: 2 },
          { sousQuestion: "c", critere: [t("Résultat : "), l(milliers(e.resultatFinal))], points: 1 },
        ],
        erreursFrequentes: [{ description: [t("Choix interdits ajoutés au lieu d'être retirés (ou l'inverse)")], cout: "0 pt sur les étapes 1 et 3" }],
        reponsesAcceptees: exact,
      };
    }
    case "E":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Formule : "), l(formuleMultinomiale44(e.n, e.repetitions.map((r) => r.fois)))], points: 1.5 },
          { sousQuestion: "b", critere: [t("Nombre de mots : "), l(milliers(e.nombreMots))], points: 1.5 },
          { sousQuestion: "c", critere: [t("Mot de départ retiré : "), l(milliers(e.nombreMots - 1))], points: 1 },
        ],
        erreursFrequentes: [{ description: [l(`${e.n}!`), t(" sans diviser par les factorielles des lettres répétées")], cout: "0 pt sur les étapes 1 et 2" }],
      };
  }
}

export const adaptateurEvaluationDenombrementCombine: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseDenombrementCombine>({
  titreDocument: "Dénombrement combiné — Évaluation",
  nomFichierBase: "denombrement-combine",
  genererInstance: genererExerciceDenombrementCombine,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN44,
  phases: phasesPourExercice,
  situation: situationPapier44,
  questions: (e) => [{ consigne: [t(CONSIGNE_PAPIER_44)], etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeDenombrementCombine,
  bareme,
  criteres,
  profil: profilDenombrementCombine,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN44,
  calculatriceIndispensable: ["A_multinomial"],
  groupesVerdict: [
    { id: "groupe_structure", label: "B — Structure d'une sélection (rôle à part, et, ou, un seul choix)", variantes: ["B_roleDistingue", "B_poolsSepares", "B_memeContrainte", "B_partitionComplementaire"] },
    { id: "groupe_contrainte", label: "D — Deux personnes : jamais ensemble, ou ensemble ou pas du tout", variantes: ["D_exclusionPaire", "D_coupleIndissociable", "D_contrainteRiche"] },
  ],
});
