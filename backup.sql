--
-- PostgreSQL database dump
--

\restrict Te5yvdgnjXNK0xwK3924x2Oqm8fLgcgfJjFdNudgwvMNeZLd9BgMkhsbkbaaR8V

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-27 13:04:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16392)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 27362)
-- Name: allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.allocations (
    id text NOT NULL,
    resource_id text NOT NULL,
    work_package_id text,
    quantity numeric(18,2) NOT NULL,
    allocation_date date NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    remarks text,
    allocated_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.allocations OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16513)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text,
    action text NOT NULL,
    module text NOT NULL,
    reference_id text,
    old_value jsonb,
    new_value jsonb,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 22512)
-- Name: bridge_crossings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bridge_crossings (
    id text NOT NULL,
    project_id text NOT NULL,
    crossing_name text NOT NULL,
    crossing_type text NOT NULL,
    method text NOT NULL,
    status text NOT NULL,
    remarks text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bridge_crossings OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 24831)
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id text NOT NULL,
    project_id text NOT NULL,
    category text NOT NULL,
    fiscal_year integer NOT NULL,
    allocated_amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 22528)
-- Name: construction_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.construction_snapshots (
    id text NOT NULL,
    project_id text NOT NULL,
    snapshot_date date NOT NULL,
    pipeline_laid_km numeric(8,2) NOT NULL,
    pipeline_tested_km numeric(8,2) NOT NULL,
    house_connections_completed integer NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.construction_snapshots OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 21524)
-- Name: delays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delays (
    id text NOT NULL,
    project_id text NOT NULL,
    work_package_id text,
    reason text NOT NULL,
    days_delayed integer NOT NULL,
    root_cause text,
    mitigation_plan text,
    reported_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    category text DEFAULT 'General'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL
);


ALTER TABLE public.delays OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 21493)
-- Name: ehs_checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ehs_checklist_items (
    id text NOT NULL,
    inspection_id text NOT NULL,
    item_description text NOT NULL,
    status text NOT NULL,
    due_date date
);


ALTER TABLE public.ehs_checklist_items OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 21460)
-- Name: ehs_incidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ehs_incidents (
    id text NOT NULL,
    project_id text NOT NULL,
    incident_type text NOT NULL,
    severity text NOT NULL,
    incident_date date NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    reported_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ehs_incidents OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 21479)
-- Name: ehs_inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ehs_inspections (
    id text NOT NULL,
    project_id text NOT NULL,
    inspection_date date NOT NULL,
    score_pct numeric(5,2),
    remarks text,
    inspected_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ehs_inspections OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 22464)
-- Name: house_connection_clusters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.house_connection_clusters (
    id text NOT NULL,
    project_id text NOT NULL,
    cluster_name text NOT NULL,
    planned integer NOT NULL,
    completed integer NOT NULL,
    in_progress integer NOT NULL,
    remaining integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.house_connection_clusters OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 24848)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    budget_id text NOT NULL,
    invoice_number text NOT NULL,
    vendor_name text NOT NULL,
    amount numeric(18,2) NOT NULL,
    invoice_date date NOT NULL,
    due_date date,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_date date,
    attachment_ids jsonb,
    submitted_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16473)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16418)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 22444)
-- Name: pipeline_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipeline_sections (
    id text NOT NULL,
    project_id text NOT NULL,
    zone text NOT NULL,
    chainage_from text NOT NULL,
    chainage_to text NOT NULL,
    diameter text NOT NULL,
    length_km numeric(8,2) NOT NULL,
    laying_pct numeric(5,2) NOT NULL,
    testing_pct numeric(5,2) NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pipeline_sections OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17654)
-- Name: progress_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress_entries (
    id text NOT NULL,
    work_package_id text NOT NULL,
    reported_date date NOT NULL,
    physical_progress_pct numeric(5,2) NOT NULL,
    remarks text,
    attachment_ids jsonb,
    reported_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.progress_entries OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16500)
-- Name: project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_members (
    id text NOT NULL,
    project_id text NOT NULL,
    user_id text NOT NULL,
    role_on_project text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_members OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16486)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date date,
    start_date date
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16458)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    device_info text,
    ip_address text,
    expires_at timestamp(3) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    replaced_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 31406)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id text NOT NULL,
    project_id text NOT NULL,
    title text NOT NULL,
    period text NOT NULL,
    module text DEFAULT 'overall'::text NOT NULL,
    date_from date,
    date_to date,
    generated_date date NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    summary text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 27346)
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    unit text NOT NULL,
    total_capacity numeric(18,2) NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 21504)
-- Name: risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risks (
    id text NOT NULL,
    project_id text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    probability text NOT NULL,
    impact text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    owner_id text NOT NULL,
    identified_date date NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    owner_name text
);


ALTER TABLE public.risks OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16430)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id text NOT NULL,
    permission_id text NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16406)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 22481)
-- Name: testing_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testing_activities (
    id text NOT NULL,
    project_id text NOT NULL,
    activity_name text NOT NULL,
    planned_value numeric(8,2) NOT NULL,
    actual_value numeric(8,2) NOT NULL,
    unit text NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.testing_activities OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16439)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    password_changed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 22498)
-- Name: valve_chamber_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.valve_chamber_summaries (
    id text NOT NULL,
    project_id text NOT NULL,
    planned integer NOT NULL,
    completed integer NOT NULL,
    in_progress integer NOT NULL,
    not_started integer NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.valve_chamber_summaries OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17638)
-- Name: work_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_packages (
    id text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    planned_start date NOT NULL,
    planned_end date NOT NULL,
    actual_start date,
    actual_end date,
    weightage_pct numeric(5,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.work_packages OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 16392)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
597c0335-546b-4cdf-a5c5-10a635624fc7	a704c7045b9f9a0aa0a3e33aaab62ffe58c0ab7c4fe0ec7e49b2cb5be085b683	2026-07-15 18:03:03.732651+05:30	20260715123303_init	\N	\N	2026-07-15 18:03:03.645828+05:30	1
7961f85c-a27e-4a68-a6ba-f9b3b9313619	84718fb500dcadc113c346a1b7f3f4cd6982f583f59e4d9aab02724f2531d17d	2026-07-16 15:23:28.596999+05:30	20260716095328_add_financial_dashboard	\N	\N	2026-07-16 15:23:28.462086+05:30	1
f974bc2d-85d3-488f-89eb-21febdb829a0	0adad9a8279c14648b81855e6ebc8009f9a5fae5ba939db96548a5f800f58608	2026-07-16 16:00:39.942076+05:30	20260716103039_add_resource_dashboard	\N	\N	2026-07-16 16:00:39.844459+05:30	1
64a86673-30cb-4288-8fd3-a7864ec5ba46	b19571b8f5bf669dfb9cfa1c2b393242984abad435184258f1a2f2559165020f	2026-07-20 16:04:29.323305+05:30	20260720103429_construction_dashboard	\N	\N	2026-07-20 16:04:29.14559+05:30	1
21eaf45e-2960-40bb-9262-9cfa0c67eab1	e8daf93b5fcbc2b235b11942576a4844dc315d213d05027fed408871bacd6827	2026-07-22 14:24:13.899435+05:30	20260722085413_add_financial_dashboard	\N	\N	2026-07-22 14:24:13.723681+05:30	1
2ba36f6c-7b12-4fd8-ab46-6863df8c0870	edc591da6a451e3b51b5d7aa4b2610a616cf2eb975594ddac82495dce1aa3cd8	2026-07-22 14:32:41.786313+05:30	20260722090241_add_financial_dashboard	\N	\N	2026-07-22 14:32:41.742095+05:30	1
ccf349e0-d7c0-4b6f-af45-421f2f0a7fae	94f216219cfd5104d61f7ac90018ee59e4b5ac4025561cc5d655e221a4b7cf8b	2026-07-22 17:24:39.977207+05:30	20260722115439_add_resource_dashboard	\N	\N	2026-07-22 17:24:39.921896+05:30	1
bdb6e546-81fe-41f5-ad13-5108e789b716	6b34dea952b5164b232b4af0e1dc100589e51795d1e59b5d020d986350fb78a9	2026-07-23 09:52:18.15534+05:30	20260723042218_update_risk_delay_ui_fields	\N	\N	2026-07-23 09:52:18.108519+05:30	1
faf87cf1-c0ee-4e2f-b9dd-26f9805a907e	3ee36f6a2988925cc6ee1d3316409fda1858df0e87219cfae7fdb059784e9c97	2026-07-23 11:34:28.191721+05:30	20260723060428_add_reports_module	\N	\N	2026-07-23 11:34:28.105098+05:30	1
\.


--
-- TOC entry 5192 (class 0 OID 27362)
-- Dependencies: 245
-- Data for Name: allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.allocations (id, resource_id, work_package_id, quantity, allocation_date, status, remarks, allocated_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5175 (class 0 OID 16513)
-- Dependencies: 228
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, module, reference_id, old_value, new_value, ip_address, created_at) FROM stdin;
c324e1aa-8943-43a4-9f91-7b462b3f625a	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:05:33.711
f1a67277-7caf-4429-a763-59a02d20ea93	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:07:00.857
3a967147-d7c9-4d7e-bcdd-f0a97206b71c	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:07:06.002
9797579d-0bd2-46f3-82be-659a67ea9a3a	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:07:30.427
bd5b5c83-1bcd-4b67-b724-22b5c0164da9	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:26:22.741
e09a31cf-6cc0-4f47-a621-a18e8bf73457	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:26:46.339
b86f22b2-e91a-4def-9280-79fc51252c66	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:15.944
db359b1e-2990-4064-bd94-7d41d9f120dc	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:16.997
f1089b09-985b-44ac-a6af-0fd4a2a024fb	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:17.814
87a271da-fca9-46f5-9b3b-f67b1c42eff2	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:18.342
0372c6fc-f73e-4ed1-9dee-62eeac11084b	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:20.844
f4eb11ac-31a9-4436-838a-ffde09fd8830	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:30.126
cafb6d51-c0a4-4ff0-922e-5ec9e56a0937	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:30.311
acd8501d-cc21-42ee-aca3-007591d10aad	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:30.488
6d248089-464f-4bfc-b53a-d4f2361b9483	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:30.659
18b2312e-f9bf-4f59-ab36-a7178b5ff0bb	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:30.835
fbd7fc2a-c409-4999-ac2c-4d2b0ad200e3	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:31.005
d71bab86-5cb0-44b6-8549-9dae257887f0	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:31.257
52016984-c9ac-4e73-8e2f-3a1398069fb7	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:31.438
ce8ae87b-ded6-4373-9cc3-19353167b330	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:31.703
2a92ebcb-8df2-4a9b-9adc-24a74271de50	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:31.874
67b6a81b-6afc-487b-8811-309eeb59f6b2	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:32.046
31c2e498-9dc7-4263-96cf-c73b686d815e	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:32.209
9a4da77d-4d77-4fa8-9629-d48e5cf16987	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:32.372
3d809e34-c36a-44a8-be21-d3aac76f837f	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:32.632
5eae998a-9a02-4227-a7bc-aa6738418870	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:35.476
52b8f97b-c9b4-411b-9549-4a9f56f622ac	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:36.055
115041c8-f7ba-4271-9d69-66e7c91f8722	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:36.58
046102d0-d604-4459-9999-5e39f3148d90	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:37.031
25990e88-2aa6-4125-b3ab-6490c8eca170	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:37.482
0ba22c9e-3233-4303-b1de-4f7b4a72bd5b	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:37.907
1576288e-901f-48c8-a78e-f02bf04755af	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:38.354
3cca1864-192b-4a29-8fde-79909e6a3bf2	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:38.735
8e58a5f7-e21f-4d8b-ad05-1744a1be8281	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:29:39.072
5f2db352-433d-4d95-8492-edd1dc181d9e	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:30:11.381
ab3bfcd4-d08e-40cd-948d-54b7a60d43fc	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:31:02.976
574360cc-e1c5-47bf-a1e3-20ec32ca9707	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:33:40.272
a51f351e-ca31-4652-af51-a823fbe372f9	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-17 10:33:43.984
923a57bc-bcc5-45c2-b819-3d93509afe11	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-20 05:34:42.718
855d8aa6-bd1a-4ea9-967f-c5dfc1fc191b	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-20 05:36:30.204
30a40701-cff6-4ef1-965f-8f52edee5627	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-20 05:36:57.482
9d57004b-42e4-433a-8315-1562a9b7aad8	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-20 05:52:29.98
63762062-6a2f-4b60-af37-8f659604713f	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-20 05:53:14.017
ba370004-18f4-49fb-95ce-65b851885c15	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 05:13:04.184
069b2238-b457-4d90-91c9-4c7782853f22	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 06:15:51.569
db7ace8d-0f91-4d08-b158-2e3f5fd22d19	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 06:17:43.341
881dfdd2-c52e-437a-8354-d522fc74d219	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 06:17:58.842
18a04396-ad83-4b87-abda-9bd7c8bf3721	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 09:24:17.164
2bf07724-8ae8-407b-8cd0-e6b89833f481	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 09:54:12.99
97e55c72-376a-49f7-b052-f528a06ce7f8	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 09:55:40.447
24bf460a-0db7-4d32-ad4a-84671e2ecd63	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 10:03:00.968
76e32aee-313f-41f5-8979-a298d3e48d2c	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	financial_dashboard	cedff5ea-dc95-4b06-b585-51173007549e	\N	{"id": "cedff5ea-dc95-4b06-b585-51173007549e", "amount": 50000, "status": "pending", "dueDate": "2026-10-10T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-22T10:12:22.567Z", "updatedAt": "2026-07-22T10:12:22.567Z", "vendorName": "2 years", "invoiceDate": "2025-10-10T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543135"}	::1	2026-07-22 10:12:22.574
0e352d45-618b-4397-bdbb-9b9291321eb3	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	financial_dashboard	72cee3ce-b05d-4e2b-bec5-a71a4f04f0b3	\N	{"id": "72cee3ce-b05d-4e2b-bec5-a71a4f04f0b3", "notes": null, "category": "Budget", "currency": "INR", "createdAt": "2026-07-22T10:15:35.804Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T10:15:35.804Z", "fiscalYear": 2026, "allocatedAmount": 245000}	::1	2026-07-22 10:15:35.806
0309b6c5-ed6c-4073-b03d-0f8e7afdab36	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	financial_dashboard	72cee3ce-b05d-4e2b-bec5-a71a4f04f0b3	{"id": "72cee3ce-b05d-4e2b-bec5-a71a4f04f0b3", "notes": null, "category": "Budget", "currency": "INR", "createdAt": "2026-07-22T10:15:35.804Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T10:15:35.804Z", "fiscalYear": 2026, "allocatedAmount": 245000}	\N	::1	2026-07-22 10:16:13.717
94312087-0c9c-4841-9347-41637d678774	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	financial_dashboard	a04ce4c7-37b9-478b-bb6c-7548ba771416	\N	{"id": "a04ce4c7-37b9-478b-bb6c-7548ba771416", "amount": 50000, "status": "pending", "dueDate": "2026-02-01T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-22T10:18:14.515Z", "updatedAt": "2026-07-22T10:18:14.515Z", "vendorName": "1 year", "invoiceDate": "2025-10-10T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543136"}	::1	2026-07-22 10:18:14.517
1cee711d-ea82-4471-a43c-0ed10f5f1756	4aec35c8-444d-4be9-942e-51d19d5b3df4	update	financial_dashboard	a04ce4c7-37b9-478b-bb6c-7548ba771416	{"id": "a04ce4c7-37b9-478b-bb6c-7548ba771416", "amount": 50000, "status": "pending", "dueDate": "2026-02-01T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-22T10:18:14.515Z", "updatedAt": "2026-07-22T10:18:14.515Z", "vendorName": "1 year", "invoiceDate": "2025-10-10T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543136"}	{"id": "a04ce4c7-37b9-478b-bb6c-7548ba771416", "amount": 50000, "status": "paid", "dueDate": "2026-02-01T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-22T10:18:14.515Z", "updatedAt": "2026-07-22T10:18:14.531Z", "vendorName": "1 year", "invoiceDate": "2025-10-10T00:00:00.000Z", "paymentDate": "2026-07-22T00:00:00.000Z", "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543136"}	::1	2026-07-22 10:18:14.533
3127a178-8fe4-4b3c-9cae-8cd4af845d93	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 11:56:27.012
c87d1bc6-8767-47e1-8872-06f068e2a9cf	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 11:56:28.637
888b1149-1391-409e-ad72-88873b3e6c01	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	fcd307b4-b190-4678-9ddc-fbc21cc9f1a0	\N	{"id": "fcd307b4-b190-4678-9ddc-fbc21cc9f1a0", "name": "gpu", "type": "equipment", "unit": "12", "notes": null, "createdAt": "2026-07-22T11:57:11.250Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:57:11.250Z", "totalCapacity": 56}	::1	2026-07-22 11:57:11.254
d64bf017-72cc-4bd1-807e-eea1e26a5fc3	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	319f9f34-37ed-49dd-adb5-0444d9cf5c63	\N	{"id": "319f9f34-37ed-49dd-adb5-0444d9cf5c63", "name": "admin", "type": "manpower", "unit": "persons", "notes": null, "createdAt": "2026-07-22T11:57:30.973Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:57:30.973Z", "totalCapacity": 1}	::1	2026-07-22 11:57:30.976
07599a30-01df-4bc4-878b-a855f7261e30	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	73157e1a-a0a7-443c-bf6e-0875c9546993	\N	{"id": "73157e1a-a0a7-443c-bf6e-0875c9546993", "name": "tpu", "type": "equipment", "unit": "6 GB", "notes": null, "createdAt": "2026-07-22T11:58:27.390Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:58:27.390Z", "totalCapacity": 50}	::1	2026-07-22 11:58:27.395
38c98714-9841-473d-b607-2bd3c7ec2a74	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	resource_dashboard	73157e1a-a0a7-443c-bf6e-0875c9546993	{"id": "73157e1a-a0a7-443c-bf6e-0875c9546993", "name": "tpu", "type": "equipment", "unit": "6 GB", "notes": null, "createdAt": "2026-07-22T11:58:27.390Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:58:27.390Z", "totalCapacity": 50}	\N	::1	2026-07-22 11:58:45.204
2627449d-9a38-430b-90b6-364af507a92a	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	1beea24c-2dc1-40ab-96a5-6ebba1a5e84f	\N	{"id": "1beea24c-2dc1-40ab-96a5-6ebba1a5e84f", "name": "Director", "type": "manpower", "unit": "persons", "notes": null, "createdAt": "2026-07-22T11:59:51.012Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:59:51.012Z", "totalCapacity": 1}	::1	2026-07-22 11:59:51.014
13a9208d-6c4e-4c49-8cae-d4beca4c27b6	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 12:04:33.927
7342fb7a-fe79-464e-b509-db6159c563ac	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-22 12:04:35.817
1021fb98-b0e3-4e01-9abc-53a61e92b561	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	resource_dashboard	319f9f34-37ed-49dd-adb5-0444d9cf5c63	{"id": "319f9f34-37ed-49dd-adb5-0444d9cf5c63", "name": "admin", "type": "manpower", "unit": "persons", "notes": null, "createdAt": "2026-07-22T11:57:30.973Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:57:30.973Z", "totalCapacity": 1}	\N	::1	2026-07-22 12:35:56.978
94787324-7bbf-41d9-adac-3e8c97ef4768	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 04:18:32.848
faa83d14-153f-43ce-b11c-e65e28b3c9c4	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 04:33:02.033
4b0076f5-186d-4252-a342-927b79925d18	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	risk_delay	2162b624-c243-4180-843d-b836b2392f1a	\N	{"id": "2162b624-c243-4180-843d-b836b2392f1a", "impact": "medium", "status": "open", "ownerId": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "category": "general", "createdAt": "2026-07-23T04:48:20.879Z", "ownerName": "Director", "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-23T04:48:20.879Z", "description": "Pending projects of company", "probability": "medium", "identifiedDate": "2026-07-25T00:00:00.000Z"}	::1	2026-07-23 04:48:20.885
ac74d44a-1635-4c84-ad96-d1a27bcf1450	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	risk_delay	2162b624-c243-4180-843d-b836b2392f1a	{"id": "2162b624-c243-4180-843d-b836b2392f1a", "impact": "medium", "status": "open", "ownerId": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "category": "general", "createdAt": "2026-07-23T04:48:20.879Z", "ownerName": "Director", "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-23T04:48:20.879Z", "description": "Pending projects of company", "probability": "medium", "identifiedDate": "2026-07-25T00:00:00.000Z"}	\N	::1	2026-07-23 04:49:48.19
cb6e84c0-acc0-4511-acb3-f4f2246142bd	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	risk_delay	a547a9e7-2863-41c7-8366-d4f7db1d3ac5	\N	{"id": "a547a9e7-2863-41c7-8366-d4f7db1d3ac5", "reason": "Project Mozambic", "status": "in_progress", "category": "technical", "createdAt": "2026-07-23T04:50:36.012Z", "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "rootCause": "team delay", "updatedAt": "2026-07-23T04:50:36.012Z", "reportedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "daysDelayed": 25, "workPackageId": null, "mitigationPlan": "complete the task"}	::1	2026-07-23 04:50:36.015
000a1630-2d95-466e-9f3c-bb1dbd7b20ac	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	risk_delay	a547a9e7-2863-41c7-8366-d4f7db1d3ac5	{"id": "a547a9e7-2863-41c7-8366-d4f7db1d3ac5", "reason": "Project Mozambic", "status": "in_progress", "category": "technical", "createdAt": "2026-07-23T04:50:36.012Z", "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "rootCause": "team delay", "updatedAt": "2026-07-23T04:50:36.012Z", "reportedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "daysDelayed": 25, "workPackageId": null, "mitigationPlan": "complete the task"}	\N	::1	2026-07-23 04:50:51.92
f1011e84-e7b6-4857-9624-ab42ebd4541e	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	financial_dashboard	1c9abfb7-ed54-4acd-83d6-41378ab77f98	\N	{"id": "1c9abfb7-ed54-4acd-83d6-41378ab77f98", "amount": 60000, "status": "pending", "dueDate": "2025-02-25T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-23T04:53:33.330Z", "updatedAt": "2026-07-23T04:53:33.330Z", "vendorName": "2 years", "invoiceDate": "2012-10-23T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543137"}	::1	2026-07-23 04:53:33.333
47e06e51-1a03-41dd-ae9d-7d2dc88a4b3a	4aec35c8-444d-4be9-942e-51d19d5b3df4	update	financial_dashboard	1c9abfb7-ed54-4acd-83d6-41378ab77f98	{"id": "1c9abfb7-ed54-4acd-83d6-41378ab77f98", "amount": 60000, "status": "pending", "dueDate": "2025-02-25T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-23T04:53:33.330Z", "updatedAt": "2026-07-23T04:53:33.330Z", "vendorName": "2 years", "invoiceDate": "2012-10-23T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543137"}	{"id": "1c9abfb7-ed54-4acd-83d6-41378ab77f98", "amount": 60000, "status": "approved", "dueDate": "2025-02-25T00:00:00.000Z", "budgetId": "7f493d83-ac76-45a7-bf04-78ba1a69c2af", "createdAt": "2026-07-23T04:53:33.330Z", "updatedAt": "2026-07-23T04:53:33.347Z", "vendorName": "2 years", "invoiceDate": "2012-10-23T00:00:00.000Z", "paymentDate": null, "submittedBy": "4aec35c8-444d-4be9-942e-51d19d5b3df4", "attachmentIds": [], "invoiceNumber": "125155543137"}	::1	2026-07-23 04:53:33.349
218f2cdb-9d40-4b19-b873-0d85bf49050b	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	resource_dashboard	fcd307b4-b190-4678-9ddc-fbc21cc9f1a0	{"id": "fcd307b4-b190-4678-9ddc-fbc21cc9f1a0", "name": "gpu", "type": "equipment", "unit": "12", "notes": null, "createdAt": "2026-07-22T11:57:11.250Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:57:11.250Z", "totalCapacity": 56}	\N	::1	2026-07-23 04:54:36.212
199e8574-5a61-4740-9104-52983aa5b692	4aec35c8-444d-4be9-942e-51d19d5b3df4	delete	resource_dashboard	1beea24c-2dc1-40ab-96a5-6ebba1a5e84f	{"id": "1beea24c-2dc1-40ab-96a5-6ebba1a5e84f", "name": "Director", "type": "manpower", "unit": "persons", "notes": null, "createdAt": "2026-07-22T11:59:51.012Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-22T11:59:51.012Z", "totalCapacity": 1}	\N	::1	2026-07-23 04:54:42.523
23b47b95-4b64-4757-b8c2-dc8dbc69c956	4aec35c8-444d-4be9-942e-51d19d5b3df4	logout	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 05:03:14.393
e9a58338-8e97-44d8-a25c-f14aeef14731	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 05:03:18.997
2ce92788-ba9f-4319-8848-2cad10630005	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	3d0ecd7d-1495-415d-8015-da5e572badff	\N	{"id": "3d0ecd7d-1495-415d-8015-da5e572badff", "name": "GPU", "type": "equipment", "unit": "6 GB", "notes": null, "createdAt": "2026-07-23T05:04:10.064Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-23T05:04:10.064Z", "totalCapacity": 650}	::1	2026-07-23 05:04:10.07
b3e84c39-c416-4d92-8954-b68025f57737	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	b9c20152-91c3-407a-9577-a2ac87735f8e	\N	{"id": "b9c20152-91c3-407a-9577-a2ac87735f8e", "name": "adminn", "type": "manpower", "unit": "2", "notes": null, "createdAt": "2026-07-23T05:05:16.923Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-23T05:05:16.923Z", "totalCapacity": 22}	::1	2026-07-23 05:05:16.929
191d5d64-82e1-4b74-a930-0d954b3bf2a8	4aec35c8-444d-4be9-942e-51d19d5b3df4	create	resource_dashboard	26f1fc96-9b72-4547-b9b6-ae0a37df16ff	\N	{"id": "26f1fc96-9b72-4547-b9b6-ae0a37df16ff", "name": "Directorr", "type": "manpower", "unit": "1", "notes": null, "createdAt": "2026-07-23T05:05:46.226Z", "deletedAt": null, "projectId": "b0f25cd0-d234-4667-a369-aeffc1ddd041", "updatedAt": "2026-07-23T05:05:46.226Z", "totalCapacity": 1}	::1	2026-07-23 05:05:46.23
90d47022-c995-486f-beea-bb56bde35382	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 09:26:04.25
aab8da3d-6da9-44ab-aad2-d451c00de926	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 10:30:12.096
ed1cca2b-64be-4c2b-8fa5-dd87c724fda2	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 10:35:37.098
607d88d3-bc4a-4ff8-83cd-24af8ad2055d	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 10:49:26.394
a8080fbe-551d-4def-89c7-06f4ec1ecb5b	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 10:55:46.723
28cd69cf-9f97-4f5a-8dc9-9db8f3bbdfc3	4aec35c8-444d-4be9-942e-51d19d5b3df4	login	auth	4aec35c8-444d-4be9-942e-51d19d5b3df4	\N	\N	::1	2026-07-23 10:55:51.77
\.


--
-- TOC entry 5187 (class 0 OID 22512)
-- Dependencies: 240
-- Data for Name: bridge_crossings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bridge_crossings (id, project_id, crossing_name, crossing_type, method, status, remarks, created_at, updated_at) FROM stdin;
bec783b0-25d4-4f15-84f3-13e4f82d5aab	b0f25cd0-d234-4667-a369-aeffc1ddd041	DND	Flyover	Construction	Complete	\N	2026-07-23 10:41:59.138	2026-07-23 10:41:59.138
\.


--
-- TOC entry 5189 (class 0 OID 24831)
-- Dependencies: 242
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, project_id, category, fiscal_year, allocated_amount, currency, notes, created_at, updated_at, deleted_at) FROM stdin;
7f493d83-ac76-45a7-bf04-78ba1a69c2af	b0f25cd0-d234-4667-a369-aeffc1ddd041	Project Works	2026	2368000000.00	INR	Initial financial dashboard budget	2026-07-22 10:08:59.636	2026-07-22 10:08:59.636	\N
72cee3ce-b05d-4e2b-bec5-a71a4f04f0b3	b0f25cd0-d234-4667-a369-aeffc1ddd041	Budget	2026	245000.00	INR	\N	2026-07-22 10:15:35.804	2026-07-22 10:16:13.714	2026-07-22 10:16:13.7
\.


