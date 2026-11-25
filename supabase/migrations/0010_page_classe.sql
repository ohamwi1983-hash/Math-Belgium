-- =================================================================================================
-- Math-Belgium — page de classe à code (élèves, SANS compte) publiée depuis le carnet du professeur
-- =================================================================================================
--
-- À coller APRÈS 0009_partages_plans.sql (il suppose 0001 et 0002 déjà exécutés : profils, classes,
-- est_actif ; il ne touche à aucune autre table), dans l'éditeur SQL du projet Supabase (SQL Editor →
-- New query → coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune
-- donnée (tables `create table if not exists`, contraintes ajoutées seulement si absentes, fonctions
-- `create or replace`, sel tiré une seule fois). Aucune clé secrète, aucun jeton, aucun mot de passe :
-- rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /carnet → une classe → « Page de classe
-- des élèves » → « Créer le code » (Supabase peut mettre quelques secondes à voir les nouvelles
-- tables). Tant que ce fichier n'est pas exécuté, le carnet marche comme avant et la page de classe
-- affiche « Pour activer la page de classe, collez 0010… ».
--
-- Décisions du professeur (25/11/2026, planche 12 des maquettes « côté élève ») :
--   - l'élève ouvre /classe avec un CODE de 6 caractères (ou le QR /classe?code=…), une seule fois ;
--     rien ne lui est demandé : aucun nom, aucune adresse, aucun compte ;
--   - le serveur ne contient QUE ce que le professeur publie : une COPIE choisie (prochaines
--     interros, devoirs à rendre, 3 dernières séances), jamais les séances elles-mêmes ;
--   - code renouvelable (l'ancien cesse aussitôt de marcher) et révocable (« Couper le code ») ;
--   - interrupteurs : interros, devoirs, matière vue, heure des séances, nom du professeur (coupé
--     par défaut).
--
-- Contenu (AUCUNE donnée d'élève — l'élève ne laisse rien : le code est gardé sur SON appareil) :
--   pages_classe        une ligne par classe publiée : code (NULL = coupé), interrupteurs de ce qui
--                       est publié, contenu (copie construite par le carnet du professeur : titres de
--                       chapitre et d'étapes, dates, texte des devoirs, identifiants de générateurs ;
--                       JAMAIS la remarque de séance, jamais une autre classe, jamais l'école), date
--                       de publication.
--   essais_page_classe  compteurs d'essais de code RATÉS (adresse IP hachée avec un sel secret, ou
--                       « global ») : limite les essais au hasard. Aucun client n'y a accès.
--   page_classe_sel     le sel (aléatoire, tiré une fois) : aucun client n'y a accès.
--   RLS                 le professeur lit, crée, modifie et supprime la page de SES classes (compte
--                       actif) ; il n'écrit que les interrupteurs et le contenu (droits de colonne) :
--                       le code, ses dates et la date de publication sont posés par la base.
--                       L'administrateur ne voit rien de plus qu'avant. `anon` n'a AUCUN droit sur les
--                       tables : la page élève passe par UNE fonction, `lire_page_classe(code)`
--                       (SECURITY DEFINER), qui ne renvoie que les colonnes publiées d'une page dont le
--                       code est valide, avec une limite d'essais.
--
-- Limitation des essais (`lire_page_classe`) — méthode et limites :
--   - un code = 6 symboles parmi 32 (sans 0/O ni 1/I) : 32⁶ ≈ 1,07 milliard de codes ;
--   - seuls les essais RATÉS comptent (un élève qui a gardé le bon code n'est jamais compté) ;
--   - par adresse IP (hachée par md5 avec le sel secret : l'adresse n'est jamais stockée en clair) :
--     au plus 30 essais ratés par fenêtre de 10 minutes (une classe entière derrière le même wifi
--     d'école peut se tromper plusieurs fois sans être bloquée) ;
--   - pour tout le site : au plus 600 essais ratés par heure (filet si l'adresse IP change à chaque
--     essai) ;
--   - au-delà, la fonction répond « trop_essais » SANS regarder le code (sinon le blocage laisserait
--     deviner les bons codes) ; la page élève montre alors la dernière version vue sur l'appareil ;
--   - limites : l'adresse vient des en-têtes posés par la passerelle de Supabase (`cf-connecting-ip`,
--     sinon le premier `x-forwarded-for`, sinon `x-real-ip`) ; si un en-tête pouvait être imité, seul
--     le plafond global resterait ; un plafond global atteint bloque aussi, pour l'heure, les élèves
--     qui tapent un code (pas ceux qui l'ont déjà : ils voient la dernière version gardée). Avec 1 000
--     pages publiées et le plafond global atteint en continu, deviner UNE page prend en moyenne
--     ≈ 75 jours — et elle ne montre que des dates d'interro et des devoirs, sans aucun nom.
-- =================================================================================================

create table if not exists public.pages_classe (
  classe_id         uuid not null,
  proprietaire      uuid not null default auth.uid() references public.profils (id) on delete cascade,
  -- NULL : code coupé (la page ne s'ouvre plus). Tiré par la base (`nouveau_code_classe`).
  code              text unique,
  code_cree_le      timestamptz,
  publier_interros  boolean not null default true,
  publier_devoirs   boolean not null default true,
  publier_matiere   boolean not null default true,
  publier_heure     boolean not null default false,
  -- Nom affiché du professeur (profil) : coupé par défaut, ajouté par `lire_page_classe` seulement
  -- s'il est coché (jamais stocké dans le contenu).
  publier_nom       boolean not null default false,
  contenu           jsonb not null default '{}'::jsonb,
  publie_le         timestamptz,
  cree_le           timestamptz not null default now(),
  modifie_le        timestamptz not null default now(),
  -- Clé (classe_id, proprietaire) et non classe_id seule : viser la classe d'un autre donne 23503
  -- (clé étrangère composée) sans révéler (23505) qu'elle a déjà une page (même choix que 0003).
  primary key (classe_id, proprietaire)
);
comment on table public.pages_classe is 'Page de classe des élèves (sans compte) : copie publiée par le professeur, lue par code via lire_page_classe. Aucune donnée d''élève.';

do $$
begin
  -- La page ne vise qu'une classe À SOI (clé étrangère composée, comme les séances de 0002).
  if not exists (select 1 from pg_constraint where conname = 'pages_classe_classe_du_proprietaire' and conrelid = 'public.pages_classe'::regclass) then
    alter table public.pages_classe add constraint pages_classe_classe_du_proprietaire
      foreign key (classe_id, proprietaire) references public.classes (id, proprietaire) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pages_classe_code_format' and conrelid = 'public.pages_classe'::regclass) then
    alter table public.pages_classe add constraint pages_classe_code_format
      check (code is null or code ~ '^[A-HJ-NP-Z2-9]{6}$');
  end if;
  -- Contenu : un objet de 64 Ko au plus, aux seules clés connues, listes en tableaux.
  if not exists (select 1 from pg_constraint where conname = 'pages_classe_contenu_valide' and conrelid = 'public.pages_classe'::regclass) then
    alter table public.pages_classe add constraint pages_classe_contenu_valide
      check (
        jsonb_typeof(contenu) = 'object'
        and octet_length(contenu::text) <= 64000
        and contenu - array['v', 'interros', 'devoirs', 'seances'] = '{}'::jsonb
        and coalesce(jsonb_typeof(contenu -> 'interros'), 'array') = 'array'
        and coalesce(jsonb_typeof(contenu -> 'devoirs'), 'array') = 'array'
        and coalesce(jsonb_typeof(contenu -> 'seances'), 'array') = 'array'
      );
  end if;
end;
$$;

create table if not exists public.essais_page_classe (
  cle     text primary key,
  debut   timestamptz not null default now(),
  nombre  integer not null default 0
);
comment on table public.essais_page_classe is 'Essais de code ratés (IP hachée avec un sel secret, ou « global ») : limitation de lire_page_classe. Aucun accès client.';

create table if not exists public.page_classe_sel (
  id   integer primary key default 1 check (id = 1),
  sel  text not null
);
comment on table public.page_classe_sel is 'Sel secret du hachage des adresses IP (essais_page_classe). Aucun accès client.';
insert into public.page_classe_sel (id, sel)
  values (1, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
  on conflict (id) do nothing;

-- -------------------------------------------------------------------------------------------------
-- Dates posées par la base (SECURITY INVOKER : ne lit que la ligne écrite)
-- -------------------------------------------------------------------------------------------------

create or replace function public.pages_classe_avant_ecriture()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le := now();
  if tg_op = 'INSERT' then
    new.cree_le := now();
    new.publie_le := case when new.contenu <> '{}'::jsonb then now() else null end;
  elsif new.contenu is distinct from old.contenu then
    new.publie_le := now();
  end if;
  return new;
end;
$$;

drop trigger if exists pages_classe_avant_ecriture on public.pages_classe;
create trigger pages_classe_avant_ecriture before insert or update on public.pages_classe
  for each row execute function public.pages_classe_avant_ecriture();

-- -------------------------------------------------------------------------------------------------
-- Code : tiré par la base, renouvelé, coupé
-- -------------------------------------------------------------------------------------------------

-- 6 symboles parmi 32 (alphabet de 0001 sans 0/O ni 1/I) ; octet % 32 uniforme ; gen_random_uuid :
-- noyau Postgres, aucune extension. Fonction interne (aucun client ne l'appelle).
create or replace function public.tirer_code_classe()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  octets bytea := uuid_send(gen_random_uuid());
  resultat text := '';
  i int;
begin
  -- Octets 0 à 5 d'un uuid v4 : entièrement aléatoires (la version est dans l'octet 6).
  for i in 0..5 loop
    resultat := resultat || substr(alphabet, (get_byte(octets, i) % 32) + 1, 1);
  end loop;
  return resultat;
end;
$$;

-- « Créer le code » / « Nouveau code » : un nouveau code pour SA classe (l'ancien cesse aussitôt).
-- Crée la ligne de la page si elle n'existe pas (interrupteurs par défaut, contenu vide). Renvoie le code.
create or replace function public.nouveau_code_classe(p_classe uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  essai int := 0;
begin
  if v_uid is null or not public.est_actif() then
    raise exception 'Réservé aux professeurs connectés.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.classes c where c.id = p_classe and c.proprietaire = v_uid) then
    raise exception 'Classe introuvable.' using errcode = 'P0002';
  end if;
  loop
    essai := essai + 1;
    v_code := public.tirer_code_classe();
    begin
      insert into public.pages_classe (classe_id, proprietaire, code, code_cree_le)
        values (p_classe, v_uid, v_code, now())
        on conflict (classe_id, proprietaire) do update set code = excluded.code, code_cree_le = excluded.code_cree_le;
      return v_code;
    exception when unique_violation then
      -- Code déjà pris par une autre classe (rare) : on en tire un autre.
      if essai >= 20 then
        raise exception 'Impossible de tirer un code libre, réessaie.' using errcode = 'P0001';
      end if;
    end;
  end loop;
end;
$$;

-- « Couper le code » : la page ne s'ouvre plus du tout (le contenu reste, pour « Nouveau code »).
create or replace function public.couper_code_classe(p_classe uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.est_actif() then
    raise exception 'Réservé aux professeurs connectés.' using errcode = '42501';
  end if;
  update public.pages_classe set code = null, code_cree_le = null
    where classe_id = p_classe and proprietaire = auth.uid();
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Page élève : lecture par code (anon), avec limite d'essais
-- -------------------------------------------------------------------------------------------------

-- Renvoie un objet jsonb :
--   {"statut":"ok", "classe":"5e B", "mis_a_jour":…, ["professeur":"M. …"], ["interros":[…]],
--    ["devoirs":[…]], ["seances":[…]]}  — seules les rubriques cochées sont présentes ; « heure »
--    retirée des interros et des séances si l'heure n'est pas publiée ; interros passées et devoirs
--    déjà rendus retirés (date de Bruxelles) ;
--   {"statut":"inconnu"}  code mal formé, inconnu, renouvelé, coupé, ou compte du professeur désactivé
--                         (une seule réponse : rien ne dit si un code a existé) ;
--   {"statut":"trop_essais", "reessayer_dans": secondes}.
create or replace function public.lire_page_classe(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[[:space:]-]', '', 'g'));
  v_entetes json;
  v_ip text;
  v_cle text;
  v_sel text;
  v_essai public.essais_page_classe%rowtype;
  v_page public.pages_classe%rowtype;
  v_classe text;
  v_nom text;
  v_aujourdhui text := to_char((now() at time zone 'Europe/Brussels')::date, 'YYYY-MM-DD');
  v_res jsonb;
  fenetre_ip constant interval := interval '10 minutes';
  max_ip constant int := 30;
  fenetre_globale constant interval := interval '1 hour';
  max_global constant int := 600;
begin
  -- Adresse du demandeur (en-têtes de la passerelle Supabase / PostgREST), jamais stockée en clair.
  begin
    v_entetes := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_entetes := null;
  end;
  v_ip := btrim(coalesce(
    nullif(v_entetes ->> 'cf-connecting-ip', ''),
    nullif(split_part(coalesce(v_entetes ->> 'x-forwarded-for', ''), ',', 1), ''),
    nullif(v_entetes ->> 'x-real-ip', ''),
    'inconnue'));
  select s.sel into v_sel from public.page_classe_sel s where s.id = 1;
  v_cle := 'ip:' || md5(coalesce(v_sel, '') || '|' || v_ip);

  -- Ménage occasionnel des vieux compteurs.
  if random() < 0.02 then
    delete from public.essais_page_classe e where e.debut < now() - interval '1 day';
  end if;

  -- Limites AVANT de regarder le code.
  select * into v_essai from public.essais_page_classe e where e.cle = v_cle;
  if found and v_essai.debut > now() - fenetre_ip and v_essai.nombre >= max_ip then
    return jsonb_build_object('statut', 'trop_essais', 'reessayer_dans', greatest(1, ceil(extract(epoch from (v_essai.debut + fenetre_ip - now())))::int));
  end if;
  select * into v_essai from public.essais_page_classe e where e.cle = 'global';
  if found and v_essai.debut > now() - fenetre_globale and v_essai.nombre >= max_global then
    return jsonb_build_object('statut', 'trop_essais', 'reessayer_dans', greatest(1, ceil(extract(epoch from (v_essai.debut + fenetre_globale - now())))::int));
  end if;

  if v_code ~ '^[A-HJ-NP-Z2-9]{6}$' then
    select p.* into v_page
      from public.pages_classe p
      join public.profils pr on pr.id = p.proprietaire and pr.actif
      where p.code = v_code;
    if found then
      select c.nom into v_classe from public.classes c where c.id = v_page.classe_id;
      v_res := jsonb_build_object('statut', 'ok', 'classe', v_classe, 'mis_a_jour', v_page.publie_le);
      if v_page.publier_nom then
        select pr.nom_affiche into v_nom from public.profils pr where pr.id = v_page.proprietaire;
        v_res := v_res || jsonb_build_object('professeur', v_nom);
      end if;
      if v_page.publier_interros then
        v_res := v_res || jsonb_build_object('interros', (
          select coalesce(jsonb_agg(case when v_page.publier_heure then e else e - 'heure' end order by n), '[]'::jsonb)
          from jsonb_array_elements(coalesce(v_page.contenu -> 'interros', '[]'::jsonb)) with ordinality as t(e, n)
          where jsonb_typeof(e) = 'object' and coalesce(e ->> 'date', '') >= v_aujourdhui));
      end if;
      if v_page.publier_devoirs then
        v_res := v_res || jsonb_build_object('devoirs', (
          select coalesce(jsonb_agg(e order by n), '[]'::jsonb)
          from jsonb_array_elements(coalesce(v_page.contenu -> 'devoirs', '[]'::jsonb)) with ordinality as t(e, n)
          where jsonb_typeof(e) = 'object' and (e ->> 'pour' is null or e ->> 'pour' >= v_aujourdhui)));
      end if;
      if v_page.publier_matiere then
        v_res := v_res || jsonb_build_object('seances', (
          select coalesce(jsonb_agg(case when v_page.publier_heure then e else e - 'heure' end order by n), '[]'::jsonb)
          from jsonb_array_elements(coalesce(v_page.contenu -> 'seances', '[]'::jsonb)) with ordinality as t(e, n)
          where jsonb_typeof(e) = 'object'));
      end if;
      return v_res;
    end if;
  end if;

  -- Essai raté : compté pour cette adresse et pour tout le site.
  insert into public.essais_page_classe as e (cle, debut, nombre) values (v_cle, now(), 1)
    on conflict (cle) do update set
      nombre = case when e.debut <= now() - fenetre_ip then 1 else e.nombre + 1 end,
      debut = case when e.debut <= now() - fenetre_ip then now() else e.debut end;
  insert into public.essais_page_classe as e (cle, debut, nombre) values ('global', now(), 1)
    on conflict (cle) do update set
      nombre = case when e.debut <= now() - fenetre_globale then 1 else e.nombre + 1 end,
      debut = case when e.debut <= now() - fenetre_globale then now() else e.debut end;
  return jsonb_build_object('statut', 'inconnu');
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Droits et RLS
-- -------------------------------------------------------------------------------------------------

-- Supabase accorde par défaut tout à anon / authenticated sur les nouvelles tables : on repart de rien.
revoke all on public.pages_classe, public.essais_page_classe, public.page_classe_sel from anon;
revoke all on public.pages_classe, public.essais_page_classe, public.page_classe_sel from authenticated;
grant select, delete on public.pages_classe to authenticated;
grant insert (classe_id, publier_interros, publier_devoirs, publier_matiere, publier_heure, publier_nom, contenu) on public.pages_classe to authenticated;
grant update (publier_interros, publier_devoirs, publier_matiere, publier_heure, publier_nom, contenu) on public.pages_classe to authenticated;

alter table public.pages_classe enable row level security;
alter table public.essais_page_classe enable row level security;
alter table public.page_classe_sel enable row level security;

drop policy if exists pages_classe_proprietaire on public.pages_classe;
create policy pages_classe_proprietaire on public.pages_classe for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));
-- essais_page_classe, page_classe_sel : aucune politique, aucun droit → aucun client n'y lit ni n'y écrit.

revoke all on function public.pages_classe_avant_ecriture() from public, anon;
grant execute on function public.pages_classe_avant_ecriture() to authenticated;
revoke all on function public.tirer_code_classe() from public, anon, authenticated;
revoke all on function public.nouveau_code_classe(uuid) from public, anon;
grant execute on function public.nouveau_code_classe(uuid) to authenticated;
revoke all on function public.couper_code_classe(uuid) from public, anon;
grant execute on function public.couper_code_classe(uuid) to authenticated;
-- La SEULE porte d'entrée des élèves.
revoke all on function public.lire_page_classe(text) from public;
grant execute on function public.lire_page_classe(text) to anon, authenticated;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
