import type { ReactNode } from "react";
import { NOMS, fenetre, type ExerciceAssocierCourbes } from "./moteur5e/modeleAssocierCourbes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAssocierCourbes } from "./generateurs5e/associerCourbes";
import { correctionDetailleeAssocierCourbes } from "./generateurs5e/associerCourbes/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { TENTATIVES_CHOIX } from "./moteur5e/sessionEcransTrig";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aidesEcran, consignesEcrans, enonceExercice, explicationChoix, expressionNommee, reponseEcran } from "./ui5e/formatAssocierCourbes";
import { figureCourbe } from "./ui5e/figureAssocierCourbes";
import { CoqueTrig5e } from "./components5e/CoqueTrig5e";
import { EtapeChoixTrig5e } from "./components5e/EtapesTrig5e";
import { RenduFragments } from "../4e/components/RenduFragments";
import { Katex } from "./components/Katex";

/**
 * 5gen53 — « Associer formules et courbes » (5e, chapitre 2, section `lecture-graphique`, processus 1
 * CONNAÎTRE). Quatre expressions A sin(ωx + φ) + b et leurs quatre courbes dans le désordre ; un écran
 * par courbe (choix fermé parmi les quatre expressions, UNE tentative ; un choix faux est expliqué :
 * ce que donnerait l'expression choisie). Les expressions d'une variante ne diffèrent que par le
 * paramètre piège (φ / Φ, signe de A, ω / T) ou par un paramètre chacune. Même quadrillage pour les
 * quatre courbes, chaque colonne étiquetée en multiple exact de π. `?code=` : mêmes fonctions que
 * l'adaptateur. Aucun point affiché.
 */

function exerciceInitial(): ExerciceAssocierCourbes {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceAssocierCourbes();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAssocierCourbes, construireAvecVariante);
}

function courbe(e: ExerciceAssocierCourbes, k: number): ReactNode {
  return (
    <div
      style={{ width: "100%", maxWidth: 460, margin: "8px auto" }}
      dangerouslySetInnerHTML={{ __html: figureCourbe(e.expressions[e.ordre[k]!]!, fenetre(e), `Courbe ${k + 1}`).replace(/width="\d+" height="\d+"/, 'style="width:100%;height:auto;display:block"') }}
    />
  );
}

export function App5gen53() {
  return (
    <CoqueTrig5e<ExerciceAssocierCourbes>
      titre="Associer formules et courbes"
      sousTitre="Chapitre 2 — Trigonométrie"
      idDebug="__debug5gen53"
      catalogue={CATALOGUE_VARIANTES}
      exerciceInitial={exerciceInitial}
      genererLibre={genererExerciceAssocierCourbes}
      genererVariante={construireAvecVariante}
      nombreEcrans={() => 4}
      titreEcran={(_, i) => TITRES_ECRANS[i]!}
      tentativesMax={() => TENTATIVES_CHOIX}
      reponseAttendue={(e, k) => (
        <p style={{ margin: 0 }}>
          <RenduFragments fragments={reponseEcran(e, k)} />
        </p>
      )}
      messageRevele={() => "Ce n'était pas la bonne expression (une seule tentative sur un choix fermé)."}
      corrige={correctionDetailleeAssocierCourbes}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceExercice()} />
          </p>
          <ul style={{ margin: "4px 0 0", paddingLeft: "1.2em", display: "grid", gap: 4 }}>
            {e.expressions.map((_, i) => (
              <li key={i} style={{ overflowX: "auto" }}>
                <Katex expression={expressionNommee(e, i)} />
              </li>
            ))}
          </ul>
        </>
      )}
      rendreEcran={({ e, ecran, niveauAide, onActiverAide, conclure, validation }) => (
        <EtapeChoixTrig5e
          consigne={consignesEcrans()[ecran]!}
          avantOptions={courbe(e, ecran)}
          options={e.expressions.map((_, i) => ({ id: String(i), fragments: [{ type: "latex" as const, valeur: expressionNommee(e, i) }] }))}
          largeurOption={240}
          attendue={String(e.ordre[ecran])}
          aides={aidesEcran(e)}
          niveauAide={niveauAide}
          onActiverAide={onActiverAide}
          validation={validation}
          libelleGroupe="Expressions"
          onValider={(id) => {
            const i = Number(id);
            const correct = i === e.ordre[ecran];
            conclure(correct, <p style={{ margin: 0 }}>{`Expression ${NOMS[i]}`}</p>, correct ? undefined : explicationChoix(e, ecran, i));
          }}
        />
      )}
    />
  );
}
