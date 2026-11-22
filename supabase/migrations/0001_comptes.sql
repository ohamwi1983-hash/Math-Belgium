-- =================================================================================================
-- Math-Belgium — comptes professeurs (phase 1)
-- =================================================================================================
--
-- À exécuter UNE fois dans l'éditeur SQL du projet Supabase (SQL Editor → New query → coller →
-- Run), ou via l'API / la CLI (`supabase db push`). Le script est idempotent autant que possible :
-- le relancer ne casse rien (tables `if not exists`, fonctions `create or replace`, politiques et
-- déclencheurs supprimés puis recréés).
--
-- Contenu :
--   tables     profils, ecoles, invitations, plans (aucune donnée d'élève)
--   RLS        partout : chaque professeur ne voit / modifie que SES lignes ; un compte désactivé
--              (`profils.actif = false`) n'accède plus à rien ; l'administrateur lit les profils
--              et gère les invitations (par des fonctions qui vérifient `est_admin`)
--   inscription  UNIQUEMENT avec un code d'invitation : déclencheur SECURITY DEFINER sur
--              `auth.users` (after insert) — pas de clé de service nécessaire
--   RPC        verifier_code_invitation, definir_ecole_par_defaut, supprimer_mon_compte,
--              admin_generer_codes, admin_revoquer_code, admin_lister_invitations,
--              admin_lister_professeurs, admin_definir_actif
--
-- Mise en service (voir aussi `.claude/rules/comptes.md`) :
--
--   1. Créer le PREMIER code d'invitation (avant toute inscription : sans code, impossible de
--      s'inscrire, même pour l'administrateur) :
--
--        insert into public.invitations (code, note, expire_le)
--        values ('PREMIERCODE1', 'Compte administrateur', now() + interval '7 days');
--
--      (code : lettres et chiffres, la casse, les espaces et les tirets saisis sont ignorés.)
--
--   2. S'inscrire sur le site (/inscription) avec ce code.
--
--   3. Se promouvoir administrateur :
--
--        update public.profils set est_admin = true
--        where id = (select id from auth.users where email = 'ton.adresse@exemple.be');
--
--      Ensuite, les codes suivants se génèrent depuis la page /admin du site.
--
-- Plus tard (NE PAS FAIRE en phase 1, mais le schéma le permet) :
--   - partage entre collègues : une table `partages (plan_id → plans.id, destinataire → profils.id,
--     droit)` et une politique SELECT supplémentaire sur `plans` (`exists (select 1 from partages
--     …)`) — les politiques actuelles ne sont pas à modifier, les politiques permissives s'ajoutent ;
--   - carnet de matière vue (phase 2) : une table `classes (id, ecole_id → ecoles.id on delete
--     cascade, proprietaire → profils.id, nom, …)` puis les séances ; `ecoles.id` est déjà une clé
--     uuid stable faite pour être référencée.
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------------------------------

create table if not exists public.profils (
  id          uuid primary key references auth.users (id) on delete cascade,
  nom_affiche text not null check (char_length(btrim(nom_affiche)) between 1 and 120),
  est_admin   boolean not null default false,
  actif       boolean not null default true,
  cree_le     timestamptz not null default now(),
  modifie_le  timestamptz not null default now()
);
comment on table public.profils is 'Un profil par professeur inscrit (id = auth.users.id). Aucune donnée d''élève.';
comment on column public.profils.nom_affiche is 'Nom imprimé sur les copies (« M. Dupont »).';

create table if not exists public.ecoles (
  id           uuid primary key default gen_random_uuid(),
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  nom          text not null check (char_length(btrim(nom)) between 1 and 160),
  adresse      text not null default '' check (char_length(adresse) <= 240),
  par_defaut   boolean not null default false,
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now()
);
comment on table public.ecoles is 'Écoles d''un professeur (cartouche des copies). Phase 2 : des classes s''y rattacheront.';
create index if not exists ecoles_proprietaire_idx on public.ecoles (proprietaire);
-- Une seule école par défaut par professeur.
create unique index if not exists ecoles_une_par_defaut on public.ecoles (proprietaire) where par_defaut;

