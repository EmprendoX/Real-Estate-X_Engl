/**
 * CONTENIDO DE PÁGINA "SOBRE MÍ" Y SECCIÓN INTRO DEL HOME
 *
 * Todo el texto editorial vive acá. Para personalizar el sitio para otro
 * broker, basta con cambiar estos valores (sin tocar JSX).
 *
 * Variables de plantilla disponibles en los textos:
 *   {{city}}       → siteConfig.city
 *   {{brokerName}} → siteConfig.brokerName
 *
 * Estas variables se reemplazan automáticamente al renderizar.
 */

export interface AboutContent {
  /** URL de la foto del broker. Puede ser /images/foto.jpg o URL absoluta. */
  brokerPhoto: string;
  /** Rol mostrado debajo del nombre en la página About. */
  role: string;
  /** Sección "Sobre mí" del home — 3 párrafos cortos como teaser. */
  homeIntro: {
    heading: string;
    paragraphs: string[];
  };
  /** Bio extendida en la página /about (sección "Quién soy"). */
  bio: {
    heading: string;
    paragraphs: string[];
  };
  /** Sección "Cómo trabajo" en /about. */
  howIWork: {
    heading: string;
    intro: string;
    pillars: { title: string; description: string }[];
    outro?: string;
  };
  /** Sección "Por qué trabajar conmigo" en /about. */
  whyMe: {
    heading: string;
    items: { title: string; description: string }[];
  };
}

export const aboutContent: AboutContent = {
  brokerPhoto:
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
  role: "Agencia Inmobiliaria Boutique",

  homeIntro: {
    heading: "La agencia inmobiliaria de referencia en {{city}}",
    paragraphs: [
      "En {{brokerName}} representamos las propiedades más exclusivas de {{city}}. Un equipo curado de más de 25 asesores senior, cada uno especializado en zonas prime y segmentos de alto valor.",
      "No mostramos catálogos: diseñamos búsquedas. Cada cliente recibe un dossier personalizado con propiedades pre-filtradas por nuestros analistas, agendas coordinadas y asesoría legal y financiera integrada.",
      "Marcamos el estándar del mercado. Discreción absoluta, procesos impecables y resultados que hablan por nosotros.",
    ],
  },

  bio: {
    heading: "Quiénes somos",
    paragraphs: [
      "{{brokerName}} es una agencia inmobiliaria boutique fundada por profesionales del sector con trayectoria en desarrollos residenciales, comerciales y de alto patrimonio en {{city}}. Nacimos con una convicción: el mercado premium merece un nivel de servicio que la mayoría de las agencias tradicionales no está preparada para ofrecer.",
      "Hoy operamos con un equipo de 25 asesores, analistas de mercado y abogados especializados. Trabajamos por referidos y con carteras seleccionadas, lo que nos permite dedicar a cada operación el tiempo, la investigación y la discreción que exige.",
      "Nuestros clientes son familias, inversionistas y desarrolladores que valoran hacer las cosas bien la primera vez.",
    ],
  },

  howIWork: {
    heading: "Cómo trabajamos",
    intro:
      "Nuestra metodología se apoya en tres principios que definen cada operación que asesoramos:",
    pillars: [
      {
        title: "Estrategia antes que catálogo",
        description:
          "Comenzamos con una sesión de descubrimiento para entender objetivo, plazos y perfil patrimonial. Recién entonces activamos la búsqueda o la campaña de venta.",
      },
      {
        title: "Curaduría, no volumen",
        description:
          "Cada propiedad que ponemos sobre la mesa pasa por nuestro filtro de precio, ubicación, plusvalía y estado legal. Priorizamos la calidad del portafolio sobre la cantidad de opciones.",
      },
      {
        title: "Cierre integrado",
        description:
          "Coordinamos abogados, notarios, financieras y asesores fiscales bajo un único punto de contacto. Usted firma; nosotros nos encargamos del resto.",
      },
    ],
    outro:
      "Operamos con propiedades premium en {{city}}: residencias, penthouses, terrenos con potencial de desarrollo y activos comerciales seleccionados.",
  },

  whyMe: {
    heading: "Por qué elegir {{brokerName}}",
    items: [
      {
        title: "Equipo senior",
        description:
          "Más de 25 asesores con trayectoria comprobada en el mercado inmobiliario de {{city}}.",
      },
      {
        title: "Servicio boutique",
        description:
          "Portafolio curado, atención dedicada y acceso a operaciones off-market que no verá en portales.",
      },
      {
        title: "Discreción y confianza",
        description:
          "Contratos claros, comunicación directa y confidencialidad absoluta en cada operación.",
      },
      {
        title: "Resultados medibles",
        description:
          "Tiempos de venta por debajo del promedio de mercado y precios de cierre alineados a valuaciones profesionales.",
      },
    ],
  },
};

