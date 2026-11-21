import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceChaslesSansFigure, ExerciceCoefficients, ExerciceDemontrer, ExerciceInserer, ExerciceReduire } from "../../core/chaslesSansFigure.types";
import type { TermeVecteur } from "../../moteur/expressionChasles";
import { insertionInserer, positif, premiereLigneJuste, resultatCoefficients, resultatInserer, resultatReduire, sommePointL, TL, V, vec, vecteurDemontrer } from "../../ui/formatChaslesSansFigure";
import { l, t } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen130 (partagé par l'adaptateur et l'appli, une lettre
 * par écran). Chaque ligne de calcul est une égalité VRAIE pour tous les points (ou sous
 * l'hypothèse de l'énoncé : milieu, point défini par une égalité) — le collecteur la contrôle avec
 * des points tirés au hasard.
 */

type E = ExerciceChaslesSansFigure;
const C2 = "(cours, § 2)";
const C5 = "(cours, § 5)";
const C6 = "(cours, § 6)";

/** Chaîne de Chasles de proche en proche : V0 + V1 + … → un seul vecteur (ou le vecteur nul). */
function lignesTelescopage(chaine: string[], ferme: boolean): LigneCalcul[] {
  const n = ferme ? chaine.length : chaine.length - 1;
  const pts = ferme ? [...chaine, chaine[0]!] : chaine;
  const lignes: LigneCalcul[] = [];
  for (let i = 1; i < n; i++) {
    const reste = Array.from({ length: n - i - 1 }, (_, j) => V(pts[i + 1 + j]!, pts[i + 2 + j]!));
    lignes.push(ligne(`=${[V(pts[0]!, pts[i + 1]!), ...reste].join("+")}`, `Chasles en ${pts[i]}`));
  }
  if (ferme) lignes.push(ligne("=\\vec{0}", [l(V(pts[0]!, pts[0]!)), t(" est le vecteur nul")]));
  return lignes;
}

function corrigeReduire(e: ExerciceReduire): EtapeCorrection[] {
  const retranches = e.termes.filter((x) => x.k < 0);
  const positifs = e.termes.map(positif);
  const pts = e.ferme ? [...e.chaine, e.chaine[0]!] : e.chaine;
  const enChaine = Array.from({ length: pts.length - 1 }, (_, i) => vec(1, pts[i]!, pts[i + 1]!));
  const premier = retranches[0]!;
  const lignesA: LigneCalcul[] = [
    ...retranches.map((x) => ligne(`-${V(x.de, x.vers)}=${V(x.vers, x.de)}`, "l'opposé : on échange les deux lettres")),
    ligne(`${TL(e.termes)}=${TL(positifs)}`, "on remplace chaque vecteur retranché"),
  ];
  const lignesB: LigneCalcul[] = [ligne(`${TL(positifs)}=${TL(enChaine)}`, "on réordonne : chaque vecteur part de l'arrivée du précédent"), ...lignesTelescopage(e.chaine, e.ferme)];
  const res = resultatReduire(e);
  const premierPt = e.chaine[0]!;
  const dernierPt = e.ferme ? premierPt : e.chaine[e.chaine.length - 1]!;
  return [
    utilise("a", [t("Retrancher un vecteur, c'est ajouter son opposé ; l'opposé de "), l("\\vec{XY}"), t(" est "), l("\\vec{YX}"), t(` ${C2} et ${C5}.`)]),
    calcul("a", lignesA),
    resultat("a", [l(`${TL(e.termes)}=${TL(positifs)}`)]),
    piege("a", [t("On échange les deux lettres et on remplace « − » par « + » : "), l(`-${V(premier.de, premier.vers)}=${V(premier.vers, premier.de)}`), t(", pas "), l(V(premier.de, premier.vers)), t(".")]),
    utilise("b", [t("Relation de Chasles : "), l("\\vec{XY}+\\vec{YZ}=\\vec{XZ}"), t(` ; on range d'abord les vecteurs pour qu'ils se relaient ${C6}.`)]),
    calcul("b", lignesB),
    resultat("b", [l(`${TL(e.termes)}=${TL(res)}`)]),
    verification("b", e.ferme ? [t(`La chaîne part de ${premierPt} et revient en ${premierPt} : elle est fermée, d'où le vecteur nul.`)] : [t(`La chaîne part de ${premierPt} et arrive en ${dernierPt} : le résultat va du premier point au dernier.`)]),
    piege("b", [t("On ne télescope que deux vecteurs qui se relaient : l'arrivée du premier doit être le départ du second.")]),
  ];
}

