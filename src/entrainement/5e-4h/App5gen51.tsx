import type { ReactNode } from "react";
import type { ExerciceAnglesRadians, Quadrant } from "./moteur5e/modeleAnglesRadians";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAnglesRadians } from "./generateurs5e/anglesRadians";
import { correctionDetailleeAnglesRadians } from "./generateurs5e/anglesRadians/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { quadrant } from "./moteur5e/modeleAnglesRadians";
import { diagnostiquerCosSin, diagnostiquerReduction, diagnostiquerTangente, verifierQuadrant } from "./moteur5e/verificationAnglesRadians";
import { TENTATIVES_CHAMP, TENTATIVES_CHOIX } from "./moteur5e/sessionEcransTrig";
import { CONSIGNE_GENERALE, OPTIONS_QUADRANT, TITRES_ECRANS, aideSaisie, aidesEcran, consignesEcrans, enonceExercice, reponsesEcrans } from "./ui5e/formatAnglesRadians";
import { figureCercleRadians } from "./ui5e/figureCercleRadians";
import { CoqueTrig5e } from "./components5e/CoqueTrig5e";
import { EtapeChampsTrig5e, EtapeChoixTrig5e, SaisieTrig } from "./components5e/EtapesTrig5e";
import { RenduFragments } from "../4e/components/RenduFragments";

/**
 * 5gen51 — « Angles en radians sur le cercle » (5e, chapitre 2, section `parametres`, processus 1
 * CONNAÎTRE). Le tableau des valeurs exactes et le cercle à 16 angles du § 4 sans entraînement
 * jusqu'ici. Quatre écrans :
 * 1. θ ramené dans [0 ; 2π[ (champ, 3 tentatives ; une écriture juste hors de [0 ; 2π[ est signalée
 *    sans compter) ;
 * 2. le quadrant ou l'axe du point image (choix fermé, 1 tentative) ;
 * 3. cos θ et sin θ lus sur le cercle quadrillé aux valeurs remarquables (deux champs, 3 tentatives) ;
 * 4. tan θ, ou « n'existe pas » (champ, 3 tentatives).
 * Le point M n'apparaît sur la figure qu'une fois le quadrant donné. `?code=` : mêmes fonctions que
 * l'adaptateur. Aucun point affiché.
 */

function exerciceInitial(): ExerciceAnglesRadians {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceAnglesRadians();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAnglesRadians, construireAvecVariante);
}

function paragraphe(fragments: Parameters<typeof RenduFragments>[0]["fragments"]): ReactNode {
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

const RACCOURCIS = [
  { libelle: "π", mode: "ajoute" as const, texte: "π" },
  { libelle: "√", mode: "ajoute" as const, texte: "√" },
];

export function App5gen51() {
  return (
    <CoqueTrig5e<ExerciceAnglesRadians>
      titre="Angles en radians sur le cercle"
      sousTitre="Chapitre 2 — Trigonométrie"
      idDebug="__debug5gen51"
      catalogue={CATALOGUE_VARIANTES}
      exerciceInitial={exerciceInitial}
      genererLibre={genererExerciceAnglesRadians}
      genererVariante={construireAvecVariante}
      nombreEcrans={() => 4}
      titreEcran={(_, i) => TITRES_ECRANS[i]!}
      tentativesMax={(_, i) => (i === 1 ? TENTATIVES_CHOIX : TENTATIVES_CHAMP)}
      reponseAttendue={(e, i) => paragraphe(reponsesEcrans(e)[i]!)}
      messageRevele={() => "Ce n'était pas la bonne position (une seule tentative sur un choix fermé)."}
      corrige={correctionDetailleeAnglesRadians}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e, ecran, clos) => {
        const avecM = ecran >= 2 || (ecran === 1 && clos);
        return (
          <>
            <p style={{ margin: "6px 0" }}>
              <RenduFragments fragments={enonceExercice(e)} />
            </p>
            <div style={{ width: "100%", maxWidth: 300, margin: "8px auto" }} aria-label="Cercle trigonométrique" dangerouslySetInnerHTML={{ __html: figureCercleRadians({ reduit: avecM ? e.reduit : null }).replace(/width="\d+" height="\d+"/, 'style="width:100%;height:auto;display:block"') }} />
          </>
        );
      }}
      rendreEcran={({ e, ecran, niveauAide, onActiverAide, conclure, validation, tentativesUtilisees, tentativesMax }) => {
        const communs = { aides: aidesEcran(e, ecran), niveauAide, onActiverAide, validation, tentativesUtilisees, tentativesMax };
        if (ecran === 1)
          return (
            <EtapeChoixTrig5e
              consigne={consignesEcrans(e)[1]!}
              options={OPTIONS_QUADRANT}
              largeurOption={260}
              attendue={quadrant(e)}
              aides={communs.aides}
              niveauAide={niveauAide}
              onActiverAide={onActiverAide}
              validation={validation}
              libelleGroupe="Position du point image"
              onValider={(id) => conclure(verifierQuadrant(e, id as Quadrant), paragraphe(OPTIONS_QUADRANT.find((o) => o.id === id)!.fragments))}
            />
          );
        if (ecran === 0)
          return (
            <EtapeChampsTrig5e
              {...communs}
              consigne={consignesEcrans(e)[0]!}
              champs={[{ prefixe: "\\theta_0 =", nom: "Angle dans [0 ; 2π[" }]}
              raccourcis={RACCOURCIS}
              aideSaisie={aideSaisie(0)}
              diagnostiquer={(v) => diagnostiquerReduction(e, v[0]!)}
              onValider={(ok, v) => conclure(ok, <p style={{ margin: 0 }}><SaisieTrig texte={v[0]!} /></p>)}
              idChamp="angles-radians-reduit"
            />
          );
        if (ecran === 2)
          return (
            <EtapeChampsTrig5e
              {...communs}
              consigne={consignesEcrans(e)[2]!}
              champs={[
                { prefixe: "\\cos\\theta =", nom: "cos θ" },
                { prefixe: "\\sin\\theta =", nom: "sin θ" },
              ]}
              raccourcis={RACCOURCIS}
              aideSaisie={aideSaisie(2)}
              diagnostiquer={(v) => diagnostiquerCosSin(e, v)}
              onValider={(ok, v) =>
                conclure(
                  ok,
                  <p style={{ margin: 0 }}>
                    cos θ = <SaisieTrig texte={v[0]!} /> ; sin θ = <SaisieTrig texte={v[1]!} />
                  </p>,
                )
              }
              idChamp="angles-radians-cos"
            />
          );
        return (
          <EtapeChampsTrig5e
            {...communs}
            consigne={consignesEcrans(e)[3]!}
            champs={[{ prefixe: "\\tan\\theta =", nom: "tan θ" }]}
            raccourcis={[...RACCOURCIS, { libelle: "n'existe pas", mode: "remplit", texte: "n'existe pas" }]}
            aideSaisie={aideSaisie(3)}
            diagnostiquer={(v) => diagnostiquerTangente(e, v[0]!)}
            onValider={(ok, v) => conclure(ok, <p style={{ margin: 0 }}>{/existe/i.test(v[0]!) ? v[0] : <SaisieTrig texte={v[0]!} />}</p>)}
            idChamp="angles-radians-tan"
          />
        );
      }}
    />
  );
}