/**
 * Versión en inglés del contenido editorial. Mantiene las mismas variables de
 * plantilla ({{city}}, {{brokerName}}). El precio/contexto local no aplica aquí.
 */
export const aboutContentEn: AboutContent = {
  brokerPhoto:
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
  role: "Boutique Real Estate Agency",

  homeIntro: {
    heading: "The reference real estate agency in {{city}}",
    paragraphs: [
      "At {{brokerName}} we represent the most exclusive properties in {{city}}. A curated team of 25+ senior advisors, each one specialized in prime areas and high-value segments.",
      "We don't send catalogs — we design searches. Every client receives a personalized dossier of properties pre-filtered by our analysts, coordinated viewings, and integrated legal and financial advisory.",
      "We set the market standard. Absolute discretion, impeccable processes, and results that speak for themselves.",
    ],
  },

  bio: {
    heading: "Who we are",
    paragraphs: [
      "{{brokerName}} is a boutique real estate agency founded by industry professionals with backgrounds in residential, commercial, and high-net-worth developments across {{city}}. We started with one conviction: the premium market deserves a level of service that most traditional agencies aren't equipped to deliver.",
      "Today we operate with a team of 25 advisors, market analysts, and specialized attorneys. We work by referral and with selected portfolios, which lets us dedicate to each transaction the time, research, and discretion it demands.",
      "Our clients are families, investors, and developers who value getting things right the first time.",
    ],
  },

  howIWork: {
    heading: "How we work",
    intro:
      "Our approach rests on three principles that define every transaction we advise on:",
    pillars: [
      {
        title: "Strategy before catalog",
        description:
          "We begin with a discovery session to understand your objective, timeline, and portfolio profile. Only then do we activate the search or the sales campaign.",
      },
      {
        title: "Curation, not volume",
        description:
          "Every property we bring to the table passes our filter on price, location, appreciation potential, and legal standing. We prioritize portfolio quality over option count.",
      },
      {
        title: "Integrated closing",
        description:
          "We coordinate attorneys, notaries, financing, and tax advisors under a single point of contact. You sign; we handle the rest.",
      },
    ],
    outro:
      "We operate in the premium {{city}} market: residences, penthouses, development-ready land, and select commercial assets.",
  },

  whyMe: {
    heading: "Why choose {{brokerName}}",
    items: [
      {
        title: "Senior team",
        description:
          "25+ advisors with proven track record in the {{city}} real estate market.",
      },
      {
        title: "Boutique service",
        description:
          "Curated portfolio, dedicated attention, and access to off-market deals you won't see on public listings.",
      },
      {
        title: "Discretion and trust",
        description:
          "Clear contracts, direct communication, and absolute confidentiality on every transaction.",
      },
      {
        title: "Measurable results",
        description:
          "Sale timelines below market average and closing prices aligned with professional appraisals.",
      },
    ],
  },
};

/**
 * Devuelve el contenido editorial en el idioma dado. Para "en" usa la versión
 * en inglés; en cualquier otro caso, español.
 */
export function getAboutContent(locale?: string): AboutContent {
  return locale === "en" ? aboutContentEn : aboutContent;
}

/**
 * Reemplaza las variables de plantilla ({{city}}, {{brokerName}})
 * en cualquier string del contenido.
 */
export function renderTemplate(
  text: string,
  vars: { city: string; brokerName: string }
): string {
  return text
    .replace(/\{\{city\}\}/g, vars.city)
    .replace(/\{\{brokerName\}\}/g, vars.brokerName);
}