function corrigeCoefficients(e: ExerciceCoefficients): EtapeCorrection[] {
  const { X, Y, Z, k, c } = e;
  const g = e.groupe;
  const negatif = g.find((x) => x.k < 0);
  const lignesA: LigneCalcul[] = [];
  const parenthese = `${k}(${V(X, Y)}+${V(Y, Z)})`;
  if (negatif) {
    lignesA.push(ligne(`${TL(g)}=${TL(g.map(positif))}`, "on retourne le vecteur précédé de « − »"));
    lignesA.push(ligne(`=${parenthese}`, `on met ${k} en évidence`));
  } else lignesA.push(ligne(`${TL(g)}=${parenthese}`, `on met ${k} en évidence`));
  lignesA.push(ligne(`=${TL([vec(k, X, Z)])}`, `Chasles en ${Y}`));
  const r = k + c;
  const avecTroisieme = TL([vec(k, X, Z), vec(c, X, Z)]);
  const lignesB: LigneCalcul[] = [ligne(`${TL(e.termes)}=${avecTroisieme}`, e.retourneC ? "étape a ; le dernier vecteur retourné change de signe" : "étape a")];
  lignesB.push(ligne(`=(${k}${c < 0 ? c : `+${c}`})${V(X, Z)}`, "on additionne les coefficients"));
  if (r === 0) lignesB.push(ligne(`=0\\cdot ${V(X, Z)}`), ligne("=\\vec{0}"));
  else if (r < 0) lignesB.push(ligne(`=${TL([vec(r, X, Z)])}`), ligne(`=${TL(resultatCoefficients(e))}`, "on retourne le vecteur"));
  else lignesB.push(ligne(`=${TL(resultatCoefficients(e))}`));
  return [
    utilise("a", [t("Un coefficient commun se met en évidence (cours, § 3), puis la relation de Chasles réduit la parenthèse "), t(C6), t(".")]),
    calcul("a", lignesA),
    resultat("a", [l(`${TL(g)}=${TL([vec(k, X, Z)])}`)]),
    piege("a", negatif ? [t("Retourner un vecteur change le signe de son coefficient : "), l(`${TL([negatif])}=${TL([positif(negatif)])}`), t(".")] : [t("Le coefficient reste devant le vecteur réduit : "), l(`${parenthese}=${TL([vec(k, X, Z)])}`), t(", pas "), l(V(X, Z)), t(".")]),
    utilise("b", [t("On remplace le groupe par le vecteur trouvé, on écrit le dernier terme avec le même vecteur, puis on additionne les coefficients d'un même vecteur (cours, § 3).")]),
    calcul("b", lignesB),
    resultat("b", [l(`${TL(e.termes)}=${TL(resultatCoefficients(e))}`)]),
    piege("b", [t("Le signe écrit devant le dernier terme fait partie de son coefficient : "), l(`${TL([e.troisieme])}=${TL([vec(c, X, Z)])}`), t(".")]),
  ];
}

