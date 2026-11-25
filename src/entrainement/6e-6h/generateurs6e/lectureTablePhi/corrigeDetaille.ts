import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLTP } from "../../core6e/lectureTablePhi";
import { bonneEcriture, cible, ligneColonne, probaTable } from "../../core6e/lectureTablePhi";
import { extraitTablePhiHtml, phiTable } from "../../core6e/tablePhi";
import { ecritureL, evenementL, reponse } from "../../ui6e/formatLectureTablePhi";
import { clocheSvg, nombreSvg } from "../../ui6e/figureCloche";
import type { ZoneCloche } from "../../ui6e/figureCloche";
import { dL, p4L, phiL, zL } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen116`, partagé par l'appli et le papier — une lettre par
 * écran. Lecture : la décomposition de z (ligne + colonne) et l'extrait de la table autour de la case
 * (figure du corrigé seulement, jamais dans l'énoncé) ; écriture : la propriété (complément, symétrie,
 * différence) ligne par ligne ; calcul : les valeurs lues puis le résultat, avec la cloche de l'aire
 * calculée ; sens inverse : les deux cases qui encadrent la probabilité et leurs écarts.
 */

type E = ExerciceLTP;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

/** Cloche de l'aire demandée (corrigé). */
function clocheAire(e: E): string {
  let zones: ZoneCloche[];
  let reperes: number[];
  switch (e.variante) {
    case "directe":
      zones = [{ de: -Infinity, a: e.a }];
      reperes = [e.a];
      break;
    case "complement":
      zones = [{ de: e.a, a: Infinity }];
      reperes = [e.a];
      break;
    case "symetrie":
      zones = [{ de: -Infinity, a: -e.a }];
      reperes = [-e.a];
      break;
    case "intervalle":
      zones = [{ de: e.aNeg ? -e.a : e.a, a: e.b }];
      reperes = [e.aNeg ? -e.a : e.a, e.b];
      break;
    default:
      zones = e.variante === "inverseSymetrie" && e.sens === "sup" ? [{ de: e.z, a: Infinity }] : [{ de: -Infinity, a: e.z }];
      reperes = [e.z];
  }
  return clocheSvg({ zones, reperes: [{ z: 0, etiquette: "0" }, ...reperes.map((z) => ({ z, etiquette: nombreSvg(z), trait: true }))], largeur: 300, titre: "Courbe de Gauss : aire de la probabilité calculée" });
}

function lecture(z: number, nom: string): LigneCalcul[] {
  const { ligne: li, colonne } = ligneColonne(z);
  return [ligne(`${zL(z)}=${dL(li, 1)}+${dL(colonne, 2)}`, "ligne + colonne"), ligne(`${nom}=${p4L(phiTable(z))}`, "lu dans la table")];
}

/** Deux cases consécutives qui encadrent p (ou la case égale à p). */
function encadrement(p: number): { z1: number; z2: number } | null {
  for (let i = 0; i < 349; i++) {
    const a = phiTable(i / 100);
    const b = phiTable((i + 1) / 100);
    if (Math.abs(a - p) < 1e-9 || Math.abs(b - p) < 1e-9) return null;
    if (a < p && p < b) return { z1: i / 100, z2: (i + 1) / 100 };
  }
  return null;
}

function lignesCaseProche(e: E): LigneCalcul[] {
  const c = cible(e);
  const zc = Math.abs(e.z);
  const enc = encadrement(c);
  if (!enc) return [ligne(`${phiL(zc)}=${p4L(phiTable(zc))}`, "valeur exacte dans la table")];
  const d1 = Math.abs(c - phiTable(enc.z1));
  const d2 = Math.abs(phiTable(enc.z2) - c);
  return [
    ligne(`${phiL(enc.z1)}=${p4L(phiTable(enc.z1))}<${p4L(c)}<${p4L(phiTable(enc.z2))}=${phiL(enc.z2)}`, "deux cases voisines"),
    ligne(`${p4L(c)}-${p4L(phiTable(enc.z1))}=${p4L(d1)}`, "premier écart"),
    ligne(`${p4L(phiTable(enc.z2))}-${p4L(c)}=${p4L(d2)}`, "second écart"),
  ];
}

export function correctionDetailleeLTP(e: E): EtapeCorrection[] {
  const P = probaTable(e);
  const etapes: EtapeCorrection[] = [];
  if (e.variante === "directe") {
    etapes.push(
      utilise("a", [t("Table de "), f("\\Phi"), t(" (cours, § 6) : "), f("\\Phi(z)=P(Z\\le z)"), t(" ; la ligne donne l'unité et le dixième de "), f("z"), t(", la colonne son centième.")]),
      calcul("a", [lecture(e.a, phiL(e.a))[0]!]),
      resultat("a", fr(reponse(e, "case"))),
      utilise("b", [t("La valeur se lit au croisement de la ligne et de la colonne.")]),
      { ...calcul("b", [ligne(`${evenementL(e)}=${phiL(e.a)}`, "lecture directe"), lecture(e.a, phiL(e.a))[1]!]), figureHtml: extraitTablePhiHtml(e.a) },
      resultat("b", fr(reponse(e, "valeur"))),
      verification("b", [t("Pour "), f("z>0"), t(", l'aire à gauche dépasse la moitié de l'aire totale :")], [ligne(`${p4L(P)}>0{,}5`)]),
      piege("b", [t("Lire une case voisine (une colonne ou une ligne à côté) : la ligne porte "), f(dL(ligneColonne(e.a).ligne, 1)), t(", la colonne "), f(dL(ligneColonne(e.a).colonne, 2)), t(".")]),
    );
    return etapes;
  }
  if (e.variante === "inverse" || e.variante === "inverseSymetrie") {
    const zc = Math.abs(e.z);
    if (e.variante === "inverse") {
      etapes.push(
        utilise("a", [t("Sens inverse (cours, § 6) : on cherche la probabilité dans le corps de la table et on garde la case la plus proche.")]),
        { ...calcul("a", lignesCaseProche(e)), figureHtml: extraitTablePhiHtml(zc) },
        resultat("a", fr(reponse(e, "case"))),
      );
    } else {
      etapes.push(
        utilise("a", e.sens === "sup" ? [t("La table donne l'aire à gauche "), f("\\Phi(z)"), t(" : on passe par le contraire, "), f("P(Z\\ge z)=1-\\Phi(z)"), t(".")] : [t("Une probabilité inférieure à "), f("0{,}5"), t(" correspond à un "), f("z"), t(" négatif : on pose "), f("z=-t"), t(" et "), f("\\Phi(-t)=1-\\Phi(t)"), t(".")]),
        calcul(
          "a",
          e.sens === "sup"
            ? [ligne(`1-\\Phi(z)=${p4L(e.p)}`, "contraire"), ligne(`\\Phi(z)=1-${p4L(e.p)}`), ligne(`=${p4L(cible(e))}`)]
            : [ligne(`P(Z\\le -t)=1-\\Phi(t)=${p4L(e.p)}`, "symétrie"), ligne(`\\Phi(t)=1-${p4L(e.p)}`), ligne(`=${p4L(cible(e))}`)],
        ),
        resultat("a", fr(reponse(e, "cible"))),
      );
    }
    const { ligne: li, colonne } = ligneColonne(zc);
    const lignesB: LigneCalcul[] = e.variante === "inverseSymetrie" ? [...lignesCaseProche(e), ligne(`t=${dL(li, 1)}+${dL(colonne, 2)}=${zL(zc)}`, "ligne + colonne")] : [ligne(`z=${dL(li, 1)}+${dL(colonne, 2)}`, "ligne + colonne"), ligne(`=${zL(zc)}`)];
    if (e.variante === "inverseSymetrie") lignesB.push(ligne(`z=${e.sens === "sup" ? "t" : "-t"}=${zL(e.z)}`, e.sens === "sup" ? "z positif" : "z négatif"));
    etapes.push(
      utilise("b", [t("Le réel cherché se lit dans les marges : en-tête de la ligne (unité et dixième) plus en-tête de la colonne (centième).")]),
      { ...calcul("b", lignesB), figureHtml: e.variante === "inverseSymetrie" ? extraitTablePhiHtml(zc) : clocheAire(e) },
      resultat("b", fr(reponse(e, "z"))),
      verification("b", [t("On relit la table :")], [ligne(e.variante === "inverse" ? `${phiL(e.z)}=${p4L(phiTable(e.z))}\\approx ${p4L(e.p)}` : `${evenementL(e).replace(/=.*$/, "").replace("z", zL(e.z))}=${e.sens === "sup" ? `1-${phiL(zc)}` : `1-${phiL(zc)}`}=${p4L(1 - phiTable(zc))}\\approx ${p4L(e.p)}`)]),
      piege(
        "b",
        e.variante === "inverseSymetrie" && e.sens === "inf"
          ? [t("Oublier le signe : une probabilité "), f("P(Z\\le z)"), t(" inférieure à "), f("0{,}5"), t(" donne un "), f("z"), t(" négatif.")]
          : [t("Garder la case de valeur juste inférieure sans comparer les deux écarts, ou recopier la probabilité au lieu de lire "), f("z"), t(" dans les marges.")],
      ),
    );
    return etapes;
  }
  // complement, symetrie, intervalle : écriture puis valeur.
  const juste = ecritureL(e, bonneEcriture(e));
  let lignesA: LigneCalcul[];
  let utiliseA: FragmentConsigne[];
  if (e.variante === "complement") {
    utiliseA = [t("Aire totale sous la courbe égale à 1 ; pour une variable continue, "), f("P(Z=a)=0"), t(" : « "), f("\\ge"), t(" » et « "), f(">"), t(" » donnent la même probabilité (cours, § 6).")];
    lignesA = [ligne(`${evenementL(e)}=1-P(Z\\le ${zL(e.a)})`, "événement contraire"), ligne(`=${juste}`)];
  } else if (e.variante === "symetrie") {
    utiliseA = [t("Symétrie de la courbe par rapport à 0 : "), f("\\Phi(-z)=1-\\Phi(z)"), t(" (cours, § 6).")];
    lignesA = [ligne(`${evenementL(e)}=P(Z\\ge ${zL(e.a)})`, "symétrie de la courbe"), ligne(`=${juste}`, "contraire")];
  } else {
    utiliseA = [f("P(a\\le Z\\le b)=\\Phi(b)-\\Phi(a)"), t(" : aire à gauche de "), f("b"), t(" moins aire à gauche de "), f("a"), t(e.aNeg ? " ; pour une borne négative, " : " (cours, § 6)."), ...(e.aNeg ? [f("\\Phi(-t)=1-\\Phi(t)"), t(" (cours, § 6).")] : [])];
    lignesA = e.aNeg
      ? [ligne(`${evenementL(e)}=${phiL(e.b)}-${phiL(-e.a)}`, "différence"), ligne(`=${phiL(e.b)}-(1-${phiL(e.a)})`, "symétrie"), ligne(`=${juste}`)]
      : [ligne(`${evenementL(e)}=${juste}`, "différence")];
  }
  const valeursLues: LigneCalcul[] =
    e.variante === "intervalle" ? [ligne(`${phiL(e.b)}=${p4L(phiTable(e.b))}`, "lu dans la table"), ligne(`${phiL(e.a)}=${p4L(phiTable(e.a))}`, "lu dans la table")] : [ligne(`${phiL(e.a)}=${p4L(phiTable(e.a))}`, "lu dans la table")];
  const numerique =
    e.variante === "intervalle"
      ? e.aNeg
        ? `${p4L(phiTable(e.b))}+${p4L(phiTable(e.a))}-1`
        : `${p4L(phiTable(e.b))}-${p4L(phiTable(e.a))}`
      : `1-${p4L(phiTable(e.a))}`;
  etapes.push(
    utilise("a", utiliseA),
    calcul("a", lignesA),
    resultat("a", fr(reponse(e, "ecriture"))),
    utilise("b", [t("Valeurs lues dans la table, puis l'écriture de l'étape 1.")]),
    { ...calcul("b", [...valeursLues, ligne(`${evenementL(e)}=${numerique}`, "on remplace"), ligne(`=${p4L(P)}`)]), figureHtml: clocheAire(e) },
    resultat("b", fr(reponse(e, "valeur"))),
    verification("b", [t("C'est bien une probabilité, cohérente avec l'aire colorée :")], [ligne(`0\\le ${p4L(P)}\\le 1`)]),
    piege(
      "b",
      e.variante === "symetrie"
        ? [t("Écrire "), f(`\\Phi(${zL(-e.a)})=\\Phi(${zL(e.a)})=${p4L(phiTable(e.a))}`), t(" : "), f("\\Phi"), t(" n'est pas paire.")]
        : e.variante === "complement"
          ? [t("Répondre "), f(`\\Phi(${zL(e.a)})=${p4L(phiTable(e.a))}`), t(" : c'est l'aire à gauche de "), f(zL(e.a)), t(", pas à droite.")]
          : e.aNeg
            ? [t("Écrire "), f(`\\Phi(${zL(e.b)})-\\Phi(${zL(e.a)})`), t(" : la borne inférieure est "), f(zL(-e.a)), t(", pas "), f(zL(e.a)), t(".")]
            : [t("Additionner les deux valeurs de "), f("\\Phi"), t(" : on trouverait plus que 1.")],
    ),
  );
  return etapes;
}