--
-- TOC entry 5188 (class 0 OID 22528)
-- Dependencies: 241
-- Data for Name: construction_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.construction_snapshots (id, project_id, snapshot_date, pipeline_laid_km, pipeline_tested_km, house_connections_completed, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5182 (class 0 OID 21524)
-- Dependencies: 235
-- Data for Name: delays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delays (id, project_id, work_package_id, reason, days_delayed, root_cause, mitigation_plan, reported_by, created_at, updated_at, category, status) FROM stdin;
\.


--
-- TOC entry 5180 (class 0 OID 21493)
-- Dependencies: 233
-- Data for Name: ehs_checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ehs_checklist_items (id, inspection_id, item_description, status, due_date) FROM stdin;
\.


--
-- TOC entry 5178 (class 0 OID 21460)
-- Dependencies: 231
-- Data for Name: ehs_incidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ehs_incidents (id, project_id, incident_type, severity, incident_date, description, status, reported_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5179 (class 0 OID 21479)
-- Dependencies: 232
-- Data for Name: ehs_inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ehs_inspections (id, project_id, inspection_date, score_pct, remarks, inspected_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5184 (class 0 OID 22464)
-- Dependencies: 237
-- Data for Name: house_connection_clusters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.house_connection_clusters (id, project_id, cluster_name, planned, completed, in_progress, remaining, created_at, updated_at) FROM stdin;
52ee6e76-9f37-4972-ac16-737a8de80de1	b0f25cd0-d234-4667-a369-aeffc1ddd041	Palampur	56	45	5	9	2026-07-23 10:50:30.22	2026-07-23 10:50:30.22
\.


--
-- TOC entry 5190 (class 0 OID 24848)
-- Dependencies: 243
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, budget_id, invoice_number, vendor_name, amount, invoice_date, due_date, status, payment_date, attachment_ids, submitted_by, created_at, updated_at) FROM stdin;
cedff5ea-dc95-4b06-b585-51173007549e	7f493d83-ac76-45a7-bf04-78ba1a69c2af	125155543135	2 years	50000.00	2025-10-10	2026-10-10	pending	\N	[]	4aec35c8-444d-4be9-942e-51d19d5b3df4	2026-07-22 10:12:22.567	2026-07-22 10:12:22.567
a04ce4c7-37b9-478b-bb6c-7548ba771416	7f493d83-ac76-45a7-bf04-78ba1a69c2af	125155543136	1 year	50000.00	2025-10-10	2026-02-01	paid	2026-07-22	[]	4aec35c8-444d-4be9-942e-51d19d5b3df4	2026-07-22 10:18:14.515	2026-07-22 10:18:14.531
1c9abfb7-ed54-4acd-83d6-41378ab77f98	7f493d83-ac76-45a7-bf04-78ba1a69c2af	125155543137	2 years	60000.00	2012-10-23	2025-02-25	approved	\N	[]	4aec35c8-444d-4be9-942e-51d19d5b3df4	2026-07-23 04:53:33.33	2026-07-23 04:53:33.347
\.


--
-- TOC entry 5172 (class 0 OID 16473)
-- Dependencies: 225
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- TOC entry 5168 (class 0 OID 16418)
-- Dependencies: 221
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module, action, created_at) FROM stdin;
866b8e74-fdca-4be8-a838-51bdc313e374	construction_progress	create	2026-07-15 12:33:40.982
21279902-4db2-4a1b-8379-04e7c588af87	construction_progress	read	2026-07-15 12:33:40.987
b96e345b-c73d-49e7-b43b-8fb1c0638050	construction_progress	update	2026-07-15 12:33:40.989
7d744acf-0a9e-4316-a76c-d805a491de9d	construction_progress	delete	2026-07-15 12:33:40.991
62368228-6cfa-44f5-a100-4e1e2d54dc64	financial	create	2026-07-15 12:33:40.993
f82c56f5-23af-4dd2-95c3-fa25ae9073c6	financial	read	2026-07-15 12:33:40.998
1ac3970e-88d3-4e5a-9984-a2b671f6395b	financial	update	2026-07-15 12:33:41.001
2edc98a0-87ef-4ae8-9142-9150397a283c	financial	delete	2026-07-15 12:33:41.005
04e8a1e9-2db6-42c5-951e-5d534a4e0493	ehs	create	2026-07-15 12:33:41.007
675b9e95-b8de-4d19-ad26-cb2e4738198b	ehs	read	2026-07-15 12:33:41.009
ca159083-daa0-426d-978b-22f2d79aeacf	ehs	update	2026-07-15 12:33:41.014
a99535b5-5c9b-4574-90b1-89cc9b0c55e4	ehs	delete	2026-07-15 12:33:41.016
41e7b52c-ef8e-42a9-acbc-c8deb662f772	risk_delay	create	2026-07-15 12:33:41.018
3bf228a0-ec01-4bff-94a3-9d27b01f03e1	risk_delay	read	2026-07-15 12:33:41.02
4e4a24a6-6f09-47b9-bdb2-1d18ab599af0	risk_delay	update	2026-07-15 12:33:41.023
4d4a1ffa-c6f4-4b3c-8dba-64b829637932	risk_delay	delete	2026-07-15 12:33:41.024
3ecc25c2-2191-429e-b9bd-2832f6f5b256	resources	create	2026-07-15 12:33:41.026
4c4f762a-97e5-4582-9be0-2fb4f76ca146	resources	read	2026-07-15 12:33:41.029
d7774812-00fd-41d1-850f-9dac93ddda7a	resources	update	2026-07-15 12:33:41.031
3242898d-d17b-4aac-be80-a530525352f3	resources	delete	2026-07-15 12:33:41.033
9301b3e1-bbf0-461d-97c3-b53bf9eebbab	settings	create	2026-07-15 12:33:41.036
3eaa0592-eed3-411f-b80e-adf3eea033cb	settings	read	2026-07-15 12:33:41.038
4fa52190-932d-4918-b756-04edcfb3cbf6	settings	update	2026-07-15 12:33:41.04
e84ea233-4ebe-4b35-ac00-af543cab719e	settings	delete	2026-07-15 12:33:41.042
a2781a06-2318-4ea8-88b8-3a55d1abf240	resource_dashboard	create	2026-07-17 05:12:26.644
a0d7c332-c3df-4d6b-80d5-5db59850eb40	resource_dashboard	read	2026-07-17 05:12:26.648
1aa5284a-4664-4e76-b735-8d9643baf961	resource_dashboard	update	2026-07-17 05:12:26.651
5dcaa1ea-f460-4d68-bd29-8baf2236d74b	resource_dashboard	delete	2026-07-17 05:12:26.652
976daa4e-007a-4627-ac5a-56394470a785	financial_dashboard	create	2026-07-17 05:40:01.681
914918ae-6c7b-4fb5-8baf-39d910fd08fb	financial_dashboard	read	2026-07-17 05:40:01.684
77906cfb-67a6-47fa-9593-d98f0fda5f19	financial_dashboard	update	2026-07-17 05:40:01.686
8b889bdb-6007-488f-8eaf-85405efbc809	financial_dashboard	delete	2026-07-17 05:40:01.688
56f2ebbc-35f1-4039-b752-08758b8fddd5	reports	create	2026-07-23 06:39:42.5
9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85	reports	read	2026-07-23 06:39:42.502
9a50da77-073f-4de7-8910-9c0bc06358b2	reports	update	2026-07-23 06:39:42.504
bb8fec8d-8a22-4f5c-9ca4-55f7f2fa1197	reports	delete	2026-07-23 06:39:42.506
\.


--
-- TOC entry 5183 (class 0 OID 22444)
-- Dependencies: 236
-- Data for Name: pipeline_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipeline_sections (id, project_id, zone, chainage_from, chainage_to, diameter, length_km, laying_pct, testing_pct, status, created_at, updated_at) FROM stdin;
5ea1e310-6655-4550-ae72-71f8cff338bc	b0f25cd0-d234-4667-a369-aeffc1ddd041	pipeline	88	95	56	45.00	50.00	50.00	Complete	2026-07-22 10:13:15.825	2026-07-22 10:13:15.825
14773cb8-01e2-4cbf-9ad9-4bc47105c640	b0f25cd0-d234-4667-a369-aeffc1ddd041	E	88	95	56	23.00	25.00	25.00	Complete	2026-07-23 09:28:08.492	2026-07-23 09:28:08.492
\.


--
-- TOC entry 5177 (class 0 OID 17654)
-- Dependencies: 230
-- Data for Name: progress_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progress_entries (id, work_package_id, reported_date, physical_progress_pct, remarks, attachment_ids, reported_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5174 (class 0 OID 16500)
-- Dependencies: 227
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_members (id, project_id, user_id, role_on_project, created_at) FROM stdin;
702fd71e-4ae6-43aa-a153-304ab3b6ed44	b0f25cd0-d234-4667-a369-aeffc1ddd041	4aec35c8-444d-4be9-942e-51d19d5b3df4	admin	2026-07-22 10:08:59.629
b03da5d6-b8af-4e2e-b217-1330d2280517	ae028897-c9bd-4ee3-90b9-f7317deffd3b	4aec35c8-444d-4be9-942e-51d19d5b3df4	project_manager	2026-07-22 11:55:20.931
\.


--
-- TOC entry 5173 (class 0 OID 16486)
-- Dependencies: 226
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, code, status, created_at, end_date, start_date) FROM stdin;
b0f25cd0-d234-4667-a369-aeffc1ddd041	Water Supply Distribution Project	PDISA-WSDP	active	2026-07-22 10:08:59.606	2027-12-31	2025-01-01
ae028897-c9bd-4ee3-90b9-f7317deffd3b	Water Supply Distribution Project	WSDP-LUBANGO-001	active	2026-07-22 11:55:20.923	2026-12-31	2026-01-01
\.


--
-- TOC entry 5171 (class 0 OID 16458)
-- Dependencies: 224
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, device_info, ip_address, expires_at, revoked, replaced_by, created_at) FROM stdin;
a0f15462-884a-4121-bb9b-cb03123ffbb5	4aec35c8-444d-4be9-942e-51d19d5b3df4	a1a4808fa9014ed2d852023a253df10baab29a968a539f215509155c70c6c041	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:05:33.692	t	a23b1f0f-2270-46c6-b842-12a6ea7d1cf4	2026-07-17 10:05:33.698
164d0d70-e09a-4b05-836a-a0ef55f30d40	4aec35c8-444d-4be9-942e-51d19d5b3df4	79f167224bc434bbfc7687c06ecf08e74d03b5c2e705a6f29cda96d7c9a4b856	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:26:22.737	t	\N	2026-07-17 10:26:22.738
3349f0ac-0841-47ca-8546-83b28ec7c065	4aec35c8-444d-4be9-942e-51d19d5b3df4	2567ebcde00308a34ffc78e4e072926ff4941e6dc7ec4f98e2a250cdbcefbf6b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:30:11.378	t	\N	2026-07-17 10:30:11.379
6fc53fb0-fffa-4430-a022-e2732cb0cf2f	4aec35c8-444d-4be9-942e-51d19d5b3df4	0fc04e60da35ecc775beabcb7ad06b520bbf41b23ff3011f67b423f270c4124b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:34:42.682	t	1731c4d6-7e72-4e97-b29c-1f81048d790c	2026-07-20 05:34:42.684
1731c4d6-7e72-4e97-b29c-1f81048d790c	4aec35c8-444d-4be9-942e-51d19d5b3df4	cc9f561ad19a797c00eaf82a955a885bba8fa97b672a2f3505132ab2e985c3cc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:34:43.411	t	86f53e8a-8454-4723-b95d-71c910eda6df	2026-07-20 05:34:43.414
86f53e8a-8454-4723-b95d-71c910eda6df	4aec35c8-444d-4be9-942e-51d19d5b3df4	3fbd104bc55b2a08de88108049f740095423848a0143ea9746b6823a4736399e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:36:18.975	t	5707d11a-3b36-45e7-b1fd-dfe643663600	2026-07-20 05:36:18.976
5707d11a-3b36-45e7-b1fd-dfe643663600	4aec35c8-444d-4be9-942e-51d19d5b3df4	76f4093eea1cb3433c0afa53ebab21910a6042775669590e1b76c7db54f77eb6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:36:22.316	t	\N	2026-07-20 05:36:22.317
eeecca43-245b-4bf3-b917-adf5db800851	4aec35c8-444d-4be9-942e-51d19d5b3df4	41b8c7009d4b2500f93a7147806af6d3088dcd0e5063c27163352da253f3277a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:36:57.476	t	27e7e1f0-8d7d-410a-b722-b0bab5dd8876	2026-07-20 05:36:57.48
27e7e1f0-8d7d-410a-b722-b0bab5dd8876	4aec35c8-444d-4be9-942e-51d19d5b3df4	958b636c94e4ada26e3a9061dcf9f9460ee90f82196938b8ecc35620950249bd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:36:57.652	t	6c09d9a3-30bd-4ffa-b386-8ee912c07b26	2026-07-20 05:36:57.657
6c09d9a3-30bd-4ffa-b386-8ee912c07b26	4aec35c8-444d-4be9-942e-51d19d5b3df4	dbee9e7238ce55be5c30efe7864fbbf429cefbef4b3c15c392d660a56c53725f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:37:15.172	t	7213e291-dd8e-4419-b3ad-a1386eb45e3f	2026-07-20 05:37:15.178
7213e291-dd8e-4419-b3ad-a1386eb45e3f	4aec35c8-444d-4be9-942e-51d19d5b3df4	a05fb06b62b7aedce871769feeacccc076b8cee19dd7be8677302f26e0a3639d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:37:17.322	t	2cc38268-8234-4e9f-8f63-e741a41627d9	2026-07-20 05:37:17.329
2cc38268-8234-4e9f-8f63-e741a41627d9	4aec35c8-444d-4be9-942e-51d19d5b3df4	2a8a4166e296fba2be06aa5e558064e463e413657070f593ab69b255ef2f7555	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:37:40.929	t	37e8dd54-f303-4ab6-ad52-4fb19ad69627	2026-07-20 05:37:40.934
37e8dd54-f303-4ab6-ad52-4fb19ad69627	4aec35c8-444d-4be9-942e-51d19d5b3df4	3bf12fecf730ba0bea835dfb19f8b42d130c016b3bc2f04404fc34c8d15741a9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:37:47.788	t	\N	2026-07-20 05:37:47.794
5ea7dd2e-7ab2-4817-94ad-11ee3908cc31	4aec35c8-444d-4be9-942e-51d19d5b3df4	379a072e8ef09c42ae4b478daf5aa440b67caa802d14cc37ee6ca96cb5b98b0b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:53:14.01	t	7abf48da-3998-444d-9503-61d96964d801	2026-07-20 05:53:14.015
7abf48da-3998-444d-9503-61d96964d801	4aec35c8-444d-4be9-942e-51d19d5b3df4	bda78bc82c3ed5b0781c4bd1a2319d4db65b0ff06bf1a8b12fdae7ed7c79f897	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:53:14.51	t	3b371e03-0219-444a-83fc-0ff76c7e9cf2	2026-07-20 05:53:14.515
3b371e03-0219-444a-83fc-0ff76c7e9cf2	4aec35c8-444d-4be9-942e-51d19d5b3df4	3ebd6f946f87d883268953486dd3128f7c4233fe3185037c10efbc3df02509ba	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:53:20.678	t	0939acc8-c684-4962-acc1-7c156db87450	2026-07-20 05:53:20.684
0939acc8-c684-4962-acc1-7c156db87450	4aec35c8-444d-4be9-942e-51d19d5b3df4	91cbe9c41d0a5730ee4e822dbefef3ab07bcd2e37cadb91dce2173aeebfdbacf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 05:53:27.412	t	068f6cc6-8a43-46db-a3f0-ff4d0d09476b	2026-07-20 05:53:27.418
068f6cc6-8a43-46db-a3f0-ff4d0d09476b	4aec35c8-444d-4be9-942e-51d19d5b3df4	cda80d6d98e50310ef5902d8e11946ab146221a1003f1d03df5418ae777c9f20	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:25:32.084	t	14f75b87-c276-4fc1-b8aa-71e8143f9c0e	2026-07-20 08:25:32.086
88cb3876-0fdb-471f-a5f1-1482637db619	4aec35c8-444d-4be9-942e-51d19d5b3df4	23b6cdd712212b5988d1ae83a07c2d6c62bcd7e93c26cc4471a8fb3e956ef70b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:27:59.554	t	7266bba0-d0a9-4575-a013-c5a1d9945e6c	2026-07-20 08:27:59.556
a23b1f0f-2270-46c6-b842-12a6ea7d1cf4	4aec35c8-444d-4be9-942e-51d19d5b3df4	55a650db6d180fb5eedce9c307550cf229bc65ef5639710b4ecfcd9a2b970a77	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:06:26.261	t	\N	2026-07-17 10:06:26.263
14f75b87-c276-4fc1-b8aa-71e8143f9c0e	4aec35c8-444d-4be9-942e-51d19d5b3df4	aa8fc057402687abd7db543da5f15f1272c5dd22be0c78bbd3dd1183eee9ca7e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:27:03.474	t	88cb3876-0fdb-471f-a5f1-1482637db619	2026-07-20 08:27:03.476
7266bba0-d0a9-4575-a013-c5a1d9945e6c	4aec35c8-444d-4be9-942e-51d19d5b3df4	316fba1cf17666d9287141cc618fb6aa42db20138045df1b3764fadd295d5072	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:28:01.666	t	31c82e27-9536-4e30-a781-3ed599afbb38	2026-07-20 08:28:01.667
31c82e27-9536-4e30-a781-3ed599afbb38	4aec35c8-444d-4be9-942e-51d19d5b3df4	0056ff57bd50eeff4a3dfc7d9b9cef8af28d8d0d9cb44077bd7d50c1ded10cbe	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:28:28.42	t	becb21e8-b3b2-469c-a181-00cdf985a50b	2026-07-20 08:28:28.422
becb21e8-b3b2-469c-a181-00cdf985a50b	4aec35c8-444d-4be9-942e-51d19d5b3df4	7314c44d24a65da4a62013c756c5f8557c91de9d54906b7cc1c01ea992c66799	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:28:34.379	t	0db0de15-f6f7-4f70-85fc-356bb0ec3334	2026-07-20 08:28:34.381
0db0de15-f6f7-4f70-85fc-356bb0ec3334	4aec35c8-444d-4be9-942e-51d19d5b3df4	2d96dd288f6d70d9dcc1f7113a2535be8b05df7ed02baf9b690ec63758555987	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 08:38:34.261	t	6a6168e9-b846-4b16-a107-416fe92bf118	2026-07-20 08:38:34.262
6a6168e9-b846-4b16-a107-416fe92bf118	4aec35c8-444d-4be9-942e-51d19d5b3df4	11dbc037990ce7ce7cd405548b0dd3d70d33305dd734d41cd63dc9a3c4fdd117	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 10:45:56.874	t	d0799ca5-cd2c-4a07-8467-08a342a19349	2026-07-20 10:45:56.876
d0799ca5-cd2c-4a07-8467-08a342a19349	4aec35c8-444d-4be9-942e-51d19d5b3df4	4a38591357d9789311c37a61741c1f058b4ea6bfafeb56516f9d59bc4bec14db	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 10:46:01.425	t	0ad74fb7-b6b6-42e1-a4c0-b5c2b080d993	2026-07-20 10:46:01.427
0ad74fb7-b6b6-42e1-a4c0-b5c2b080d993	4aec35c8-444d-4be9-942e-51d19d5b3df4	305b015e2d33aa3b855b6a9ab82e17464c78d7ff72510b44162285daf053e0ad	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 10:46:59.491	t	9bc960b8-3b55-4732-88d1-4edf032d7bc1	2026-07-20 10:46:59.492
9bc960b8-3b55-4732-88d1-4edf032d7bc1	4aec35c8-444d-4be9-942e-51d19d5b3df4	430c37d7512f57f4a8e0ca4fe9c13620b8e4af210a905b8d02450e0112496bb2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 10:47:03.52	t	672c8d06-616b-4e44-96b5-5eca54fda8a7	2026-07-20 10:47:03.522
672c8d06-616b-4e44-96b5-5eca54fda8a7	4aec35c8-444d-4be9-942e-51d19d5b3df4	34696d3e7fe03136d9553da8d5cb0f5df1030aaae0d181fdda29662126cd7c38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 11:05:16.022	t	d444f811-1e87-47fd-82d4-64718a858c12	2026-07-20 11:05:16.023
d444f811-1e87-47fd-82d4-64718a858c12	4aec35c8-444d-4be9-942e-51d19d5b3df4	5eaf602b94eb74edde14a74d1817c1603cc2c72d9cede9bd6b3f7c973f6d2c0d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 11:05:17.919	t	f083f495-0046-4d37-8f47-f22c459e347e	2026-07-20 11:05:17.92
42bb9f86-47cb-4bf4-8fe5-4e9af97458b7	4aec35c8-444d-4be9-942e-51d19d5b3df4	cf970fac8b35eca7c41531f927ad54e83095cc7ffdd1338e54aceccff067ad80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 05:13:04.144	t	8bcaf70f-c8a1-49fb-b23f-8f273840139d	2026-07-22 05:13:04.146
8bcaf70f-c8a1-49fb-b23f-8f273840139d	4aec35c8-444d-4be9-942e-51d19d5b3df4	041cdf056c9aea0888f1dec68f454416cb1274a0f165234a7704a20c2529afe5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 05:13:04.835	t	b363606a-f824-469b-adfd-6dba7f53aa42	2026-07-22 05:13:04.836
b363606a-f824-469b-adfd-6dba7f53aa42	4aec35c8-444d-4be9-942e-51d19d5b3df4	b0880006b087a4507eacc492b32a6eddecc12b4cb276fc89c557eefa15d0353f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 05:13:18.737	t	e61989ff-082d-444b-af96-601939570685	2026-07-22 05:13:18.738
e61989ff-082d-444b-af96-601939570685	4aec35c8-444d-4be9-942e-51d19d5b3df4	d130b0ef47bfdc6f1b5f1b7393e80a3f5c567bc4e63215c17413676847d0f832	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:10:05.525	t	fc86e1c8-b19a-4ffa-909f-3bc0832c9509	2026-07-22 06:10:05.528
fc86e1c8-b19a-4ffa-909f-3bc0832c9509	4aec35c8-444d-4be9-942e-51d19d5b3df4	974c1cdd20c0502df195e67817d87acb948e9a19ad4dcfde08467a9a1637b482	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:13:36.253	t	33b1221d-7315-4888-bff2-a82365515e0a	2026-07-22 06:13:36.254
33b1221d-7315-4888-bff2-a82365515e0a	4aec35c8-444d-4be9-942e-51d19d5b3df4	18e2bfb8e9766b5a23f519557b35aae9065f969b807835d0e678665c6e3a5b97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:13:38.563	t	5186dada-5239-40e7-a343-7407d6d046fe	2026-07-22 06:13:38.566
5186dada-5239-40e7-a343-7407d6d046fe	4aec35c8-444d-4be9-942e-51d19d5b3df4	d65e96eb0aeb90227eaa559d0fe5d4df3c22d6e1c99e6fa0c325a9c3afe163cf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:13:39.817	t	d3d7f859-571e-47c5-8586-6692ae8f06ec	2026-07-22 06:13:39.818
d3d7f859-571e-47c5-8586-6692ae8f06ec	4aec35c8-444d-4be9-942e-51d19d5b3df4	279b26ffa74d34457dd962fa2e11add4ca0830c3d6449b81415d78a8e86d1021	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:13:53.005	t	9184c74b-7e0d-445f-8be1-b8bf445bf66c	2026-07-22 06:13:53.006
9184c74b-7e0d-445f-8be1-b8bf445bf66c	4aec35c8-444d-4be9-942e-51d19d5b3df4	861c108bba9272a7063a4310abad7f332ed3315043800227c7d3bd4466ce0023	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:13:54.436	t	3888d0b3-27cb-4baf-bb06-212d981b8d15	2026-07-22 06:13:54.437
f083f495-0046-4d37-8f47-f22c459e347e	4aec35c8-444d-4be9-942e-51d19d5b3df4	42ef62094d81f1a7f964a3cc0ab22d69e7189b47d2a93018494e83673afa9870	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-27 11:10:28.624	t	\N	2026-07-20 11:10:28.626
1019e7cb-93f7-494a-a488-1c44557f39a6	4aec35c8-444d-4be9-942e-51d19d5b3df4	e9b2c1fe46fd528cccc86af674d002a78a74d1dc3d5bf7a2b4bfa33474185b10	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:24:19.973	t	ec6e76e9-ecdb-47b8-b6a2-7399b78be410	2026-07-22 09:24:19.975
7456839d-5483-4507-93a6-5435fe18a988	4aec35c8-444d-4be9-942e-51d19d5b3df4	d0dd30d9a9bd474546bd9c844115cd85c31a13f50a5e09e1c7d88e5cf856e607	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	::1	2026-07-29 06:15:51.565	t	d06e19a4-2cff-4b67-806e-c0f1d601f455	2026-07-22 06:15:51.566
3888d0b3-27cb-4baf-bb06-212d981b8d15	4aec35c8-444d-4be9-942e-51d19d5b3df4	fc71f286be936bb0f6a363fdd958faac73c1847682e6297bbd945c95a66dab4f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:16:42.796	t	47affae4-23b9-49ce-b5cb-76fe103f671c	2026-07-22 06:16:42.797
47affae4-23b9-49ce-b5cb-76fe103f671c	4aec35c8-444d-4be9-942e-51d19d5b3df4	d61071074d17a7a64df1d0e8c89c1fd358d4cd0f64c3c38388bc0f8627e7e891	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:16:51.44	t	931951fd-32d1-431a-898f-e3be3ed8a0d2	2026-07-22 06:16:51.441
931951fd-32d1-431a-898f-e3be3ed8a0d2	4aec35c8-444d-4be9-942e-51d19d5b3df4	672129375442360fefd68f4873e8f3f8e092047732c6fb157f1d77ddd3184ff5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:17:31.58	t	\N	2026-07-22 06:17:31.58
ab1b0cc9-a473-48c0-9b03-c4b5494495db	4aec35c8-444d-4be9-942e-51d19d5b3df4	94a694f0963acc98c9e8ab0128b5fe14ade029994b2eba178471c9016664cbeb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:17:58.839	t	2b36d3d0-29bf-44e6-bc94-2909dd1b9408	2026-07-22 06:17:58.84
2b36d3d0-29bf-44e6-bc94-2909dd1b9408	4aec35c8-444d-4be9-942e-51d19d5b3df4	1655c7d8cf029a3a3531fad2545cb831ddef7b0974fbaa9692cf39eed6c2e474	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:17:58.917	t	7ed0e7d4-f12d-4fed-aaf2-540c8f6e15f0	2026-07-22 06:17:58.918
7ed0e7d4-f12d-4fed-aaf2-540c8f6e15f0	4aec35c8-444d-4be9-942e-51d19d5b3df4	861374b2025f04de06fd284e232f9221d3531dec467e6ee2bac50159bf272739	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:18:09.204	t	24c3d0c0-34b5-4f32-9e98-e6f8370c6128	2026-07-22 06:18:09.205
24c3d0c0-34b5-4f32-9e98-e6f8370c6128	4aec35c8-444d-4be9-942e-51d19d5b3df4	c4936427ff6964aed3ced1edb732e2a0b03870a07819544b58ca47a2efc2c15c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:38:19.344	t	381add95-a60a-4973-9073-0ff10c97a1c7	2026-07-22 06:38:19.346
381add95-a60a-4973-9073-0ff10c97a1c7	4aec35c8-444d-4be9-942e-51d19d5b3df4	49efb8e17f75b497a81ea2894438fdafae0276a5affd243039b93294c3aef97e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:39:13.892	t	2db4b0da-2a10-471d-99da-1af1cd5d947d	2026-07-22 06:39:13.894
2db4b0da-2a10-471d-99da-1af1cd5d947d	4aec35c8-444d-4be9-942e-51d19d5b3df4	2056aef9005060e7882dc0693c4c32d02e62ce2e7b6872e993317ab99618f6ba	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:39:15.666	t	53eaeced-6870-4477-8f6b-bdcdaf42fa9f	2026-07-22 06:39:15.668
53eaeced-6870-4477-8f6b-bdcdaf42fa9f	4aec35c8-444d-4be9-942e-51d19d5b3df4	299369136c9e036fc7cc3744ba09613c2bd95941a6231f411a8955f405f0dd9a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:39:22.731	t	d81f124e-fbac-4e73-b34a-2e5828cc4f56	2026-07-22 06:39:22.732
d81f124e-fbac-4e73-b34a-2e5828cc4f56	4aec35c8-444d-4be9-942e-51d19d5b3df4	8dc19220ea41f76e2390eece3a3d520fe3d202f044c895fc5145606dc712e740	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:42:07.855	t	be5299d0-2e00-4802-8600-825760e33322	2026-07-22 06:42:07.856
be5299d0-2e00-4802-8600-825760e33322	4aec35c8-444d-4be9-942e-51d19d5b3df4	f8abdcb881770269f522f347005a084b0ec46db8ecc2cbd1fc9e42e29e88135c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:42:23.449	t	a0a946cd-f483-4155-ab87-0bef29f68a04	2026-07-22 06:42:23.451
a0a946cd-f483-4155-ab87-0bef29f68a04	4aec35c8-444d-4be9-942e-51d19d5b3df4	ddcfdde39507d90b444b6d623947bdb2c9bb7764699069c0ee05f9ca0ea91904	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:19.14	t	9fd9ecff-f29b-4c3d-9c86-80a26509d67e	2026-07-22 06:50:19.141
9fd9ecff-f29b-4c3d-9c86-80a26509d67e	4aec35c8-444d-4be9-942e-51d19d5b3df4	1ee4e2b3e4e337c34d77eec17ef7f7555a36bccb31d11756e7c6c85c7b926f03	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:19.598	t	dc8ff2ef-3d2d-4d61-b4e3-75b1ea1467aa	2026-07-22 06:50:19.6
dc8ff2ef-3d2d-4d61-b4e3-75b1ea1467aa	4aec35c8-444d-4be9-942e-51d19d5b3df4	81d8a0917a29fa0add1bfdaba1df2864fca30cc564c919ae57c43afd583e0f16	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:20.709	t	f92c507b-31d7-4656-ac4a-3d545330862d	2026-07-22 06:50:20.711
f92c507b-31d7-4656-ac4a-3d545330862d	4aec35c8-444d-4be9-942e-51d19d5b3df4	b9d2c3e43500db387f6ee832156c9722175636af93fac5288a792a8ee1dcb080	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:21.361	t	83ae9689-d5d6-4388-8a67-8df72fe4a5f9	2026-07-22 06:50:21.363
83ae9689-d5d6-4388-8a67-8df72fe4a5f9	4aec35c8-444d-4be9-942e-51d19d5b3df4	cd5c7ac8e038026f03d39769f27db131f0ce9840309d78cde5dbd428d5efdb78	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:22.097	t	3dd0a3f2-b83f-423c-9af6-1cf983505a85	2026-07-22 06:50:22.099
3dd0a3f2-b83f-423c-9af6-1cf983505a85	4aec35c8-444d-4be9-942e-51d19d5b3df4	174be21af5da31d04799638f39bf5d3a241a7c8ce938febd231caf5b771f460c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 06:50:22.668	t	eb607cd2-d21b-4251-b25c-d7f69b21a795	2026-07-22 06:50:22.669
eb607cd2-d21b-4251-b25c-d7f69b21a795	4aec35c8-444d-4be9-942e-51d19d5b3df4	56361f6fa04cafdf8ee3a42d6aa9f120b756b27f817bd04e052e0f333d753e89	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:15:45.758	t	642340d7-24ec-40a7-997c-c65a246fb5ed	2026-07-22 07:15:45.76
642340d7-24ec-40a7-997c-c65a246fb5ed	4aec35c8-444d-4be9-942e-51d19d5b3df4	92e20c7b0dc060329758ed1445c6306d574bbf2c5d0e763275b3d942c84fb4ab	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:16:09.083	t	45043c12-f34f-439d-9adf-d0029d078954	2026-07-22 07:16:09.084
9e17a420-7db0-4a93-beda-686cd2b1be5c	4aec35c8-444d-4be9-942e-51d19d5b3df4	889c42094d8e796253862f8362f50cd82650b8faf0691176c139e11f1ddfcf24	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:16:30.996	t	00675724-cf74-469f-be02-2f78fd58b7bf	2026-07-22 07:16:30.997
45043c12-f34f-439d-9adf-d0029d078954	4aec35c8-444d-4be9-942e-51d19d5b3df4	e4d40212541313b9c425b291092e9a5326e544e45c09d39dba99418efe59e4cb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:16:18.439	t	9e17a420-7db0-4a93-beda-686cd2b1be5c	2026-07-22 07:16:18.44
00675724-cf74-469f-be02-2f78fd58b7bf	4aec35c8-444d-4be9-942e-51d19d5b3df4	6c28aec56455276ecb900bee1d77dfd993398f2d6bcc7811872aaf24c765af21	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:31:49.057	t	af1df2c7-4c0d-4a2e-81ed-5bc7aed63681	2026-07-22 07:31:49.058
af1df2c7-4c0d-4a2e-81ed-5bc7aed63681	4aec35c8-444d-4be9-942e-51d19d5b3df4	0460484cddf155ce2f355e71432dfe0df09624d88c6f87ada7a49ca73d05d87c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:32:03.28	t	49975a59-ebe4-4be7-b236-8635ed53cd7a	2026-07-22 07:32:03.282
49975a59-ebe4-4be7-b236-8635ed53cd7a	4aec35c8-444d-4be9-942e-51d19d5b3df4	f1edbf1c9e0b089c785c0dd8f8abd27ffc0384152d1131ad7da8a5851ad9f66f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:32:40.591	t	578f232c-4d12-4432-bfa9-cdb1b9851929	2026-07-22 07:32:40.592
578f232c-4d12-4432-bfa9-cdb1b9851929	4aec35c8-444d-4be9-942e-51d19d5b3df4	6db293ba635b8135f346102f49da9de5324e903dd32866b7389c524dead95541	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:32:42.809	t	889cef30-f420-410e-b489-8ffd3c545a81	2026-07-22 07:32:42.811
889cef30-f420-410e-b489-8ffd3c545a81	4aec35c8-444d-4be9-942e-51d19d5b3df4	0e67316984ae3154af9087c912416bd256ffbb2f8c98d06b1d04a8a1dd5f1317	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:32:58.27	t	ad419e67-f13e-417c-9c18-03aab962c2d9	2026-07-22 07:32:58.272
ad419e67-f13e-417c-9c18-03aab962c2d9	4aec35c8-444d-4be9-942e-51d19d5b3df4	be1e66e4ca1be9db44a1e42fca25555a9d12bd374216d95d7b2384dc8fd6a91d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 07:33:29.243	t	5d928b40-a7ec-4bef-8f29-ecd8783e2c22	2026-07-22 07:33:29.245
5d928b40-a7ec-4bef-8f29-ecd8783e2c22	4aec35c8-444d-4be9-942e-51d19d5b3df4	e77a0bb4299849a20be8104dbc960f8b6a0e817742d79ff5c839af706f4673ab	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 08:56:57.42	t	d9ab20ba-e721-4d1d-b075-c235d25da8e1	2026-07-22 08:56:57.421
d9ab20ba-e721-4d1d-b075-c235d25da8e1	4aec35c8-444d-4be9-942e-51d19d5b3df4	43dc1d233d4d73ca761f3646591f9eff43aa6a8bd745dd3c6553b9cb34f515cd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 08:57:01.777	t	a314905b-4d21-48ee-87ed-64c00ccb3b8b	2026-07-22 08:57:01.778
a314905b-4d21-48ee-87ed-64c00ccb3b8b	4aec35c8-444d-4be9-942e-51d19d5b3df4	6588c6e3720e0e072c99ce832c94bd6c1ad0511d47ced946b62eecb5ec9378c1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:13:43.618	t	04b0fa68-8be8-4600-a534-847c16328dfd	2026-07-22 09:13:43.62
04b0fa68-8be8-4600-a534-847c16328dfd	4aec35c8-444d-4be9-942e-51d19d5b3df4	07b2c03153155cc29de438f8462ba24a5a09a782984d1c652e3cea4a74142a92	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:13:58.003	t	1cc6d7f9-4d32-44db-8031-31d46a6bed25	2026-07-22 09:13:58.005
1cc6d7f9-4d32-44db-8031-31d46a6bed25	4aec35c8-444d-4be9-942e-51d19d5b3df4	97de7cc08ad1dedcbb41ce9edc2b29e352e644305ca451b7960753da262b2c5a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:01.012	t	ca950560-e2ed-487d-a08d-1a64eb61fa31	2026-07-22 09:16:01.014
ca950560-e2ed-487d-a08d-1a64eb61fa31	4aec35c8-444d-4be9-942e-51d19d5b3df4	311bb4cf8903573386e367bbada75b49ae972de47ad23a00f994e4a1b700a0df	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:01.768	t	cc351374-38a8-49de-b4c8-ba074957f6c6	2026-07-22 09:16:01.795
cc351374-38a8-49de-b4c8-ba074957f6c6	4aec35c8-444d-4be9-942e-51d19d5b3df4	434531f2a6455162eb0b8cbd993b466ec285a2f22e72d6753227ff82ef0d8ca8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:07.113	t	cf8405bb-5413-473e-b81d-8ed843594bc5	2026-07-22 09:16:07.115
cf8405bb-5413-473e-b81d-8ed843594bc5	4aec35c8-444d-4be9-942e-51d19d5b3df4	45fcee00b96ef9ce7ca428ad7ecda8bd4112ed6293ad70b6f444ee456731b40a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:09.13	t	add26924-d687-48cb-abbd-e705288ed18a	2026-07-22 09:16:09.131
add26924-d687-48cb-abbd-e705288ed18a	4aec35c8-444d-4be9-942e-51d19d5b3df4	b70ceaac1c2fd5fbd9987d92bd787e97381baf55a5bdc1b0afd87b297f433318	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:10.927	t	07a095c5-c4ab-4053-9893-e7032ec4ecb5	2026-07-22 09:16:10.929
0994a74f-b3d9-4c37-b5ab-bc5221dcd641	4aec35c8-444d-4be9-942e-51d19d5b3df4	925123a9e21905110d118875dc56e5b4376c1d4058e286c66b14c37c00cf88c9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:07:00.854	t	\N	2026-07-17 10:07:00.856
3f2dbeb7-a8b5-4c18-b302-da66ed72810c	4aec35c8-444d-4be9-942e-51d19d5b3df4	dcda09566ac44791c0a73878ffab546f3d9f008c286590caaa282659b98d07f6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:07:05.999	t	\N	2026-07-17 10:07:06.001
1999cc42-d7de-499a-ba6c-cbb939d9fc23	4aec35c8-444d-4be9-942e-51d19d5b3df4	49e889728be1cc37c96f57f78b46846ab1a237133a0c60488fdb8b9898056bd2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-24 10:07:30.424	t	\N	2026-07-17 10:07:30.426
d06e19a4-2cff-4b67-806e-c0f1d601f455	4aec35c8-444d-4be9-942e-51d19d5b3df4	aa713073a2c014886edf1dc7935cd79be6f4afce1dbdf073d8cf02ed315b541e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	::1	2026-07-29 06:15:51.9	t	\N	2026-07-22 06:15:51.902
ba1e6492-9a3d-4869-8c2b-74bda2f6cc0a	4aec35c8-444d-4be9-942e-51d19d5b3df4	aa90cbdd727cd87e120f0f0be2424e7a4f801cf77ba624749f7d6809de63734b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:16:10.935	t	\N	2026-07-22 09:16:10.936
07a095c5-c4ab-4053-9893-e7032ec4ecb5	4aec35c8-444d-4be9-942e-51d19d5b3df4	df53fe0a7b4c38ba1d73efed59d5b3c1295923c2a7bf0edf2eb5dc5b31356288	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:24:09.399	t	\N	2026-07-22 09:24:09.4
57084647-e996-4cf8-b36b-d2e633db41ff	4aec35c8-444d-4be9-942e-51d19d5b3df4	8137411bedc0c71e37f65add49bbc5bd04b173c59788230b98f4367564882250	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:24:17.485	t	1019e7cb-93f7-494a-a488-1c44557f39a6	2026-07-22 09:24:17.487
c760093d-6de6-4fa1-8bf5-24655e9abb64	4aec35c8-444d-4be9-942e-51d19d5b3df4	0108c9c92549d0131e155f89929313022f5383d3381b0e7c3590ec470dfcb8a5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:24:17.16	t	57084647-e996-4cf8-b36b-d2e633db41ff	2026-07-22 09:24:17.162
69f02861-88e4-477c-9968-fbb86d22944f	4aec35c8-444d-4be9-942e-51d19d5b3df4	5862b0059f21c4c0ed4b54997e091e332738d10627419664d780de7ab136df56	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:24:19.964	t	\N	2026-07-22 09:24:19.966
ec6e76e9-ecdb-47b8-b6a2-7399b78be410	4aec35c8-444d-4be9-942e-51d19d5b3df4	452b879728f5ec1abc3616d159bfa08f64195caf305fd3f80704eec05a667fe3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:26:55.338	t	\N	2026-07-22 09:26:55.341
e578e733-abf0-48fd-b3b9-d037495010e9	4aec35c8-444d-4be9-942e-51d19d5b3df4	304208c7d997212562517de777b3cc99214be20f9393616fec26d5fb029a876c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:54:12.978	t	1748d070-b04d-40a2-9753-8b24b550e5f6	2026-07-22 09:54:12.98
1748d070-b04d-40a2-9753-8b24b550e5f6	4aec35c8-444d-4be9-942e-51d19d5b3df4	39932f9e8b5a38fe2bdf15facbf04b5b4d2e42789bf241cc0adac359f90c9089	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:54:13.12	t	95a9c7b2-973b-4953-bf3c-e936caeb64c9	2026-07-22 09:54:13.122
95a9c7b2-973b-4953-bf3c-e936caeb64c9	4aec35c8-444d-4be9-942e-51d19d5b3df4	7e14358959d548a79f096557fdc57b7f0fde74cb13755df1a26aebbae767b7d9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:54:14.849	t	9bc1dc59-df77-4ffd-8a18-cfddd7ec11c6	2026-07-22 09:54:14.851
9bc1dc59-df77-4ffd-8a18-cfddd7ec11c6	4aec35c8-444d-4be9-942e-51d19d5b3df4	7b84dd01bda239e487be020350ca172b4aa7b58f9e794db5bf5b112f65fca54f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:54:14.9	t	42d6f8a6-73c9-4cd6-92f3-a862ed0a1ec2	2026-07-22 09:54:14.901
42d6f8a6-73c9-4cd6-92f3-a862ed0a1ec2	4aec35c8-444d-4be9-942e-51d19d5b3df4	2c68f5970dd6e7c1e1ca10b9081dfa32eb5ee9bf14faf10c06880c6890eb8b01	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:31.619	t	f1d065c7-6582-4535-b552-a7c1657e9ed5	2026-07-22 09:55:31.62
c75076d0-4fa5-44c0-8d36-b19db70acef5	4aec35c8-444d-4be9-942e-51d19d5b3df4	e0826c1dfae74f201d3b3a2d7d63d7372b907a114227dd957df905e871436412	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:54:14.839	t	\N	2026-07-22 09:54:14.84
7be27130-ad61-4081-ab59-d5f72c4049d8	4aec35c8-444d-4be9-942e-51d19d5b3df4	741261cd2d5718a4f1c6e06535a4fe8c05def056faf90e6dbe8abd7c2a21dd30	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:31.616	t	\N	2026-07-22 09:55:31.618
f1d065c7-6582-4535-b552-a7c1657e9ed5	4aec35c8-444d-4be9-942e-51d19d5b3df4	d179f8249cc809d96886b5c67dfd79ea481ae22bcd8808cdf96254f4d5b13885	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:36.119	t	\N	2026-07-22 09:55:36.121
0e008163-ba6e-415c-9824-45d8b3604187	4aec35c8-444d-4be9-942e-51d19d5b3df4	bfa1728f3c47f00a6669511bed693c9a05ce904a5990bb088018f40232cf93d9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:40.444	t	1d531233-1482-43d5-8589-17b2d966b9c6	2026-07-22 09:55:40.445
1d531233-1482-43d5-8589-17b2d966b9c6	4aec35c8-444d-4be9-942e-51d19d5b3df4	2785ec9ce512b468c026ddc12141a1f190732f68f717ece68295811245c8f2a8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:40.528	t	38811baf-0495-4507-9b20-771814368dca	2026-07-22 09:55:40.529
38811baf-0495-4507-9b20-771814368dca	4aec35c8-444d-4be9-942e-51d19d5b3df4	925b6d90a699657d57a1fee15f73bd4d711122fb00b3d3fa25747be0536e37f5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:42.432	t	3a052ec1-323c-4536-9ea2-dc8c270fe61f	2026-07-22 09:55:42.433
3a052ec1-323c-4536-9ea2-dc8c270fe61f	4aec35c8-444d-4be9-942e-51d19d5b3df4	36336297a241fe96bafab93635468706e00ed129e328a332dde61f8f00fbf545	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:55:42.451	t	ac34913f-a4bb-4cfe-ac0a-bd1adad6a7da	2026-07-22 09:55:42.453
ac34913f-a4bb-4cfe-ac0a-bd1adad6a7da	4aec35c8-444d-4be9-942e-51d19d5b3df4	4827d6a15e644ea37c89d02b7fd77ca88698c22524b1a1e72c254ec71f25071c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:26.063	t	a26d7b70-1c90-4a8e-8841-b9d0f86ec274	2026-07-22 09:56:26.065
a26d7b70-1c90-4a8e-8841-b9d0f86ec274	4aec35c8-444d-4be9-942e-51d19d5b3df4	d808a38ce4898b128545e0eeb602dbfcd9c434afede873ecbb0add9659b28114	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:26.113	t	473997e6-deb1-47e7-b481-7284b2bf5f3c	2026-07-22 09:56:26.116
473997e6-deb1-47e7-b481-7284b2bf5f3c	4aec35c8-444d-4be9-942e-51d19d5b3df4	525beb82a77a0e996b677c6423ee3da324ed66aa85b39b503a6b6750ebc141ed	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:26.649	t	b2be5e67-e823-4edf-a489-505e26b8525e	2026-07-22 09:56:26.651
b2be5e67-e823-4edf-a489-505e26b8525e	4aec35c8-444d-4be9-942e-51d19d5b3df4	ce01eaa444a9b3b259dd9412e281498de43bd5d6c82f9e58a02f88e1718e921a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:26.712	t	f965794b-341e-43be-a6ff-57c8e69c6e05	2026-07-22 09:56:26.714
f965794b-341e-43be-a6ff-57c8e69c6e05	4aec35c8-444d-4be9-942e-51d19d5b3df4	5ca8db0cd7bd9c299649929e5594b0f020cc4a31b5cab2168f0fc6861411055e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:28.157	t	1567fe89-6617-439f-a25f-4b8bb1dd58e4	2026-07-22 09:56:28.158
1567fe89-6617-439f-a25f-4b8bb1dd58e4	4aec35c8-444d-4be9-942e-51d19d5b3df4	4fbbb7d26ac5716e6e5492c6464bc9851af26a4ee7434015b71866a65400c5ad	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:28.22	t	3cdaaf5d-e9fa-46c6-8a93-0b858c930ea8	2026-07-22 09:56:28.222
3cdaaf5d-e9fa-46c6-8a93-0b858c930ea8	4aec35c8-444d-4be9-942e-51d19d5b3df4	61ac70625a3cbed73bab59f91e6f8c245ae36d31197a368756b97ab6aa6983cc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:34.907	t	7446a23e-c555-468c-8a07-f373bbfd008c	2026-07-22 09:56:34.922
f2022702-8031-401c-aa36-bc85236603e0	4aec35c8-444d-4be9-942e-51d19d5b3df4	c7ec73e54aaf30ef30d49a07c5be053f4c1554bdbef84c5ba8e0aaffc6f826c4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:35.477	t	18648825-683b-44da-9317-6652fcbf3962	2026-07-22 09:56:35.493
7446a23e-c555-468c-8a07-f373bbfd008c	4aec35c8-444d-4be9-942e-51d19d5b3df4	8e9ba6965f2ef094b29823c772e28c65125413719affb2645a10a50e6a08720a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:34.95	t	f2022702-8031-401c-aa36-bc85236603e0	2026-07-22 09:56:34.965
18648825-683b-44da-9317-6652fcbf3962	4aec35c8-444d-4be9-942e-51d19d5b3df4	e37214c25404dda0e5e5672c0ea24d4164a2cf673186df9e9922fcae3a4da34b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:35.53	t	4f303b89-34df-4739-8942-0bfb6364a7ec	2026-07-22 09:56:35.546
4f303b89-34df-4739-8942-0bfb6364a7ec	4aec35c8-444d-4be9-942e-51d19d5b3df4	67a01e2f515059ded722d893260b94bfb689eaa99b0eee0ca4ebe415c30f21a8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:36.051	t	67222eee-7df1-45c2-8ef6-a6d917f63247	2026-07-22 09:56:36.067
67222eee-7df1-45c2-8ef6-a6d917f63247	4aec35c8-444d-4be9-942e-51d19d5b3df4	c8223c2e6e9203e4d6f8c8c4fba0e8f2cebc68107fe3cf4690ef56a8d579c15c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:36.097	t	881d91fa-e8f1-430a-bba4-7e7fe8aa8abc	2026-07-22 09:56:36.113
881d91fa-e8f1-430a-bba4-7e7fe8aa8abc	4aec35c8-444d-4be9-942e-51d19d5b3df4	062e49363ccaa6e729bb1bf47669384da09ed1c6ad40a64044cfb89434591c5f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:36.662	t	60a8a635-1d98-4f6e-b6c8-260bca71a87a	2026-07-22 09:56:36.678
60a8a635-1d98-4f6e-b6c8-260bca71a87a	4aec35c8-444d-4be9-942e-51d19d5b3df4	6d4d36f9aa12e96a3a1bb531cf7eef0f508e303f05d2a8661e2e1fa46dee768b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:36.715	t	e529ed52-0436-4445-a3be-035800f7f886	2026-07-22 09:56:36.73
e529ed52-0436-4445-a3be-035800f7f886	4aec35c8-444d-4be9-942e-51d19d5b3df4	906bef05dc5e1ac187301712d61923fad086b34879083f6e10e4f24d99b7b21b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:38.047	t	6a8d2eef-8878-40b4-a9d4-6752147f410f	2026-07-22 09:56:38.063
6a8d2eef-8878-40b4-a9d4-6752147f410f	4aec35c8-444d-4be9-942e-51d19d5b3df4	53d40a1d6229c7a043f973e0ab41de20634617741312f7ca747198d72e55a813	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:38.114	t	0191a9a6-cbec-40f5-a932-7c02bb1974ca	2026-07-22 09:56:38.129
0191a9a6-cbec-40f5-a932-7c02bb1974ca	4aec35c8-444d-4be9-942e-51d19d5b3df4	e5455e1d57cbe60b7bc2cb89937942781af6987b824cd9b73afdd1258093188d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:41.153	t	c656c99d-1c85-4686-9061-02ad977024b7	2026-07-22 09:56:41.169
c656c99d-1c85-4686-9061-02ad977024b7	4aec35c8-444d-4be9-942e-51d19d5b3df4	d393143e64f85b5b7904dcf0c1f100d7cf1aa33257d6d361b619931160f73e09	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:41.193	t	b661f89b-5023-4f91-acd9-1599fcf8c8a5	2026-07-22 09:56:41.209
b661f89b-5023-4f91-acd9-1599fcf8c8a5	4aec35c8-444d-4be9-942e-51d19d5b3df4	856f4c2005d76dc68a4050dfc0b78756582e0d51376ff4cb39da303b0abb2703	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:56:50.675	t	c678cf38-ac73-40da-818e-9edab1424573	2026-07-22 09:56:50.69
c678cf38-ac73-40da-818e-9edab1424573	4aec35c8-444d-4be9-942e-51d19d5b3df4	ded79049ed56979f1b57c94d0264130393028aec652bce2219eee71f90b8abe1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:58:38.197	t	7e0fc19b-e68d-4bbd-8216-78713ce657b7	2026-07-22 09:58:38.201
7e0fc19b-e68d-4bbd-8216-78713ce657b7	4aec35c8-444d-4be9-942e-51d19d5b3df4	730d532ecf5303abe305ab339475c19f2142286c1f374c50330dd2eb27e93e67	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:58:43.095	t	601b13a8-3b24-430d-a84f-97b5edefb640	2026-07-22 09:58:43.099
601b13a8-3b24-430d-a84f-97b5edefb640	4aec35c8-444d-4be9-942e-51d19d5b3df4	475eaeec19cf0fea4ad5d72def5b98b86fe151c34dfc22f6f2eb341296ecd4a1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 09:58:43.157	t	cd53f741-77f9-4adb-97eb-a88ebe988b50	2026-07-22 09:58:43.16
cd53f741-77f9-4adb-97eb-a88ebe988b50	4aec35c8-444d-4be9-942e-51d19d5b3df4	b874cca6800d4f6fa39e9306ed6c68cf9df6557b89ba7f12d574af31a5e6a597	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:02.939	t	fb766d3d-200f-4ca4-932a-f0236ec3d3f3	2026-07-22 10:00:02.94
fb766d3d-200f-4ca4-932a-f0236ec3d3f3	4aec35c8-444d-4be9-942e-51d19d5b3df4	9c9f438ff0328c85dbb66c34163b92ccfc1e7613df9acada68671c81768315e2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:02.999	t	8b06bce9-f3f3-49e0-bd4b-f665f0ebbd87	2026-07-22 10:00:03
8b06bce9-f3f3-49e0-bd4b-f665f0ebbd87	4aec35c8-444d-4be9-942e-51d19d5b3df4	929f0ba3143814c1e7f4cb4ec42d0552bd9611883c017ee191f2e15946217f39	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:46.094	t	19ba238d-9dc4-44f5-9c3e-36dc7d26b1d3	2026-07-22 10:00:46.095
19ba238d-9dc4-44f5-9c3e-36dc7d26b1d3	4aec35c8-444d-4be9-942e-51d19d5b3df4	7e5bc8d91f10d6f538ce1bc87ea031a2af23ec63b8bccc86c8f75eb512258587	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:46.149	t	3867731f-ab65-4121-9a84-04f482812095	2026-07-22 10:00:46.15
3867731f-ab65-4121-9a84-04f482812095	4aec35c8-444d-4be9-942e-51d19d5b3df4	794c4ac45124065eb5766afd9dfae2665cb3a062c5720ecf68150a4293cda668	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:51.435	t	f7734833-1392-4ef3-8ea9-e701ce0b227a	2026-07-22 10:00:51.436
f7734833-1392-4ef3-8ea9-e701ce0b227a	4aec35c8-444d-4be9-942e-51d19d5b3df4	47417ece040e4ce6eb13beb3a3060fd4e3d68b8e469058264ecf00318335b6aa	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:51.478	t	6966c2a3-a31d-4753-8ae7-d9f87c7f5bf2	2026-07-22 10:00:51.48
6966c2a3-a31d-4753-8ae7-d9f87c7f5bf2	4aec35c8-444d-4be9-942e-51d19d5b3df4	a119550e1df92f2c153d950949b92d6ae1a1c5aeeb39df20c5d97b7076638171	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:54.108	t	2bddf681-e7f7-4901-843b-da43ec81378f	2026-07-22 10:00:54.109
cdff8fd3-09e5-4dbe-822d-8e5cdb221c80	4aec35c8-444d-4be9-942e-51d19d5b3df4	6db013cee1132e017976bde42f5f735dca38b51b16492db05049d04bd6fdf100	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:54.925	t	d6d7cf2f-e782-4a72-94d1-2b2a75052419	2026-07-22 10:00:54.926
2bddf681-e7f7-4901-843b-da43ec81378f	4aec35c8-444d-4be9-942e-51d19d5b3df4	8dedde2a8d949fc6790dd184528f1a174a2e955b1c873636a51fa25ac0f329f2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:54.156	t	cdff8fd3-09e5-4dbe-822d-8e5cdb221c80	2026-07-22 10:00:54.156
d6d7cf2f-e782-4a72-94d1-2b2a75052419	4aec35c8-444d-4be9-942e-51d19d5b3df4	a2cd41aaaa466b584bf2d4dbd390bf7bf16701dddbadfacca0c3558496869156	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:54.987	t	03493da6-529e-45cc-87a7-25b00c4a9972	2026-07-22 10:00:54.988
03493da6-529e-45cc-87a7-25b00c4a9972	4aec35c8-444d-4be9-942e-51d19d5b3df4	32bf628fe9cb0b7355d0e773c07146f444bfcc5950c8507b88fa6478c423eed1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:55.722	t	ca8bca2d-144f-4d3f-9c7e-7981b19481cc	2026-07-22 10:00:55.723
ca8bca2d-144f-4d3f-9c7e-7981b19481cc	4aec35c8-444d-4be9-942e-51d19d5b3df4	64d85172fb29f652925121ffee4b042aab236a3fdabf8e06a20d3562d12794bd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:55.751	t	441f7020-304f-489d-8bb4-f90e67819836	2026-07-22 10:00:55.752
441f7020-304f-489d-8bb4-f90e67819836	4aec35c8-444d-4be9-942e-51d19d5b3df4	864a60a20e9d10058c3bbe0c45e109fdbfffde47123c423718070e5e9d12f566	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:56.462	t	c4553aad-69f4-4859-969e-9ef495dcdaa0	2026-07-22 10:00:56.463
c4553aad-69f4-4859-969e-9ef495dcdaa0	4aec35c8-444d-4be9-942e-51d19d5b3df4	d3d675c1d152800c80a9cfa755d0eff735ce9affcdd7cb86086cc223b48d2a20	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:00:56.496	t	f841e06e-5755-40fe-9db4-ae9f554fc38c	2026-07-22 10:00:56.497
f841e06e-5755-40fe-9db4-ae9f554fc38c	4aec35c8-444d-4be9-942e-51d19d5b3df4	13ad12ea19f2282d9b7bdf1feca1c0164e123e0574270587c2b9cf7bc51b26d8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:00.645	t	eb1c3dda-cecf-44e1-9e91-2728fc0d4cbe	2026-07-22 10:01:00.646
eb1c3dda-cecf-44e1-9e91-2728fc0d4cbe	4aec35c8-444d-4be9-942e-51d19d5b3df4	b7918b8597381b4ef69d18320c57319f87e2c0a036304a04a946b6c42cd092bd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:00.69	t	25a16e2d-c11f-41fa-8c6e-c3ea98d08c42	2026-07-22 10:01:00.691
25a16e2d-c11f-41fa-8c6e-c3ea98d08c42	4aec35c8-444d-4be9-942e-51d19d5b3df4	c44c1081d3d13a7f558e6f9821b5c95613d0f3f6a5cfee98b060f5117b777180	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:28.973	t	480c68cc-cd5c-4d06-882c-db06ce50f12b	2026-07-22 10:01:28.975
480c68cc-cd5c-4d06-882c-db06ce50f12b	4aec35c8-444d-4be9-942e-51d19d5b3df4	5be6493de286de659b8ed09dbdf9419e1165cef2668a211700d3865a88cd0018	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:29.021	t	a6aa8857-5909-45f7-9535-147b6296807a	2026-07-22 10:01:29.022
a6aa8857-5909-45f7-9535-147b6296807a	4aec35c8-444d-4be9-942e-51d19d5b3df4	a38af122b3393ef7f211bc6ed32ac339a53952c1f79696d82fbf5a8297edcd42	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:32.275	t	86f85eda-fc24-46f9-bdfa-1ed27f9914d2	2026-07-22 10:01:32.276
86f85eda-fc24-46f9-bdfa-1ed27f9914d2	4aec35c8-444d-4be9-942e-51d19d5b3df4	2cd8c3987d20dc702116ab95a10cb395f99663394bc624ee23fdd8141f090036	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:01:32.327	t	18055f78-8c33-4391-94f9-87ef8edb8412	2026-07-22 10:01:32.328
18055f78-8c33-4391-94f9-87ef8edb8412	4aec35c8-444d-4be9-942e-51d19d5b3df4	7c9c7de966f0cbd608447f1358ed9255d8dd658a3f518e26b852d4a4e9355489	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:02:39.333	t	fe3ecf12-62e8-4863-9e80-65491f49b4d9	2026-07-22 10:02:39.334
fe3ecf12-62e8-4863-9e80-65491f49b4d9	4aec35c8-444d-4be9-942e-51d19d5b3df4	710da619e7da72a22fe09804cb99d222c98fc2a2fab79883037a832f96420c27	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:02:39.379	t	bf986340-9c24-4f9c-a3a7-f0031be92b89	2026-07-22 10:02:39.38
bf986340-9c24-4f9c-a3a7-f0031be92b89	4aec35c8-444d-4be9-942e-51d19d5b3df4	72e49ba56af7dd7d399765a76ed3e2f992e1d480e430b1a02522b254fe6843a2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:02:53.637	t	\N	2026-07-22 10:02:53.639
8b058f85-59b4-452e-ac6a-06a56af50d68	4aec35c8-444d-4be9-942e-51d19d5b3df4	c3715ff885a641b0366b62410b2d547ccf239b7ac52e88c2b9a5f62583270a59	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:03:00.964	t	b5db832c-805b-4c1c-959f-0f461408fe50	2026-07-22 10:03:00.965
b5db832c-805b-4c1c-959f-0f461408fe50	4aec35c8-444d-4be9-942e-51d19d5b3df4	a00a397433ff662f83d9b4dd17890d5fef7e135d27e1131ed315ae37a7e9ec21	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:03:01.043	t	70581b7b-062c-4c1e-8be6-f54164294755	2026-07-22 10:03:01.045
70581b7b-062c-4c1e-8be6-f54164294755	4aec35c8-444d-4be9-942e-51d19d5b3df4	975a0f7191dd3609c930583a0ddaec86b58f960a2217c252f2ddd30c66ee669b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:03:04.11	t	60b96bc4-f6b0-42b5-a922-cd23432cc645	2026-07-22 10:03:04.112
60b96bc4-f6b0-42b5-a922-cd23432cc645	4aec35c8-444d-4be9-942e-51d19d5b3df4	dbf44b2f038973b8829e11db791457b07547304a586462213d147e82e1ef9a16	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:04:17.809	t	d8b823b6-28e1-46c6-9a9b-2c73849f393b	2026-07-22 10:04:17.821
d8b823b6-28e1-46c6-9a9b-2c73849f393b	4aec35c8-444d-4be9-942e-51d19d5b3df4	2550d0e1234bef98d28b32012a8b5dc437d8a1ad63b0eb28152ed1645fcb3ec3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:10:33.804	t	e89856ed-4c49-4063-b29c-b41a18652034	2026-07-22 10:10:33.811
e89856ed-4c49-4063-b29c-b41a18652034	4aec35c8-444d-4be9-942e-51d19d5b3df4	1bf56737042c6179108a29369ba6de43885f9be89c70ef2b4a483f92c1684d62	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:10:37.953	t	d95cb721-ba3a-4659-9ac3-36434f68eee7	2026-07-22 10:10:37.96
d95cb721-ba3a-4659-9ac3-36434f68eee7	4aec35c8-444d-4be9-942e-51d19d5b3df4	bf3c4f8780697e1435c87f9aca6b522aeeca3530395d179e4aebfe16d4a893b1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:11:33.99	t	379c9694-0332-4e51-a6af-89049e532625	2026-07-22 10:11:33.992
379c9694-0332-4e51-a6af-89049e532625	4aec35c8-444d-4be9-942e-51d19d5b3df4	a4a1808624319fff63e9cb91d00c61d9717370eb2e6d541f7293a7a64a128c29	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:11:34.028	t	0fcd9097-4568-4beb-bd14-e9fa901c7083	2026-07-22 10:11:34.029
0fcd9097-4568-4beb-bd14-e9fa901c7083	4aec35c8-444d-4be9-942e-51d19d5b3df4	63ba393ff3d0ff9e66e83e0f62e12028943cfc16039f33fe0d80182b904db02f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:12:31.778	t	1fe4e5f4-83a1-47c5-93ed-2d7fd9697733	2026-07-22 10:12:31.781
1fe4e5f4-83a1-47c5-93ed-2d7fd9697733	4aec35c8-444d-4be9-942e-51d19d5b3df4	f3ceb172801b9a0156c4416dd80ebf6ce7d1d9ac5f40dc322f67abee554c91c9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:12:31.81	t	214107c9-da58-4b8b-9092-a5e85a564818	2026-07-22 10:12:31.811
214107c9-da58-4b8b-9092-a5e85a564818	4aec35c8-444d-4be9-942e-51d19d5b3df4	33034129131e0dc975787aa291e7106e15ff2ddf35a4c53ccbabe6c4bce807e6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:12:44.29	t	c49c32b4-df3a-419c-8cd7-efe135652d65	2026-07-22 10:12:44.292
c49c32b4-df3a-419c-8cd7-efe135652d65	4aec35c8-444d-4be9-942e-51d19d5b3df4	87d4fc982b192bf2fe328407c1f0b7b22d7888169ada5645f7aaf93ee3bd2681	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:12:44.314	t	48299d8c-1844-42fb-b925-6457005b29d3	2026-07-22 10:12:44.318
48299d8c-1844-42fb-b925-6457005b29d3	4aec35c8-444d-4be9-942e-51d19d5b3df4	f153619287915bf20397a3198cda4fee69c8b49e5cb8caabff0d5d1f63884f7b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:12:46.848	t	8aeb5aab-b679-4f80-a039-5cdabfb5505d	2026-07-22 10:12:46.85
8aeb5aab-b679-4f80-a039-5cdabfb5505d	4aec35c8-444d-4be9-942e-51d19d5b3df4	941ad7cc5d1ea8d36f4648996f9fce41df800a6928387eff59f35d8eaf6a5bd8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:14:33.775	t	9669cfde-78eb-4c26-9ab7-ee5823bbee82	2026-07-22 10:14:33.777
9669cfde-78eb-4c26-9ab7-ee5823bbee82	4aec35c8-444d-4be9-942e-51d19d5b3df4	30347cee7f189bc89e6dd603b7171f22edca5aa5c8994c2932c61f8e1139332e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:14:36.026	t	dadc41e2-8aee-4d68-8d14-f1bbd400958a	2026-07-22 10:14:36.029
dadc41e2-8aee-4d68-8d14-f1bbd400958a	4aec35c8-444d-4be9-942e-51d19d5b3df4	8357106db2cecc283063a308419f33f2be242258d4efef455bbce00637d8bfa7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:14:36.069	t	cdbaabaf-f15d-4aaa-8d3b-6681a2d6483c	2026-07-22 10:14:36.071
cdbaabaf-f15d-4aaa-8d3b-6681a2d6483c	4aec35c8-444d-4be9-942e-51d19d5b3df4	921a1f8e0e33c7740b82b4b7f61a8264fd79aff533fa263915da7f25b743420e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:14:40.805	t	9fbbe6e3-ea68-4285-9223-8aeacbcff335	2026-07-22 10:14:40.806
9fbbe6e3-ea68-4285-9223-8aeacbcff335	4aec35c8-444d-4be9-942e-51d19d5b3df4	fed26f055d22d1668831a7ba4ae3f485b4c80367a0a581e5431b3d35322628be	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:14:40.848	t	eac73ea3-b7ec-47a0-b785-f1321376417f	2026-07-22 10:14:40.849
eac73ea3-b7ec-47a0-b785-f1321376417f	4aec35c8-444d-4be9-942e-51d19d5b3df4	6db059c1f031a612d117c876c3c2816ebf2dadf228031cf63a958650e1bc5f66	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:34:53.321	t	ab81a644-8051-48bb-93c1-f354d15d88b3	2026-07-22 10:34:53.323
ab81a644-8051-48bb-93c1-f354d15d88b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	fcc01fa730c1d2f81203d858d5ca0618a4d858251479f6d5257ba25e49764906	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:42:33.926	t	da14846f-6100-4e57-afcf-c9f83c8f2cf6	2026-07-22 10:42:33.941
da14846f-6100-4e57-afcf-c9f83c8f2cf6	4aec35c8-444d-4be9-942e-51d19d5b3df4	db16ee436aae737c04aa74b6c2e3751c57fece0859850b84748c3c608158d5ea	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 10:42:36.149	t	dccf1501-b16b-43e8-aa4d-aa493b732dfc	2026-07-22 10:42:36.164
dccf1501-b16b-43e8-aa4d-aa493b732dfc	4aec35c8-444d-4be9-942e-51d19d5b3df4	4a62df2809afa2e09d3ed7b14ea361c7d85bd4cff859f06dcb095deca0da1d7c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:44:47.534	t	848c809a-9375-4850-81ae-6c6d52a55efb	2026-07-22 11:44:47.549
848c809a-9375-4850-81ae-6c6d52a55efb	4aec35c8-444d-4be9-942e-51d19d5b3df4	6ebd4b19ad1a4cce2a0730730b89339407e8898dee1f19fd2a6cd07ce64ac534	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:45:36.988	t	4371a67a-1465-4919-979e-30601acd682f	2026-07-22 11:45:36.993
4371a67a-1465-4919-979e-30601acd682f	4aec35c8-444d-4be9-942e-51d19d5b3df4	30ad354580575e4c959b93f6d386d5d59cbb9a660ce8cbe87aa23c76c6468e4c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:45:47.833	t	fe667a0c-0e46-48b1-a410-ac1efcfae20d	2026-07-22 11:45:47.835
fe667a0c-0e46-48b1-a410-ac1efcfae20d	4aec35c8-444d-4be9-942e-51d19d5b3df4	98b1f2f5355971546525826be0d0bba4fe2230fea3758b5561eeb3107b8890ad	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:56:20.429	t	83089523-eea9-4070-8f3b-1df2a8d3be02	2026-07-22 11:56:20.43
83089523-eea9-4070-8f3b-1df2a8d3be02	4aec35c8-444d-4be9-942e-51d19d5b3df4	c8f6302ed217a85dd570b8a24462c9f14ab72d23fb1b2b861716d4530d6d2246	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:56:24.092	t	\N	2026-07-22 11:56:24.093
7b8f46a1-ae20-4054-9954-ff4e87d3437b	4aec35c8-444d-4be9-942e-51d19d5b3df4	1f29831fe4a82840827c53e65f5570d1c6bdbb81a94a12309f4b5a8080e278f0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:56:28.633	t	02d97135-1df5-4e16-82f4-5c10f187d7a4	2026-07-22 11:56:28.634
02d97135-1df5-4e16-82f4-5c10f187d7a4	4aec35c8-444d-4be9-942e-51d19d5b3df4	656ff9a0d79e786294dc20965deac0b16bbc264b03b617e7dc1b19b8be83f359	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:56:28.72	t	6638d633-536f-47a0-b81e-f1d68d77433c	2026-07-22 11:56:28.721
6638d633-536f-47a0-b81e-f1d68d77433c	4aec35c8-444d-4be9-942e-51d19d5b3df4	dbfc4e9d81f816d98eb722bb66e228b176532b684a12454c69fca28078b6829a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 11:56:32.86	t	2ac87cdd-7424-4ba1-87af-3d13a0bf1761	2026-07-22 11:56:32.861
2ac87cdd-7424-4ba1-87af-3d13a0bf1761	4aec35c8-444d-4be9-942e-51d19d5b3df4	e0ae677e8e1fd56e0e23211f757bc68ca1b410bcc66d0a8168540baf618776f8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:00:29.618	t	a309416a-0a77-4284-beb4-4441f6abb1de	2026-07-22 12:00:29.619
a309416a-0a77-4284-beb4-4441f6abb1de	4aec35c8-444d-4be9-942e-51d19d5b3df4	8421b48e238f311922f12718a16ad5a6220e4a3a6bbdd96e9a6037fba53b5c3c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:00.071	t	a2b2a6d5-8abd-4203-afc3-e481ff01427f	2026-07-22 12:04:00.073
a2b2a6d5-8abd-4203-afc3-e481ff01427f	4aec35c8-444d-4be9-942e-51d19d5b3df4	b1f996471450d0a3d2f3fbb1223656d18890827bee42763b6308841ac7fbe036	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:04.777	t	c5cca60d-a091-4638-96d9-1a381c8b10c2	2026-07-22 12:04:04.778
c5cca60d-a091-4638-96d9-1a381c8b10c2	4aec35c8-444d-4be9-942e-51d19d5b3df4	58b4f07a6dd8e456075136cab8fe1f7705aa376b8b795dc1946d95b53c50383e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:29.114	t	\N	2026-07-22 12:04:29.115
3e813b39-a228-4077-aa59-9d1784559fe1	4aec35c8-444d-4be9-942e-51d19d5b3df4	6b50603b4665ddb2a66b1aa52e91c9e46d84897c4c72f24a9fc038af82b2cbe4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:35.814	t	d26293a0-a1e4-4f74-8d19-61d4ddcf74b9	2026-07-22 12:04:35.815
d26293a0-a1e4-4f74-8d19-61d4ddcf74b9	4aec35c8-444d-4be9-942e-51d19d5b3df4	54929a20258982f924d12479b4ac78ba39af3d2e3330d08be0a4a9fd3a2d9ac7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:35.932	t	14607968-db12-4cc5-be28-45c1a5afc9ac	2026-07-22 12:04:35.934
14607968-db12-4cc5-be28-45c1a5afc9ac	4aec35c8-444d-4be9-942e-51d19d5b3df4	b38c857b1a62d1737671df3b8a1672b3dc67e61b77e46bc8d4c89473430d77e2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:39.372	t	3b4afe6c-d24d-467f-b538-d42823b59df8	2026-07-22 12:04:39.373
3b4afe6c-d24d-467f-b538-d42823b59df8	4aec35c8-444d-4be9-942e-51d19d5b3df4	fcdcf1828b0987ccd604aa9649d370310ce67d59682f3847f0319fd2c1308fe8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:04:57.048	t	7f3e0f12-8a45-422b-9f4d-d61ba53b97da	2026-07-22 12:04:57.049
7f3e0f12-8a45-422b-9f4d-d61ba53b97da	4aec35c8-444d-4be9-942e-51d19d5b3df4	5b58f40671ec54fdede9dcb71fee84d00019fb130c9e9a122a36e9856e13fa5f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:05:31.319	t	b097875c-03d1-4824-995b-661cea01ae2a	2026-07-22 12:05:31.321
b097875c-03d1-4824-995b-661cea01ae2a	4aec35c8-444d-4be9-942e-51d19d5b3df4	7fcc6ab3f34a63302afb508a2889bc2c25495a17e14b562f541e8dad35ad6e60	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:05:34.175	t	30e88d47-70e7-43b2-b65f-895a5c36002c	2026-07-22 12:05:34.176
30e88d47-70e7-43b2-b65f-895a5c36002c	4aec35c8-444d-4be9-942e-51d19d5b3df4	f3b592ae504967dc663357e693e61ef90cc25055a202a7e8bc7ad67c0d461a8f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:14:53.52	t	eb5ba5b7-6a95-4cd0-b548-1cb43ba530b3	2026-07-22 12:14:53.521
eb5ba5b7-6a95-4cd0-b548-1cb43ba530b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	1ae8cd37212d7d6797818a5e6814535a22cced9c239c55fedc2e9b848e877a3f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:16:35.147	t	88fd099b-cc50-4cc3-a444-f55bb6a97621	2026-07-22 12:16:35.149
88fd099b-cc50-4cc3-a444-f55bb6a97621	4aec35c8-444d-4be9-942e-51d19d5b3df4	6dd1c7ef90c9e0b5f4378baf3286a472f2dd2b89f05764d1cac23f4912cb197c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:19:45.493	t	ba781fe9-9997-4637-9db7-5a3c9413d84b	2026-07-22 12:19:45.494
ba781fe9-9997-4637-9db7-5a3c9413d84b	4aec35c8-444d-4be9-942e-51d19d5b3df4	d2f157db199d1a7f93a86308507b24113effdd27296fcef8d6f0908b50c0df66	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:24:02.417	t	9ee3070c-5e3f-4c95-82d4-938b08c579b9	2026-07-22 12:24:02.419
9ee3070c-5e3f-4c95-82d4-938b08c579b9	4aec35c8-444d-4be9-942e-51d19d5b3df4	6a74b478c1114d92d0097fbbea8e85c14343738206c3d7f3fee11cb1c8b6aec1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:24:53.698	t	43bb3754-4beb-4ae7-8d38-f5c0abc06236	2026-07-22 12:24:53.7
43bb3754-4beb-4ae7-8d38-f5c0abc06236	4aec35c8-444d-4be9-942e-51d19d5b3df4	dd051d7c20a3cd390fe53fb669ed411e09f92ecaa38d29e2362e0ded30bbca38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:32:01.072	t	e2637db9-c113-42ed-9208-917f0e04252c	2026-07-22 12:32:01.073
e2637db9-c113-42ed-9208-917f0e04252c	4aec35c8-444d-4be9-942e-51d19d5b3df4	de28bb6778ecbb6bb19b70d07519ed403c55251ecdc5e222331ff8ca35131f0b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:33:18.321	t	3f0d1e83-f042-4cf2-a5e1-2146de342f8f	2026-07-22 12:33:18.323
3f0d1e83-f042-4cf2-a5e1-2146de342f8f	4aec35c8-444d-4be9-942e-51d19d5b3df4	e8cf1df2440a35904f1bbc923260fec2262976637fcc82e087e782928752aab3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:35:12.906	t	2d1dd0a8-b209-4b39-9dda-5731f8a48b10	2026-07-22 12:35:12.908
2d1dd0a8-b209-4b39-9dda-5731f8a48b10	4aec35c8-444d-4be9-942e-51d19d5b3df4	629f570d09aee9b7fba63770983ef6c065a489ab023ad388908fe13e7990c113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:35:13.563	t	7075fe87-21c0-4a43-ae67-49fd8748c731	2026-07-22 12:35:13.565
7075fe87-21c0-4a43-ae67-49fd8748c731	4aec35c8-444d-4be9-942e-51d19d5b3df4	cfdcf4431db642195d75df347fb5dceb3a89f8fff4f50f5e0338ad95b81ed57b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:35:30.368	t	1462c90a-fa6f-4d31-a2eb-5936d698cc1a	2026-07-22 12:35:30.373
2de6bb8b-ca99-4895-b236-946f2ccf025d	4aec35c8-444d-4be9-942e-51d19d5b3df4	2abef1a6f3e97bf9c7f60497fc26d185cdd8ea47d8e947bb5fdcf2f6169d72ea	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:18:32.815	t	37da8cbc-e527-4216-b319-df667ee94492	2026-07-23 04:18:32.822
f61f4977-febe-42a8-b3e8-969643dbaf68	4aec35c8-444d-4be9-942e-51d19d5b3df4	f64712ac9a5d69d74fab348ce999996adc72fb05be6edd67cb1850b36030ff29	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:18:49.476	t	12fd1042-02dc-4bf9-a16e-ec3907b9b146	2026-07-23 04:18:49.483
37da8cbc-e527-4216-b319-df667ee94492	4aec35c8-444d-4be9-942e-51d19d5b3df4	c1008c33acae6d873a003ca4684f355566d5ef7744408070e6314d06008c2a7b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:18:33.308	t	f61f4977-febe-42a8-b3e8-969643dbaf68	2026-07-23 04:18:33.316
6169dde5-7ab6-45cd-af16-09fe288a53ba	4aec35c8-444d-4be9-942e-51d19d5b3df4	9afdd4f5098c84a0e81020b76001ba36de0f4ef415104935818d375af9c747e1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:33:02.024	t	5104d184-0d84-4b8d-9ba4-74012903d0d4	2026-07-23 04:33:02.03
5104d184-0d84-4b8d-9ba4-74012903d0d4	4aec35c8-444d-4be9-942e-51d19d5b3df4	6cbfc66d50eafeb1c0a1701351c9bec13c0d4e3a5960991959717b94f58e7e73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:33:02.517	t	7dfcdc4a-69f1-4e1a-8840-56bc81b1fa2d	2026-07-23 04:33:02.524
7dfcdc4a-69f1-4e1a-8840-56bc81b1fa2d	4aec35c8-444d-4be9-942e-51d19d5b3df4	71241b62040c124665ed1e8f9ca6a9de38054d69249dbff2400215835a8698c5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:33:05.528	t	ddcf38ce-391b-45fd-a1be-4168fce5367c	2026-07-23 04:33:05.535
ddcf38ce-391b-45fd-a1be-4168fce5367c	4aec35c8-444d-4be9-942e-51d19d5b3df4	fed4d0649acbdafe3137e8aa85bf6c328cc343d188210404ac06a31d2c64ba9c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:40:50.28	t	16332d56-a524-4720-a7b6-b76e1958427c	2026-07-23 04:40:50.281
16332d56-a524-4720-a7b6-b76e1958427c	4aec35c8-444d-4be9-942e-51d19d5b3df4	8ef26515736c4f496c2f8d2a098a1f0a0e1162faa1e2c5a0b2865141627c646a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:41:10.287	t	91fa7f49-52be-4abb-b592-0f01d0bec2a2	2026-07-23 04:41:10.289
91fa7f49-52be-4abb-b592-0f01d0bec2a2	4aec35c8-444d-4be9-942e-51d19d5b3df4	2c5172878de15b0b4bf47190823283ab97b7880c8b37818ee0386a8d5eaab285	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:47:58.346	t	9fc596e3-d9f8-4c9c-a7e3-ecaf83bf510d	2026-07-23 04:47:58.357
9fc596e3-d9f8-4c9c-a7e3-ecaf83bf510d	4aec35c8-444d-4be9-942e-51d19d5b3df4	b44a13151cb2c54f302226c5a6938caa459bc10c21d726513565cd5c250ca819	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:51:10.018	t	d753ba28-e88f-496a-99ed-021e1e4b89c5	2026-07-23 04:51:10.02
d753ba28-e88f-496a-99ed-021e1e4b89c5	4aec35c8-444d-4be9-942e-51d19d5b3df4	e751eb1c86da89da0ea1a852126fcefb1ad2d1b6f87c8ce324de2175c6f8b2c5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:51:51.124	t	b92d5540-cb9f-4dd9-b50e-c0b439244588	2026-07-23 04:51:51.128
b92d5540-cb9f-4dd9-b50e-c0b439244588	4aec35c8-444d-4be9-942e-51d19d5b3df4	c41ae1c2057409518384a2e71b615e405ebc0de68b04183844c15b68c672c05e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:03.313	t	d1dee6cb-5e30-4eb3-8156-2ade0826ad95	2026-07-23 04:52:03.315
d1dee6cb-5e30-4eb3-8156-2ade0826ad95	4aec35c8-444d-4be9-942e-51d19d5b3df4	356ad03816be207b43d1ffe0ebd756f38eb9194f9d912cd4f74ddd832552fa1a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:12.098	t	d36192e7-4ff3-4016-87f2-15ae4b1b3847	2026-07-23 04:52:12.101
d36192e7-4ff3-4016-87f2-15ae4b1b3847	4aec35c8-444d-4be9-942e-51d19d5b3df4	70376b7e5be05436d02491cee9bf893e3a35a4b047a77fd30756302e03086c88	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:22.196	t	a1354138-28d7-49a7-b779-05fe437a68f2	2026-07-23 04:52:22.198
a1354138-28d7-49a7-b779-05fe437a68f2	4aec35c8-444d-4be9-942e-51d19d5b3df4	9d428a661b0fbf78f53308b8114fb867bf7a4eb0053f2dc2efff402908c875c0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:30.205	t	3def4000-8073-43bf-993b-aa15cbd6604d	2026-07-23 04:52:30.208
3def4000-8073-43bf-993b-aa15cbd6604d	4aec35c8-444d-4be9-942e-51d19d5b3df4	4321948c62243f721bb1a2f62640908b0be8b6b0a8a4d037e924fd8e8496371f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:32.493	t	49e92d5a-b0bf-4bed-9da3-2b7e9dfcc204	2026-07-23 04:52:32.496
49e92d5a-b0bf-4bed-9da3-2b7e9dfcc204	4aec35c8-444d-4be9-942e-51d19d5b3df4	6c20294a0e4915b85a7b03ca291668cdec35b1d834aab5e8eb3db71f8d0c334c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:38.699	t	62760cae-41fa-4f88-8da2-162d287e2bdc	2026-07-23 04:52:38.702
62760cae-41fa-4f88-8da2-162d287e2bdc	4aec35c8-444d-4be9-942e-51d19d5b3df4	56825eef0c5e34d9d6d97c51922699a84678f916f1378b828044ebef3dcf88ff	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:52:38.768	t	62a6542e-6781-4f7c-92f8-e5664738f60e	2026-07-23 04:52:38.771
62a6542e-6781-4f7c-92f8-e5664738f60e	4aec35c8-444d-4be9-942e-51d19d5b3df4	fa1c1e4c378859488a2f2c21ee61fda49167b91d28fa143995e4010b07b7ddb4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:53:55.147	t	bbab058e-6f35-4125-80c8-1c01ef66fbd4	2026-07-23 04:53:55.151
bbab058e-6f35-4125-80c8-1c01ef66fbd4	4aec35c8-444d-4be9-942e-51d19d5b3df4	3631d4e68e39e6129289ae0e83799e2b7cd62117854d49b5f14eb564437db98f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:53:55.183	t	55ebf434-779a-4139-86d0-69d1943bf3fa	2026-07-23 04:53:55.187
55ebf434-779a-4139-86d0-69d1943bf3fa	4aec35c8-444d-4be9-942e-51d19d5b3df4	a2277f9829d2246638d5c450afc640e1be3d67863ffdf982e90e0ff8ebc6f4cf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:54:29.196	t	44e5a263-8836-4317-8547-13a72c0895ac	2026-07-23 04:54:29.197
44e5a263-8836-4317-8547-13a72c0895ac	4aec35c8-444d-4be9-942e-51d19d5b3df4	a39005634b28f1cda0870716e7776e11fbe9100532204f543f6f6126b30e2ec7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:54:58.649	t	657651f0-a2ff-4f82-94b3-d4cf8d5ab1e7	2026-07-23 04:54:58.652
657651f0-a2ff-4f82-94b3-d4cf8d5ab1e7	4aec35c8-444d-4be9-942e-51d19d5b3df4	40bcae6e8c2a9137ca6274abb8a8fc90c8771de526ca646e86dd40c785e9958f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:55:03.33	t	64f0d6ab-39a3-45cc-8b47-0ad3e0095434	2026-07-23 04:55:03.334
64f0d6ab-39a3-45cc-8b47-0ad3e0095434	4aec35c8-444d-4be9-942e-51d19d5b3df4	459177b3df7449a0d08e8d187e025eaea63e53df8630ba98ba9def1d1af57c22	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:03:12.381	t	\N	2026-07-23 05:03:12.383
26b2c76d-ebd6-4a5b-bdb9-0bf44e645c8d	4aec35c8-444d-4be9-942e-51d19d5b3df4	947d03c4d94088c2efd1d13aaee61e087c4500f47326ec0db5528be8bd99d33a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:03:18.991	t	344766fe-fb5b-4aad-a92c-2b1ec3f6f67a	2026-07-23 05:03:18.994
344766fe-fb5b-4aad-a92c-2b1ec3f6f67a	4aec35c8-444d-4be9-942e-51d19d5b3df4	0839b01c473ef379b51f9a7a0811547ac49c7d41f342444002b042ee538e93f6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:03:19.342	t	caf8efff-190c-4a12-aa6e-c48278521082	2026-07-23 05:03:19.345
caf8efff-190c-4a12-aa6e-c48278521082	4aec35c8-444d-4be9-942e-51d19d5b3df4	202a6db9a7d024fd4e5cb910fd17cb1c11a024b9fda4a8c14d8be955b53b1dbb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:03:23.865	t	ffa350c8-f6e8-4c42-ab33-5b46c4b728f8	2026-07-23 05:03:23.868
43b18734-4eda-43dc-adea-078949d3fbe0	4aec35c8-444d-4be9-942e-51d19d5b3df4	1a68503a31a8f4e53891125369d702cd262c2d496f4a6b4b89fe5f76258200f8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:44:36.427	t	823d5904-9050-42a9-bf65-9f8e693250cf	2026-07-23 06:44:36.428
ffa350c8-f6e8-4c42-ab33-5b46c4b728f8	4aec35c8-444d-4be9-942e-51d19d5b3df4	f3d6ec86167fb0ef9fd94e2d1306d5a97e1d023be5f610ab97d24614565b2a65	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:03:28.719	t	6ffeab37-6dda-43f3-8162-c94575cff206	2026-07-23 05:03:28.723
6ffeab37-6dda-43f3-8162-c94575cff206	4aec35c8-444d-4be9-942e-51d19d5b3df4	83397e4f9eba425508c155ac7131ef9e2352fad18ae7643f887a43c76e8c9af0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:08:09.192	t	202f553a-9c25-4883-9dd7-62178420588c	2026-07-23 05:08:09.199
202f553a-9c25-4883-9dd7-62178420588c	4aec35c8-444d-4be9-942e-51d19d5b3df4	08df7c65b859b03be9eb560ed127755b356125b5bb80e4fafb9ff44928220429	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:08:47.6	t	efc8d7f7-9f19-4ea6-9bd6-cdd6b2d35050	2026-07-23 05:08:47.603
efc8d7f7-9f19-4ea6-9bd6-cdd6b2d35050	4aec35c8-444d-4be9-942e-51d19d5b3df4	34a57a88155f9268356ba9f8be406adfacba91262d79ec6266596bc2520e5ffc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:12:28.824	t	3d968a33-33c2-4454-b272-954fdf346d74	2026-07-23 05:12:28.825
3d968a33-33c2-4454-b272-954fdf346d74	4aec35c8-444d-4be9-942e-51d19d5b3df4	93af7af76becb7279eb304252f64907ada306b9cee85853ee399063825c44c2e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:14:06.009	t	69d1f66b-ee6f-4ae2-848e-a258dbd2f94d	2026-07-23 05:14:06.01
69d1f66b-ee6f-4ae2-848e-a258dbd2f94d	4aec35c8-444d-4be9-942e-51d19d5b3df4	87a7ca93db78a1ef2a9f80c0f48a6eb8f323663bbcd7bf97d0a1e7d4def4ff80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:40:34.093	t	206e33dd-7507-489e-8c72-ac11015f58ee	2026-07-23 06:40:34.095
206e33dd-7507-489e-8c72-ac11015f58ee	4aec35c8-444d-4be9-942e-51d19d5b3df4	ebafacd697db43a653d761a3f3e45fe3a79e5c722806c9c9f85e47e99f848618	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:40:57.29	t	43b18734-4eda-43dc-adea-078949d3fbe0	2026-07-23 06:40:57.292
823d5904-9050-42a9-bf65-9f8e693250cf	4aec35c8-444d-4be9-942e-51d19d5b3df4	7d540dfa102ea11d61f0ce5cf06a18f9e15f9cb7b923d87b55d477158cbc08f4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:51:00.273	t	1dc7d3d1-3620-4e2a-ae1d-85de06d7af6d	2026-07-23 06:51:00.275
1dc7d3d1-3620-4e2a-ae1d-85de06d7af6d	4aec35c8-444d-4be9-942e-51d19d5b3df4	707949bcd80e49ea3cacefb4f4260629c68233a163fcc6359716f034909494c1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:52:03.996	t	753d46c7-da62-4067-aa55-9c2c5416a636	2026-07-23 06:52:03.998
753d46c7-da62-4067-aa55-9c2c5416a636	4aec35c8-444d-4be9-942e-51d19d5b3df4	dc61c2b80eea5cfba616d9e57ae5166b9658ad44e51d5714d95acb4e466cd31c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:52:09.482	t	823dc146-72f5-445f-9aa1-06539f3ae439	2026-07-23 06:52:09.484
823dc146-72f5-445f-9aa1-06539f3ae439	4aec35c8-444d-4be9-942e-51d19d5b3df4	53435a3b1993b17f12585c47185d7848b42bf9a190b116f4af39249cf9f7b63d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:33.571	t	76e682b8-b4c7-4315-abd0-92d45b457487	2026-07-23 06:53:33.573
76e682b8-b4c7-4315-abd0-92d45b457487	4aec35c8-444d-4be9-942e-51d19d5b3df4	cfb42fe89bdd1be6997ec28bde5af94c3cf7d3a0ac960c98c08370de6391dfa1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:37.702	t	b3d8bdec-f82e-401e-ab0b-abc9656affed	2026-07-23 06:53:37.704
b3d8bdec-f82e-401e-ab0b-abc9656affed	4aec35c8-444d-4be9-942e-51d19d5b3df4	13ddf16cbb45ba56c2bb5144af1251ad51e0b586d3de9bfef9ba7541379246f8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:38.502	t	2abc18af-47c4-4f61-b2d2-7ae082ea08a4	2026-07-23 06:53:38.504
2abc18af-47c4-4f61-b2d2-7ae082ea08a4	4aec35c8-444d-4be9-942e-51d19d5b3df4	c53bcd0f8e37741bcac86e86c5c452c6057eeaa8ea16d47588dafb9101d4227a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:39.019	t	e27e0497-0c0d-450b-b065-9f8e3131246a	2026-07-23 06:53:39.021
e27e0497-0c0d-450b-b065-9f8e3131246a	4aec35c8-444d-4be9-942e-51d19d5b3df4	e90a9eb1b54c00e941e0ecc169647f5da41316000131c25d5dc2c897aa9c8154	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:48.645	t	fbf7d08b-6183-4c5c-9650-0a8d217844e5	2026-07-23 06:53:48.647
fbf7d08b-6183-4c5c-9650-0a8d217844e5	4aec35c8-444d-4be9-942e-51d19d5b3df4	d5ea663bc5f6950ab4812cdd6075d6f67a51dc6128f80a735840c4065a20f147	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:53:48.711	t	fc33ced0-3a5c-46b0-838d-0056f1dcfcb7	2026-07-23 06:53:48.713
fc33ced0-3a5c-46b0-838d-0056f1dcfcb7	4aec35c8-444d-4be9-942e-51d19d5b3df4	e2d6b5e4ed8cc980eee591094d67ab29194e4a1f1e3e986e5179617150319a82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:54:28.048	t	de1cfafb-c4a7-4166-bb5c-6626268f3ccb	2026-07-23 06:54:28.05
d2cb671c-50ff-4dcf-b3a3-2ab439ca6554	4aec35c8-444d-4be9-942e-51d19d5b3df4	4f6c9fd115f77525565a9544c36fba2220cd3fa8a4b0cc497ed4e857a84f45e2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 05:08:09.176	t	\N	2026-07-23 05:08:09.18
de1cfafb-c4a7-4166-bb5c-6626268f3ccb	4aec35c8-444d-4be9-942e-51d19d5b3df4	023634af98ecaff887725e3f4626467e815dc9a2ca5d5b32a4547e3599ebadb2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:54:38.694	t	bd8990fe-f8aa-4e23-b9aa-dd69e04b6cbd	2026-07-23 06:54:38.696
bd8990fe-f8aa-4e23-b9aa-dd69e04b6cbd	4aec35c8-444d-4be9-942e-51d19d5b3df4	a2cc2f2b283055b6dea682d6fd6aa6e697a8aa3527f7e7ce3f9e175e3503c3c8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 06:58:57.52	t	8518dc90-55a8-493c-a55e-0ef976afff4e	2026-07-23 06:58:57.521
8518dc90-55a8-493c-a55e-0ef976afff4e	4aec35c8-444d-4be9-942e-51d19d5b3df4	b5a4553e3e853acfb8d91d5088f6a718e1877698d54a7b37adbd3c93f9fe12bb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:01:45.491	t	10495134-5591-4832-9c96-fb3209542784	2026-07-23 07:01:45.493
10495134-5591-4832-9c96-fb3209542784	4aec35c8-444d-4be9-942e-51d19d5b3df4	aeece468ec6f023b154e35b12f828dd04cccc04fb3c9146cfa261e927c49852d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:01:47.909	t	1ab0c149-0c4c-47e4-b697-c460544001fe	2026-07-23 07:01:47.911
1ab0c149-0c4c-47e4-b697-c460544001fe	4aec35c8-444d-4be9-942e-51d19d5b3df4	894d03258171a598619736d93a31d3ce671cc26b6ca1355b3535c1d248bfa408	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:01:48.654	t	6c7e563e-1d93-457c-9497-621436b9cf90	2026-07-23 07:01:48.655
6c7e563e-1d93-457c-9497-621436b9cf90	4aec35c8-444d-4be9-942e-51d19d5b3df4	4ba4925dd6e58936754c805712cb09bdc37d8d5857c6a7d09cb654a98e424908	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:02:24.276	t	340195d2-a109-453e-90f4-f126b07a1d51	2026-07-23 07:02:24.278
340195d2-a109-453e-90f4-f126b07a1d51	4aec35c8-444d-4be9-942e-51d19d5b3df4	26a6b29757ddb1dcf4fef6504cb0327c9b5065abc48542c5246126e76401540e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:02:27.954	t	68305fe1-ad67-44f0-b280-be4146d712d0	2026-07-23 07:02:27.956
68305fe1-ad67-44f0-b280-be4146d712d0	4aec35c8-444d-4be9-942e-51d19d5b3df4	bb2aa2c5df144bfc4b0733f730b9180cb4648318b016922b163ad5f91edf495c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:02:29.1	t	7b8aed1f-3e39-4b5a-9d1f-543885650719	2026-07-23 07:02:29.102
7b8aed1f-3e39-4b5a-9d1f-543885650719	4aec35c8-444d-4be9-942e-51d19d5b3df4	49913d8960008d6b55af0de4b93e7fa92c88e4edb6284ad6b50dc045ae5a2ade	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:02:36.417	t	5b212992-6154-45fe-8ad5-db5c8471a9f3	2026-07-23 07:02:36.419
5b212992-6154-45fe-8ad5-db5c8471a9f3	4aec35c8-444d-4be9-942e-51d19d5b3df4	cf61698aa680da8b15dc09dac43642b894d5bfde7eecf0c9a5b80e46bab9d001	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:06:54.856	t	ecf8fcf3-844a-4f35-8315-a0a136867c57	2026-07-23 07:06:54.857
ecf8fcf3-844a-4f35-8315-a0a136867c57	4aec35c8-444d-4be9-942e-51d19d5b3df4	565fd19e08b58503df8d5e0c9e5eb71a2249328aee048e121f488bfe2c2945c4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:07:29.65	t	7a87b168-6d5b-4f61-a9d4-60c73a4fe540	2026-07-23 07:07:29.652
7a87b168-6d5b-4f61-a9d4-60c73a4fe540	4aec35c8-444d-4be9-942e-51d19d5b3df4	30e74a2430d2dbd27af30de1f83fdc0890283712f5e56eb60cd2790dca65c22f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:07:35.51	t	c8b1e2b2-f54a-4d11-b676-31d278e4659f	2026-07-23 07:07:35.512
c8b1e2b2-f54a-4d11-b676-31d278e4659f	4aec35c8-444d-4be9-942e-51d19d5b3df4	fe2c7cc1f9a841a1859f78a33bb12c134785ac86f5e9cd44f04082592bb60016	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:10:48.511	t	6f84fb12-d22a-4df9-bc6d-b958d41169d5	2026-07-23 07:10:48.513
6f84fb12-d22a-4df9-bc6d-b958d41169d5	4aec35c8-444d-4be9-942e-51d19d5b3df4	0c5fa14e1271a110bbc542258a6eace0534a9444271655432eb19bac1b39c896	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:18:16.413	t	1633a03b-2496-4856-9cdd-11cf42256b89	2026-07-23 07:18:16.415
1633a03b-2496-4856-9cdd-11cf42256b89	4aec35c8-444d-4be9-942e-51d19d5b3df4	fb9ce902002620e886013a8d57fc53f3ab034f974d96ee02de720fd5605d2235	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:18:21.329	t	6f0baa00-be96-4a3b-9c32-f8c38316db58	2026-07-23 07:18:21.331
6f0baa00-be96-4a3b-9c32-f8c38316db58	4aec35c8-444d-4be9-942e-51d19d5b3df4	c90a2aa65f1aa3e4e229a1977495ea2d1b8b7ee08d8fcfc9ee47e436fe511fef	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:18:22.446	t	4b1b98da-ab29-4433-9540-ba178a6e5951	2026-07-23 07:18:22.448
4b1b98da-ab29-4433-9540-ba178a6e5951	4aec35c8-444d-4be9-942e-51d19d5b3df4	d00f99ae8ae8064955964ce3b20cb3fd36e7509a0069ef533afdee221f76dd61	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:18:38.807	t	66ac8b44-203b-42c5-80f7-6866f6ad13be	2026-07-23 07:18:38.809
66ac8b44-203b-42c5-80f7-6866f6ad13be	4aec35c8-444d-4be9-942e-51d19d5b3df4	6a91141753eb5a86085a291ca546a8ed620aec231ca8cb980a672f753c4c410b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:18:41.847	t	c574da97-026f-4b03-a0a1-fcad8474028e	2026-07-23 07:18:41.849
c574da97-026f-4b03-a0a1-fcad8474028e	4aec35c8-444d-4be9-942e-51d19d5b3df4	d13c56ac19d6bcbfbf5b99e4605315512a8f2abddd5a3c7520359b6e8496fe5d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:19:10.558	t	27c8594d-0669-4b1b-883f-d9e22272b61e	2026-07-23 07:19:10.56
27c8594d-0669-4b1b-883f-d9e22272b61e	4aec35c8-444d-4be9-942e-51d19d5b3df4	9c691f71bd5ac644753f4801e2d8f55c477b40c52e1857345858ce9879ff1a26	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:20:10.253	t	d1c49866-8c3b-44ff-8f7b-6edcff8ea9c9	2026-07-23 07:20:10.259
d1c49866-8c3b-44ff-8f7b-6edcff8ea9c9	4aec35c8-444d-4be9-942e-51d19d5b3df4	be7856c9769f17c1b072f1505e49488af143af2b7ffc7f29b408976de01472c6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:20:11.405	t	e35ffb05-bacb-4071-b677-f408528df370	2026-07-23 07:20:11.407
2ac42f29-df58-44fc-9b78-6689fada5c2b	4aec35c8-444d-4be9-942e-51d19d5b3df4	91449079221f41be344e407c7f560e2ab0f1a135751d7b961c8ad7eaa2647a86	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:21:30.74	t	44ad5783-6f97-4b13-ab7f-31f8a2f8445f	2026-07-23 07:21:30.741
e35ffb05-bacb-4071-b677-f408528df370	4aec35c8-444d-4be9-942e-51d19d5b3df4	5ffc61d4346f373fb9c3a1521d37d49502f80d89e9061a1311b8d634a76f7cfb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:21:02.914	t	2ac42f29-df58-44fc-9b78-6689fada5c2b	2026-07-23 07:21:02.916
44ad5783-6f97-4b13-ab7f-31f8a2f8445f	4aec35c8-444d-4be9-942e-51d19d5b3df4	af27890c5ced660728e7ca72f06c86e5f7a825cd85305f49b54477b77bd94c64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:22:00.493	t	229bbf97-dbb8-46fd-a432-0f8d8f4ac6b3	2026-07-23 07:22:00.494
229bbf97-dbb8-46fd-a432-0f8d8f4ac6b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	8e42bc131394776c33fbdfe2a7e195f5176b8991cc757dd9bd695f9d652c5e0d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:22:18.886	t	ed86ae4d-6ec1-4669-91ee-a4c8306e03d0	2026-07-23 07:22:18.888
ed86ae4d-6ec1-4669-91ee-a4c8306e03d0	4aec35c8-444d-4be9-942e-51d19d5b3df4	5d6719b4f621731fc5d3dcc299c74a2bc75e99d2256f02e75b3d539c8cff8690	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:25:32.229	t	870ffba5-18e4-4da9-beeb-93de3e85376f	2026-07-23 07:25:32.23
870ffba5-18e4-4da9-beeb-93de3e85376f	4aec35c8-444d-4be9-942e-51d19d5b3df4	d44cbe1d4f0461bf67e586de17e59dad4b6d4e768ea69bdca0e0f753933d6adf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:25:39.68	t	9eba53f8-6df8-431a-8436-faef2a4687ce	2026-07-23 07:25:39.681
9eba53f8-6df8-431a-8436-faef2a4687ce	4aec35c8-444d-4be9-942e-51d19d5b3df4	30318dad51fb7a37cfcfff1cc7f0f535d53c7f248c24d75be2c58c3176ec1068	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 07:26:07.395	t	f78d5067-1d88-47b6-bc8c-e93536c5e2a5	2026-07-23 07:26:07.396
f78d5067-1d88-47b6-bc8c-e93536c5e2a5	4aec35c8-444d-4be9-942e-51d19d5b3df4	be4e3d2882b9d63f16f9c7d1aee639afc82cf9cd9c77542ce71bcc73f029eb3e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 08:20:28.172	t	841b0764-5b79-480b-a3f0-bdf6d44606aa	2026-07-23 08:20:28.174
841b0764-5b79-480b-a3f0-bdf6d44606aa	4aec35c8-444d-4be9-942e-51d19d5b3df4	2bd7fa730d965b6882fd4df7dcf8bb5b94d8f19ed0f6d884822cf30284dcb532	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 08:20:47.842	t	0aedad2a-5fc6-43ae-8aaf-51d5b5775be6	2026-07-23 08:20:47.843
0aedad2a-5fc6-43ae-8aaf-51d5b5775be6	4aec35c8-444d-4be9-942e-51d19d5b3df4	e36b34511aa8fe6d555dd1c0a8b6e01c7da4baf1656c6b578cbf9aee9d25009d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 08:20:57.588	t	22176342-d2f3-49aa-89de-e2a5f2c9a0d5	2026-07-23 08:20:57.589
22176342-d2f3-49aa-89de-e2a5f2c9a0d5	4aec35c8-444d-4be9-942e-51d19d5b3df4	0f77ac992c194c799f21ff8f6a95bd30856417726479a9cb007e244be78ffcaf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 08:21:33.829	t	536cbef5-3155-4f25-bee5-0bd3e1f2a336	2026-07-23 08:21:33.83
1462c90a-fa6f-4d31-a2eb-5936d698cc1a	4aec35c8-444d-4be9-942e-51d19d5b3df4	24c4f1ab4939104b64a427c57d510266ae09295191346fd52b235cd15dcbdf0f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-29 12:36:10.913	t	\N	2026-07-22 12:36:10.917
12fd1042-02dc-4bf9-a16e-ec3907b9b146	4aec35c8-444d-4be9-942e-51d19d5b3df4	f5c65a44df15856ae1edfaecc5986783220a43eab5e352727090d89cf5422400	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 04:19:49.639	t	\N	2026-07-23 04:19:49.64
536cbef5-3155-4f25-bee5-0bd3e1f2a336	4aec35c8-444d-4be9-942e-51d19d5b3df4	ce6b5b9dc3cc2c167fa3f4ddd82636fe9fd825d7fd7d5703e4a2f499a69d8e5c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 08:51:23.832	t	\N	2026-07-23 08:51:23.834
0e80274f-253c-48de-859d-051c9c05ed8f	4aec35c8-444d-4be9-942e-51d19d5b3df4	f7a5cc115d60c48ee4fa633f3e83f940c0dd8cee4d059056ec2e124b7dcda5c2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:26:04.236	t	1ba8fdd2-df22-490d-a9f3-1c36af0063f8	2026-07-23 09:26:04.247
1ba8fdd2-df22-490d-a9f3-1c36af0063f8	4aec35c8-444d-4be9-942e-51d19d5b3df4	cf5dd2f6c60513f9863b9794c913e7b0db1a9a57d6259bd1f57aa4357d9fa6d4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:26:04.643	t	320edbac-f4a7-4b75-a4ee-907de669ab8d	2026-07-23 09:26:04.654
320edbac-f4a7-4b75-a4ee-907de669ab8d	4aec35c8-444d-4be9-942e-51d19d5b3df4	32bf4b1f1e3f90791caefb9e828fe9f3191c831e141b4ea6d3017bfcd3500481	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:26:08.488	t	d996b7f4-5909-4817-8d5d-626a4794ddcb	2026-07-23 09:26:08.499
d996b7f4-5909-4817-8d5d-626a4794ddcb	4aec35c8-444d-4be9-942e-51d19d5b3df4	541ab8daa88752fea0c570ee857cb1b348f50ef4d72e9be997ea03c3f8a5fa1e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:26:08.533	t	ca2e688c-00b7-48e6-b1c7-e780ab1dc69d	2026-07-23 09:26:08.544
ca2e688c-00b7-48e6-b1c7-e780ab1dc69d	4aec35c8-444d-4be9-942e-51d19d5b3df4	2a5f7165e0dda538b872ea6a8dec07f9b962abcdc57a52e732abb36e493a59f8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:28:19.952	t	17e31517-6e3b-4616-8a9b-0848f68ef41a	2026-07-23 09:28:19.953
17e31517-6e3b-4616-8a9b-0848f68ef41a	4aec35c8-444d-4be9-942e-51d19d5b3df4	dfca66dd2289d86b183dda034024279ce174faa87d9f52e3bd609ff35fc66428	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:28:49.412	t	2e0d0094-4cb5-451b-a5bb-335492c74a5c	2026-07-23 09:28:49.414
2e0d0094-4cb5-451b-a5bb-335492c74a5c	4aec35c8-444d-4be9-942e-51d19d5b3df4	e0b40d9bf5b5147fff041410c91de6e99f0457d57b822df366d2e1e663e0d77b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:28:53.686	t	19fb5736-17d5-4203-b8bb-3917c8e35ef8	2026-07-23 09:28:53.687
19fb5736-17d5-4203-b8bb-3917c8e35ef8	4aec35c8-444d-4be9-942e-51d19d5b3df4	578e7519a96c75d6996788e0641c515b637c3cecbcfd66891fbacffeb5e1dd13	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:12:58.543	t	cdcd3f50-aa8b-4590-9f77-a073b795199a	2026-07-23 10:12:58.545
0a126265-b2de-4604-a0e5-c555c192b2af	4aec35c8-444d-4be9-942e-51d19d5b3df4	913654c3f3d93d0a8469dc3b62e554b208bc5a07efa160e071c92e814761f6a5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:18:20.651	t	7a967da4-8ac7-4502-b856-98af2811c0c9	2026-07-23 10:18:20.652
071a440a-992c-4a11-802a-cf43d1f2779b	4aec35c8-444d-4be9-942e-51d19d5b3df4	1bf782fcb6713232e34c3e9e9a451a7ce01553b780536261a018601b74724281	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 09:28:19.941	t	\N	2026-07-23 09:28:19.943
cdcd3f50-aa8b-4590-9f77-a073b795199a	4aec35c8-444d-4be9-942e-51d19d5b3df4	2ed637bf4197111cf6ff76ab242da5c85c911a807890b1450196900fb6505a96	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:12:59.741	t	0a126265-b2de-4604-a0e5-c555c192b2af	2026-07-23 10:12:59.742
7a967da4-8ac7-4502-b856-98af2811c0c9	4aec35c8-444d-4be9-942e-51d19d5b3df4	083a7a4821bcba1ba9c5476a04c63f15c5329bdbb54d2fe05786149fb075bd2c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:18:22.025	t	94b1dc88-a0df-4e8b-bede-505193b9730d	2026-07-23 10:18:22.026
94b1dc88-a0df-4e8b-bede-505193b9730d	4aec35c8-444d-4be9-942e-51d19d5b3df4	bf684b51e5c1db60c193f7df4e448d35cfd075f8daad8668de97238bf2e81731	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:18:28.475	t	82625b8b-c7cc-440a-8c94-634f2c173173	2026-07-23 10:18:28.476
82625b8b-c7cc-440a-8c94-634f2c173173	4aec35c8-444d-4be9-942e-51d19d5b3df4	1288eb3b7e8f266bb3f7f81dd5daa0f08bfe6f92a070603db092dc987bbc997c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:18:32.679	t	3b027013-56dd-4d92-9d28-aec296652c4c	2026-07-23 10:18:32.68
13bac555-9d16-40a2-a6cf-7d70e6bfca2d	4aec35c8-444d-4be9-942e-51d19d5b3df4	9136f3c5f37f44609098e6d62bed14b4cce197684e98e57a12ca4e5173c548d7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:43.168	t	0aa423a2-881b-42a7-80b7-194ec297d386	2026-07-23 10:21:43.17
3b027013-56dd-4d92-9d28-aec296652c4c	4aec35c8-444d-4be9-942e-51d19d5b3df4	9909b3b799d2c93fb2c673ec5c749b59b6d04dcf2cdace42dbb95d0f64d6582c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:18:32.698	t	8932db65-a201-46e5-850d-2414db2c512a	2026-07-23 10:18:32.7
8932db65-a201-46e5-850d-2414db2c512a	4aec35c8-444d-4be9-942e-51d19d5b3df4	92a86e58420832f09ba6e04ddf2f3faac862a850c304e3c81cfecc51d4eb4dd9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:33.903	t	c67c6cb3-ba47-4a6b-8539-9e5e53887e17	2026-07-23 10:21:33.905
c67c6cb3-ba47-4a6b-8539-9e5e53887e17	4aec35c8-444d-4be9-942e-51d19d5b3df4	e76d1dfbc2745152373c89c5299a83f25e82037cfd83cb2453a1ba9ca9102a98	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:35.759	t	13bac555-9d16-40a2-a6cf-7d70e6bfca2d	2026-07-23 10:21:35.761
ac33d8b9-1890-4653-ac11-7f3ecbfa9027	4aec35c8-444d-4be9-942e-51d19d5b3df4	b2442a5a1276510fd53fab1686a2acf0ec532b20aea031828e27262ead0e927b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:18.611	t	f2f5c5f6-f9bf-4a76-baf9-1676526d8f00	2026-07-23 10:27:18.612
0aa423a2-881b-42a7-80b7-194ec297d386	4aec35c8-444d-4be9-942e-51d19d5b3df4	8ea69027df5a106f92a12a11dff31703f3ec71da8ede8e5bab823f51055aa696	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:14.568	t	aa28bcad-d119-4529-b266-ac8168ff9bb3	2026-07-23 10:27:14.569
aa28bcad-d119-4529-b266-ac8168ff9bb3	4aec35c8-444d-4be9-942e-51d19d5b3df4	658a8d9f8bae3d8db461b310824aadf2a53f9ee3593be6e810d5a622a90f8327	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:15.905	t	ac33d8b9-1890-4653-ac11-7f3ecbfa9027	2026-07-23 10:27:15.906
f2f5c5f6-f9bf-4a76-baf9-1676526d8f00	4aec35c8-444d-4be9-942e-51d19d5b3df4	56f7a8f55a7c4f339f9127426d66abf88acfed44d7a5917b5a617ba47c530087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:22.427	t	e29335b1-bf69-480a-97bc-0874bc5d9422	2026-07-23 10:27:22.427
e29335b1-bf69-480a-97bc-0874bc5d9422	4aec35c8-444d-4be9-942e-51d19d5b3df4	57ea865cd7d988e31813c94362ab860effcce51694d74c898efdd69b0fdf4157	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:01.365	t	62a48b3a-6d58-4941-b7c2-5ba4a0f60403	2026-07-23 10:30:01.366
7405333e-6fba-4928-ae22-e28c438712a8	4aec35c8-444d-4be9-942e-51d19d5b3df4	51fb035cb87ef7a435cb424a8861a4f607bdd6f4c540067823597a01b686eec7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:33.887	t	\N	2026-07-23 10:21:33.889
f34d72c2-81d1-4faf-8733-b70e9353858e	4aec35c8-444d-4be9-942e-51d19d5b3df4	fa6e318df5756807d4e79f38a42daffa33097d01966bcfbef42b75532f68aeb3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:35.745	t	\N	2026-07-23 10:21:35.75
788b1a0b-f061-407c-b7f1-1e8672aa6da3	4aec35c8-444d-4be9-942e-51d19d5b3df4	7795a4de548ee2e2c7ff9bc189499639944c69022868626a4ac347915eabf6bc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:15.889	t	\N	2026-07-23 10:27:15.89
201ae9df-9556-4bf3-9a01-6a18bbc3e7b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	4f7516d55fb703b3565ada95f6d7f3a550bb7874b19f72616f9b73cafab8f602	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:21:43.166	t	\N	2026-07-23 10:21:43.168
62a48b3a-6d58-4941-b7c2-5ba4a0f60403	4aec35c8-444d-4be9-942e-51d19d5b3df4	6b09811d8f230ad6fc668e8e23aa915ba80de219aba1486b7e4ca3c8810ad9e3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:03.113	t	\N	2026-07-23 10:30:03.115
8380cca5-f26b-4c0c-80a7-78dfce46ac4d	4aec35c8-444d-4be9-942e-51d19d5b3df4	82dd879d49d465f7f4d6f59abf076f8c02ee88f31949e19b660807408a37c600	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:14.566	t	\N	2026-07-23 10:27:14.567
3dc8a60a-2b02-46f4-89ee-ca48196bd16c	4aec35c8-444d-4be9-942e-51d19d5b3df4	3ea8f52bcad7788e5c290e50fe787f0b13bd14262dfb53da092b4ca19b5caa61	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:18.606	t	\N	2026-07-23 10:27:18.607
ad31e3dd-8f31-4a9f-8c46-4364a28aa3cf	4aec35c8-444d-4be9-942e-51d19d5b3df4	918b1d644d73af7d8fde37a8c84c99a19395b94233ab0dac9ad64578a2091b61	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:27:22.426	t	\N	2026-07-23 10:27:22.427
6d9021f5-4dca-4f28-8324-9725253969d9	4aec35c8-444d-4be9-942e-51d19d5b3df4	046727d4d4c09b6647bd0aead4aa79038af5fce109503c3275ee3570dc56ea9d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:01.372	t	\N	2026-07-23 10:30:01.375
88a8fe85-0976-47bd-80e4-a624470ef922	4aec35c8-444d-4be9-942e-51d19d5b3df4	bd8a5b9b3c6e014126a15e00d2d01d05f9604c6f6ffb956b3d990618e060c926	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:12.092	t	a7e0c2ae-7f66-4a17-b6a9-ecc6eae7ec6e	2026-07-23 10:30:12.094
6e23751e-557b-4e8c-b670-eb160b03b0b9	4aec35c8-444d-4be9-942e-51d19d5b3df4	f6f8355197a843c6c10c1e95a0f772c8ce48325db7c8ff14c0211fdb63b78d94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:28.932	t	28e4e631-cb63-4b20-a128-5a468bc9b233	2026-07-23 10:32:28.934
a7e0c2ae-7f66-4a17-b6a9-ecc6eae7ec6e	4aec35c8-444d-4be9-942e-51d19d5b3df4	57e6f482c174b4c7921959768caddbdf13fa88de1fe25456ee511c6c3d7c6918	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:12.18	t	b4b3d0c0-ae14-482b-b72e-6d04f56e5cfe	2026-07-23 10:30:12.181
b4b3d0c0-ae14-482b-b72e-6d04f56e5cfe	4aec35c8-444d-4be9-942e-51d19d5b3df4	a395dd7c99f166ff109bda0a57f98e7c58b49824add784f0a90f66d3554a4557	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:16.173	t	96f576bf-dc50-4105-bf88-99f883e4e6b3	2026-07-23 10:30:16.175
28e4e631-cb63-4b20-a128-5a468bc9b233	4aec35c8-444d-4be9-942e-51d19d5b3df4	c00b5415e186745e5ffdf301891ccce317f0d2ce23605187ff777cf33b01d70a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:52.087	t	087d5ddd-48ea-4051-90af-dc4af683d33f	2026-07-23 10:32:52.088
96f576bf-dc50-4105-bf88-99f883e4e6b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	861a490f90a1a14cc99d7f444260ef5f4f4cc83388c936a6834e854f06a2573f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:18.111	t	6e23751e-557b-4e8c-b670-eb160b03b0b9	2026-07-23 10:32:18.112
087d5ddd-48ea-4051-90af-dc4af683d33f	4aec35c8-444d-4be9-942e-51d19d5b3df4	5ed722d2e5336239f78bbc724483fd51a28a4d3e2b8a5709637edd21c070fa81	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:52.108	t	e9385506-38b0-48fc-89ab-47df86e233b7	2026-07-23 10:32:52.109
e9385506-38b0-48fc-89ab-47df86e233b7	4aec35c8-444d-4be9-942e-51d19d5b3df4	c9f2e5fe7b40da55004bf514ac04052f22dc0d775accac4e9c02794a967abf78	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:24.573	t	b15973d8-5ac2-4f37-94f9-e5dcad03e9d5	2026-07-23 10:35:24.574
71dddf53-7d87-412b-aff4-dbacd78b19e2	4aec35c8-444d-4be9-942e-51d19d5b3df4	fe106710058ac2e5477a707633f29ea5ce6a4b4d6d0d2f0bb4cc5d1449cffd86	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:30:16.177	t	\N	2026-07-23 10:30:16.178
3e91dc48-49e2-450a-bfe9-a16dc3ccacc3	4aec35c8-444d-4be9-942e-51d19d5b3df4	3feb8f6c613953ff0d441327f40ada87b6c0fc3e67eab24363a1d87e8522f990	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:18.107	t	\N	2026-07-23 10:32:18.109
367971a2-a660-4e52-8341-0075815ea978	4aec35c8-444d-4be9-942e-51d19d5b3df4	edf1079bf30cf883833293b4f70b2b8cc9d70a8e026fc32e2a8b560d13b9e4dd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:32:28.917	t	\N	2026-07-23 10:32:28.918
8b30a896-0c07-49d2-b83b-e664e8643abf	4aec35c8-444d-4be9-942e-51d19d5b3df4	36120497851ff680a851aff0086f3a363a1f393c28bcdeca29d029e971c86621	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:24.57	t	\N	2026-07-23 10:35:24.573
b15973d8-5ac2-4f37-94f9-e5dcad03e9d5	4aec35c8-444d-4be9-942e-51d19d5b3df4	7be2cd5d54c92c6f6de7cbfd98e714e84ec7df1fff319d4359122cc11d9c7a40	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:26.073	t	\N	2026-07-23 10:35:26.074
7a1d2d09-05f1-41e0-8651-f364025d8183	4aec35c8-444d-4be9-942e-51d19d5b3df4	7b207f206f6aefcbf0e049f7e7b0e5eedcb418b7ea06f7cc0dd0818aeb830d6c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:37.096	t	503e0e65-c5ac-4972-9686-b9008d8ce10b	2026-07-23 10:35:37.097
503e0e65-c5ac-4972-9686-b9008d8ce10b	4aec35c8-444d-4be9-942e-51d19d5b3df4	b0fbc5840f13ea76278dcf82509ae134936ff2579d6e6bd31021c31868bc0448	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:37.232	t	b4f1d679-c035-47e6-abb7-66072b041a7d	2026-07-23 10:35:37.233
b4f1d679-c035-47e6-abb7-66072b041a7d	4aec35c8-444d-4be9-942e-51d19d5b3df4	99f437cb3d94a71f1199c0089ed3a0cfa8e1e731a9822fc44df23ac58e25905e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:40.004	t	7a72d541-8758-4cf4-afe2-60c41bf6df86	2026-07-23 10:35:40.005
2159aa36-d5dc-4e15-82c2-3d32a4ea6c34	4aec35c8-444d-4be9-942e-51d19d5b3df4	29d6086732401d6f06081d14b682bf53017905a19e73602b165ac363bc337b09	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:41.025	t	4f87c1b1-a618-40b3-a1ab-e10334fd2f02	2026-07-23 10:38:41.026
7a72d541-8758-4cf4-afe2-60c41bf6df86	4aec35c8-444d-4be9-942e-51d19d5b3df4	e721750f4c4f68532aa7877647d9d5e87aa2502949bf632861fd8f807a95bd21	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:35:40.032	t	ef108654-6b87-4e58-b6da-99c0f2ddd455	2026-07-23 10:35:40.034
ef108654-6b87-4e58-b6da-99c0f2ddd455	4aec35c8-444d-4be9-942e-51d19d5b3df4	0df541c146693df61894f87b4b814da92591806a93a3a19888c0f6ceed45d651	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:32.604	t	ac17d716-5de7-46a3-8943-eea305ebe93b	2026-07-23 10:38:32.605
20d8d52d-f855-4f52-bbf9-b6fa12923671	4aec35c8-444d-4be9-942e-51d19d5b3df4	8ac7ff52cab27ec07cb21471ebf371cd694f11468e74e7f171ad42003dd51d16	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:41:10.912	t	889470a7-696e-4143-8061-a615ddb25257	2026-07-23 10:41:10.916
ac17d716-5de7-46a3-8943-eea305ebe93b	4aec35c8-444d-4be9-942e-51d19d5b3df4	381771343b5ebc3efee1cdc28f4a795b42d2c2f9ac8fde564479c4f6a82ffa7b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:33.898	t	32ec2af4-a520-49b0-9503-d22fd14dea2b	2026-07-23 10:38:33.901
32ec2af4-a520-49b0-9503-d22fd14dea2b	4aec35c8-444d-4be9-942e-51d19d5b3df4	50bd25b6c69a852bdb3b17ff30e4c81a8de2fa32e43fb8dfb27cb3749c681c37	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:35.264	t	2159aa36-d5dc-4e15-82c2-3d32a4ea6c34	2026-07-23 10:38:35.265
4f87c1b1-a618-40b3-a1ab-e10334fd2f02	4aec35c8-444d-4be9-942e-51d19d5b3df4	52ed1f2dee0f975ae07ba8fb93d330d0dea1b0fe7066caed05f1eb79c47fee8c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:41.049	t	e846d618-0164-4b8b-a0a3-f49a42609134	2026-07-23 10:38:41.05
e846d618-0164-4b8b-a0a3-f49a42609134	4aec35c8-444d-4be9-942e-51d19d5b3df4	cb8b0e787d05904e18b83b9aba209016cc340da59dc62d7ef323f4119ce92398	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:40:48.162	t	20d8d52d-f855-4f52-bbf9-b6fa12923671	2026-07-23 10:40:48.164
889470a7-696e-4143-8061-a615ddb25257	4aec35c8-444d-4be9-942e-51d19d5b3df4	47f6d1efca07c413105978ac57136ed53197afbc577164cc62e8762bea065e0f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:41:13.805	t	142ab937-aa02-4f3a-9469-614608383fa0	2026-07-23 10:41:13.807
ce97cba4-c82a-4f17-9bd6-f7b1b71a34a7	4aec35c8-444d-4be9-942e-51d19d5b3df4	8ebbdc4d207a1a8e2ffb340932ae36f2b5f2b1a86d8186bc12d93c0ffcc8c201	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:20.102	t	71b7a6b8-ad5c-4aa3-9bdb-ec33e6fc27af	2026-07-23 10:49:20.104
142ab937-aa02-4f3a-9469-614608383fa0	4aec35c8-444d-4be9-942e-51d19d5b3df4	126202b88235db9dde26e027c5a4f98e17d4b5fcb84d6e4e72aa66c41e215862	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:41:13.826	t	ce97cba4-c82a-4f17-9bd6-f7b1b71a34a7	2026-07-23 10:41:13.828
9b02e14e-6fab-43de-b1fa-89af1ce3d3c5	4aec35c8-444d-4be9-942e-51d19d5b3df4	a664d1239c53967e94fbe2275666bd0fbe70a0eaa9088f4501b155cf34ee9c8a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:32.602	t	\N	2026-07-23 10:38:32.603
c13fc681-d466-4861-955f-31c33bf73efa	4aec35c8-444d-4be9-942e-51d19d5b3df4	960cb339cdc5f9daeb6553889363eee2fea8d35a6315fcef1b2cf282c67c78cd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:33.9	t	\N	2026-07-23 10:38:33.901
b993bb36-3495-47b7-937c-b2cf9dad6622	4aec35c8-444d-4be9-942e-51d19d5b3df4	d4f55598c8a430d32d13d010346fe48a405a39e136eb27780479cf038f52a1b8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:40:48.157	t	\N	2026-07-23 10:40:48.159
a27d6430-86d8-47c7-a3fc-bde598009dba	4aec35c8-444d-4be9-942e-51d19d5b3df4	8574e0cc3f13c485b5c6a126895a353b22acfc0fc87d75330f971a87fe475650	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:38:35.261	t	\N	2026-07-23 10:38:35.262
b0214aa7-5d96-44e5-97b9-6d44b15e51a2	4aec35c8-444d-4be9-942e-51d19d5b3df4	552e352956d54dfb72233d68e0da64235264cebbc316c2540fcfb7dccc3e974c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:41:10.903	t	\N	2026-07-23 10:41:10.905
2a772878-fc09-4584-98fc-461165ec1203	4aec35c8-444d-4be9-942e-51d19d5b3df4	71595af1b6bd7802bec0500d4e6711c0f28e1fa06ae6ad82e4b42bb63601b244	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:20.098	t	\N	2026-07-23 10:49:20.1
71b7a6b8-ad5c-4aa3-9bdb-ec33e6fc27af	4aec35c8-444d-4be9-942e-51d19d5b3df4	0d6ff2d09b6bde217fc71a9bb10b421135aad4659c388d22eb81e58c51547458	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:24.505	t	\N	2026-07-23 10:49:24.507
e2c7d1fe-9945-446a-b174-713c8aaef46c	4aec35c8-444d-4be9-942e-51d19d5b3df4	4a28ca53bec69c787e9d74f444c43f087cf067b40d088470a39cb2b126766a3b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:26.391	t	ae00eab3-0760-4207-89ea-210b179af1b5	2026-07-23 10:49:26.392
ae00eab3-0760-4207-89ea-210b179af1b5	4aec35c8-444d-4be9-942e-51d19d5b3df4	e36fda386c150117a3c03db8d41eb0885dd62a0fcc5f167aea37f3bc4da214c5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:26.478	t	3e5607ff-d518-4b29-9558-56afabe9c6c1	2026-07-23 10:49:26.48
3e5607ff-d518-4b29-9558-56afabe9c6c1	4aec35c8-444d-4be9-942e-51d19d5b3df4	443e47a904cfd70972f2053dfcc640f887b5f2790f78f842b75d443ec78b2a8c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:29.174	t	ea27bfbe-53ad-42d7-9c6a-48ed2a171c4e	2026-07-23 10:49:29.176
ea27bfbe-53ad-42d7-9c6a-48ed2a171c4e	4aec35c8-444d-4be9-942e-51d19d5b3df4	832b29134d423cccaf1bcb49934f9e0f23bd2e08f95fd025f2816410d203af7c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:49:29.201	t	ee694f9a-948f-4c52-a273-6245b8c68acf	2026-07-23 10:49:29.204
ee694f9a-948f-4c52-a273-6245b8c68acf	4aec35c8-444d-4be9-942e-51d19d5b3df4	44ef272b6cc7da8262e9d938824e013df42b4b1d0f816d23b4fbd3fd8f260121	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:33.172	t	\N	2026-07-23 10:55:33.174
82527d04-2df6-4262-951f-f108ff46825b	4aec35c8-444d-4be9-942e-51d19d5b3df4	ad5d91ab82766c85c9a3c491d27953a8dcb8da7534a3869714015922c1b5d47a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:46.72	t	741bd73c-1221-483d-b4f2-0b2449db8ad4	2026-07-23 10:55:46.721
741bd73c-1221-483d-b4f2-0b2449db8ad4	4aec35c8-444d-4be9-942e-51d19d5b3df4	3f7fd3562f0aea56d673e13ca65f1f8a8fa7d4343b7d407517275ca2c89d87ac	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:46.851	t	8747f422-b4de-4b96-b777-9b9accf20347	2026-07-23 10:55:46.852
8747f422-b4de-4b96-b777-9b9accf20347	4aec35c8-444d-4be9-942e-51d19d5b3df4	5359d47128df2b15e478bce971ef293209d7a2add236d8288201b0bb8e666e5f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:50.24	t	\N	2026-07-23 10:55:50.241
58780ec7-e2ce-4834-9030-327d7282a18d	4aec35c8-444d-4be9-942e-51d19d5b3df4	eeb65a364530a9ffe126e728c4a98710a05d6169c13871f845da946526ebae2f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:51.767	t	4db653c8-b6a1-4dd6-ad1e-2fb5b5b2c75b	2026-07-23 10:55:51.768
44366224-8805-4480-b96a-5c39d3bdb742	4aec35c8-444d-4be9-942e-51d19d5b3df4	e869b068d723cdec45e57d33ec53464c8482184ab9a2a5b71fe20a5e61299122	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:54.169	f	\N	2026-07-23 10:55:54.17
726dfcb6-30fa-456a-805e-952ea75a59a7	4aec35c8-444d-4be9-942e-51d19d5b3df4	4bb908a57bc7544d9dae69993bd36b65dd0d909cf0480f6a433e98b77a396ab3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:54.165	t	38c5d44d-b5bf-4d37-8fcb-8ee36c0c0a76	2026-07-23 10:55:54.166
4db653c8-b6a1-4dd6-ad1e-2fb5b5b2c75b	4aec35c8-444d-4be9-942e-51d19d5b3df4	a7c0ec23dd5e5ab9eefc3fe93c897a9f7ead280a91b16ab985bfb92ee7e13900	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:55:51.854	t	726dfcb6-30fa-456a-805e-952ea75a59a7	2026-07-23 10:55:51.855
a0f46b78-98f6-42ae-a222-74c750046c40	4aec35c8-444d-4be9-942e-51d19d5b3df4	88c8c981aa78a9be5049b956a886f0c272f8b9b9664156e3abe386783bd72af6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:11.67	f	\N	2026-07-23 10:59:11.671
6331761c-6479-4919-b99f-7ac5ab76c690	4aec35c8-444d-4be9-942e-51d19d5b3df4	9167afdeb3c82d54f50b72636825ca8ec3c7b93dda4d96c0fc2d72ca23850703	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:18.453	t	2390f912-6dbe-428b-aede-feccff2c184f	2026-07-23 10:59:18.454
38c5d44d-b5bf-4d37-8fcb-8ee36c0c0a76	4aec35c8-444d-4be9-942e-51d19d5b3df4	6cc4bf1d3500d3edfe76a073c480729f8ae749df90d12ec451534ce6dc6f8941	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:11.676	t	6331761c-6479-4919-b99f-7ac5ab76c690	2026-07-23 10:59:11.677
2390f912-6dbe-428b-aede-feccff2c184f	4aec35c8-444d-4be9-942e-51d19d5b3df4	8cab0626f8aa8627a4355e0277969796f2d12be371a0faaa742a6fc9c109ac4d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:18.484	t	fb593fc4-79ae-4d5c-9473-ef7ee6bf71b6	2026-07-23 10:59:18.487
fb593fc4-79ae-4d5c-9473-ef7ee6bf71b6	4aec35c8-444d-4be9-942e-51d19d5b3df4	0cc20d1e37136638a1aacffe56371a34724b6d0f225dbba221b570f8632dc66c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:34.212	t	2583adc2-5d2c-45a5-8aa7-c30b1d8476e9	2026-07-23 10:59:34.214
65353ead-57dd-4e9c-b81e-b314c36a83ca	4aec35c8-444d-4be9-942e-51d19d5b3df4	a0c233cdfa0e1c11e749fc3ae8d94002ec11ec05cbb04969cda9334759923112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:00:27.154	t	25bbae7c-d76f-4213-9857-290e1c893bc8	2026-07-23 11:00:27.156
2583adc2-5d2c-45a5-8aa7-c30b1d8476e9	4aec35c8-444d-4be9-942e-51d19d5b3df4	441036aa7eb1651b8064fb29e4d1f41c04a3e2e028e93bf4fb74df1b5bf5b5ae	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 10:59:51.225	t	65353ead-57dd-4e9c-b81e-b314c36a83ca	2026-07-23 10:59:51.227
25bbae7c-d76f-4213-9857-290e1c893bc8	4aec35c8-444d-4be9-942e-51d19d5b3df4	3a09b712a2a7af1845cfac675a3ae6bec654732d6bad02977fc9528374e2ad45	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:01:30.745	t	1c9b4511-a1f1-475a-aea1-4deebd012d7d	2026-07-23 11:01:30.746
1c9b4511-a1f1-475a-aea1-4deebd012d7d	4aec35c8-444d-4be9-942e-51d19d5b3df4	7cb6a4fc76319caa291bf7f808e9e96a9caed2cd94a75b3ed26dad9a27796729	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:01:46.043	t	be452c9c-544e-494a-b086-f71e9c661c4d	2026-07-23 11:01:46.044
be452c9c-544e-494a-b086-f71e9c661c4d	4aec35c8-444d-4be9-942e-51d19d5b3df4	de612730bfc6449c1d68f17c86473992d2310810a2d21be27b933308400f842f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:02:04.903	t	dd44c5aa-4f3b-4f28-a6f0-ef7f306ce3c8	2026-07-23 11:02:04.905
dd44c5aa-4f3b-4f28-a6f0-ef7f306ce3c8	4aec35c8-444d-4be9-942e-51d19d5b3df4	e35da053ef32c8252432978e1298cf348b8e7dbd925ecca134089446ae5312e7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:02:46.602	t	c5427c22-b6dc-4e06-946e-05e247892ecf	2026-07-23 11:02:46.604
c5427c22-b6dc-4e06-946e-05e247892ecf	4aec35c8-444d-4be9-942e-51d19d5b3df4	9e326b3e9925f9aea53811be87862562591967c1ceccd1e46e16ce5b26e69c35	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:02:53.625	t	466ece31-64ef-4d3c-9c8a-ebef298e295e	2026-07-23 11:02:53.627
466ece31-64ef-4d3c-9c8a-ebef298e295e	4aec35c8-444d-4be9-942e-51d19d5b3df4	b5b4c6a32bf7c13390f46d96db980846ad5f4b93a91f0c78dd3ecebd3a11c5fd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:05:11.35	t	f5b7fdd8-af24-4f3c-95f3-8453af436716	2026-07-23 11:05:11.351
f5b7fdd8-af24-4f3c-95f3-8453af436716	4aec35c8-444d-4be9-942e-51d19d5b3df4	23ae07d220ca1e38142f8e566ea94f00175b658a761a8d5f21a4c834559a3691	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:06:13.414	t	4acd1227-e325-4451-9d1e-257629d9d60d	2026-07-23 11:06:13.415
4acd1227-e325-4451-9d1e-257629d9d60d	4aec35c8-444d-4be9-942e-51d19d5b3df4	415fa080fc50635d946498ce2022dc207303d7a2b441b5454a3694e0f90bc625	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:06:17.044	t	e6afbccc-424c-4afe-b93e-d457e2ad3b31	2026-07-23 11:06:17.045
e6afbccc-424c-4afe-b93e-d457e2ad3b31	4aec35c8-444d-4be9-942e-51d19d5b3df4	d2d00d6703fe6e3ef0a60b4c4439e2ddb3724d3742cda64297a4e1c6bb412638	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:06:35.076	t	0c8ba007-d827-44b4-9f00-5c31fbdfe097	2026-07-23 11:06:35.077
0c8ba007-d827-44b4-9f00-5c31fbdfe097	4aec35c8-444d-4be9-942e-51d19d5b3df4	b0552ffcd21e3b8e4eba69deadd7d174d4ec1b1af51ba4b6f87951267a680982	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:07:09.094	t	03087af5-e4e1-40aa-801b-1f8df66f6a32	2026-07-23 11:07:09.095
03087af5-e4e1-40aa-801b-1f8df66f6a32	4aec35c8-444d-4be9-942e-51d19d5b3df4	d966032b27b4d62f8b08bb386f84742da95efbe5175061b4ea81e45bd673347c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:07:09.384	t	95a1da7e-6086-4cce-970c-11c5208d11b3	2026-07-23 11:07:09.385
95a1da7e-6086-4cce-970c-11c5208d11b3	4aec35c8-444d-4be9-942e-51d19d5b3df4	8a40d6be196be07b3c502938f5dab8941c0bf88bac6d10175ce45180ece795ad	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:22.197	t	76580750-2088-4329-b2df-e1533c3413dc	2026-07-23 11:09:22.198
76580750-2088-4329-b2df-e1533c3413dc	4aec35c8-444d-4be9-942e-51d19d5b3df4	c582f6f9249370060c0467ebd5d181e2162764e4bdd6c35f732a1fb52c59ad28	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:27.104	t	fb8b8ef7-33af-440c-9f2f-d08b330a19d2	2026-07-23 11:09:27.106
fb8b8ef7-33af-440c-9f2f-d08b330a19d2	4aec35c8-444d-4be9-942e-51d19d5b3df4	29917645566b69daa7a30e02fb5f2d24cc1e26e7bf7fbee998419c12405cdd78	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:41.142	t	47a62a1a-88ee-4248-a115-e2307df18e5b	2026-07-23 11:09:41.144
47a62a1a-88ee-4248-a115-e2307df18e5b	4aec35c8-444d-4be9-942e-51d19d5b3df4	5d5ef3ab0a8da1c7eafab2468a50decdb6de24c8e8c6650eb84a9f887f43d1bd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:41.193	t	04a44d4b-5dda-406f-a0d1-b2836ed7a3b1	2026-07-23 11:09:41.195
04a44d4b-5dda-406f-a0d1-b2836ed7a3b1	4aec35c8-444d-4be9-942e-51d19d5b3df4	c690a9f4daee7464283bd78daacf382f86e48c3a779bfa98bd634b0df8593171	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:47.75	t	6513db16-813c-48eb-93d5-54e00d62fdd8	2026-07-23 11:09:47.752
6513db16-813c-48eb-93d5-54e00d62fdd8	4aec35c8-444d-4be9-942e-51d19d5b3df4	559c956786df81e35b2f59989557ac3cfe26938ad14b1b2714e8ce4a002b4098	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:09:47.787	t	4bc04163-d68e-4bc9-aff8-dac0c41b0ff8	2026-07-23 11:09:47.79
4bc04163-d68e-4bc9-aff8-dac0c41b0ff8	4aec35c8-444d-4be9-942e-51d19d5b3df4	2324f042a0a0ab756bb826dae36cad00b6c05b9057655d9f4d6b85631ff6c2a5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:10:52.834	t	558db15f-251f-42c1-8932-2f4ea66e5218	2026-07-23 11:10:52.841
558db15f-251f-42c1-8932-2f4ea66e5218	4aec35c8-444d-4be9-942e-51d19d5b3df4	a0d723973b1f193de4f7902b78248aa2996c64a6dc61448f58272d6e75369301	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:11:20.938	t	46c83b31-96f8-447a-9f6e-3f4e3bf630e1	2026-07-23 11:11:20.945
46c83b31-96f8-447a-9f6e-3f4e3bf630e1	4aec35c8-444d-4be9-942e-51d19d5b3df4	1d1e0ecc0691c7576dd3449b8e4cd51485059aea31abc2483e650fe14aad1549	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:12:34.006	t	ac71cced-5194-4752-949d-ef4d184a0ba9	2026-07-23 11:12:34.008
8fe9c8a7-8f1d-407d-ac8e-c24c4f7f8dc3	4aec35c8-444d-4be9-942e-51d19d5b3df4	708302ae21023723583bb4820e719a50b6cb83adb69cf6e0de56d72b329d56ea	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:12:56.876	f	\N	2026-07-23 11:12:56.877
ac71cced-5194-4752-949d-ef4d184a0ba9	4aec35c8-444d-4be9-942e-51d19d5b3df4	899aa990da64e3aa3e5a380ca73f1bc7cfab316a20a81e6ddd9f9f2c21c806af	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:12:52.276	t	faa12d88-343d-415d-b38c-126af1a8526e	2026-07-23 11:12:52.277
2522e6ca-d54c-4fad-aa57-757642a37670	4aec35c8-444d-4be9-942e-51d19d5b3df4	8db050fed0f93a9e476ce31edb59f77af763c75b9896a7076fc842fb012f876e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 12:29:02.331	f	\N	2026-07-23 12:29:02.332
faa12d88-343d-415d-b38c-126af1a8526e	4aec35c8-444d-4be9-942e-51d19d5b3df4	6f89a3fe333a7663141443e0bf589e51739ec0c52dbe9170783c9f8238a144a3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 11:12:56.872	t	7147aa46-9c7d-4500-8989-454cf368fa33	2026-07-23 11:12:56.873
7147aa46-9c7d-4500-8989-454cf368fa33	4aec35c8-444d-4be9-942e-51d19d5b3df4	a60c01feae9e87e022464681c170cd77fa800c33a4aa237b24805ef101e8362a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 12:29:02.33	t	bbbb8a00-708e-4f6d-b633-6203b025ebc9	2026-07-23 12:29:02.336
bbbb8a00-708e-4f6d-b633-6203b025ebc9	4aec35c8-444d-4be9-942e-51d19d5b3df4	64b6abdde543513a80c388fa3c7b4e87ce1c402e2bb31a697e4a9c784236336f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 12:29:08.388	t	1b223848-ff00-43d3-b44e-b931a30c3dfb	2026-07-23 12:29:08.389
1b223848-ff00-43d3-b44e-b931a30c3dfb	4aec35c8-444d-4be9-942e-51d19d5b3df4	2f6068f1b2f52a542648e289cea28e5ababcf5d5dcaa32bd7780a14bf49ab011	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 12:29:16.578	t	d0c16b9a-c821-443d-99a3-e57fe6b07411	2026-07-23 12:29:16.579
d0c16b9a-c821-443d-99a3-e57fe6b07411	4aec35c8-444d-4be9-942e-51d19d5b3df4	4eb07fc7ee1238c4d89a68f56819bd0cfbac7639273b91dbabcc238c4402e50c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-07-30 12:29:54.875	t	ab656504-774d-4292-ba15-0ddf520b53fe	2026-07-23 12:29:54.876
ab656504-774d-4292-ba15-0ddf520b53fe	4aec35c8-444d-4be9-942e-51d19d5b3df4	783882bbd8abbe1191157f8d2ccb299d2386f44b418333d8011c5268d6e5b9d9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-08-03 04:46:51.593	t	547759a5-925a-4979-8c63-5cc3db3ad92c	2026-07-27 04:46:51.6
39041c48-9c91-403e-9769-87074a3175d5	4aec35c8-444d-4be9-942e-51d19d5b3df4	088c24a581e8378473ef3d0bbca203cc05b0fab3b76336dbbb873e27a72269f1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-08-03 04:47:19.815	f	\N	2026-07-27 04:47:19.823
547759a5-925a-4979-8c63-5cc3db3ad92c	4aec35c8-444d-4be9-942e-51d19d5b3df4	db19f6f9b742b87a3c642ac32c2c8466b9fa4246a31808b92bcc33376b424d63	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	2026-08-03 04:46:51.845	t	39041c48-9c91-403e-9769-87074a3175d5	2026-07-27 04:46:51.853
\.


