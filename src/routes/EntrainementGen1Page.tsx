import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { AppMethodeRapide } from '../entrainement/4e/AppMethodeRapide'
import '../entrainement/4e/entrainement-4e.css'

/** Page `/entrainement/4e/gen1` — premier générateur interactif porté depuis `plateforme-maths`
 * (pilote de fusion, voir conversation du 2026-10-04) : le code (core/moteur/générateurs/ui/
 * components) est copié tel quel sous `src/entrainement/4e/`, en conservant la structure relative
 * d'origine pour que ses imports internes n'aient jamais besoin d'être réécrits. Le CSS porté est
 * scopé sous `.entrainement-4e` (`entrainement-4e.css`) pour ne jamais fuiter sur le reste du site
 * — seules les classes réellement utilisées par ce générateur ont été extraites de l'`App.css`
 * d'origine (104 Ko, partagé par les 190 générateurs là-bas), pas la feuille complète. */
export function EntrainementGen1Page() {
  const navigate = useNavigate()

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: '4e', to: '/' },
          { label: 'Équations et inéquations du second degré', to: '/4e/equations-inequations-second-degre' },
          { label: "S'entraîner" },
        ]}
      />
      <div className="entrainement-4e">
        <AppMethodeRapide onRetourAccueil={() => navigate('/4e/equations-inequations-second-degre')} />
      </div>
    </>
  )
}
