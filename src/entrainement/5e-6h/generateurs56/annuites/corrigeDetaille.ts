import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lettreEtape, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { centL, centT, COUL_FLECHE2, exposant, ligneTempsSvg, montantL, montantT, nL, nT, pourcentFixeL } from "../finance/commun";
import type { ExerciceAnnuites, PhaseAnnuites } from "./index";
import { facteurVn, iDe, iPeriode, nbVersements, phasesAnnuites, V0, Vn, VnApres, versementCherche } from "./index";
import { fL, iL, interetsAttendus, optionJuste, reponse } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen27` (étape 13 du cours), une lettre par écran ; LIGNE DU
 * TEMPS sous la formule (versements, valeur cherchée, flèches capitaliser / actualiser).
 */

type E = ExerciceAnnuites;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const facT = (e: E) => nT(1 + iPeriode(e), 6);

function figure(e: E): string {
  const n = nbVersements(e);
  const aT = montantT(e.a);
  switch (e.variante) {
    case "placementDernier":
    case "mensuel":
      return ligneTempsSvg({
        n,
        unite: e.variante === "mensuel" ? "mois" : "années",
        versements: Array.from({ length: n }, (_, k) => ({ k: k + 1, texte: aT })),
        marques: [{ k: n, texte: `Vₙ ≈ ${centT(Vn(e))}` }],
        fleches: [{ de: 1, a: n, texte: `1er versement × ${facT(e)}${exposant(n - 1)}` }],
      });
    case "placementApres":
      return ligneTempsSvg({
        n: e.n,
        unite: "années",
        etiquette: (k) => (k === e.n ? `fin ${e.annee + e.n - 1}` : String(e.annee + k)),
        versements: Array.from({ length: e.n }, (_, k) => ({ k, texte: aT })),
        marques: [{ k: e.n, texte: `≈ ${centT(VnApres(e))}` }],
        fleches: [
          { de: 0, a: e.n - 1, texte: `Vₙ (au dernier versement)` },
          { de: e.n - 1, a: e.n, texte: `× ${facT(e)}`, couleur: COUL_FLECHE2 },
        ],
      });
    case "valeurActuelle":
      return ligneTempsSvg({
        n: e.n,
        unite: "années",
        versements: Array.from({ length: e.n }, (_, k) => ({ k: k + 1, texte: aT })),
        marques: [{ k: 0, texte: `V₀ ≈ ${centT(V0(e))}` }],
        fleches: [
          { de: 1, a: 0, texte: `× ${facT(e)}${exposant(-1)}`, couleur: COUL_FLECHE2 },
          { de: e.n, a: 0, texte: `× ${facT(e)}${exposant(-e.n)}`, couleur: COUL_FLECHE2 },
        ],
      });
    case "versement":
      return ligneTempsSvg({
        n: e.apres ? e.n : e.n,
        unite: "années",
        versements: Array.from({ length: e.n }, (_, k) => ({ k: e.apres ? k : k + 1, texte: "a" })),
        marques: [{ k: e.n, texte: `${montantT(e.cible)} visés` }],
        fleches: e.apres ? [{ de: e.n - 1, a: e.n, texte: `× ${facT(e)}`, couleur: COUL_FLECHE2 }] : [{ de: 1, a: e.n, texte: `1er versement × ${facT(e)}${exposant(e.n - 1)}` }],
      });
  }
}

function etape(e: E, p: PhaseAnnuites, l: string): EtapeCorrection[] {
  const n = nbVersements(e);
  const A = montantL(e.a);
  switch (p) {
    case "formule": {
      if (e.variante === "valeurActuelle")
        return [
          utilise(l, [t("Valeur actuelle : chaque remboursement est ramené à la date de l'emprunt ; c'est aussi la valeur acquise actualisée de n années.")]),
          calcul(l, [ligne("V_0=a\\,(1+i)^{-1}+a\\,(1+i)^{-2}+\\dots+a\\,(1+i)^{-n}"), ligne("=V_n\\,(1+i)^{-n}=a\\,\\dfrac{(1+i)^n-1}{i}\\,(1+i)^{-n}"), ligne("=a\\,\\dfrac{1-(1+i)^{-n}}{i}")]),
          { ...resultat(l, fr(optionJuste(e, "formule"))), figureHtml: figure(e) },
          piege(l, [t("Prendre la formule de "), f("V_n"), t(" : elle donne la valeur au moment du dernier remboursement, pas à la date de l'emprunt.")]),
        ];
      if (e.variante === "versement")
        return [
          utilise(l, [t("On écrit que la valeur acquise des versements vaut la somme visée "), f("S"), t(e.apres ? ", une année après le dernier versement, et on isole a." : " au moment du dernier versement, et on isole a.")]),
          calcul(l, e.apres ? [ligne("a\\,\\dfrac{(1+i)^n-1}{i}\\,(1+i)=S"), ligne("a=\\dfrac{S\\cdot i}{\\left((1+i)^n-1\\right)(1+i)}")] : [ligne("a\\,\\dfrac{(1+i)^n-1}{i}=S"), ligne("a=\\dfrac{S\\cdot i}{(1+i)^n-1}")]),
          { ...resultat(l, fr(optionJuste(e, "formule"))), figureHtml: figure(e) },
          piege(l, [t("Diviser la somme visée par le nombre de versements : on oublie les intérêts.")]),
        ];
      return [
        utilise(l, [t("Le premier versement est capitalisé n − 1 fois, le dernier ne l'est pas : on additionne une suite géométrique de premier terme a et de raison 1 + i.")]),
        calcul(l, [ligne("V_n=a+a\\,(1+i)+\\dots+a\\,(1+i)^{n-1}"), ligne("=a\\,\\dfrac{(1+i)^n-1}{(1+i)-1}=a\\,\\dfrac{(1+i)^n-1}{i}", "somme des termes d'une suite géométrique")]),
        { ...resultat(l, fr(optionJuste(e, "formule"))), figureHtml: figure(e) },
        piege(l, [t("Confondre avec la valeur actuelle "), f("a\\,\\dfrac{1-(1+i)^{-n}}{i}"), t(", calculée une période avant le premier versement.")]),
      ];
    }
    case "moment":
      return [
        utilise(l, [t("Le dernier versement a lieu le 1er janvier ; le capital reste placé jusqu'au 31 décembre, soit une année de plus.")]),
        calcul(l, [ligne("V_{\\text{fin}}=V_n\\,(1+i)")]),
        { ...resultat(l, fr(optionJuste(e, "moment"))), figureHtml: figure(e) },
        piege(l, [t("Donner "), f("V_n"), t(" : le capital rapporte encore des intérêts pendant la dernière année.")]),
      ];
    case "valeur": {
      if (e.variante === "mensuel")
        return [
          utilise(l, [t("Même formule avec le taux mensuel (gardé en mémoire) et "), f(`n=12\\cdot ${e.n}=${n}`), t(" versements.")]),
          calcul(l, [ligne(`V_{${n}}=${A}\\cdot\\dfrac{(1+i_{\\text{mensuel}})^{${n}}-1}{i_{\\text{mensuel}}}`), ligne(`\\approx ${centL(Vn(e))}`)]),
          { ...resultat(l, fr(reponse(e, "valeur"))), figureHtml: figure(e) },
          verification(l, [t(`Avec le taux mensuel arrondi au millième de %, on trouve un résultat qui peut différer de quelques centimes à quelques euros : on garde le taux en mémoire.`)]),
        ];
      return [
        utilise(l, [t("Valeur acquise au dernier versement : "), f("V_n=a\\,\\dfrac{(1+i)^n-1}{i}"), t(".")]),
        calcul(l, [ligne(`V_{${n}}=${A}\\cdot\\dfrac{${fL(e)}^{${n}}-1}{${iL(e)}}`), ligne(`\\approx ${nL(Vn(e), 4, true)}`), ligne(`\\approx ${centL(Vn(e))}`, "au centime")]),
        resultat(l, fr(reponse(e, "valeur"))),
      ];
    }
    case "cherchee":
      return [
        utilise(l, [t("On capitalise "), f("V_n"), t(" pendant une année.")]),
        calcul(l, [ligne(`V_{${e.n}}\\,(1+i)=${A}\\cdot\\dfrac{${fL(e)}^{${e.n}}-1}{${iL(e)}}\\cdot ${fL(e)}`), ligne(`\\approx ${centL(VnApres(e))}`)]),
        resultat(l, [t(`Le 31 décembre ${e.annee + e.n - 1}, le capital vaut environ `), f(centL(VnApres(e))), t(" €.")]),
      ];
    case "interets": {
      if (e.variante === "valeurActuelle")
        return [
          utilise(l, [t("Intérêts payés = total remboursé − montant emprunté.")]),
          calcul(l, [ligne(`I=${e.n}\\cdot ${A}-V_0`), ligne(`\\approx ${montantL(e.n * e.a)}-${centL(V0(e))}`), ligne(`\\approx ${centL(interetsAttendus(e))}`)]),
          resultat(l, [t("Intérêts payés : "), ...fr(reponse(e, "interets")), t(".")]),
        ];
      if (e.variante === "versement")
        return [
          utilise(l, [t("Part des intérêts = somme visée − total des versements.")]),
          calcul(l, [ligne(`I=${montantL(e.cible)}-${e.n}\\cdot a`), ligne(`\\approx ${montantL(e.cible)}-${e.n}\\cdot ${centL(versementCherche(e))}`), ligne(`\\approx ${centL(interetsAttendus(e))}`)]),
          resultat(l, [t("Intérêts : "), ...fr(reponse(e, "interets")), t(".")]),
        ];
      return [
        utilise(l, [t("Intérêts = valeur acquise − somme des versements.")]),
        calcul(l, [ligne(`I=V_{${n}}-${n}\\cdot ${A}`), ligne(`\\approx ${centL(Vn(e))}-${montantL(n * e.a)}`), ligne(`\\approx ${centL(interetsAttendus(e))}`)]),
        resultat(l, [t("Intérêts rapportés : "), ...fr(reponse(e, "interets")), t(".")]),
        ...(e.variante === "mensuel" ? [piege(l, [t("Diviser le taux annuel par 12 au lieu de calculer le taux mensuel équivalent.")])] : []),
      ];
    }
    case "capital":
      return [
        utilise(l, [t("On remplace dans "), f("V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}"), t(".")]),
        calcul(l, [ligne(`V_0=${A}\\cdot\\dfrac{1-${fL(e)}^{-${e.n}}}{${iL(e)}}`), ligne(`\\approx ${nL(V0(e), 4, true)}`), ligne(`\\approx ${centL(V0(e))}`, "au centime")]),
        resultat(l, [t("Montant empruntable : "), ...fr(reponse(e, "capital")), t(".")]),
        verification(l, [t("Contrôle : "), f(`${centL(V0(e))}\\cdot ${fL(e)}^{${e.n}}\\approx ${centL(e.a * facteurVn(iDe(e), e.n))}`), t(", la valeur acquise des remboursements au dernier d'entre eux.")]),
      ];
    case "versement":
      return [
        utilise(l, [t("On remplace dans l'égalité de l'étape précédente.")]),
        calcul(l, [
          ligne(e.apres ? `a=\\dfrac{${montantL(e.cible)}\\cdot ${iL(e)}}{\\left(${fL(e)}^{${e.n}}-1\\right)\\cdot ${fL(e)}}` : `a=\\dfrac{${montantL(e.cible)}\\cdot ${iL(e)}}{${fL(e)}^{${e.n}}-1}`),
          ligne(`\\approx ${nL(versementCherche(e), 4, true)}`),
          ligne(`\\approx ${centL(versementCherche(e))}`, "au centime"),
        ]),
        resultat(l, [t("Versement annuel : "), ...fr(reponse(e, "versement")), t(".")]),
      ];
    case "tauxMensuel": {
      const r = Math.pow(1 + iDe(e), 1 / 12);
      return [
        utilise(l, [t("Taux équivalents : "), f("(1+i_{\\text{mensuel}})^{12}=1+i_{\\text{annuel}}"), t(".")]),
        calcul(l, [ligne(`1+i_{\\text{mensuel}}=\\sqrt[12]{${fL(e)}}\\approx ${nL(r, 7, true)}`), ligne(`i_{\\text{mensuel}}\\approx ${nL(r - 1, 7, true)}\\approx ${pourcentFixeL(100 * (r - 1), 3)}`, "en %, au millième")]),
        resultat(l, fr(reponse(e, "tauxMensuel"))),
      ];
    }
  }
}

export function correctionDetailleeAnnuites(e: E): EtapeCorrection[] {
  return phasesAnnuites(e).flatMap((p, k) => etape(e, p, lettreEtape(k)));
}