create table if not exists public.invitations (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique check (code ~ '^[A-Z0-9]{6,32}$'),
  cree_par          uuid references public.profils (id) on delete set null,
  cree_le           timestamptz not null default now(),
  expire_le         timestamptz,
  note              text check (char_length(note) <= 300),
  utilise_par       uuid references auth.users (id) on delete set null,
  utilise_par_email text,
  utilise_le        timestamptz,
  revoque           boolean not null default false
);
comment on table public.invitations is 'Codes d''invitation à usage unique (inscription). Gérés par l''administrateur via les fonctions admin_*.';
comment on column public.invitations.code is 'Lettres majuscules et chiffres seulement (le site retire espaces et tirets avant comparaison).';

create table if not exists public.plans (
  id           uuid primary key default gen_random_uuid(),
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  type         text not null check (type in ('exercice', 'evaluation', 'examen', 'remediation')),
  titre        text not null check (char_length(btrim(titre)) between 1 and 200),
  contenu      jsonb not null check (jsonb_typeof(contenu) = 'object' and octet_length(contenu::text) <= 2000000),
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now()
);
comment on table public.plans is 'Coffre : configurations enregistrées (PlanDocument JSON tel quel). Partage entre collègues : plus tard (table partages).';
create index if not exists plans_proprietaire_idx on public.plans (proprietaire, modifie_le desc);

-- -------------------------------------------------------------------------------------------------
-- Fonctions d'aide (utilisées par les politiques)
-- -------------------------------------------------------------------------------------------------

-- SECURITY DEFINER : lit `profils` sans repasser par ses propres politiques (pas de récursion).
create or replace function public.est_actif()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profils p where p.id = auth.uid() and p.actif);
$$;

create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profils p where p.id = auth.uid() and p.actif and p.est_admin);
$$;

