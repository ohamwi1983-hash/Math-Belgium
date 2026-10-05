import { useState } from "react";
import type { ExercicePythagoricienne } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_RACINES_PYTHAGORICIENNE, TEXTE_AIDE_RACINES_NIVEAU1, formatPolynomeCibleLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePythagoricienne;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Écran 2 (famille "pythagoricienne") — EXACTEMENT 2 champs (les 2 racines t1/t2 du polynôme du
 * second degré), ordre indifférent côté vérification. Pas de bloc "état actuel" séparé : l'équation-box
 * ci-dessous (`formatPolynomeCibleLatex`) affiche déjà littéralement la conversion pythagoricienne
 * confirmée à l'écran précédent (`diagnostiquerConversionPythagoricienne` vérifie l'équivalence à
 * cette même valeur) — elle REMPLIT donc déjà le rôle du bloc "état actuel" pour cet écran, même
 * principe que "le bloc violet réinterprété comme état actuel" déjà établi ailleurs sur la
 * plateforme (ex. gen24/25, 4e) — un second bloc identique en dessous serait un pur doublon. */
export function EtapeRacinesPythagoricienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = t1.trim() !== "" && t2.trim() !== "";
  // Ensemble {t1;t2} vérifié à l'ORDRE INDIFFÉRENT — les 2 champs ne peuvent pas être
  // diagnostiqués séparément, un même statut combiné s'applique aux 2.
  const champsErronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer([t1, t2]) !== "correct";

  function valider() {
    if (!complet) return;
    const textes = [t1, t2];
    if (diagnostiquer) setDernierStatut(diagnostiquer(textes));
    onValider(textes);
  }

  const fn = exercice.fonctionCible === "cos" ? "\\cos" : "\\sin";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box">
        <Katex expression={formatPolynomeCibleLatex(exercice)} block />
      </div>
      <p className="prompt-text">{CONSIGNE_RACINES_PYTHAGORICIENNE}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={`${fn}(x_1)`} />
        </label>
        <input type="text" className={`text-input${champsErronee ? " is-erronee" : ""}`} value={t1} onChange={(e) => setT1(e.target.value)} placeholder="ex : 1/2" />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={`${fn}(x_2)`} />
        </label>
        <input type="text" className={`text-input${champsErronee ? " is-erronee" : ""}`} value={t2} onChange={(e) => setT2(e.target.value)} placeholder="ex : -1" />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_RACINES_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}
