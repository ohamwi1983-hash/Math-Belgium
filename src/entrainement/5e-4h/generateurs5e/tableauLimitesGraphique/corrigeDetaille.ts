import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceTableauLimites, Situation } from "../../core5e/tableauLimitesGraphique";
import { fonction, LETTRES } from "../../core5e/tableauLimitesGraphique";
import { limL, MOINS, moinsDroiteL, nombreL, PLUS, pointC, polyL } from "../../ui5e/ecrituresLimitesLotG";
import { droiteL, estOblique, figureCorrige, infL, limBoutL, reponse } from "../../ui5e/formatTableauLimites";

/**
 * Corrigé détaillé « comme au tableau » de `5gen66`, une lettre par écran : a) chaque graphique
 * confronté au tableau — pour un intrus, LA limite lue qui le contredit (f_B, f_C… = fonction du
 * graphique B, C…), pour le bon graphique chaque limite vérifiée ; b) asymptotes verticales
 * (limite infinie en p⁻ / p⁺) ; c) asymptote(s) horizontale(s) ou oblique, figure annotée.
 */

type E = ExerciceTableauLimites;
const t = texte;
const f = latex;
const enveloppe = (svg: string) => `<div style="max-width:6.5cm;margin:4px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

/** Lignes de contrôle du bon graphique (nom de fonction `nom`). */
function lignesConformes(s: Situation, nom: string, lettre: string): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  s.av.forEach((p, i) => {
    L.push(ligne(`${limL(pointC(p, "-"))}${nom}(x)=${infL(s.cotes[i]![0])}`, i === 0 ? `graphique ${lettre} : conforme au tableau` : "conforme"));
    L.push(ligne(`${limL(pointC(p, "+"))}${nom}(x)=${infL(s.cotes[i]![1])}`, "conforme"));
  });
  for (const [c, b] of [
    [MOINS, s.gauche],
    [PLUS, s.droite],
  ] as const) {
    if (b.type === "h") L.push(ligne(`${limL(c)}${nom}(x)=${b.L}`, "conforme"));
    else L.push(ligne(`${limL(c)}\\left[${nom}(x)-(${polyL([b.m, b.q])})\\right]=0`, "conforme"));
  }
  return L;
}

function ligneIntrus(e: E, k: number, lettre: string): LigneCalcul {
  const x = e.intrus[k]!;
  const s = e.sit;
  const nom = `f_{${lettre}}`;
  const elimine = (ce: string) => [t(`graphique ${lettre} : le tableau donne `), f(ce), t(" — éliminé")];
  switch (x.type) {
    case "coteAV":
    case "echangeGD": {
      const i = x.iav!;
      const c = x.type === "coteAV" ? x.cote! : 0;
      const p = s.av[i]!;
      return ligne(`${limL(pointC(p, c === 0 ? "-" : "+"))}${nom}(x)=${infL(x.sit.cotes[i]![c])}`, elimine(infL(s.cotes[i]![c])));
    }
    case "ahValeur": {
      const L2 = x.sit.droite.type === "h" ? x.sit.droite.L : 0;
      return ligne(`${limL(PLUS)}${nom}(x)=${L2}`, [t(`graphique ${lettre} : la courbe passe par la hauteur `), f(limBoutL(s.droite, 1)), t(" sans s'en approcher ; le tableau donne "), f(limBoutL(s.droite, 1)), t(" — éliminé")]);
    }
    case "aoPente": {
      const b = s.droite.type === "o" ? s.droite : { m: 0, q: 0 };
      // f_X ≈ −mx + q : l'écart à la bonne droite vaut −2mx, infini du signe de −m en +∞.
      return ligne(`${limL(PLUS)}\\left[${nom}(x)-(${polyL([b.m, b.q])})\\right]=${infL(-b.m)}`, elimine("0"));
    }
    case "aoOrdonnee": {
      const b = s.droite.type === "o" ? s.droite : { m: 0, q: 0 };
      const q2 = x.sit.droite.type === "o" ? x.sit.droite.q : 0;
      return ligne(`${limL(PLUS)}\\left[${nom}(x)-(${polyL([b.m, b.q])})\\right]=${q2 - b.q}`, elimine("0"));
    }
    case "echangeInfinis":
      return ligne(`${limL(MOINS)}${nom}(x)=${limBoutL(x.sit.gauche, -1)}`, elimine(limBoutL(s.gauche, -1)));
    case "avDeplacee": {
      const p = s.av.find((v) => !x.sit.av.includes(v))!;
      const v = fonction(x.sit)(p);
      return ligne(`${nom}(${p})=${nombreL(v)}`, [t(`graphique ${lettre} : la courbe traverse la droite `), f(`x=${p}`), t(", pas d'asymptote verticale en "), f(`${p}`), t(" — éliminé")]);
    }
  }
}

function etapeA(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [];
  LETTRES.forEach((l, i) => {
    const k = e.ordre[i]!;
    if (k < 0) L.push(...lignesConformes(e.sit, `f_{${l}}`, l));
    else L.push(ligneIntrus(e, k, l));
  });
  return [
    utilise("a", [t("Chaque limite du tableau se lit sur le graphique : limite infinie en "), f("p^-"), t(" (ou "), f("p^+"), t(") → la courbe longe la droite "), f("x=p"), t(" à gauche (ou à droite) en montant ou en descendant ; limite L en l'infini → la courbe s'approche de la droite "), f("y=L"), t(" (cours, point 3). On note "), f("f_A"), t(", "), f("f_B"), t("… la fonction de chaque graphique.")]),
    calcul("a", L),
    resultat("a", reponse(e, "graphique")),
    piege("a", [t("Confondre une asymptote horizontale avec une valeur atteinte : la courbe peut passer par la hauteur L ; c'est son comportement en l'infini qui compte.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const s = e.sit;
  const L: LigneCalcul[] = [];
  s.av.forEach((p, i) => {
    L.push(ligne(`${limL(pointC(p, "-"))}f(x)=${infL(s.cotes[i]![0])}`, "lu dans le tableau"));
    L.push(ligne(`x=${p}`, "limite infinie en cette valeur : asymptote verticale"));
  });
  return [utilise("b", [t("Une limite infinie quand x tend vers p (à gauche ou à droite) donne l'asymptote verticale "), f("x=p"), t(" (cours, point 2).")]), calcul("b", L), resultat("b", reponse(e, "av"))];
}

function etapeC(e: E): EtapeCorrection[] {
  const s = e.sit;
  const L: LigneCalcul[] = [];
  if (estOblique(s) && s.droite.type === "o") {
    L.push(ligne(`${limL(PLUS)}\\left[${moinsDroiteL(s.droite.m, s.droite.q)}\\right]=0`, "lu dans le tableau (aussi en −∞)"));
    L.push(ligne(droiteL(s.droite), "asymptote oblique"));
  } else {
    const deux = e.variante === "deuxAh";
    if (deux && s.gauche.type === "h") {
      L.push(ligne(`${limL(MOINS)}f(x)=${s.gauche.L}`, "lu dans le tableau"));
      L.push(ligne(droiteL(s.gauche), "asymptote horizontale en −∞"));
    }
    if (s.droite.type === "h") {
      L.push(ligne(`${limL(PLUS)}f(x)=${s.droite.L}`, deux ? "lu dans le tableau" : "lu dans le tableau (même limite en −∞)"));
      L.push(ligne(droiteL(s.droite), deux ? "asymptote horizontale en +∞" : "asymptote horizontale"));
    }
  }
  return [
    utilise("c", estOblique(s) ? [t("Si "), f("f(x)-(mx+q)"), t(" tend vers 0 en l'infini, la droite "), f("y=mx+q"), t(" est asymptote oblique (cours, point 2).")] : [t("Une limite finie L en "), f("-\\infty"), t(" ou en "), f("+\\infty"), t(" donne l'asymptote horizontale "), f("y=L"), t(" de ce côté (cours, point 2).")]),
    { ...calcul("c", L), figureHtml: enveloppe(figureCorrige(e)) },
    resultat("c", reponse(e, "horiz")),
  ];
}

export function correctionDetailleeTableauLimites(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e)];
}
