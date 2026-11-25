import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { DonneeNP, ExerciceNP } from "../../core6e/normaleParametres";
import { proportion, valeurTable, xDe, zDe } from "../../core6e/normaleParametres";
import { reponse } from "../../ui6e/formatNormaleParametres";
import { nL, p4L, zL } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen120`, partagé par l'appli et le papier : a) z par la
 * table à l'envers (complément si la proportion est « plus de », symétrie si la valeur est sous la
 * moyenne), une transformation par ligne ; b) (et c)) le paramètre inconnu par x = μ + zσ (système :
 * soustraction des deux égalités) ; vérification en recalculant x ; piège : le signe de z.
 */

type E = ExerciceNP;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function lignesZ(e: E, d: DonneeNP, nom: string): LigneCalcul[] {
  const x = nL(xDe(e, d));
  const pr = p4L(proportion(d));
  const z = zDe(d);
  const lignes: LigneCalcul[] = [];
  if (d.sens === "inf") lignes.push(ligne(`P(X\\le ${x})=${pr}`, "donnée"));
  else lignes.push(ligne(`P(X\\ge ${x})=${pr}`, "donnée"), ligne(`P(X\\le ${x})=1-${pr}=${p4L(1 - proportion(d))}`, "contraire"));
  if (z >= 0) lignes.push(ligne(`\\Phi(${nom})=${p4L(valeurTable(d))}`, "supérieur à 0,5 : z positif"), ligne(`${nom}=${zL(z)}`, "lu dans la table"));
  else lignes.push(ligne(`\\Phi(-${nom})=1-${p4L(1 - valeurTable(d))}=${p4L(valeurTable(d))}`, "inférieur à 0,5 : z négatif, symétrie"), ligne(`-${nom}=${zL(-z)}`, "lu dans la table"), ligne(`${nom}=${zL(z)}`));
  return lignes;
}

export function correctionDetailleeNP(e: E): EtapeCorrection[] {
  const d = e.donnees;
  const etapes: EtapeCorrection[] = [
    utilise("a", [t("Sens inverse (cours, § 6) : "), f("Z=\\dfrac{X-\\mu}{\\sigma}"), t(" suit "), f("\\mathcal{N}(0\\,;1)"), t(" ; une valeur "), f("x"), t(" s'écrit "), f("x=\\mu+z\\sigma"), t(", et "), f("P(X\\le x)=\\Phi(z)"), t(".")]),
    calcul("a", d.length === 2 ? [...lignesZ(e, d[0]!, "z_1"), ...lignesZ(e, d[1]!, "z_2")] : lignesZ(e, d[0]!, "z")),
    resultat("a", fr(reponse(e, "z"))),
  ];
  const x1 = nL(xDe(e, d[0]!));
  const z1 = zDe(d[0]!);
  if (e.variante === "sigma") {
    etapes.push(
      utilise("b", [f("x=\\mu+z\\sigma"), t(", d'où "), f("\\sigma=\\dfrac{x-\\mu}{z}"), t(".")]),
      calcul("b", [ligne(`${x1}=${nL(e.mu)}+(${zL(z1)})\\,\\sigma`), ligne(`\\sigma=\\dfrac{${x1}-${nL(e.mu)}}{${zL(z1)}}`), ligne(`=${nL(e.sigma)}`)]),
      resultat("b", fr(reponse(e, "sigma"))),
      verification("b", [t("On recalcule la valeur donnée :")], [ligne(`${nL(e.mu)}+(${zL(z1)})\\times ${nL(e.sigma)}=${x1}`)]),
      piege("b", [t("Oublier le signe de "), f("z"), t(" : on trouverait un écart-type négatif.")]),
    );
    return etapes;
  }
  if (e.variante === "mu") {
    etapes.push(
      utilise("b", [f("x=\\mu+z\\sigma"), t(", d'où "), f("\\mu=x-z\\sigma"), t(".")]),
      calcul("b", [ligne(`\\mu=${x1}-(${zL(z1)})\\times ${nL(e.sigma)}`), ligne(`=${nL(e.mu)}`)]),
      resultat("b", fr(reponse(e, "mu"))),
      verification("b", [t("On recalcule la valeur donnée :")], [ligne(`${nL(e.mu)}+(${zL(z1)})\\times ${nL(e.sigma)}=${x1}`)]),
      piege("b", [t("Écrire "), f("\\mu=x+z\\sigma"), t(" ou oublier le signe de "), f("z"), t(" : la moyenne serait du mauvais côté de "), f(x1), t(".")]),
    );
    return etapes;
  }
  const x2 = nL(xDe(e, d[1]!));
  const z2 = zDe(d[1]!);
  etapes.push(
    utilise("b", [t("Système "), f(`${x1}=\\mu+z_1\\sigma`), t(" et "), f(`${x2}=\\mu+z_2\\sigma`), t(" : on soustrait les deux égalités.")]),
    calcul("b", [ligne(`${x2}-${x1}=(${zL(z2)}-(${zL(z1)}))\\,\\sigma`), ligne(`${nL(xDe(e, d[1]!) - xDe(e, d[0]!))}=${zL(z2 - z1)}\\,\\sigma`), ligne(`\\sigma=${nL(e.sigma)}`)]),
    resultat("b", fr(reponse(e, "sigma"))),
    utilise("c", [f("\\mu=x_1-z_1\\sigma"), t(".")]),
    calcul("c", [ligne(`\\mu=${x1}-(${zL(z1)})\\times ${nL(e.sigma)}`), ligne(`=${nL(e.mu)}`)]),
    resultat("c", fr(reponse(e, "mu"))),
    verification("c", [t("Seconde égalité :")], [ligne(`${nL(e.mu)}+${zL(z2)}\\times ${nL(e.sigma)}=${x2}`)]),
    piege("c", [t("Prendre "), f("z_1"), t(" positif : la valeur "), f(x1), t(" est sous la moyenne, son "), f("z"), t(" est négatif.")]),
  );
  return etapes;
}