--
-- TOC entry 5193 (class 0 OID 31406)
-- Dependencies: 246
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, project_id, title, period, module, date_from, date_to, generated_date, status, summary, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5191 (class 0 OID 27346)
-- Dependencies: 244
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, project_id, name, type, unit, total_capacity, notes, created_at, updated_at, deleted_at) FROM stdin;
c07b2fe4-1b46-463b-9bce-91d9da91604c	ae028897-c9bd-4ee3-90b9-f7317deffd3b	DI Pipe — 600mm	material	m	1200.00	Critical inventory item	2026-07-22 11:55:20.934	2026-07-22 11:55:20.934	\N
d50b3052-50b3-4689-abb0-5b33a3ce4114	ae028897-c9bd-4ee3-90b9-f7317deffd3b	DI Pipe — 450mm	material	m	3100.00	Main distribution pipeline material	2026-07-22 11:55:20.94	2026-07-22 11:55:20.94	\N
f5c1a185-6bdb-4d37-8784-099f299d800a	ae028897-c9bd-4ee3-90b9-f7317deffd3b	HDPE Pipe — 315mm	material	m	5400.00	Secondary distribution pipeline material	2026-07-22 11:55:20.943	2026-07-22 11:55:20.943	\N
7cc74edf-10e7-48a4-af45-bac4ccd2f979	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Excavators	equipment	nos	10.00	Earthwork fleet	2026-07-22 11:55:20.945	2026-07-22 11:55:20.945	\N
4f70b7f3-4145-426f-96fd-b461e0d36861	ae028897-c9bd-4ee3-90b9-f7317deffd3b	HDD Rigs	equipment	nos	3.00	Horizontal directional drilling rigs	2026-07-22 11:55:20.948	2026-07-22 11:55:20.948	\N
331ecfbc-f4a4-4bcd-8f2b-a54e50be16ec	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Dewatering Pumps	equipment	nos	12.00	Used for trench dewatering	2026-07-22 11:55:20.95	2026-07-22 11:55:20.95	\N
ef155c84-d5c6-4e97-a3c3-8148e2a6ddeb	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Skilled	manpower	persons	340.00	Skilled labor deployment	2026-07-22 11:55:20.953	2026-07-22 11:55:20.953	\N
e2955330-bf13-4429-8ac1-b14b26102bf8	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Unskilled	manpower	persons	520.00	Unskilled labor deployment	2026-07-22 11:55:20.955	2026-07-22 11:55:20.955	\N
ce2638bb-7253-4773-8547-9f48cb206c78	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Supervisory	manpower	persons	65.00	Site supervision team	2026-07-22 11:55:20.957	2026-07-22 11:55:20.957	\N
fe86eb61-3ca6-45b3-b253-a55501cb3e0f	ae028897-c9bd-4ee3-90b9-f7317deffd3b	Engineering Staff	manpower	persons	48.00	Engineering and technical team	2026-07-22 11:55:20.959	2026-07-22 11:55:20.959	\N
73157e1a-a0a7-443c-bf6e-0875c9546993	b0f25cd0-d234-4667-a369-aeffc1ddd041	tpu	equipment	6 GB	50.00	\N	2026-07-22 11:58:27.39	2026-07-22 11:58:45.198	2026-07-22 11:58:45.197
319f9f34-37ed-49dd-adb5-0444d9cf5c63	b0f25cd0-d234-4667-a369-aeffc1ddd041	admin	manpower	persons	1.00	\N	2026-07-22 11:57:30.973	2026-07-22 12:35:56.973	2026-07-22 12:35:56.969
fcd307b4-b190-4678-9ddc-fbc21cc9f1a0	b0f25cd0-d234-4667-a369-aeffc1ddd041	gpu	equipment	12	56.00	\N	2026-07-22 11:57:11.25	2026-07-23 04:54:36.21	2026-07-23 04:54:36.209
1beea24c-2dc1-40ab-96a5-6ebba1a5e84f	b0f25cd0-d234-4667-a369-aeffc1ddd041	Director	manpower	persons	1.00	\N	2026-07-22 11:59:51.012	2026-07-23 04:54:42.52	2026-07-23 04:54:42.518
3d0ecd7d-1495-415d-8015-da5e572badff	b0f25cd0-d234-4667-a369-aeffc1ddd041	GPU	equipment	6 GB	650.00	\N	2026-07-23 05:04:10.064	2026-07-23 05:04:10.064	\N
b9c20152-91c3-407a-9577-a2ac87735f8e	b0f25cd0-d234-4667-a369-aeffc1ddd041	adminn	manpower	2	22.00	\N	2026-07-23 05:05:16.923	2026-07-23 05:05:16.923	\N
26f1fc96-9b72-4547-b9b6-ae0a37df16ff	b0f25cd0-d234-4667-a369-aeffc1ddd041	Directorr	manpower	1	1.00	\N	2026-07-23 05:05:46.226	2026-07-23 05:05:46.226	\N
\.