function corrigeDemontrer(e: ExerciceDemontrer): EtapeCorrection[] {
  const { P, Q, R, S } = e;
  const juste = premiereLigneJuste(e);
  const gauche = TL(e.gauche);
  if (e.sousForme === "difference") {
    return [
      utilise("a", [t("On transforme le membre de gauche. Retrancher un vecteur, c'est ajouter son opposé "), t(C5), t(".")]),
      calcul("a", [ligne(`${gauche}=${TL(juste)}`, [t("on remplace "), l(`-${V(R, Q)}`), t(" par son opposé")])]),
      resultat("a", [l(`${gauche}=${TL(juste)}`)]),
      piege("a", [t("Seul le vecteur retranché change de sens : "), l(V(P, Q)), t(" reste "), l(V(P, Q)), t(".")]),
      utilise("b", [t("Relation de Chasles "), t(C6), t(", sur chaque membre.")]),
      calcul("b", [ligne(`${gauche}=${TL(juste)}`, "étape a"), ligne(`=${V(P, R)}`, `Chasles en ${Q}`)], [], "Membre de gauche"),
      calcul("b", [ligne(`${TL(e.droite)}=${V(P, S)}+${V(S, R)}`, [t("on remplace "), l(`-${V(R, S)}`), t(" par son opposé")]),ligne(`=${V(P, R)}`, `Chasles en ${S}`)], [], "Membre de droite"),
      resultat("b", [t("Les deux membres valent "), l(V(P, R)), t(" : "), l(`${gauche}=${TL(e.droite)}`), t(" pour tous points.")]),
      piege("b", [t("On ne part pas de l'égalité à démontrer : on réduit chaque membre séparément, puis on compare.")]),
    ];
  }
  const insertion = e.insere === "S" ? `${V(P, Q)}=${V(P, S)}+${V(S, Q)}` : `${V(R, S)}=${V(R, Q)}+${V(Q, S)}`;
  const reordonne = e.insere === "S" ? [vec(1, P, S), vec(1, R, S), vec(1, S, Q)] : [vec(1, R, Q), vec(1, P, Q), vec(1, Q, S)];
  const reduit = e.insere === "S" ? [vec(1, P, S), vec(1, R, Q)] : [vec(1, R, Q), vec(1, P, S)];
  const lignesB: LigneCalcul[] = [ligne(`${gauche}=${TL(juste)}`, "étape a"), ligne(`=${TL(reordonne)}`, "on réordonne"), ligne(`=${TL(reduit)}`, `Chasles en ${e.insere}`)];
  if (TL(reduit) !== TL(e.droite)) lignesB.push(ligne(`=${TL(e.droite)}`, "on range comme le membre de droite"));
  const attendu = vecteurDemontrer(e);
  return [
    utilise("a", [t("On part du membre de gauche et on le transforme jusqu'à obtenir celui de droite. La relation de Chasles permet d'insérer un point : "), l(insertion), t(` ${C6}.`)]),
    calcul("a", [ligne(`${gauche}=${TL(juste)}`, `on insère ${e.insere}`)]),
    resultat("a", [l(`${gauche}=${TL(juste)}`)]),
    piege("a", [t("La relation de Chasles s'enchaîne : le point inséré est l'arrivée du premier vecteur et le départ du second, "), l(insertion), t(".")]),
    utilise("b", [t("On réordonne pour que deux vecteurs se relaient, puis on applique la relation de Chasles "), t(C6), t(".")]),
    calcul("b", lignesB),
    resultat("b", [t("Le vecteur obtenu est "), l(TL([attendu])), t(" ; donc "), l(`${gauche}=${TL(e.droite)}`), t(" pour tous points.")]),
    verification("b", [t("Contrôle : les deux membres ont les mêmes points de départ ("), l(P), t(" et "), l(R), t(") et les mêmes points d'arrivée ("), l(Q), t(" et "), l(S), t(").")]),
    piege("b", [t("On ne part jamais de l'égalité à démontrer : on transforme un seul membre jusqu'à obtenir l'autre.")]),
  ];
}

