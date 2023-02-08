--
-- PostgreSQL database dump
--

-- Dumped from database version 10.23 (Ubuntu 10.23-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.23 (Ubuntu 10.23-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: account_emailaddress; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.account_emailaddress (
    id integer NOT NULL,
    email character varying(254) NOT NULL,
    verified boolean NOT NULL,
    "primary" boolean NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.account_emailaddress OWNER TO onbekend;

--
-- Name: account_emailaddress_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.account_emailaddress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.account_emailaddress_id_seq OWNER TO onbekend;

--
-- Name: account_emailaddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.account_emailaddress_id_seq OWNED BY public.account_emailaddress.id;


--
-- Name: account_emailconfirmation; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.account_emailconfirmation (
    id integer NOT NULL,
    created timestamp with time zone NOT NULL,
    sent timestamp with time zone,
    key character varying(64) NOT NULL,
    email_address_id integer NOT NULL
);


ALTER TABLE public.account_emailconfirmation OWNER TO onbekend;

--
-- Name: account_emailconfirmation_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.account_emailconfirmation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.account_emailconfirmation_id_seq OWNER TO onbekend;

--
-- Name: account_emailconfirmation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.account_emailconfirmation_id_seq OWNED BY public.account_emailconfirmation.id;


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO onbekend;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_group_id_seq OWNER TO onbekend;

--
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_group_id_seq OWNED BY public.auth_group.id;


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_group_permissions (
    id integer NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO onbekend;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_group_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_group_permissions_id_seq OWNER TO onbekend;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_group_permissions_id_seq OWNED BY public.auth_group_permissions.id;


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO onbekend;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_permission_id_seq OWNER TO onbekend;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_permission_id_seq OWNED BY public.auth_permission.id;


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO onbekend;

--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_user_groups (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO onbekend;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_user_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_groups_id_seq OWNER TO onbekend;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_user_groups_id_seq OWNED BY public.auth_user_groups.id;


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_id_seq OWNER TO onbekend;

--
-- Name: auth_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_user_id_seq OWNED BY public.auth_user.id;


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.auth_user_user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO onbekend;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.auth_user_user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_user_permissions_id_seq OWNER TO onbekend;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.auth_user_user_permissions_id_seq OWNED BY public.auth_user_user_permissions.id;


--
-- Name: core_artwork; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_artwork (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    art character varying(100) NOT NULL,
    description text NOT NULL,
    slug character varying(50) NOT NULL
);


ALTER TABLE public.core_artwork OWNER TO onbekend;

--
-- Name: core_artwork_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_artwork_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_artwork_id_seq OWNER TO onbekend;

--
-- Name: core_artwork_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_artwork_id_seq OWNED BY public.core_artwork.id;


--
-- Name: core_billingaddress; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_billingaddress (
    id integer NOT NULL,
    street_address character varying(100) NOT NULL,
    apartment_address character varying(20) NOT NULL,
    country character varying(2) NOT NULL,
    zip character varying(20) NOT NULL,
    user_id integer NOT NULL,
    usa_resident boolean NOT NULL
);


ALTER TABLE public.core_billingaddress OWNER TO onbekend;

--
-- Name: core_billingaddress_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_billingaddress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_billingaddress_id_seq OWNER TO onbekend;

--
-- Name: core_billingaddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_billingaddress_id_seq OWNED BY public.core_billingaddress.id;


--
-- Name: core_item; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_item (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    image character varying(100) NOT NULL,
    price numeric(8,2) NOT NULL,
    discount_price numeric(8,2),
    category character varying(2) NOT NULL,
    label character varying(1) NOT NULL,
    slug character varying(50) NOT NULL,
    description text NOT NULL,
    count integer NOT NULL,
    sold_out boolean NOT NULL
);


ALTER TABLE public.core_item OWNER TO onbekend;

--
-- Name: core_item_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_item_id_seq OWNER TO onbekend;

--
-- Name: core_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_item_id_seq OWNED BY public.core_item.id;


--
-- Name: core_order; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_order (
    id integer NOT NULL,
    ref_code character varying(20) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    ordered_date timestamp with time zone NOT NULL,
    ordered boolean NOT NULL,
    being_delivered boolean NOT NULL,
    received boolean NOT NULL,
    refund_requested boolean NOT NULL,
    refund_granted boolean NOT NULL,
    billing_address_id integer,
    payment_id integer,
    user_id integer NOT NULL
);


ALTER TABLE public.core_order OWNER TO onbekend;

--
-- Name: core_order_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_order_id_seq OWNER TO onbekend;

--
-- Name: core_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_order_id_seq OWNED BY public.core_order.id;


--
-- Name: core_order_items; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    orderitem_id integer NOT NULL
);


ALTER TABLE public.core_order_items OWNER TO onbekend;

--
-- Name: core_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_order_items_id_seq OWNER TO onbekend;

--
-- Name: core_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_order_items_id_seq OWNED BY public.core_order_items.id;


--
-- Name: core_orderitem; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_orderitem (
    id integer NOT NULL,
    ordered boolean NOT NULL,
    quantity integer NOT NULL,
    item_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.core_orderitem OWNER TO onbekend;

--
-- Name: core_orderitem_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_orderitem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_orderitem_id_seq OWNER TO onbekend;

--
-- Name: core_orderitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_orderitem_id_seq OWNED BY public.core_orderitem.id;


--
-- Name: core_payment; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_payment (
    id integer NOT NULL,
    stripe_charge_id character varying(50) NOT NULL,
    amount numeric(8,2) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    user_id integer
);


ALTER TABLE public.core_payment OWNER TO onbekend;

--
-- Name: core_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_payment_id_seq OWNER TO onbekend;

--
-- Name: core_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_payment_id_seq OWNED BY public.core_payment.id;


--
-- Name: core_refund; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.core_refund (
    id integer NOT NULL,
    reason text NOT NULL,
    accepted boolean NOT NULL,
    email character varying(254) NOT NULL,
    order_id integer NOT NULL
);


ALTER TABLE public.core_refund OWNER TO onbekend;

--
-- Name: core_refund_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.core_refund_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_refund_id_seq OWNER TO onbekend;

--
-- Name: core_refund_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.core_refund_id_seq OWNED BY public.core_refund.id;


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO onbekend;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.django_admin_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_admin_log_id_seq OWNER TO onbekend;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.django_admin_log_id_seq OWNED BY public.django_admin_log.id;


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO onbekend;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.django_content_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_content_type_id_seq OWNER TO onbekend;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.django_content_type_id_seq OWNED BY public.django_content_type.id;


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.django_migrations (
    id integer NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO onbekend;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.django_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_migrations_id_seq OWNER TO onbekend;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.django_migrations_id_seq OWNED BY public.django_migrations.id;


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO onbekend;

--
-- Name: django_site; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.django_site (
    id integer NOT NULL,
    domain character varying(100) NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.django_site OWNER TO onbekend;

--
-- Name: django_site_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.django_site_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_site_id_seq OWNER TO onbekend;

--
-- Name: django_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.django_site_id_seq OWNED BY public.django_site.id;


--
-- Name: socialaccount_socialaccount; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.socialaccount_socialaccount (
    id integer NOT NULL,
    provider character varying(30) NOT NULL,
    uid character varying(191) NOT NULL,
    last_login timestamp with time zone NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    extra_data text NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.socialaccount_socialaccount OWNER TO onbekend;

--
-- Name: socialaccount_socialaccount_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.socialaccount_socialaccount_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.socialaccount_socialaccount_id_seq OWNER TO onbekend;

--
-- Name: socialaccount_socialaccount_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.socialaccount_socialaccount_id_seq OWNED BY public.socialaccount_socialaccount.id;


--
-- Name: socialaccount_socialapp; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.socialaccount_socialapp (
    id integer NOT NULL,
    provider character varying(30) NOT NULL,
    name character varying(40) NOT NULL,
    client_id character varying(191) NOT NULL,
    secret character varying(191) NOT NULL,
    key character varying(191) NOT NULL
);


ALTER TABLE public.socialaccount_socialapp OWNER TO onbekend;

--
-- Name: socialaccount_socialapp_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.socialaccount_socialapp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.socialaccount_socialapp_id_seq OWNER TO onbekend;

--
-- Name: socialaccount_socialapp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.socialaccount_socialapp_id_seq OWNED BY public.socialaccount_socialapp.id;


--
-- Name: socialaccount_socialapp_sites; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.socialaccount_socialapp_sites (
    id integer NOT NULL,
    socialapp_id integer NOT NULL,
    site_id integer NOT NULL
);


ALTER TABLE public.socialaccount_socialapp_sites OWNER TO onbekend;

--
-- Name: socialaccount_socialapp_sites_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.socialaccount_socialapp_sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.socialaccount_socialapp_sites_id_seq OWNER TO onbekend;

--
-- Name: socialaccount_socialapp_sites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.socialaccount_socialapp_sites_id_seq OWNED BY public.socialaccount_socialapp_sites.id;


--
-- Name: socialaccount_socialtoken; Type: TABLE; Schema: public; Owner: onbekend
--

CREATE TABLE public.socialaccount_socialtoken (
    id integer NOT NULL,
    token text NOT NULL,
    token_secret text NOT NULL,
    expires_at timestamp with time zone,
    account_id integer NOT NULL,
    app_id integer NOT NULL
);


ALTER TABLE public.socialaccount_socialtoken OWNER TO onbekend;

--
-- Name: socialaccount_socialtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: onbekend
--

CREATE SEQUENCE public.socialaccount_socialtoken_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.socialaccount_socialtoken_id_seq OWNER TO onbekend;

--
-- Name: socialaccount_socialtoken_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: onbekend
--

ALTER SEQUENCE public.socialaccount_socialtoken_id_seq OWNED BY public.socialaccount_socialtoken.id;


--
-- Name: account_emailaddress id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailaddress ALTER COLUMN id SET DEFAULT nextval('public.account_emailaddress_id_seq'::regclass);


--
-- Name: account_emailconfirmation id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailconfirmation ALTER COLUMN id SET DEFAULT nextval('public.account_emailconfirmation_id_seq'::regclass);


--
-- Name: auth_group id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group ALTER COLUMN id SET DEFAULT nextval('public.auth_group_id_seq'::regclass);


--
-- Name: auth_group_permissions id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('public.auth_group_permissions_id_seq'::regclass);


--
-- Name: auth_permission id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_permission ALTER COLUMN id SET DEFAULT nextval('public.auth_permission_id_seq'::regclass);


--
-- Name: auth_user id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user ALTER COLUMN id SET DEFAULT nextval('public.auth_user_id_seq'::regclass);


--
-- Name: auth_user_groups id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_groups ALTER COLUMN id SET DEFAULT nextval('public.auth_user_groups_id_seq'::regclass);


--
-- Name: auth_user_user_permissions id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.auth_user_user_permissions_id_seq'::regclass);


--
-- Name: core_artwork id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_artwork ALTER COLUMN id SET DEFAULT nextval('public.core_artwork_id_seq'::regclass);


--
-- Name: core_billingaddress id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_billingaddress ALTER COLUMN id SET DEFAULT nextval('public.core_billingaddress_id_seq'::regclass);


--
-- Name: core_item id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_item ALTER COLUMN id SET DEFAULT nextval('public.core_item_id_seq'::regclass);


--
-- Name: core_order id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order ALTER COLUMN id SET DEFAULT nextval('public.core_order_id_seq'::regclass);


--
-- Name: core_order_items id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order_items ALTER COLUMN id SET DEFAULT nextval('public.core_order_items_id_seq'::regclass);


--
-- Name: core_orderitem id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_orderitem ALTER COLUMN id SET DEFAULT nextval('public.core_orderitem_id_seq'::regclass);


--
-- Name: core_payment id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_payment ALTER COLUMN id SET DEFAULT nextval('public.core_payment_id_seq'::regclass);


--
-- Name: core_refund id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_refund ALTER COLUMN id SET DEFAULT nextval('public.core_refund_id_seq'::regclass);


--
-- Name: django_admin_log id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_admin_log ALTER COLUMN id SET DEFAULT nextval('public.django_admin_log_id_seq'::regclass);


--
-- Name: django_content_type id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_content_type ALTER COLUMN id SET DEFAULT nextval('public.django_content_type_id_seq'::regclass);


--
-- Name: django_migrations id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_migrations ALTER COLUMN id SET DEFAULT nextval('public.django_migrations_id_seq'::regclass);


--
-- Name: django_site id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_site ALTER COLUMN id SET DEFAULT nextval('public.django_site_id_seq'::regclass);


--
-- Name: socialaccount_socialaccount id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialaccount ALTER COLUMN id SET DEFAULT nextval('public.socialaccount_socialaccount_id_seq'::regclass);


--
-- Name: socialaccount_socialapp id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp ALTER COLUMN id SET DEFAULT nextval('public.socialaccount_socialapp_id_seq'::regclass);


--
-- Name: socialaccount_socialapp_sites id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp_sites ALTER COLUMN id SET DEFAULT nextval('public.socialaccount_socialapp_sites_id_seq'::regclass);


--
-- Name: socialaccount_socialtoken id; Type: DEFAULT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialtoken ALTER COLUMN id SET DEFAULT nextval('public.socialaccount_socialtoken_id_seq'::regclass);


--
-- Data for Name: account_emailaddress; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.account_emailaddress (id, email, verified, "primary", user_id) FROM stdin;
\.


--
-- Data for Name: account_emailconfirmation; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.account_emailconfirmation (id, created, sent, key, email_address_id) FROM stdin;
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add site	7	add_site
26	Can change site	7	change_site
27	Can delete site	7	delete_site
28	Can view site	7	view_site
29	Can add email address	8	add_emailaddress
30	Can change email address	8	change_emailaddress
31	Can delete email address	8	delete_emailaddress
32	Can view email address	8	view_emailaddress
33	Can add email confirmation	9	add_emailconfirmation
34	Can change email confirmation	9	change_emailconfirmation
35	Can delete email confirmation	9	delete_emailconfirmation
36	Can view email confirmation	9	view_emailconfirmation
37	Can add social account	10	add_socialaccount
38	Can change social account	10	change_socialaccount
39	Can delete social account	10	delete_socialaccount
40	Can view social account	10	view_socialaccount
41	Can add social application	11	add_socialapp
42	Can change social application	11	change_socialapp
43	Can delete social application	11	delete_socialapp
44	Can view social application	11	view_socialapp
45	Can add social application token	12	add_socialtoken
46	Can change social application token	12	change_socialtoken
47	Can delete social application token	12	delete_socialtoken
48	Can view social application token	12	view_socialtoken
49	Can add item	13	add_item
50	Can change item	13	change_item
51	Can delete item	13	delete_item
52	Can view item	13	view_item
53	Can add order	14	add_order
54	Can change order	14	change_order
55	Can delete order	14	delete_order
56	Can view order	14	view_order
57	Can add refund	15	add_refund
58	Can change refund	15	change_refund
59	Can delete refund	15	delete_refund
60	Can view refund	15	view_refund
61	Can add payment	16	add_payment
62	Can change payment	16	change_payment
63	Can delete payment	16	delete_payment
64	Can view payment	16	view_payment
65	Can add order item	17	add_orderitem
66	Can change order item	17	change_orderitem
67	Can delete order item	17	delete_orderitem
68	Can view order item	17	view_orderitem
69	Can add billing address	18	add_billingaddress
70	Can change billing address	18	change_billingaddress
71	Can delete billing address	18	delete_billingaddress
72	Can view billing address	18	view_billingaddress
73	Can add artwork	19	add_artwork
74	Can change artwork	19	change_artwork
75	Can delete artwork	19	delete_artwork
76	Can view artwork	19	view_artwork
\.


--
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$260000$4bKJSqVQG5UywxIHeCaAzO$GX3dyXLUWS5GeRVBSQhRbDYRc+W/gPD3+5b3wPdFvPg=	2022-04-11 12:33:58.948352+00	t	onbekend			mj@igobymj.com	t	t	2022-02-27 19:27:16.497637+00
3	pbkdf2_sha256$260000$I9W4lXGh1YdpWHiWqNUBy2$KPlwF0Art4RtUmi3ZaG+NoQv6UotZqGU2JHeA+ucJH4=	2023-02-01 05:05:39.835843+00	f	huey253				f	t	2023-02-01 05:05:39.636008+00
2	pbkdf2_sha256$260000$72jZsIPxBbEwyk3S6KSJJz$4w9eCCZW0M46HUVE5VQuIbeQV/L7Nj9953Ld4HcBEZk=	2023-02-03 02:48:41.854867+00	t	kihoko			kihoko@gmail.com	t	t	2022-03-03 00:16:22.088359+00
\.


--
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: core_artwork; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_artwork (id, name, art, description, slug) FROM stdin;
2	Swamp Ass	artwork_pics/IMG_1196.PNG	Artwork by Kiho	swamp
3	Focus	artwork_pics/K_shared_a_drawing_with_you.JPEG	Artwork by Kiho	focus
4	Yellow Peril and Black Power	artwork_pics/Untitled_Artwork.PNG	Artwork by Kiho	support
5	Activist	artwork_pics/Activist_.jpg	Artwork by Kiho	activist
6	Original	artwork_pics/Old_Drawings_.jpg	Artwork by Kiho	original
9	Style	artwork_pics/fashion.jpg	Artwork by Kiho	style
11	guitar	artwork_pics/guitar.png	Artwork by Kiho	guitar
12	family-ties	artwork_pics/family-ties.png	Artwork by Kiho	family-ties
14	orange makku	artwork_pics/makku.png	Artwork by Kiho	orange-makku
15	Pawty Punchin	artwork_pics/pawty_punchin.png	Artwork by Kiho	pawty
16	gero	artwork_pics/gero.png	Artwork by Kiho	gero
1	Peace of mind 01	artwork_pics/IMG_1195_xJMCb08.PNG	Woman, clouds and tea	tea
17	Peace of mind 02	artwork_pics/8BCE80DD-E154-47CA-BBE4-69E5A2CE868C.JPG	...	mindfulness
18	Peace of mind 03	artwork_pics/8F8102C6-0234-4A93-9A24-56D4FB8FA3A6.JPG	...	mindfulness02
20	Toki	artwork_pics/2E7C0208-2B36-44BE-B34D-B9FC17BEE797.JPG	Nipponia nippon	Toki
21	Pregnant Life	artwork_pics/Pregnant_Life.JPG	Week 20	Week_20
22	My Heart	artwork_pics/Untitled_Artwork_Xx50RBx.JPG	Kauai	Baby
24	Mountains	artwork_pics/9262F1E3-9241-423F-84CD-36E9D7644FAC.JPG	Yama	Yama
26	WATASHI2	artwork_pics/8C9FBB99-9FD1-4BAF-8FFE-C60D4A733108.JPG	Self Love	self-love
27	Fragile	artwork_pics/2B211695-8FD4-4932-8C77-D41C7609C8F2.jpg	Take care of your heart	fralige
31	How to save our planet	artwork_pics/Untitled_Artwork_5.JPG	Artwork by Kiho	Ondanka
32	Thanks for the good vibe	artwork_pics/Untitled_Artwork_3.jpg	Artwork by Kiho	Gratitudedrawing01
33	Thanks for the universe in me	artwork_pics/Untitled_Artwork_3_copy.JPG	Artwork by Kiho	universe
34	Thanks for my complexion	artwork_pics/6CC6003E-DB26-4D14-9C13-B3E88594A04A.JPG	Artwork by Kiho	complexion
\.


--
-- Data for Name: core_billingaddress; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_billingaddress (id, street_address, apartment_address, country, zip, user_id, usa_resident) FROM stdin;
\.


--
-- Data for Name: core_item; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_item (id, title, image, price, discount_price, category, label, slug, description, count, sold_out) FROM stdin;
2	Toki	product_images/tsuru.png	30.00	\N	C	D	Toki	100% cotton t-shirts. \r\n\r\nSize: Large \r\n\r\nbirds of a feather	0	t
3	Self Love	product_images/2A5F2361-8E88-4F73-823B-F302809E948C.JPG	30.00	\N	A	P	prints	"Self Love"\r\n\r\n10.5" x 13" |  Riso printing\r\n\r\nLimited edition of 50	10	f
4	I got you pin	product_images/page0.JPG	12.00	\N	A	P	pin	Hand girl enamel pin. \r\n\r\nLimited edition.	10	f
\.


--
-- Data for Name: core_order; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_order (id, ref_code, start_date, ordered_date, ordered, being_delivered, received, refund_requested, refund_granted, billing_address_id, payment_id, user_id) FROM stdin;
1		2023-02-01 02:46:43.388333+00	2023-02-01 02:46:43.387879+00	f	f	f	f	f	\N	\N	2
2		2023-02-01 05:05:40.007207+00	2023-02-01 05:05:40.006852+00	f	f	f	f	f	\N	\N	3
\.


--
-- Data for Name: core_order_items; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_order_items (id, order_id, orderitem_id) FROM stdin;
1	1	1
2	2	2
\.


--
-- Data for Name: core_orderitem; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_orderitem (id, ordered, quantity, item_id, user_id) FROM stdin;
1	f	1	3	2
2	f	1	3	3
\.


--
-- Data for Name: core_payment; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_payment (id, stripe_charge_id, amount, "timestamp", user_id) FROM stdin;
\.


--
-- Data for Name: core_refund; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.core_refund (id, reason, accepted, email, order_id) FROM stdin;
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
1	2022-02-27 19:29:57.331332+00	1	Tea Girl	1	[{"added": {}}]	19	1
2	2022-02-27 19:30:21.740709+00	2	Swamp Ass	1	[{"added": {}}]	19	1
3	2022-02-27 19:31:14.252429+00	3	Focus	1	[{"added": {}}]	19	1
4	2022-02-27 19:34:06.466854+00	4	Yellow Peril and Black Power	1	[{"added": {}}]	19	1
5	2022-02-27 19:36:15.394888+00	5	Activist	1	[{"added": {}}]	19	1
6	2022-02-27 19:37:37.010606+00	6	Original	1	[{"added": {}}]	19	1
7	2022-02-27 19:39:08.197933+00	7	Coffee	1	[{"added": {}}]	19	1
8	2022-02-27 19:40:00.692178+00	8	chill	1	[{"added": {}}]	19	1
9	2022-02-27 19:40:44.916192+00	9	Style	1	[{"added": {}}]	19	1
10	2022-02-27 19:41:30.057921+00	8	Chill	2	[{"changed": {"fields": ["Name"]}}]	19	1
11	2022-03-18 11:37:30.570021+00	10	tsu	1	[{"added": {}}]	19	1
12	2022-03-18 11:37:43.104104+00	10	tsuru	2	[{"changed": {"fields": ["Name"]}}]	19	1
13	2022-03-18 11:38:27.825413+00	11	guitar	1	[{"added": {}}]	19	1
14	2022-03-18 11:39:21.001574+00	12	family-ties	1	[{"added": {}}]	19	1
15	2022-03-18 11:39:35.811269+00	13	meisou	1	[{"added": {}}]	19	1
16	2022-03-18 11:40:35.529011+00	1	meisou	1	[{"added": {}}]	13	1
17	2022-03-18 11:41:10.813334+00	2	tsuru	1	[{"added": {}}]	13	1
18	2022-03-18 11:42:31.910569+00	10	tsuru	3		19	1
19	2022-03-18 11:42:31.917481+00	13	meisou	3		19	1
20	2022-03-18 11:46:05.998575+00	2	tsuru	2	[{"changed": {"fields": ["Label"]}}]	13	1
21	2022-03-18 11:46:15.539542+00	1	meisou	2	[{"changed": {"fields": ["Label"]}}]	13	1
22	2022-03-19 07:15:34.293361+00	2	tsuru	2	[{"changed": {"fields": ["Price"]}}]	13	1
23	2022-03-19 07:15:34.30112+00	1	meisou	2	[{"changed": {"fields": ["Price"]}}]	13	1
24	2022-03-20 00:17:16.290094+00	14	orange makku	1	[{"added": {}}]	19	1
25	2022-04-11 12:37:30.768508+00	15	Pawty Punchin	1	[{"added": {}}]	19	1
26	2022-04-11 12:41:17.34858+00	16	gero	1	[{"added": {}}]	19	1
27	2022-06-10 00:30:52.656516+00	17	Peace of mind 01	1	[{"added": {}}]	19	2
28	2022-06-10 00:33:35.138334+00	18	Peace of mind 02	1	[{"added": {}}]	19	2
29	2022-06-10 00:49:19.244957+00	1	Peace of mind 01	2	[{"changed": {"fields": ["Name", "Description"]}}]	19	2
30	2022-06-10 00:49:34.754389+00	17	Peace of mind 02	2	[{"changed": {"fields": ["Name"]}}]	19	2
31	2022-06-10 00:49:41.05509+00	18	Peace of mind 03	2	[{"changed": {"fields": ["Name"]}}]	19	2
32	2022-06-10 00:50:17.220345+00	19	Peace of mind 04	1	[{"added": {}}]	19	2
33	2022-06-11 12:51:05.971539+00	20	Toki	1	[{"added": {}}]	19	2
34	2022-06-11 12:54:45.251924+00	21	Pregnant Life	1	[{"added": {}}]	19	2
35	2022-06-11 12:55:55.92803+00	22	My Heart	1	[{"added": {}}]	19	2
36	2022-06-12 13:18:23.217887+00	23	Moon	1	[{"added": {}}]	19	2
37	2022-06-12 13:18:46.284576+00	24	Mountains	1	[{"added": {}}]	19	2
38	2022-06-18 23:11:06.95934+00	25	WATASHI	1	[{"added": {}}]	19	2
39	2022-06-19 10:03:27.14044+00	26	WATASHI2	1	[{"added": {}}]	19	2
40	2022-06-29 12:21:55.663184+00	27	Fragile	1	[{"added": {}}]	19	2
41	2022-06-29 12:22:20.891181+00	28	Ego	1	[{"added": {}}]	19	2
42	2022-08-13 14:44:02.45824+00	29	Usagi Nengajou	1	[{"added": {}}]	19	2
43	2022-08-13 14:44:42.061478+00	30	Moon/Sun/Star	1	[{"added": {}}]	19	2
44	2022-08-13 14:45:47.186277+00	31	How to save our planet	1	[{"added": {}}]	19	2
45	2023-01-30 16:17:52.960433+00	32	Thanks for the good vibe	1	[{"added": {}}]	19	2
46	2023-02-01 02:34:57.045184+00	33	Thanks for the universe in me	1	[{"added": {}}]	19	2
47	2023-02-01 02:42:12.523494+00	3	Self Love	1	[{"added": {}}]	13	2
48	2023-02-01 02:44:10.103115+00	1	meisou	3		13	2
49	2023-02-01 02:46:10.908169+00	3	Self Love	2	[{"changed": {"fields": ["Description"]}}]	13	2
50	2023-02-01 02:49:13.026682+00	29	Usagi Nengajou	3		19	2
51	2023-02-01 02:49:50.909584+00	23	Moon	3		19	2
52	2023-02-01 02:52:09.416432+00	34	Thanks for my complexion	1	[{"added": {}}]	19	2
53	2023-02-01 02:52:47.04089+00	30	Moon/Sun/Star	3		19	2
54	2023-02-01 02:53:53.752669+00	25	WATASHI	3		19	2
55	2023-02-01 02:54:31.96014+00	28	Ego	3		19	2
56	2023-02-01 02:56:40.248062+00	19	Peace of mind 04	3		19	2
57	2023-02-01 02:57:58.930153+00	7	Coffee	3		19	2
58	2023-02-01 03:06:00.45097+00	8	Chill	3		19	2
59	2023-02-02 14:37:56.893604+00	2	Toki	2	[{"changed": {"fields": ["Title", "Slug", "Description"]}}]	13	2
60	2023-02-02 14:40:34.909239+00	3	Self Love	2	[{"changed": {"fields": ["Image"]}}]	13	2
61	2023-02-03 02:52:13.351664+00	4	I got you pin	1	[{"added": {}}]	13	2
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	sites	site
8	account	emailaddress
9	account	emailconfirmation
10	socialaccount	socialaccount
11	socialaccount	socialapp
12	socialaccount	socialtoken
13	core	item
14	core	order
15	core	refund
16	core	payment
17	core	orderitem
18	core	billingaddress
19	core	artwork
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2022-01-29 06:55:24.997504+00
2	auth	0001_initial	2022-01-29 06:55:25.067066+00
3	account	0001_initial	2022-01-29 06:55:25.180908+00
4	account	0002_email_max_length	2022-01-29 06:55:25.213405+00
5	admin	0001_initial	2022-01-29 06:55:25.233942+00
6	admin	0002_logentry_remove_auto_add	2022-01-29 06:55:25.256394+00
7	admin	0003_logentry_add_action_flag_choices	2022-01-29 06:55:25.26586+00
8	contenttypes	0002_remove_content_type_name	2022-01-29 06:55:25.295331+00
9	auth	0002_alter_permission_name_max_length	2022-01-29 06:55:25.30243+00
10	auth	0003_alter_user_email_max_length	2022-01-29 06:55:25.31393+00
11	auth	0004_alter_user_username_opts	2022-01-29 06:55:25.324908+00
12	auth	0005_alter_user_last_login_null	2022-01-29 06:55:25.33475+00
13	auth	0006_require_contenttypes_0002	2022-01-29 06:55:25.33845+00
14	auth	0007_alter_validators_add_error_messages	2022-01-29 06:55:25.348363+00
15	auth	0008_alter_user_username_max_length	2022-01-29 06:55:25.364343+00
16	auth	0009_alter_user_last_name_max_length	2022-01-29 06:55:25.374491+00
17	auth	0010_alter_group_name_max_length	2022-01-29 06:55:25.384948+00
18	auth	0011_update_proxy_permissions	2022-01-29 06:55:25.396984+00
19	core	0001_initial	2022-01-29 06:55:25.575212+00
20	core	0002_auto_20210228_0932	2022-01-29 06:55:25.723682+00
21	core	0003_auto_20210408_1349	2022-01-29 06:55:25.785678+00
22	core	0004_auto_20210408_1517	2022-01-29 06:55:25.792555+00
23	core	0005_billingaddress_usa_resident	2022-01-29 06:55:25.824659+00
24	core	0006_artwork	2022-01-29 06:55:25.841537+00
25	core	0007_auto_20210902_0401	2022-01-29 06:55:25.891601+00
26	core	0008_auto_20210902_0401	2022-01-29 06:55:25.904913+00
27	core	0009_auto_20220129_0655	2022-01-29 06:55:25.910819+00
28	sessions	0001_initial	2022-01-29 06:55:25.92864+00
29	sites	0001_initial	2022-01-29 06:55:25.950307+00
30	sites	0002_alter_domain_unique	2022-01-29 06:55:25.96413+00
31	socialaccount	0001_initial	2022-01-29 06:55:26.058326+00
32	socialaccount	0002_token_max_lengths	2022-01-29 06:55:26.126691+00
33	socialaccount	0003_extra_data_default_dict	2022-01-29 06:55:26.137779+00
34	auth	0012_alter_user_first_name_max_length	2022-01-29 07:20:52.835686+00
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
eitjw07itykc178af4ary4lc16s82wuw	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1nOPKj:fPc9D2YNIZGyGVxm_rxNDRUgHDEvLAGi0bfbdq_yGB4	2022-03-13 19:35:53.421635+00
gw3v5jc1euro062l6lq2lgty7gaaybos	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1nPYlF:rwvsNo6r1nlIr7WX8mA_gsNpL-zaVLE4dN2dvcwrFQw	2022-03-16 23:52:01.841354+00
d87azqryevndohku09c0l63mkaugblnh	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1nVASh:26YFAKIdeuKV_ElMlbzHVlFCOuumEgMDSPfW_izavXY	2022-04-01 11:08:03.228465+00
hr2iiz8j43amxtf5jifkmw60s6fgw67c	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1nVAmu:17qXFWwA55iO73M1pKmzZ4h1ytgR0t4HtxMhGTDtWAU	2022-04-01 11:28:56.651802+00
kgog894rh9xkij4o2dal3u7s2jhct5jf	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1nVjFR:FhlQXq1sq_GHGW2cxqIXk4hRyWIotGFrQKaGpO1YsCY	2022-04-03 00:16:41.222306+00
fwbvfceqv1a2fzgxc6vfpcay15xrawxy	.eJxVjDsOwjAQBe_iGln-JfZS0ucM1tq7wQHkSHFSIe6OLKWA9s3Me4uIx17i0XiLC4mr0OLyuyXMT64d0APrfZV5rfu2JNkVedImp5X4dTvdv4OCrfTaOq-VwWRGmG1IhGFEqxyAG3QeZqCAjMTac8gmWWc8KkAw1pMjZvH5AtrKOAU:1ndtF0:gSrY3NDsBhlRW-flCbYcYvKoEda4eem-KTCRWbRpwfg	2022-04-25 12:33:58.953582+00
3kbo574xwhoqg8afnckxmb9mla6u4o6f	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1o0NSc:HJIrs_fDVYWxEtRrOy7POqIYaVbxrK9unJfxtzigUMk	2022-06-26 13:16:58.712577+00
stgjvz8d0f9iyhewuvmda51gz6d6znk2	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1o2haI:GiO4qnVY4EZq-Xr_qf-tEXMkLVmYYsF5A5vs3qepmMg	2022-07-02 23:10:30.201087+00
qdgl91wx0qanocit6d2wx5stgxj4bn52	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1o6WeZ:r31yIA5xA6tQo-PRVLMNlTQ1V2yRALoHE1CgFN8vcEY	2022-07-13 12:18:43.367828+00
pp72p7kmyevr2o4iqc5223xbjxdob0aq	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1oMsKo:RkG2liy71sfQmjstr9g9iEeRqFAJASZc4tXf0UDTUw4	2022-08-27 14:41:54.543507+00
dcg0vjiz6jhow62h9bw3ng0rv9wm760m	.eJxljM0KgzAQBt8lZ5H8qIne2hcJm80GQ9MINeml9N2rIoXS4858Oy8GiEvNxT7pEUMkb-kOMbEp15Sar60rPdjEFGuYhVrmA9jo_5kDvFHeBaS04_ZstMfm1Gt72S7KJSKUuOTr-fWTmmGdt47vfeik7gfnwPXBgCHJBWllBhJSOaelJiUDN4AqoO5IjIJzh6PvvA-avT8P4U5l:1pN5JT:Tx2daSa3Wqe9fYXfJEnYMo4UEb0O6VcadjYDkuqyl24	2023-02-15 05:05:39.841555+00
9a10zurcqeql18lllvn7xihhd90d296p	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1pNahA:S2uI4lDjapjHLLGwr6r2QxEP9EjMRYIWVoaIDBtqreo	2023-02-16 14:36:12.613272+00
gk5uz9970282ohwoy5otwp3l14cejkt8	.eJxVjEEOwiAQRe_C2pBKmQIu3fcMZIaZStVAUtqV8e7apAvd_vfef6mI25rj1mSJM6uLMur0uxGmh5Qd8B3LrepUy7rMpHdFH7TpsbI8r4f7d5Cx5W9tAYEwSIIevPHWM0KffEpuQmepH0AcS3dmoMEaIjMxm45DsMaTk6DeH_AZOEE:1pNm81:X54Wz-uVk5qc-c0iJ76qw-A_-COhBRvwEaU_TW86TlA	2023-02-17 02:48:41.858838+00
\.


--
-- Data for Name: django_site; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.django_site (id, domain, name) FROM stdin;
1	example.com	example.com
\.


--
-- Data for Name: socialaccount_socialaccount; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.socialaccount_socialaccount (id, provider, uid, last_login, date_joined, extra_data, user_id) FROM stdin;
\.


--
-- Data for Name: socialaccount_socialapp; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.socialaccount_socialapp (id, provider, name, client_id, secret, key) FROM stdin;
\.


--
-- Data for Name: socialaccount_socialapp_sites; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.socialaccount_socialapp_sites (id, socialapp_id, site_id) FROM stdin;
\.


--
-- Data for Name: socialaccount_socialtoken; Type: TABLE DATA; Schema: public; Owner: onbekend
--

COPY public.socialaccount_socialtoken (id, token, token_secret, expires_at, account_id, app_id) FROM stdin;
\.


--
-- Name: account_emailaddress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.account_emailaddress_id_seq', 1, false);


--
-- Name: account_emailconfirmation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.account_emailconfirmation_id_seq', 1, false);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 76, true);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 3, true);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- Name: core_artwork_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_artwork_id_seq', 34, true);


--
-- Name: core_billingaddress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_billingaddress_id_seq', 1, false);


--
-- Name: core_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_item_id_seq', 4, true);


--
-- Name: core_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_order_id_seq', 2, true);


--
-- Name: core_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_order_items_id_seq', 2, true);


--
-- Name: core_orderitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_orderitem_id_seq', 2, true);


--
-- Name: core_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_payment_id_seq', 1, false);


--
-- Name: core_refund_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.core_refund_id_seq', 1, false);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 61, true);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 19, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 34, true);


--
-- Name: django_site_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.django_site_id_seq', 1, true);


--
-- Name: socialaccount_socialaccount_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.socialaccount_socialaccount_id_seq', 1, false);


--
-- Name: socialaccount_socialapp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.socialaccount_socialapp_id_seq', 1, false);


--
-- Name: socialaccount_socialapp_sites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.socialaccount_socialapp_sites_id_seq', 1, false);


--
-- Name: socialaccount_socialtoken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: onbekend
--

SELECT pg_catalog.setval('public.socialaccount_socialtoken_id_seq', 1, false);


--
-- Name: account_emailaddress account_emailaddress_email_key; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailaddress
    ADD CONSTRAINT account_emailaddress_email_key UNIQUE (email);


--
-- Name: account_emailaddress account_emailaddress_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailaddress
    ADD CONSTRAINT account_emailaddress_pkey PRIMARY KEY (id);


--
-- Name: account_emailconfirmation account_emailconfirmation_key_key; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailconfirmation
    ADD CONSTRAINT account_emailconfirmation_key_key UNIQUE (key);


--
-- Name: account_emailconfirmation account_emailconfirmation_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailconfirmation
    ADD CONSTRAINT account_emailconfirmation_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: core_artwork core_artwork_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_artwork
    ADD CONSTRAINT core_artwork_pkey PRIMARY KEY (id);


--
-- Name: core_artwork core_artwork_slug_key; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_artwork
    ADD CONSTRAINT core_artwork_slug_key UNIQUE (slug);


--
-- Name: core_billingaddress core_billingaddress_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_billingaddress
    ADD CONSTRAINT core_billingaddress_pkey PRIMARY KEY (id);


--
-- Name: core_item core_item_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_item
    ADD CONSTRAINT core_item_pkey PRIMARY KEY (id);


--
-- Name: core_order_items core_order_items_order_id_orderitem_id_f9cea05f_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order_items
    ADD CONSTRAINT core_order_items_order_id_orderitem_id_f9cea05f_uniq UNIQUE (order_id, orderitem_id);


--
-- Name: core_order_items core_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order_items
    ADD CONSTRAINT core_order_items_pkey PRIMARY KEY (id);


--
-- Name: core_order core_order_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order
    ADD CONSTRAINT core_order_pkey PRIMARY KEY (id);


--
-- Name: core_orderitem core_orderitem_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_orderitem
    ADD CONSTRAINT core_orderitem_pkey PRIMARY KEY (id);


--
-- Name: core_payment core_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_payment
    ADD CONSTRAINT core_payment_pkey PRIMARY KEY (id);


--
-- Name: core_refund core_refund_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_refund
    ADD CONSTRAINT core_refund_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: django_site django_site_domain_a2e37b91_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_site
    ADD CONSTRAINT django_site_domain_a2e37b91_uniq UNIQUE (domain);


--
-- Name: django_site django_site_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_site
    ADD CONSTRAINT django_site_pkey PRIMARY KEY (id);


--
-- Name: socialaccount_socialaccount socialaccount_socialaccount_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialaccount
    ADD CONSTRAINT socialaccount_socialaccount_pkey PRIMARY KEY (id);


--
-- Name: socialaccount_socialaccount socialaccount_socialaccount_provider_uid_fc810c6e_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialaccount
    ADD CONSTRAINT socialaccount_socialaccount_provider_uid_fc810c6e_uniq UNIQUE (provider, uid);


--
-- Name: socialaccount_socialapp_sites socialaccount_socialapp__socialapp_id_site_id_71a9a768_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp_sites
    ADD CONSTRAINT socialaccount_socialapp__socialapp_id_site_id_71a9a768_uniq UNIQUE (socialapp_id, site_id);


--
-- Name: socialaccount_socialapp socialaccount_socialapp_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp
    ADD CONSTRAINT socialaccount_socialapp_pkey PRIMARY KEY (id);


--
-- Name: socialaccount_socialapp_sites socialaccount_socialapp_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp_sites
    ADD CONSTRAINT socialaccount_socialapp_sites_pkey PRIMARY KEY (id);


--
-- Name: socialaccount_socialtoken socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialtoken
    ADD CONSTRAINT socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq UNIQUE (app_id, account_id);


--
-- Name: socialaccount_socialtoken socialaccount_socialtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialtoken
    ADD CONSTRAINT socialaccount_socialtoken_pkey PRIMARY KEY (id);


--
-- Name: account_emailaddress_email_03be32b2_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX account_emailaddress_email_03be32b2_like ON public.account_emailaddress USING btree (email varchar_pattern_ops);


--
-- Name: account_emailaddress_user_id_2c513194; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX account_emailaddress_user_id_2c513194 ON public.account_emailaddress USING btree (user_id);


--
-- Name: account_emailconfirmation_email_address_id_5b7f8c58; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX account_emailconfirmation_email_address_id_5b7f8c58 ON public.account_emailconfirmation USING btree (email_address_id);


--
-- Name: account_emailconfirmation_key_f43612bd_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX account_emailconfirmation_key_f43612bd_like ON public.account_emailconfirmation USING btree (key varchar_pattern_ops);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- Name: core_artwork_slug_203b4571_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_artwork_slug_203b4571_like ON public.core_artwork USING btree (slug varchar_pattern_ops);


--
-- Name: core_billingaddress_user_id_3c220740; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_billingaddress_user_id_3c220740 ON public.core_billingaddress USING btree (user_id);


--
-- Name: core_item_slug_07f502d0; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_item_slug_07f502d0 ON public.core_item USING btree (slug);


--
-- Name: core_item_slug_07f502d0_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_item_slug_07f502d0_like ON public.core_item USING btree (slug varchar_pattern_ops);


--
-- Name: core_order_billing_address_id_b33cde99; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_order_billing_address_id_b33cde99 ON public.core_order USING btree (billing_address_id);


--
-- Name: core_order_items_order_id_c5dde6c1; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_order_items_order_id_c5dde6c1 ON public.core_order_items USING btree (order_id);


--
-- Name: core_order_items_orderitem_id_e44f86b6; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_order_items_orderitem_id_e44f86b6 ON public.core_order_items USING btree (orderitem_id);


--
-- Name: core_order_payment_id_e5a26a3c; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_order_payment_id_e5a26a3c ON public.core_order USING btree (payment_id);


--
-- Name: core_order_user_id_b03bbffd; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_order_user_id_b03bbffd ON public.core_order USING btree (user_id);


--
-- Name: core_orderitem_item_id_3b7d0c2e; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_orderitem_item_id_3b7d0c2e ON public.core_orderitem USING btree (item_id);


--
-- Name: core_orderitem_user_id_323fe695; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_orderitem_user_id_323fe695 ON public.core_orderitem USING btree (user_id);


--
-- Name: core_payment_user_id_274e164a; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_payment_user_id_274e164a ON public.core_payment USING btree (user_id);


--
-- Name: core_refund_order_id_7fe621fa; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX core_refund_order_id_7fe621fa ON public.core_refund USING btree (order_id);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: django_site_domain_a2e37b91_like; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX django_site_domain_a2e37b91_like ON public.django_site USING btree (domain varchar_pattern_ops);


--
-- Name: socialaccount_socialaccount_user_id_8146e70c; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX socialaccount_socialaccount_user_id_8146e70c ON public.socialaccount_socialaccount USING btree (user_id);


--
-- Name: socialaccount_socialapp_sites_site_id_2579dee5; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX socialaccount_socialapp_sites_site_id_2579dee5 ON public.socialaccount_socialapp_sites USING btree (site_id);


--
-- Name: socialaccount_socialapp_sites_socialapp_id_97fb6e7d; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX socialaccount_socialapp_sites_socialapp_id_97fb6e7d ON public.socialaccount_socialapp_sites USING btree (socialapp_id);


--
-- Name: socialaccount_socialtoken_account_id_951f210e; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX socialaccount_socialtoken_account_id_951f210e ON public.socialaccount_socialtoken USING btree (account_id);


--
-- Name: socialaccount_socialtoken_app_id_636a42d7; Type: INDEX; Schema: public; Owner: onbekend
--

CREATE INDEX socialaccount_socialtoken_app_id_636a42d7 ON public.socialaccount_socialtoken USING btree (app_id);


--
-- Name: account_emailaddress account_emailaddress_user_id_2c513194_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailaddress
    ADD CONSTRAINT account_emailaddress_user_id_2c513194_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: account_emailconfirmation account_emailconfirm_email_address_id_5b7f8c58_fk_account_e; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.account_emailconfirmation
    ADD CONSTRAINT account_emailconfirm_email_address_id_5b7f8c58_fk_account_e FOREIGN KEY (email_address_id) REFERENCES public.account_emailaddress(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_billingaddress core_billingaddress_user_id_3c220740_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_billingaddress
    ADD CONSTRAINT core_billingaddress_user_id_3c220740_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_order core_order_billing_address_id_b33cde99_fk_core_bill; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order
    ADD CONSTRAINT core_order_billing_address_id_b33cde99_fk_core_bill FOREIGN KEY (billing_address_id) REFERENCES public.core_billingaddress(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_order_items core_order_items_order_id_c5dde6c1_fk_core_order_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order_items
    ADD CONSTRAINT core_order_items_order_id_c5dde6c1_fk_core_order_id FOREIGN KEY (order_id) REFERENCES public.core_order(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_order_items core_order_items_orderitem_id_e44f86b6_fk_core_orderitem_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order_items
    ADD CONSTRAINT core_order_items_orderitem_id_e44f86b6_fk_core_orderitem_id FOREIGN KEY (orderitem_id) REFERENCES public.core_orderitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_order core_order_payment_id_e5a26a3c_fk_core_payment_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order
    ADD CONSTRAINT core_order_payment_id_e5a26a3c_fk_core_payment_id FOREIGN KEY (payment_id) REFERENCES public.core_payment(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_order core_order_user_id_b03bbffd_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_order
    ADD CONSTRAINT core_order_user_id_b03bbffd_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_orderitem core_orderitem_item_id_3b7d0c2e_fk_core_item_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_orderitem
    ADD CONSTRAINT core_orderitem_item_id_3b7d0c2e_fk_core_item_id FOREIGN KEY (item_id) REFERENCES public.core_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_orderitem core_orderitem_user_id_323fe695_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_orderitem
    ADD CONSTRAINT core_orderitem_user_id_323fe695_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_payment core_payment_user_id_274e164a_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_payment
    ADD CONSTRAINT core_payment_user_id_274e164a_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: core_refund core_refund_order_id_7fe621fa_fk_core_order_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.core_refund
    ADD CONSTRAINT core_refund_order_id_7fe621fa_fk_core_order_id FOREIGN KEY (order_id) REFERENCES public.core_order(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: socialaccount_socialtoken socialaccount_social_account_id_951f210e_fk_socialacc; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialtoken
    ADD CONSTRAINT socialaccount_social_account_id_951f210e_fk_socialacc FOREIGN KEY (account_id) REFERENCES public.socialaccount_socialaccount(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: socialaccount_socialtoken socialaccount_social_app_id_636a42d7_fk_socialacc; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialtoken
    ADD CONSTRAINT socialaccount_social_app_id_636a42d7_fk_socialacc FOREIGN KEY (app_id) REFERENCES public.socialaccount_socialapp(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: socialaccount_socialapp_sites socialaccount_social_site_id_2579dee5_fk_django_si; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp_sites
    ADD CONSTRAINT socialaccount_social_site_id_2579dee5_fk_django_si FOREIGN KEY (site_id) REFERENCES public.django_site(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: socialaccount_socialapp_sites socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialapp_sites
    ADD CONSTRAINT socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc FOREIGN KEY (socialapp_id) REFERENCES public.socialaccount_socialapp(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: socialaccount_socialaccount socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: onbekend
--

ALTER TABLE ONLY public.socialaccount_socialaccount
    ADD CONSTRAINT socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