--
-- TOC entry 5181 (class 0 OID 21504)
-- Dependencies: 234
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risks (id, project_id, category, description, probability, impact, status, owner_id, identified_date, created_at, updated_at, owner_name) FROM stdin;
\.


--
-- TOC entry 5169 (class 0 OID 16430)
-- Dependencies: 222
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
bafb69b8-bee5-466f-88bb-449dcdc36838	866b8e74-fdca-4be8-a838-51bdc313e374
bafb69b8-bee5-466f-88bb-449dcdc36838	21279902-4db2-4a1b-8379-04e7c588af87
bafb69b8-bee5-466f-88bb-449dcdc36838	b96e345b-c73d-49e7-b43b-8fb1c0638050
bafb69b8-bee5-466f-88bb-449dcdc36838	7d744acf-0a9e-4316-a76c-d805a491de9d
bafb69b8-bee5-466f-88bb-449dcdc36838	62368228-6cfa-44f5-a100-4e1e2d54dc64
bafb69b8-bee5-466f-88bb-449dcdc36838	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
bafb69b8-bee5-466f-88bb-449dcdc36838	1ac3970e-88d3-4e5a-9984-a2b671f6395b
bafb69b8-bee5-466f-88bb-449dcdc36838	2edc98a0-87ef-4ae8-9142-9150397a283c
bafb69b8-bee5-466f-88bb-449dcdc36838	04e8a1e9-2db6-42c5-951e-5d534a4e0493
bafb69b8-bee5-466f-88bb-449dcdc36838	675b9e95-b8de-4d19-ad26-cb2e4738198b
bafb69b8-bee5-466f-88bb-449dcdc36838	ca159083-daa0-426d-978b-22f2d79aeacf
bafb69b8-bee5-466f-88bb-449dcdc36838	a99535b5-5c9b-4574-90b1-89cc9b0c55e4
bafb69b8-bee5-466f-88bb-449dcdc36838	41e7b52c-ef8e-42a9-acbc-c8deb662f772
bafb69b8-bee5-466f-88bb-449dcdc36838	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
bafb69b8-bee5-466f-88bb-449dcdc36838	4e4a24a6-6f09-47b9-bdb2-1d18ab599af0
bafb69b8-bee5-466f-88bb-449dcdc36838	4d4a1ffa-c6f4-4b3c-8dba-64b829637932
bafb69b8-bee5-466f-88bb-449dcdc36838	3ecc25c2-2191-429e-b9bd-2832f6f5b256
bafb69b8-bee5-466f-88bb-449dcdc36838	4c4f762a-97e5-4582-9be0-2fb4f76ca146
bafb69b8-bee5-466f-88bb-449dcdc36838	d7774812-00fd-41d1-850f-9dac93ddda7a
bafb69b8-bee5-466f-88bb-449dcdc36838	3242898d-d17b-4aac-be80-a530525352f3
bafb69b8-bee5-466f-88bb-449dcdc36838	9301b3e1-bbf0-461d-97c3-b53bf9eebbab
bafb69b8-bee5-466f-88bb-449dcdc36838	3eaa0592-eed3-411f-b80e-adf3eea033cb
bafb69b8-bee5-466f-88bb-449dcdc36838	4fa52190-932d-4918-b756-04edcfb3cbf6
bafb69b8-bee5-466f-88bb-449dcdc36838	e84ea233-4ebe-4b35-ac00-af543cab719e
c227e7e2-d787-41e3-95e2-f113224bde8d	866b8e74-fdca-4be8-a838-51bdc313e374
c227e7e2-d787-41e3-95e2-f113224bde8d	21279902-4db2-4a1b-8379-04e7c588af87
c227e7e2-d787-41e3-95e2-f113224bde8d	b96e345b-c73d-49e7-b43b-8fb1c0638050
c227e7e2-d787-41e3-95e2-f113224bde8d	7d744acf-0a9e-4316-a76c-d805a491de9d
c227e7e2-d787-41e3-95e2-f113224bde8d	62368228-6cfa-44f5-a100-4e1e2d54dc64
c227e7e2-d787-41e3-95e2-f113224bde8d	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
c227e7e2-d787-41e3-95e2-f113224bde8d	1ac3970e-88d3-4e5a-9984-a2b671f6395b
c227e7e2-d787-41e3-95e2-f113224bde8d	2edc98a0-87ef-4ae8-9142-9150397a283c
c227e7e2-d787-41e3-95e2-f113224bde8d	04e8a1e9-2db6-42c5-951e-5d534a4e0493
c227e7e2-d787-41e3-95e2-f113224bde8d	675b9e95-b8de-4d19-ad26-cb2e4738198b
c227e7e2-d787-41e3-95e2-f113224bde8d	ca159083-daa0-426d-978b-22f2d79aeacf
c227e7e2-d787-41e3-95e2-f113224bde8d	a99535b5-5c9b-4574-90b1-89cc9b0c55e4
c227e7e2-d787-41e3-95e2-f113224bde8d	41e7b52c-ef8e-42a9-acbc-c8deb662f772
c227e7e2-d787-41e3-95e2-f113224bde8d	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
c227e7e2-d787-41e3-95e2-f113224bde8d	4e4a24a6-6f09-47b9-bdb2-1d18ab599af0
c227e7e2-d787-41e3-95e2-f113224bde8d	4d4a1ffa-c6f4-4b3c-8dba-64b829637932
c227e7e2-d787-41e3-95e2-f113224bde8d	3ecc25c2-2191-429e-b9bd-2832f6f5b256
c227e7e2-d787-41e3-95e2-f113224bde8d	4c4f762a-97e5-4582-9be0-2fb4f76ca146
c227e7e2-d787-41e3-95e2-f113224bde8d	d7774812-00fd-41d1-850f-9dac93ddda7a
c227e7e2-d787-41e3-95e2-f113224bde8d	3242898d-d17b-4aac-be80-a530525352f3
c227e7e2-d787-41e3-95e2-f113224bde8d	3eaa0592-eed3-411f-b80e-adf3eea033cb
6104a89e-2fa3-427e-9df4-6698ac94b1d1	866b8e74-fdca-4be8-a838-51bdc313e374
6104a89e-2fa3-427e-9df4-6698ac94b1d1	21279902-4db2-4a1b-8379-04e7c588af87
6104a89e-2fa3-427e-9df4-6698ac94b1d1	b96e345b-c73d-49e7-b43b-8fb1c0638050
6104a89e-2fa3-427e-9df4-6698ac94b1d1	3ecc25c2-2191-429e-b9bd-2832f6f5b256
6104a89e-2fa3-427e-9df4-6698ac94b1d1	4c4f762a-97e5-4582-9be0-2fb4f76ca146
6104a89e-2fa3-427e-9df4-6698ac94b1d1	d7774812-00fd-41d1-850f-9dac93ddda7a
6104a89e-2fa3-427e-9df4-6698ac94b1d1	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
6104a89e-2fa3-427e-9df4-6698ac94b1d1	675b9e95-b8de-4d19-ad26-cb2e4738198b
6104a89e-2fa3-427e-9df4-6698ac94b1d1	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
5112af35-6086-4ba8-9ef9-602df3929f1c	866b8e74-fdca-4be8-a838-51bdc313e374
5112af35-6086-4ba8-9ef9-602df3929f1c	21279902-4db2-4a1b-8379-04e7c588af87
5112af35-6086-4ba8-9ef9-602df3929f1c	b96e345b-c73d-49e7-b43b-8fb1c0638050
5112af35-6086-4ba8-9ef9-602df3929f1c	7d744acf-0a9e-4316-a76c-d805a491de9d
5112af35-6086-4ba8-9ef9-602df3929f1c	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
5112af35-6086-4ba8-9ef9-602df3929f1c	675b9e95-b8de-4d19-ad26-cb2e4738198b
5112af35-6086-4ba8-9ef9-602df3929f1c	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
5112af35-6086-4ba8-9ef9-602df3929f1c	4c4f762a-97e5-4582-9be0-2fb4f76ca146
22937ee2-e5ec-4774-84d6-a9027fec1cbe	62368228-6cfa-44f5-a100-4e1e2d54dc64
22937ee2-e5ec-4774-84d6-a9027fec1cbe	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
22937ee2-e5ec-4774-84d6-a9027fec1cbe	1ac3970e-88d3-4e5a-9984-a2b671f6395b
22937ee2-e5ec-4774-84d6-a9027fec1cbe	2edc98a0-87ef-4ae8-9142-9150397a283c
22937ee2-e5ec-4774-84d6-a9027fec1cbe	21279902-4db2-4a1b-8379-04e7c588af87
22937ee2-e5ec-4774-84d6-a9027fec1cbe	675b9e95-b8de-4d19-ad26-cb2e4738198b
22937ee2-e5ec-4774-84d6-a9027fec1cbe	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
22937ee2-e5ec-4774-84d6-a9027fec1cbe	4c4f762a-97e5-4582-9be0-2fb4f76ca146
ded94592-3f59-497a-8dc3-8830ac5805b2	21279902-4db2-4a1b-8379-04e7c588af87
ded94592-3f59-497a-8dc3-8830ac5805b2	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
ded94592-3f59-497a-8dc3-8830ac5805b2	675b9e95-b8de-4d19-ad26-cb2e4738198b
ded94592-3f59-497a-8dc3-8830ac5805b2	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
93fcecf8-8253-4bee-9f7e-d696a0f537ce	21279902-4db2-4a1b-8379-04e7c588af87
93fcecf8-8253-4bee-9f7e-d696a0f537ce	f82c56f5-23af-4dd2-95c3-fa25ae9073c6
93fcecf8-8253-4bee-9f7e-d696a0f537ce	675b9e95-b8de-4d19-ad26-cb2e4738198b
93fcecf8-8253-4bee-9f7e-d696a0f537ce	3bf228a0-ec01-4bff-94a3-9d27b01f03e1
93fcecf8-8253-4bee-9f7e-d696a0f537ce	4c4f762a-97e5-4582-9be0-2fb4f76ca146
6104a89e-2fa3-427e-9df4-6698ac94b1d1	04e8a1e9-2db6-42c5-951e-5d534a4e0493
6104a89e-2fa3-427e-9df4-6698ac94b1d1	ca159083-daa0-426d-978b-22f2d79aeacf
6104a89e-2fa3-427e-9df4-6698ac94b1d1	41e7b52c-ef8e-42a9-acbc-c8deb662f772
5112af35-6086-4ba8-9ef9-602df3929f1c	41e7b52c-ef8e-42a9-acbc-c8deb662f772
5112af35-6086-4ba8-9ef9-602df3929f1c	4e4a24a6-6f09-47b9-bdb2-1d18ab599af0
bafb69b8-bee5-466f-88bb-449dcdc36838	a2781a06-2318-4ea8-88b8-3a55d1abf240
bafb69b8-bee5-466f-88bb-449dcdc36838	a0d7c332-c3df-4d6b-80d5-5db59850eb40
bafb69b8-bee5-466f-88bb-449dcdc36838	1aa5284a-4664-4e76-b735-8d9643baf961
bafb69b8-bee5-466f-88bb-449dcdc36838	5dcaa1ea-f460-4d68-bd29-8baf2236d74b
c227e7e2-d787-41e3-95e2-f113224bde8d	a2781a06-2318-4ea8-88b8-3a55d1abf240
c227e7e2-d787-41e3-95e2-f113224bde8d	a0d7c332-c3df-4d6b-80d5-5db59850eb40
c227e7e2-d787-41e3-95e2-f113224bde8d	1aa5284a-4664-4e76-b735-8d9643baf961
c227e7e2-d787-41e3-95e2-f113224bde8d	5dcaa1ea-f460-4d68-bd29-8baf2236d74b
6104a89e-2fa3-427e-9df4-6698ac94b1d1	a2781a06-2318-4ea8-88b8-3a55d1abf240
6104a89e-2fa3-427e-9df4-6698ac94b1d1	a0d7c332-c3df-4d6b-80d5-5db59850eb40
6104a89e-2fa3-427e-9df4-6698ac94b1d1	1aa5284a-4664-4e76-b735-8d9643baf961
5112af35-6086-4ba8-9ef9-602df3929f1c	a0d7c332-c3df-4d6b-80d5-5db59850eb40
22937ee2-e5ec-4774-84d6-a9027fec1cbe	a0d7c332-c3df-4d6b-80d5-5db59850eb40
93fcecf8-8253-4bee-9f7e-d696a0f537ce	a0d7c332-c3df-4d6b-80d5-5db59850eb40
bafb69b8-bee5-466f-88bb-449dcdc36838	976daa4e-007a-4627-ac5a-56394470a785
bafb69b8-bee5-466f-88bb-449dcdc36838	914918ae-6c7b-4fb5-8baf-39d910fd08fb
bafb69b8-bee5-466f-88bb-449dcdc36838	77906cfb-67a6-47fa-9593-d98f0fda5f19
bafb69b8-bee5-466f-88bb-449dcdc36838	8b889bdb-6007-488f-8eaf-85405efbc809
c227e7e2-d787-41e3-95e2-f113224bde8d	976daa4e-007a-4627-ac5a-56394470a785
c227e7e2-d787-41e3-95e2-f113224bde8d	914918ae-6c7b-4fb5-8baf-39d910fd08fb
c227e7e2-d787-41e3-95e2-f113224bde8d	77906cfb-67a6-47fa-9593-d98f0fda5f19
c227e7e2-d787-41e3-95e2-f113224bde8d	8b889bdb-6007-488f-8eaf-85405efbc809
6104a89e-2fa3-427e-9df4-6698ac94b1d1	914918ae-6c7b-4fb5-8baf-39d910fd08fb
5112af35-6086-4ba8-9ef9-602df3929f1c	914918ae-6c7b-4fb5-8baf-39d910fd08fb
22937ee2-e5ec-4774-84d6-a9027fec1cbe	976daa4e-007a-4627-ac5a-56394470a785
22937ee2-e5ec-4774-84d6-a9027fec1cbe	914918ae-6c7b-4fb5-8baf-39d910fd08fb
22937ee2-e5ec-4774-84d6-a9027fec1cbe	77906cfb-67a6-47fa-9593-d98f0fda5f19
22937ee2-e5ec-4774-84d6-a9027fec1cbe	8b889bdb-6007-488f-8eaf-85405efbc809
ded94592-3f59-497a-8dc3-8830ac5805b2	914918ae-6c7b-4fb5-8baf-39d910fd08fb
93fcecf8-8253-4bee-9f7e-d696a0f537ce	914918ae-6c7b-4fb5-8baf-39d910fd08fb
bafb69b8-bee5-466f-88bb-449dcdc36838	56f2ebbc-35f1-4039-b752-08758b8fddd5
bafb69b8-bee5-466f-88bb-449dcdc36838	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
bafb69b8-bee5-466f-88bb-449dcdc36838	9a50da77-073f-4de7-8910-9c0bc06358b2
bafb69b8-bee5-466f-88bb-449dcdc36838	bb8fec8d-8a22-4f5c-9ca4-55f7f2fa1197
c227e7e2-d787-41e3-95e2-f113224bde8d	56f2ebbc-35f1-4039-b752-08758b8fddd5
c227e7e2-d787-41e3-95e2-f113224bde8d	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
c227e7e2-d787-41e3-95e2-f113224bde8d	9a50da77-073f-4de7-8910-9c0bc06358b2
c227e7e2-d787-41e3-95e2-f113224bde8d	bb8fec8d-8a22-4f5c-9ca4-55f7f2fa1197
6104a89e-2fa3-427e-9df4-6698ac94b1d1	56f2ebbc-35f1-4039-b752-08758b8fddd5
6104a89e-2fa3-427e-9df4-6698ac94b1d1	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
6104a89e-2fa3-427e-9df4-6698ac94b1d1	9a50da77-073f-4de7-8910-9c0bc06358b2
5112af35-6086-4ba8-9ef9-602df3929f1c	56f2ebbc-35f1-4039-b752-08758b8fddd5
5112af35-6086-4ba8-9ef9-602df3929f1c	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
5112af35-6086-4ba8-9ef9-602df3929f1c	9a50da77-073f-4de7-8910-9c0bc06358b2
5112af35-6086-4ba8-9ef9-602df3929f1c	bb8fec8d-8a22-4f5c-9ca4-55f7f2fa1197
22937ee2-e5ec-4774-84d6-a9027fec1cbe	56f2ebbc-35f1-4039-b752-08758b8fddd5
22937ee2-e5ec-4774-84d6-a9027fec1cbe	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
22937ee2-e5ec-4774-84d6-a9027fec1cbe	9a50da77-073f-4de7-8910-9c0bc06358b2
ded94592-3f59-497a-8dc3-8830ac5805b2	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
93fcecf8-8253-4bee-9f7e-d696a0f537ce	9c0bf63d-3e05-4b1b-8e9d-faeb75a73f85
\.


