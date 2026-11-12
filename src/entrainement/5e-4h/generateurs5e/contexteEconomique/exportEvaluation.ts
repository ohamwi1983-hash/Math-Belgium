import type { ExerciceContexteEconomique, ExerciceContexteEconomiqueBonus } from "../../core5e/contexteEconomique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcranRiche, consigneGenerale, formatNombreTexte, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, texteAideNiveau1 } from "../../ui5e/formatContexteEconomique";
import { ordreEcransContexteEconomique, type EcranContexteEconomique } from "../../moteur5e/typesContexteEconomique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContexteEconomique } from "./index";
import { profilContexteEconomique } from "../profilsEvaluationDerivees31-33";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceContexteEconomique>` pour 5gen33 (« Contexte
 * économique », chapitre 5 de 5e) — feuille d'exercices et évaluation, selon
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * - **Énoncé papier** = la situation (texte de l'écran, `consigneGenerale`), les données, et les
 *   VRAIES questions du problème : famille A — a) comparer les deux estimations du coût marginal,
 *   b) le minimum demandé (coût moyen ou coût marginal) ; famille B — a) la quantité qui rend le
 *   bénéfice maximal, justifiée, b) ce bénéfice maximal ; dichotomie — une seule consigne. Plus de
 *   renvoi à un écran (« l'étape 'Égalité des marginales' »), plus de TeX brut.
 * - **Étapes** = écrans du générateur (`ordreEcransContexteEconomique`), titres « Étape n » du
 *   corrigé, rédigés pour le papier.
 * - **Corrigé** tiré des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`, aides) ;
 *   la dichotomie est résumée par un tableau des quatre étapes (`figureHtml`).
 */

const LETTRES = "abcdefgh";

function lettreDe(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  return LETTRES[ordreEcransContexteEconomique(exercice).indexOf(ecran)] ?? "a";
}

function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

function joindre(valeurs: string[], separateur = " ; "): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => (i === 0 ? [latex(v)] : [texte(separateur), latex(v)]));
}

