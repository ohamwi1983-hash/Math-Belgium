import { useState } from "react";
import type { ExercicePythagoricienne } from "../core5e/equationsTrigonometriques.types";
import { consigneRacinesPythagoricienne, equationEnTLatex, formatEnonceMixteLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { aidesRacinesPythagoricienne, messageCibleRacines } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 2 (famille "pythagoricienne") — EXACTEMENT 2 champs (les 2 racines t1/t2 du polynôme du
 * second degré), ordre indifférent côté vérification. Pas de bloc "état actuel" séparé : l'équation-box
 * ci-dessous (`formatPolynomeCibleLatex`) affiche déjà littéralement la conversion pythagoricienne
 * confirmée à l'écran précédent (`diagnostiquerConversionPythagoricienne` vérifie l'équivalence à
 * cette même valeur) — elle REMPLIT donc déjà le rôle du bloc "état actuel" pour cet écran, même
 * principe que "le bloc violet réinterprété comme état actuel" déjà établi ailleurs sur la
 * plateforme (ex. gen24/25, 4e) — un second bloc identique en dessous serait un pur doublon. */
export function EtapeRacinesPythagoricienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = t1.trim() !== "" && t2.trim() !== "";
  // Ensemble {t1;t2} vérifié à l'ORDRE INDIFFÉRENT — les 2 champs ne peuvent pas être
  // diagnostiqués séparément, un même statut combiné s'applique aux 2.
  const champsErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && complet && diagnostiquer([t1, t2]) !== "correct";

  function valider() {
    if (!complet) return;
    const textes = [t1, t2];
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(textes, estLisible(diagnostiquer?.(textes)), onValider);
  }


  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceMixteLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneRacinesPythagoricienne(exercice)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="t_1" />
        </label>
        <input type="text" className={`text-input${champsErronee ? " is-erronee" : ""}`} value={t1} onChange={(e) => setT1(e.target.value)} placeholder="ex : 3/7" />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="t_2" />
        </label>
        <input type="text" className={`text-input${champsErronee ? " is-erronee" : ""}`} value={t2} onChange={(e) => setT2(e.target.value)} placeholder="ex : −2/7" />
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesRacinesPythagoricienne(equationEnTLatex(exercice))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="nombre"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleRacines(saisie.soumise, exercice.racine1.t, exercice.racine2.t) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