--
-- TOC entry 5167 (class 0 OID 16406)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
bafb69b8-bee5-466f-88bb-449dcdc36838	admin	Full system control	2026-07-15 12:33:40.964	2026-07-23 09:25:32.533
c227e7e2-d787-41e3-95e2-f113224bde8d	project_manager	Owns one or more projects end-to-end	2026-07-15 12:33:40.973	2026-07-23 09:25:32.543
6104a89e-2fa3-427e-9df4-6698ac94b1d1	site_engineer	On-ground execution	2026-07-15 12:33:40.974	2026-07-23 09:25:32.544
5112af35-6086-4ba8-9ef9-602df3929f1c	planning_engineer	Schedules & work-package planning	2026-07-15 12:33:40.976	2026-07-23 09:25:32.546
22937ee2-e5ec-4774-84d6-a9027fec1cbe	finance	Budget & expenditure control	2026-07-15 12:33:40.978	2026-07-23 09:25:32.547
ded94592-3f59-497a-8dc3-8830ac5805b2	client	External stakeholder / funding body	2026-07-15 12:33:40.979	2026-07-23 09:25:32.548
93fcecf8-8253-4bee-9f7e-d696a0f537ce	read_only_user	Internal read-only viewer	2026-07-15 12:33:40.981	2026-07-23 09:25:32.55
\.