function corrigeInserer(e: ExerciceInserer): EtapeCorrection[] {
  const { A, B, I, M } = e;
  if (e.sousForme === "milieu") {
    const somme = `${V(M, A)}+${V(M, B)}`;
    return [
      utilise("a", [t("La relation de Chasles permet d'insérer n'importe quel point dans un vecteur : "), l(`${V(M, A)}=${V(M, I)}+${V(I, A)}`), t(` ${C6}.`)]),
      calcul("a", [ligne(`${somme}=${V(M, I)}+${V(I, A)}+${V(M, I)}+${V(I, B)}`, `on insère ${I} dans chaque vecteur`), ligne(`=${TL(insertionInserer(e))}`, "on regroupe")]),
      resultat("a", [l(`${somme}=${TL(insertionInserer(e))}`)]),
      piege("a", [l(I), t(" se place au milieu de l'écriture : "), l(`${V(M, I)}+${V(I, A)}`), t(", jamais "), l(`${V(M, I)}+${V(A, I)}`), t(".")]),
      utilise("b", [l(I), t(` est le milieu de [${A}${B}] : `), l(V(I, A)), t(" et "), l(V(I, B)), t(" ont la même longueur, la même direction et des sens contraires, donc ils sont opposés "), t(C6), t(".")]),
      calcul("b", [ligne(`${V(I, A)}+${V(I, B)}=\\vec{0}`, `${I} est le milieu de [${A}${B}]`), ligne(`${somme}=2${V(M, I)}+\\vec{0}`, "étape a"), ligne(`=2${V(M, I)}`)]),
      resultat("b", [l(`${somme}=2${V(M, I)}`)]),
      verification("b", [t(`Avec ${M} placé en ${A} :`)], [ligne(`${V(A, A)}+${V(A, B)}=${V(A, B)}`, [l(V(A, A)), t(" est le vecteur nul")]),ligne(`=2${V(A, I)}`, `${I} est le milieu de [${A}${B}]`)]),
      piege("b", [t("La somme contient deux fois "), l(V(M, I)), t(" : le facteur 2 ne disparaît pas.")]),
    ];
  }
  const s = e.a + e.b;
  const b = e.b;
  const res: TermeVecteur[] = resultatInserer(e);
  const lignesA: LigneCalcul[] = [ligne(`${sommePointL(e)}=${TL([vec(e.a, I, A)])}+${b === 1 ? "" : b}(${V(I, A)}+${V(A, B)})`, [t(`on insère ${A} dans `), l(V(I, B))])];
  if (b !== 1) lignesA.push(ligne(`=${TL([vec(e.a, I, A), vec(b, I, A), vec(b, A, B)])}`, `on distribue ${b}`));
  lignesA.push(ligne(`=${TL(insertionInserer(e))}`, "on regroupe"));
  const lignesB: LigneCalcul[] = [
    ligne(`${TL(insertionInserer(e))}=\\vec{0}`, "énoncé et étape a"),
    ligne(`${TL([vec(-s, A, I), vec(b, A, B)])}=\\vec{0}`, [t("car "), l(`${V(I, A)}=-${V(A, I)}`)]),
    ligne(`${TL([vec(b, A, B)])}=${TL([vec(s, A, I)])}`, [t("on ajoute "), l(`${s}${V(A, I)}`), t(" aux deux membres")]),
    ligne(`${V(A, I)}=${TL(res)}`, `on divise par ${s}`),
  ];
  return [
    utilise("a", [t("On insère "), l(A), t(" dans "), l(V(I, B)), t(" pour ne garder que "), l(V(I, A)), t(" et "), l(V(A, B)), t(" : "), l(`${V(I, B)}=${V(I, A)}+${V(A, B)}`), t(` ${C6}.`)]),
    calcul("a", lignesA),
    resultat("a", [l(`${sommePointL(e)}=${TL(insertionInserer(e))}`)]),
    piege("a", [t("Le coefficient s'applique aux deux vecteurs de la parenthèse : "), l(`${b === 1 ? "" : b}(${V(I, A)}+${V(A, B)})=${TL([vec(b, I, A), vec(b, A, B)])}`), t(".")]),
    utilise("b", [t("D'après l'énoncé, cette somme vaut "), l("\\vec{0}"), t(" ; et "), l(V(I, A)), t(" et "), l(V(A, I)), t(" sont opposés "), t(C2), t(".")]),
    calcul("b", lignesB),
    resultat("b", [l(`${V(A, I)}=${TL(res)}`)]),
    verification("b", [t("On reporte dans l'énoncé :")], [
      ligne(`${V(I, A)}=${TL([vec(-b / s, A, B)])}`, "opposé du résultat"),
      ligne(`${V(I, B)}=${TL([vec(e.a / s, A, B)])}`, [t("car "), l(`${V(I, B)}=${V(I, A)}+${V(A, B)}`)]),
      ligne(`${sommePointL(e)}=${TL([vec((-e.a * b) / s, A, B), vec((e.a * b) / s, A, B)])}`),
      ligne("=\\vec{0}"),
    ]),
    piege("b", [l(V(A, I)), t(" et "), l(V(I, A)), t(" sont opposés : en retournant le vecteur, le signe change.")]),
  ];
}

export function correctionDetailleeChasles(e: E): EtapeCorrection[] {
  if (e.variante === "reduire") return corrigeReduire(e);
  if (e.variante === "coefficients") return corrigeCoefficients(e);
  if (e.variante === "demontrer") return corrigeDemontrer(e);
  return corrigeInserer(e);
}