-- Normalisation d'un code saisi : majuscules, sans espaces ni tirets ni autre signe.
create or replace function public.normaliser_code(brut text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(upper(coalesce(brut, '')), '[^A-Z0-9]', '', 'g');
$$;

-- Date de modification tenue à jour.
create or replace function public.toucher_modifie_le()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le := now();
  return new;
end;
$$;

drop trigger if exists profils_modifie_le on public.profils;
create trigger profils_modifie_le before update on public.profils
  for each row execute function public.toucher_modifie_le();
drop trigger if exists ecoles_modifie_le on public.ecoles;
create trigger ecoles_modifie_le before update on public.ecoles
  for each row execute function public.toucher_modifie_le();
drop trigger if exists plans_modifie_le on public.plans;
create trigger plans_modifie_le before update on public.plans
  for each row execute function public.toucher_modifie_le();

-- -------------------------------------------------------------------------------------------------
-- Droits de base : rien pour `anon`, le strict nécessaire pour `authenticated` (le RLS filtre
-- ensuite les lignes). Les colonnes sensibles de `profils` (est_admin, actif) ne sont JAMAIS
-- modifiables par le client : seule `nom_affiche` l'est.
-- -------------------------------------------------------------------------------------------------

revoke all on public.profils, public.ecoles, public.invitations, public.plans from anon;
revoke all on public.profils, public.ecoles, public.invitations, public.plans from authenticated;

grant select on public.profils to authenticated;
grant update (nom_affiche) on public.profils to authenticated;
grant select, insert, update, delete on public.ecoles to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select on public.invitations to authenticated;

-- Colonne ajoutée plus tard (0005_repartition.sql), modifiable par le professeur : son droit est
-- redonné si ce fichier est relancé APRÈS 0005 (le `revoke all` ci-dessus retire aussi les droits de
-- colonne). Sans 0005, ce bloc ne fait rien.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profils' and column_name = 'repartition') then
    grant update (repartition) on public.profils to authenticated;
  end if;
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------------------------------------------

alter table public.profils enable row level security;
alter table public.ecoles enable row level security;
alter table public.invitations enable row level security;
alter table public.plans enable row level security;

-- profils : chacun lit le sien (même désactivé, pour que le site puisse afficher « compte
-- désactivé ») ; l'administrateur lit tous les profils. Modification : le sien, s'il est actif.
-- Ni insertion (le déclencheur d'inscription s'en charge) ni suppression (supprimer_mon_compte).
drop policy if exists profils_lecture on public.profils;
create policy profils_lecture on public.profils for select to authenticated
  using (id = (select auth.uid()) or (select public.est_admin()));

drop policy if exists profils_modification on public.profils;
create policy profils_modification on public.profils for update to authenticated
  using (id = (select auth.uid()) and (select public.est_actif()))
  with check (id = (select auth.uid()));

-- ecoles : uniquement les siennes, compte actif.
drop policy if exists ecoles_proprietaire on public.ecoles;
create policy ecoles_proprietaire on public.ecoles for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

-- plans : uniquement les siens, compte actif. (Partage : politique SELECT à AJOUTER plus tard.)
drop policy if exists plans_proprietaire on public.plans;
create policy plans_proprietaire on public.plans for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

-- invitations : lecture par l'administrateur seulement ; écriture uniquement par les fonctions.
drop policy if exists invitations_admin_lecture on public.invitations;
create policy invitations_admin_lecture on public.invitations for select to authenticated
  using ((select public.est_admin()));

-- -------------------------------------------------------------------------------------------------
-- Inscription par code d'invitation (déclencheur sur auth.users)
-- -------------------------------------------------------------------------------------------------
-- `supabase.auth.signUp({ email, password, options: { data: { code_invitation, nom_affiche } } })`
-- range `data` dans `raw_user_meta_data`. Si le code est absent, inconnu, expiré, révoqué ou déjà
-- utilisé, le déclencheur lève une exception : l'insertion dans auth.users est annulée et
-- `signUp` renvoie une erreur (« Database error saving new user », statut 500 — le message précis
-- ne remonte pas jusqu'au client, d'où `verifier_code_invitation` ci-dessous pour un message clair).
-- Sinon le code est marqué utilisé (verrou de ligne : deux inscriptions simultanées avec le même
-- code ne peuvent pas réussir toutes les deux) et le profil est créé.

create or replace function public.inscription_par_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := public.normaliser_code(new.raw_user_meta_data ->> 'code_invitation');
  v_nom  text := btrim(coalesce(new.raw_user_meta_data ->> 'nom_affiche', ''));
  v_inv  public.invitations%rowtype;
begin
  if v_code = '' then
    raise exception 'Inscription refusée : code d''invitation absent.' using errcode = 'P0001';
  end if;

  select * into v_inv from public.invitations i where i.code = v_code for update;

  if not found then
    raise exception 'Inscription refusée : code d''invitation inconnu.' using errcode = 'P0001';
  elsif v_inv.revoque then
    raise exception 'Inscription refusée : code d''invitation révoqué.' using errcode = 'P0001';
  elsif v_inv.utilise_le is not null then
    raise exception 'Inscription refusée : code d''invitation déjà utilisé.' using errcode = 'P0001';
  elsif v_inv.expire_le is not null and v_inv.expire_le <= now() then
    raise exception 'Inscription refusée : code d''invitation expiré.' using errcode = 'P0001';
  end if;

  if v_nom = '' then
    v_nom := split_part(coalesce(new.email, 'Professeur'), '@', 1);
  end if;

  update public.invitations
     set utilise_par = new.id, utilise_par_email = new.email, utilise_le = now()
   where id = v_inv.id;

  insert into public.profils (id, nom_affiche) values (new.id, left(v_nom, 120));
  return new;
end;
$$;

revoke all on function public.inscription_par_invitation() from public, anon, authenticated;

drop trigger if exists inscription_par_invitation on auth.users;
create trigger inscription_par_invitation after insert on auth.users
  for each row execute function public.inscription_par_invitation();

-- Pré-vérification appelée par la page /inscription AVANT signUp (message d'erreur clair).
-- Ne dit que « valide » ou la raison du refus — jamais qui l'a utilisé. Codes de 12 caractères
-- tirés au hasard parmi 32 symboles (≈ 60 bits) : impossibles à deviner par essais.
create or replace function public.verifier_code_invitation(p_code text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_inv public.invitations%rowtype;
begin
  select * into v_inv from public.invitations i where i.code = public.normaliser_code(p_code);
  if not found then return 'inconnu'; end if;
  if v_inv.revoque then return 'revoque'; end if;
  if v_inv.utilise_le is not null then return 'utilise'; end if;
  if v_inv.expire_le is not null and v_inv.expire_le <= now() then return 'expire'; end if;
  return 'valide';
end;
$$;

revoke all on function public.verifier_code_invitation(text) from public;
grant execute on function public.verifier_code_invitation(text) to anon, authenticated;

-- -------------------------------------------------------------------------------------------------
-- Fonctions du professeur
-- -------------------------------------------------------------------------------------------------

-- Définit l'école par défaut (une seule à la fois) en une opération.
create or replace function public.definir_ecole_par_defaut(p_ecole uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.est_actif() then
    raise exception 'Compte inactif.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.ecoles e where e.id = p_ecole and e.proprietaire = auth.uid()) then
    raise exception 'École introuvable.' using errcode = 'P0002';
  end if;
  update public.ecoles set par_defaut = false where proprietaire = auth.uid() and par_defaut and id <> p_ecole;
  update public.ecoles set par_defaut = true where id = p_ecole;
end;
$$;

revoke all on function public.definir_ecole_par_defaut(uuid) from public, anon;
grant execute on function public.definir_ecole_par_defaut(uuid) to authenticated;

-- Supprime le compte de l'appelant : ses plans, ses écoles, son profil (cascade) et son
-- utilisateur auth. Les invitations qu'il a utilisées / créées restent, sans lien vers lui.
-- Autorisée même pour un compte désactivé (droit à l'effacement). Refusée pour le DERNIER
-- administrateur actif (sinon plus personne ne peut générer de codes).
create or replace function public.supprimer_mon_compte()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := auth.uid();
begin
  if v_id is null then
    raise exception 'Non connecté.' using errcode = '42501';
  end if;
  if exists (select 1 from public.profils p where p.id = v_id and p.est_admin and p.actif)
     and not exists (select 1 from public.profils p where p.id <> v_id and p.est_admin and p.actif) then
    raise exception 'Dernier administrateur : nomme d''abord un autre administrateur.' using errcode = 'P0001';
  end if;
  delete from public.plans where proprietaire = v_id;
  delete from public.ecoles where proprietaire = v_id;
  delete from public.profils where id = v_id;
  delete from auth.users where id = v_id;
end;
$$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Fonctions de l'administrateur (toutes vérifient est_admin)
-- -------------------------------------------------------------------------------------------------

create or replace function public.exiger_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.est_admin() then
    raise exception 'Réservé à l''administrateur.' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.exiger_admin() from public, anon;
grant execute on function public.exiger_admin() to authenticated;

-- Code aléatoire de 12 symboles parmi 32 (alphabet sans 0/O ni 1/I : pas de confusion à la lecture).
create or replace function public.nouveau_code_invitation()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 symboles : octet % 32 uniforme
  octets bytea;
  resultat text := '';
  i int;
begin
  -- 2 uuid v4 = 32 octets aléatoires (gen_random_uuid : noyau Postgres, aucune extension).
  octets := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
  -- octets 0–5 et 9–14 de chaque uuid sont entièrement aléatoires ; on prend 12 octets sûrs.
  foreach i in array array[0, 1, 2, 3, 4, 5, 16, 17, 18, 19, 20, 21] loop
    resultat := resultat || substr(alphabet, (get_byte(octets, i) % 32) + 1, 1);
  end loop;
  return resultat;
end;
$$;
revoke all on function public.nouveau_code_invitation() from public, anon, authenticated;

create or replace function public.admin_generer_codes(p_nombre int, p_expire_le timestamptz default null, p_note text default null)
returns setof public.invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
  v_code text;
  v_inv public.invitations%rowtype;
begin
  perform public.exiger_admin();
  if p_nombre is null or p_nombre < 1 or p_nombre > 50 then
    raise exception 'Nombre de codes : entre 1 et 50.' using errcode = '22023';
  end if;
  if p_expire_le is not null and p_expire_le <= now() then
    raise exception 'La date d''expiration doit être dans le futur.' using errcode = '22023';
  end if;
  for n in 1 .. p_nombre loop
    loop
      v_code := public.nouveau_code_invitation();
      exit when not exists (select 1 from public.invitations i where i.code = v_code);
    end loop;
    insert into public.invitations (code, cree_par, expire_le, note)
    values (v_code, auth.uid(), p_expire_le, nullif(btrim(coalesce(p_note, '')), ''))
    returning * into v_inv;
    return next v_inv;
  end loop;
end;
$$;
revoke all on function public.admin_generer_codes(int, timestamptz, text) from public, anon;
grant execute on function public.admin_generer_codes(int, timestamptz, text) to authenticated;

create or replace function public.admin_revoquer_code(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.exiger_admin();
  update public.invitations set revoque = true where id = p_id and utilise_le is null;
  if not found then
    raise exception 'Code introuvable ou déjà utilisé.' using errcode = 'P0002';
  end if;
end;
$$;
revoke all on function public.admin_revoquer_code(uuid) from public, anon;
grant execute on function public.admin_revoquer_code(uuid) to authenticated;

create or replace function public.admin_lister_invitations()
returns table (
  id uuid, code text, cree_le timestamptz, expire_le timestamptz, note text, revoque boolean,
  utilise_le timestamptz, utilise_par uuid, utilise_par_email text, utilise_par_nom text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exiger_admin();
  return query
    select i.id, i.code, i.cree_le, i.expire_le, i.note, i.revoque, i.utilise_le, i.utilise_par,
           coalesce(u.email::text, i.utilise_par_email), p.nom_affiche
      from public.invitations i
      left join auth.users u on u.id = i.utilise_par
      left join public.profils p on p.id = i.utilise_par
     order by i.cree_le desc;
end;
$$;
revoke all on function public.admin_lister_invitations() from public, anon;
grant execute on function public.admin_lister_invitations() to authenticated;

create or replace function public.admin_lister_professeurs()
returns table (
  id uuid, email text, nom_affiche text, est_admin boolean, actif boolean,
  inscrit_le timestamptz, derniere_connexion timestamptz, nombre_plans bigint, nombre_ecoles bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exiger_admin();
  return query
    select p.id, u.email::text, p.nom_affiche, p.est_admin, p.actif, u.created_at, u.last_sign_in_at,
           (select count(*) from public.plans pl where pl.proprietaire = p.id),
           (select count(*) from public.ecoles e where e.proprietaire = p.id)
      from public.profils p
      join auth.users u on u.id = p.id
     order by u.created_at desc;
end;
$$;
revoke all on function public.admin_lister_professeurs() from public, anon;
grant execute on function public.admin_lister_professeurs() to authenticated;

create or replace function public.admin_definir_actif(p_id uuid, p_actif boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.exiger_admin();
  if p_id = auth.uid() then
    raise exception 'Impossible de désactiver ton propre compte.' using errcode = 'P0001';
  end if;
  update public.profils set actif = coalesce(p_actif, true) where id = p_id;
  if not found then
    raise exception 'Professeur introuvable.' using errcode = 'P0002';
  end if;
end;
$$;
revoke all on function public.admin_definir_actif(uuid, boolean) from public, anon;
grant execute on function public.admin_definir_actif(uuid, boolean) to authenticated;

-- Les fonctions d'aide des politiques : appelables par `authenticated` (le RLS les évalue avec les
-- droits de l'appelant), jamais par `anon`.
revoke all on function public.est_actif() from public, anon;
revoke all on function public.est_admin() from public, anon;
grant execute on function public.est_actif() to authenticated;
grant execute on function public.est_admin() to authenticated;
revoke all on function public.toucher_modifie_le() from public, anon, authenticated;