--
-- TOC entry 5185 (class 0 OID 22481)
-- Dependencies: 238
-- Data for Name: testing_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testing_activities (id, project_id, activity_name, planned_value, actual_value, unit, status, created_at, updated_at) FROM stdin;
ce8b6b93-bc23-47b0-a3aa-82fdd7481bfe	b0f25cd0-d234-4667-a369-aeffc1ddd041	Testing	34.00	25.00	km	In Progress	2026-07-23 10:33:45.223	2026-07-23 10:33:45.223
\.


--
-- TOC entry 5170 (class 0 OID 16439)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role_id, status, failed_login_attempts, locked_until, last_login_at, password_changed_at, created_at, updated_at, deleted_at) FROM stdin;
4aec35c8-444d-4be9-942e-51d19d5b3df4	System Administrator	admin@watersupply-monitor.example	$2b$12$HqyvDfDR3CWiNfpBrMQTdOk1bSsU8kdYb3Ryg0Dq5aNk0o.wtN50S	bafb69b8-bee5-466f-88bb-449dcdc36838	active	0	\N	2026-07-23 10:55:51.762	\N	2026-07-15 12:33:41.486	2026-07-23 10:55:51.763	\N
\.


--
-- TOC entry 5186 (class 0 OID 22498)
-- Dependencies: 239
-- Data for Name: valve_chamber_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.valve_chamber_summaries (id, project_id, planned, completed, in_progress, not_started, updated_at) FROM stdin;
4c007e44-0855-4ebe-ad31-b355c66cae46	b0f25cd0-d234-4667-a369-aeffc1ddd041	0	0	0	0	2026-07-23 10:33:16.938
\.