function attendu(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string[] {
  return formatReponseAttenduePhaseLatex(exercice, ecran);
}

// ============================================================================
// Énoncé.
// ============================================================================

function situationFragments(exercice: ExerciceContexteEconomique): FragmentConsigne[] {
  return [...fragmentsRiches(consigneGenerale(exercice)), texte(" Données : "), latex(formatTermesDonneesLatex(exercice).join(",\\ ")), texte(".")];
}

function consigneEtape(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): FragmentConsigne[] {
  switch (ecran) {
    case "coutMarginalDiscret":
      return fragmentsRiches("Calcule l'estimation par différence $C_T(q_0+1)-C_T(q_0)$.");
    case "deriveeSymbolique":
      return fragmentsRiches("Calcule la dérivée $C'_T(q)$.");
    case "deriveeValeur":
      return fragmentsRiches("Calcule l'estimation par la dérivée $C'_T(q_0)$.");
    case "comparaisonEcart":
      return [texte("Calcule l'écart absolu entre les deux estimations, puis l'écart en pourcentage de l'estimation par la dérivée.")];
    case "extremum":
      if (exercice.famille === "A" && exercice.minimum.grandeur === "coutMarginal") return fragmentsRiches("Calcule $C''_T(q)$, résous $C''_T(q)=0$, puis calcule le coût marginal minimal.");
      return fragmentsRiches("Écris $C_M(q)=\\dfrac{C_T(q)}{q}$, résous $C'_M(q)=0$, puis calcule le coût moyen minimal.");
    case "recetteTotale":
      return fragmentsRiches("Calcule la recette totale $R_T(x)=x\\cdot p(x)$.");
    case "marginales":
      return fragmentsRiches("Calcule le coût marginal $C'_T(x)$ et la recette marginale $R'_T(x)$.");
    case "resoudreEgaliteMarginales":
      return fragmentsRiches("Résous $C'_T(x)=R'_T(x)$ et retiens la solution qui convient.");
    case "beneficeFormule":
      return fragmentsRiches("Calcule le bénéfice $B(x)=R_T(x)-C_T(x)$.");
    case "beneficeDerivee":
      return fragmentsRiches("Calcule $B'(x)$.");
    case "tableauSigneBenefice":
      return fragmentsRiches(`${consigneEcranRiche(exercice, ecran)} Conclus sur la nature de l'extremum.`);
    case "confirmationCoherence":
      return [];
    case "beneficeMaximum":
      return [texte("Calcule le bénéfice pour la quantité retenue.")];
    case "poserEquationReduite":
      return fragmentsRiches("Développe et réduis $q\\cdot C'_T(q)-C_T(q)$ : c'est $P(q)$.");
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3":
      return fragmentsRiches(`Dichotomie, itération ${Number(ecran.slice(-1)) + 1} : calcule le milieu de l'intervalle, le signe de $P$ en ce milieu, et garde le sous-intervalle qui contient la solution.`);
    case "racineApprochee":
      return fragmentsRiches("Donne une valeur approchée de la solution de $P(q)=0$.");
  }
}

function construireEnonceContexteEconomique(exercice: ExerciceContexteEconomique): SectionExercice {
  return { enteteFragments: situationFragments(exercice), questions: ordreEcransContexteEconomique(exercice).map((e) => ({ consigne: consigneEtape(exercice, e) })) };
}

const PRECISION = " Donne les valeurs exactes, ou arrondies au centième.";

function enoncePapierContexteEconomique(exercice: ExerciceContexteEconomique): EnoncePapier {
  const lettres = ordreEcransContexteEconomique(exercice).map((_, i) => LETTRES[i]);
  if (exercice.famille === "A") {
    const minimum =
      exercice.minimum.grandeur === "coutMoyen"
        ? fragmentsRiches(`Détermine la production $q$ qui rend le coût moyen $C_M(q)=\\dfrac{C_T(q)}{q}$ minimal, puis la valeur de ce coût moyen minimal.${PRECISION}`)
        : fragmentsRiches(`Détermine la production $q$ qui rend le coût marginal $C'_T(q)$ minimal, puis la valeur de ce coût marginal minimal.${PRECISION}`);
    return {
      section: {
        enteteFragments: situationFragments(exercice),
        questions: [
          {
            consigne: fragmentsRiches(
              `Calcule le coût marginal en $q_0=${exercice.q0}$ par la différence, puis par la dérivée. Compare ces deux estimations : écart absolu, puis écart en pourcentage de l'estimation par la dérivée (arrondi au centième).`,
            ),
          },
          { consigne: minimum },
        ],
      },
      etapesParQuestion: [lettres.slice(0, 4), [lettres[4]]],
      reponseBreve: reponseBreveContexteEconomique(exercice, true),
    };
  }
  if (exercice.famille === "B") {
    return {
      section: {
        enteteFragments: situationFragments(exercice),
        questions: [
          { consigne: fragmentsRiches("Détermine la quantité $x$ qui rend le bénéfice maximal : résous l'égalité du coût marginal et de la recette marginale, puis justifie qu'il s'agit d'un maximum par le signe de $B'$.") },
          { consigne: [texte("Calcule ce bénéfice maximal, en centaines d'euros.")] },
        ],
      },
      etapesParQuestion: [lettres.slice(0, -1), [lettres[lettres.length - 1]]],
      reponseBreve: reponseBreveContexteEconomique(exercice, true),
    };
  }
  return {
    section: {
      enteteFragments: situationFragments(exercice),
      questions: [
        {
          consigne: fragmentsRiches(
            `Écris la condition $C_M(q)=C'_T(q)$ sous la forme $P(q)=0$, avec $P$ un polynôme réduit. Effectue ensuite quatre étapes de dichotomie à partir de l'intervalle de départ, puis donne une valeur approchée de la production qui rend le coût moyen minimal (à ${formatNombreTexte(exercice.toleranceFinale)} près).`,
          ),
        },
      ],
    },
    etapesParQuestion: [lettres],
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const STYLE_TABLE = 'style="border-collapse:collapse;margin:4px 0;font-size:13px;font-family:Archivo, Arial, Helvetica, sans-serif"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center;background:#f1f3f5"';

function formatNombreLatexLocal(v: number): string {
  return nombreTexte(v).replace(",", "{,}").replace("−", "-");
}

function nombreTexte(v: number): string {
  return formatNombreTexte(v);
}

function tableauDichotomieHtml(exercice: ExerciceContexteEconomiqueBonus): string {
  const lignes = exercice.iterations.map((it, i) => {
    const garde = it.garderCote === "gauche" ? [it.gauche, it.milieu] : [it.milieu, it.droite];
    const cases = [`${i + 1}`, `[${nombreTexte(it.gauche)} ; ${nombreTexte(it.droite)}]`, nombreTexte(it.milieu), it.signeMilieu > 0 ? "+" : "−", `[${nombreTexte(garde[0])} ; ${nombreTexte(garde[1])}]`];
    return `<tr>${cases.map((c) => `<td ${STYLE_CASE}>${c}</td>`).join("")}</tr>`;
  });
  const tetes = ["Étape", "Intervalle", "Milieu m", "Signe de P(m)", "Intervalle gardé"].map((t) => `<th ${STYLE_ENTETE}>${t}</th>`).join("");
  return `<table ${STYLE_TABLE}><thead><tr>${tetes}</tr></thead><tbody>${lignes.join("")}</tbody></table>`;
}

function methode(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): FragmentConsigne[] {
  const a = texteAideNiveau1(ecran, exercice);
  return [...fragmentsRiches(a.texte), ...(a.latex ? [texte(" "), latex(a.latex)] : [])];
}

function lignesEtape(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): EtapeCorrection[] {
  const sq = lettreDe(exercice, ecran);
  const l = (label: string, fragments: FragmentConsigne[], figureHtml?: string): EtapeCorrection => ({ label, sousQuestion: sq, fragments, ...(figureHtml ? { figureHtml } : {}) });
  const valeurs = (suffixe = ".") => [...joindre(attendu(exercice, ecran)), texte(suffixe)];
  switch (ecran) {
    case "coutMarginalDiscret":
      return [l("Calcul", valeurs(" €."))];
    case "deriveeSymbolique":
      return [l("Méthode", methode(exercice, ecran)), l("Calcul", valeurs())];
    case "deriveeValeur":
      return [l("Calcul", valeurs(" €."))];
    case "comparaisonEcart":
      return [l("Méthode", methode(exercice, ecran)), l("Calcul", valeurs()), l("Piège", [texte("L'écart en pourcentage se rapporte à l'estimation par la dérivée, pas à l'estimation par différence.")])];
    case "extremum": {
      const coutMoyen = exercice.famille === "A" && exercice.minimum.grandeur === "coutMoyen";
      return [
        l("Méthode", methode(exercice, ecran)),
        l("Conclusion", valeurs(" €.")),
        l("Piège", coutMoyen ? [texte("On dérive le coût MOYEN (le coût total divisé par q), pas le coût total, qui croît toujours.")] : [texte("On dérive le coût marginal C′ (donc C″ = 0), pas le coût total, qui croît toujours.")]),
      ];
    }
    case "recetteTotale":
    case "marginales":
    case "beneficeFormule":
    case "beneficeDerivee":
      return [l("Méthode", methode(exercice, ecran)), l("Calcul", valeurs())];
    case "resoudreEgaliteMarginales":
      return [l("Méthode", methode(exercice, ecran)), l("Calcul", valeurs()), l("Piège", [texte("Une quantité produite est positive : la solution négative est rejetée.")])];
    case "tableauSigneBenefice":
      return [l("Méthode", [texte("B′ positive avant la quantité retenue et négative après : B croît puis décroît.")]), l("Conclusion", valeurs())];
    case "confirmationCoherence":
      return [];
    case "beneficeMaximum":
      return [l("Méthode", methode(exercice, ecran)), l("Conclusion", [...joindre(attendu(exercice, ecran)), texte(" centaines d'euros.")]), l("Piège", [texte("On remplace x dans B(x), pas dans B′(x).")])];
    case "poserEquationReduite":
      return [l("Méthode", methode(exercice, ecran)), l("Calcul", valeurs())];
    case "iteration0":
    case "iteration1":
    case "iteration2":
      return [l("Calcul", valeurs())];
    case "iteration3":
      return [l("Calcul", valeurs(), exercice.famille === "bonus" ? tableauDichotomieHtml(exercice) : undefined)];
    case "racineApprochee": {
      if (exercice.famille !== "bonus") return [l("Conclusion", valeurs())];
      const der = exercice.iterations[exercice.iterations.length - 1];
      const [g, d] = der.garderCote === "gauche" ? [der.gauche, der.milieu] : [der.milieu, der.droite];
      return [
        l("Méthode", methode(exercice, ecran)),
        l("Conclusion", [latex(`q\\approx\\dfrac{${formatNombreLatexLocal(g)}+${formatNombreLatexLocal(d)}}{2}=${formatNombreLatexLocal((g + d) / 2)}`), texte(" (la solution vaut environ "), ...joindre(attendu(exercice, ecran).map((t) => t.replace("q\\approx", ""))), texte(")."), ]),
      ];
    }
  }
}

function correctionDetailleeContexteEconomique(exercice: ExerciceContexteEconomique): EtapeCorrection[] {
  return ordreEcransContexteEconomique(exercice).flatMap((e) => lignesEtape(exercice, e));
}

function reponseBreveContexteEconomique(exercice: ExerciceContexteEconomique, parQuestion = false): FragmentConsigne[] {
  const prefixe = (lettre: string) => (parQuestion ? [texte(`${lettre}) `)] : []);
  if (exercice.famille === "A") {
    return [
      ...prefixe("a"),
      latex(attendu(exercice, "coutMarginalDiscret")[0]),
      texte(" € ; "),
      latex(attendu(exercice, "deriveeValeur")[0]),
      texte(" € ; "),
      ...joindre(attendu(exercice, "comparaisonEcart"), ", "),
      texte(" — "),
      ...prefixe("b"),
      ...joindre(attendu(exercice, "extremum"), ", "),
      texte(" €"),
    ];
  }
  if (exercice.famille === "B") {
    return [...prefixe("a"), latex(attendu(exercice, "resoudreEgaliteMarginales")[0]), texte(" — "), ...prefixe("b"), latex(attendu(exercice, "beneficeMaximum")[0]), texte(" centaines d'euros")];
  }
  return [latex(attendu(exercice, "poserEquationReduite")[0]), texte(" ; "), latex(attendu(exercice, "racineApprochee")[0])];
}

function baremeContexteEconomique(exercice: ExerciceContexteEconomique): BaremeExercice {
  const l = (e: EcranContexteEconomique) => lettreDe(exercice, e);
  const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
  if (exercice.famille === "A") {
    return {
      reponseFinale: reponseBreveContexteEconomique(exercice, true),
      criteres: [
        c(l("coutMarginalDiscret"), "Coût marginal par différence", 0.5),
        c(l("deriveeSymbolique"), "Dérivée du coût total", 0.5),
        c(l("deriveeValeur"), "Coût marginal par la dérivée", 0.5),
        c(l("comparaisonEcart"), "Écart absolu et écart en pourcentage", 1),
        c(l("extremum"), exercice.minimum.grandeur === "coutMoyen" ? "Production et coût moyen minimal" : "Production et coût marginal minimal", 1.5),
      ],
      erreursFrequentes: [
        { description: [texte("Rapporter l'écart à l'estimation par différence au lieu de la dérivée")], cout: "−0,5" },
        { description: [texte("Chercher l'extremum du coût total au lieu du coût moyen ou marginal")], cout: "0 pt sur le minimum" },
      ],
      reponsesAcceptees: [[texte("Valeurs exactes ou arrondies au centième ; écart en % avec ou sans le symbole %")]],
    };
  }
  if (exercice.famille === "B") {
    return {
      reponseFinale: reponseBreveContexteEconomique(exercice, true),
      criteres: [
        c(l("recetteTotale"), "Recette totale", 0.5),
        c(l("marginales"), "Coût marginal et recette marginale", 0.5),
        c(l("resoudreEgaliteMarginales"), "Égalité des marginales résolue, solution négative rejetée", 1),
        c(l("beneficeFormule"), "Bénéfice B(x) et sa dérivée", 0.5),
        c(l("tableauSigneBenefice"), "Signe de B′ de part et d'autre : maximum", 0.5),
        c(l("beneficeMaximum"), "Bénéfice maximal", 1),
      ],
      erreursFrequentes: [
        { description: [texte("Maximiser la recette (R′ = 0) au lieu du bénéfice")], cout: `0 pt sur ${l("resoudreEgaliteMarginales")})` },
        { description: [texte("Remplacer x dans B′(x) au lieu de B(x) pour le bénéfice maximal")], cout: `0 pt sur ${l("beneficeMaximum")})` },
      ],
      reponsesAcceptees: [[texte("Polynômes sous une forme équivalente (termes dans un autre ordre)")]],
    };
  }
  return {
    reponseFinale: reponseBreveContexteEconomique(exercice),
    criteres: [c(l("poserEquationReduite"), "P(q) développé et réduit", 1), c(l("iteration0"), "Quatre étapes de dichotomie correctes (milieu, signe, intervalle gardé)", 2), c(l("racineApprochee"), "Valeur approchée de la solution", 1)],
    erreursFrequentes: [{ description: [texte("Garder le sous-intervalle où P ne change pas de signe")], cout: "−0,5 par étape" }],
    reponsesAcceptees: [[texte(`Toute valeur du dernier intervalle (à ${formatNombreTexte(exercice.toleranceFinale)} près)`)]],
  };
}

function difficulteContexteEconomique(exercice: ExerciceContexteEconomique): 1 | 2 | 3 {
  return exercice.famille === "A" ? 2 : 3;
}

/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionContexteEconomique(exercice: ExerciceContexteEconomique): BlocCorrection[] {
  return correctionDetailleeContexteEconomique(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationContexteEconomique: AdaptateurFeuilleExercices<ExerciceContexteEconomique> = {
  titreDocument: "Contexte économique — Dérivées et applications — Évaluation",
  nomFichierBase: "contexte-economique-derivees-applications",
  genererInstance: genererExerciceContexteEconomique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceContexteEconomique,
  construireCorrection: construireCorrectionContexteEconomique,
  difficulte: difficulteContexteEconomique,
  reponseBreve: (exercice) => reponseBreveContexteEconomique(exercice),
  correctionDetaillee: correctionDetailleeContexteEconomique,
  bareme: baremeContexteEconomique,
  enoncePapier: enoncePapierContexteEconomique,
  dureeMinutes: 15,
  profilInstance: profilContexteEconomique,
  calculatriceIndispensable: ["A-degre3-sans-extremum", "bonus"],
};
