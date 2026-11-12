import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import type { ReponseTableauSigneBenefice } from "../moteur5e/verificationContexteEconomique";
import { diagnostiquerBPrimePointTest, valeursBPrimePointsTest } from "../moteur5e/verificationContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteRiche5e } from "./TexteRiche5e";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauSigneBenefice) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/** Écran "tableauSigneBenefice" — l'élève calcule B'(x) en deux points test entiers de part et
 * d'autre de la quantité retenue (audit 5e ch. 5, décision B : les boutons « + / − » avaient
 * toujours la même réponse « + puis − »). Le signe et la conclusion (maximum) sont affichés dans la
 * réponse attendue. */
export function EtapeTableauSigneBenefice({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [avant, setAvant] = useState("");
  const [apres, setApres] = useState("");
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = avant.trim() !== "" && apres.trim() !== "";
  const cibles = valeursBPrimePointsTest(exercice);
  const statutAvant = montrerErreurs ? diagnostiquerBPrimePointTest(avant, cibles.avant) : null;
  const statutApres = montrerErreurs ? diagnostiquerBPrimePointTest(apres, cibles.apres) : null;

  function valider() {
    if (!complet) return;
    if (diagnostiquerBPrimePointTest(avant, cibles.avant) === "parse_error" || diagnostiquerBPrimePointTest(apres, cibles.apres) === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    onValider({ avant, apres });
  }

  const aide1 = texteAideNiveau1("tableauSigneBenefice", exercice);
  const aide2 = texteAideNiveau2(exercice, "tableauSigneBenefice");

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneGenerale(exercice)} />}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="question-finale">
        <TexteRiche5e texte={questionFinale(exercice)} />
      </p>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, "tableauSigneBenefice")} />
      </p>

      {[
        { label: `B'(${exercice.pointTestAvant})=`, valeur: avant, modifier: setAvant, statut: statutAvant },
        { label: `B'(${exercice.pointTestApres})=`, valeur: apres, modifier: setApres, statut: statutApres },
      ].map((c) => (
        <div key={c.label} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={c.label} />
          </label>
          <input type="text" className={`text-input${c.statut && c.statut !== "correct" ? " is-erronee" : ""}`} value={c.valeur} onChange={(e) => c.modifier(e.target.value)} placeholder="valeur" disabled={Boolean(validation)} />
        </div>
      ))}

      <CalculatriceScientifique />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aide1.texte}</p>
          {aide1.latex && <Katex expression={aide1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {ecritureIllisible && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
            </p>
          )}
          {!ecritureIllisible && montrerErreurs && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