--
-- TOC entry 5176 (class 0 OID 17638)
-- Dependencies: 229
-- Data for Name: work_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_packages (id, project_id, name, planned_start, planned_end, actual_start, actual_end, weightage_pct, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 4902 (class 2606 OID 16405)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 27378)
-- Name: allocations allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allocations
    ADD CONSTRAINT allocations_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 16524)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 22527)
-- Name: bridge_crossings bridge_crossings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bridge_crossings
    ADD CONSTRAINT bridge_crossings_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 24847)
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 22543)
-- Name: construction_snapshots construction_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.construction_snapshots
    ADD CONSTRAINT construction_snapshots_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 21538)
-- Name: delays delays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delays
    ADD CONSTRAINT delays_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 21503)
-- Name: ehs_checklist_items ehs_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_checklist_items
    ADD CONSTRAINT ehs_checklist_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 21478)
-- Name: ehs_incidents ehs_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_incidents
    ADD CONSTRAINT ehs_incidents_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 21492)
-- Name: ehs_inspections ehs_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_inspections
    ADD CONSTRAINT ehs_inspections_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 22480)
-- Name: house_connection_clusters house_connection_clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.house_connection_clusters
    ADD CONSTRAINT house_connection_clusters_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 24866)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 16485)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 16429)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 22463)
-- Name: pipeline_sections pipeline_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_sections
    ADD CONSTRAINT pipeline_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 17668)
-- Name: progress_entries progress_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_entries
    ADD CONSTRAINT progress_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 16512)
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 16499)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 16472)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 31425)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 27361)
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 21523)
-- Name: risks risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 16438)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 4905 (class 2606 OID 16417)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 22497)
-- Name: testing_activities testing_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testing_activities
    ADD CONSTRAINT testing_activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 16457)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 22511)
-- Name: valve_chamber_summaries valve_chamber_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valve_chamber_summaries
    ADD CONSTRAINT valve_chamber_summaries_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 17653)
-- Name: work_packages work_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_packages
    ADD CONSTRAINT work_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 1259 OID 27382)
-- Name: allocations_resource_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX allocations_resource_id_idx ON public.allocations USING btree (resource_id);


--
-- TOC entry 4984 (class 1259 OID 27385)
-- Name: allocations_resource_id_work_package_id_allocation_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX allocations_resource_id_work_package_id_allocation_date_key ON public.allocations USING btree (resource_id, work_package_id, allocation_date);


--
-- TOC entry 4985 (class 1259 OID 27384)
-- Name: allocations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX allocations_status_idx ON public.allocations USING btree (status);


--
-- TOC entry 4986 (class 1259 OID 27383)
-- Name: allocations_work_package_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX allocations_work_package_id_idx ON public.allocations USING btree (work_package_id);


--
-- TOC entry 4928 (class 1259 OID 16535)
-- Name: audit_logs_module_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_module_reference_id_idx ON public.audit_logs USING btree (module, reference_id);


--
-- TOC entry 4931 (class 1259 OID 16534)
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- TOC entry 4970 (class 1259 OID 24868)
-- Name: budgets_project_id_category_fiscal_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX budgets_project_id_category_fiscal_year_key ON public.budgets USING btree (project_id, category, fiscal_year);


--
-- TOC entry 4971 (class 1259 OID 24867)
-- Name: budgets_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX budgets_project_id_idx ON public.budgets USING btree (project_id);


--
-- TOC entry 4953 (class 1259 OID 21543)
-- Name: delays_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX delays_project_id_idx ON public.delays USING btree (project_id);


--
-- TOC entry 4954 (class 1259 OID 21544)
-- Name: delays_work_package_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX delays_work_package_id_idx ON public.delays USING btree (work_package_id);


--
-- TOC entry 4945 (class 1259 OID 21541)
-- Name: ehs_checklist_items_inspection_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ehs_checklist_items_inspection_id_idx ON public.ehs_checklist_items USING btree (inspection_id);


--
-- TOC entry 4941 (class 1259 OID 21539)
-- Name: ehs_incidents_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ehs_incidents_project_id_idx ON public.ehs_incidents USING btree (project_id);


--
-- TOC entry 4944 (class 1259 OID 21540)
-- Name: ehs_inspections_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ehs_inspections_project_id_idx ON public.ehs_inspections USING btree (project_id);


--
-- TOC entry 4972 (class 1259 OID 24869)
-- Name: invoices_budget_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_budget_id_idx ON public.invoices USING btree (budget_id);


--
-- TOC entry 4973 (class 1259 OID 24870)
-- Name: invoices_budget_id_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_budget_id_invoice_number_key ON public.invoices USING btree (budget_id, invoice_number);


--
-- TOC entry 4920 (class 1259 OID 16531)
-- Name: password_reset_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_token_hash_idx ON public.password_reset_tokens USING btree (token_hash);


--
-- TOC entry 4921 (class 1259 OID 16530)
-- Name: password_reset_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_user_id_idx ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 4906 (class 1259 OID 16526)
-- Name: permissions_module_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_module_action_key ON public.permissions USING btree (module, action);


--
-- TOC entry 4937 (class 1259 OID 17674)
-- Name: progress_entries_work_package_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX progress_entries_work_package_id_idx ON public.progress_entries USING btree (work_package_id);


--
-- TOC entry 4938 (class 1259 OID 17675)
-- Name: progress_entries_work_package_id_reported_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX progress_entries_work_package_id_reported_date_key ON public.progress_entries USING btree (work_package_id, reported_date);


--
-- TOC entry 4927 (class 1259 OID 16533)
-- Name: project_members_project_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX project_members_project_id_user_id_key ON public.project_members USING btree (project_id, user_id);


--
-- TOC entry 4922 (class 1259 OID 16532)
-- Name: projects_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX projects_code_key ON public.projects USING btree (code);


--
-- TOC entry 4916 (class 1259 OID 16529)
-- Name: refresh_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_token_hash_idx ON public.refresh_tokens USING btree (token_hash);


--
-- TOC entry 4917 (class 1259 OID 16528)
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 4987 (class 1259 OID 31427)
-- Name: reports_module_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_module_idx ON public.reports USING btree (module);


--
-- TOC entry 4990 (class 1259 OID 31426)
-- Name: reports_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_project_id_idx ON public.reports USING btree (project_id);


--
-- TOC entry 4991 (class 1259 OID 31428)
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- TOC entry 4978 (class 1259 OID 27379)
-- Name: resources_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resources_project_id_idx ON public.resources USING btree (project_id);


--
-- TOC entry 4979 (class 1259 OID 27381)
-- Name: resources_project_id_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX resources_project_id_name_key ON public.resources USING btree (project_id, name);


--
-- TOC entry 4980 (class 1259 OID 27380)
-- Name: resources_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resources_type_idx ON public.resources USING btree (type);


--
-- TOC entry 4950 (class 1259 OID 21542)
-- Name: risks_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX risks_project_id_idx ON public.risks USING btree (project_id);


--
-- TOC entry 4903 (class 1259 OID 16525)
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- TOC entry 4911 (class 1259 OID 16527)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4963 (class 1259 OID 22544)
-- Name: valve_chamber_summaries_project_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX valve_chamber_summaries_project_id_key ON public.valve_chamber_summaries USING btree (project_id);


--
-- TOC entry 4934 (class 1259 OID 17673)
-- Name: work_packages_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_packages_project_id_idx ON public.work_packages USING btree (project_id);


--
-- TOC entry 5017 (class 2606 OID 27391)
-- Name: allocations allocations_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allocations
    ADD CONSTRAINT allocations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 16571)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 22565)
-- Name: bridge_crossings bridge_crossings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bridge_crossings
    ADD CONSTRAINT bridge_crossings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 24871)
-- Name: budgets budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 22570)
-- Name: construction_snapshots construction_snapshots_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.construction_snapshots
    ADD CONSTRAINT construction_snapshots_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 21565)
-- Name: delays delays_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delays
    ADD CONSTRAINT delays_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 21570)
-- Name: delays delays_work_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delays
    ADD CONSTRAINT delays_work_package_id_fkey FOREIGN KEY (work_package_id) REFERENCES public.work_packages(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5004 (class 2606 OID 21555)
-- Name: ehs_checklist_items ehs_checklist_items_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_checklist_items
    ADD CONSTRAINT ehs_checklist_items_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.ehs_inspections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 21545)
-- Name: ehs_incidents ehs_incidents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_incidents
    ADD CONSTRAINT ehs_incidents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 21550)
-- Name: ehs_inspections ehs_inspections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ehs_inspections
    ADD CONSTRAINT ehs_inspections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 22550)
-- Name: house_connection_clusters house_connection_clusters_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.house_connection_clusters
    ADD CONSTRAINT house_connection_clusters_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 24876)
-- Name: invoices invoices_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 16556)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 22545)
-- Name: pipeline_sections pipeline_sections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_sections
    ADD CONSTRAINT pipeline_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 17691)
-- Name: progress_entries progress_entries_work_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_entries
    ADD CONSTRAINT progress_entries_work_package_id_fkey FOREIGN KEY (work_package_id) REFERENCES public.work_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 16561)
-- Name: project_members project_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 16566)
-- Name: project_members project_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 16551)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 31429)
-- Name: reports reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 27386)
-- Name: resources resources_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5005 (class 2606 OID 21560)
-- Name: risks risks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 16541)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4993 (class 2606 OID 16536)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 22555)
-- Name: testing_activities testing_activities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testing_activities
    ADD CONSTRAINT testing_activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 16546)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5011 (class 2606 OID 22560)
-- Name: valve_chamber_summaries valve_chamber_summaries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valve_chamber_summaries
    ADD CONSTRAINT valve_chamber_summaries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 17686)
-- Name: work_packages work_packages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_packages
    ADD CONSTRAINT work_packages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-07-27 13:04:54

--
-- PostgreSQL database dump complete
--

\unrestrict Te5yvdgnjXNK0xwK3924x2Oqm8fLgcgfJjFdNudgwvMNeZLd9BgMkhsbkbaaR8V



