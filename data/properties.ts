/**
 * PROPERTY DATA
 *
 * This file contains the Property type and the properties array.
 * To add or edit properties, modify the 'properties' array below.
 */

export const MAX_PROPERTIES = 50;

export type PropertyType = "venta" | "renta";
export type Currency = "MXN" | "USD";

export interface Property {
  id: string;
  slug: string; // Friendly URL (e.g. "departamento-reforma-123")
  title: string;
  description: string;
  /** English translation of the title (optional). Falls back to `title`. */
  titleEn?: string;
  /** English translation of the description (optional). Falls back to `description`. */
  descriptionEn?: string;
  type: PropertyType;
  price: number;
  currency: Currency;
  location: string; // Address or neighborhood
  city: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number; // Area in m²
  featured?: boolean; // If true, shows in the featured section on the home page
  images: string[]; // Image URLs
  tourUrl?: string; // Optional virtual tour URL (Matterport, YouTube, Vimeo, etc.)
}

export const properties: Property[] = [
  {
    id: "1",
    slug: "casa-moderna-santa-fe",
    title: "Casa Moderna en Santa Fe",
    description: "Casa contemporánea con diseño arquitectónico único. Amplios espacios, jardín privado, terraza con vista y cocina integral de alta gama. Ubicada en una zona residencial exclusiva con fácil acceso a centros comerciales y corporativos.",
    titleEn: "Modern House in Santa Fe",
    descriptionEn: "Contemporary house with a unique architectural design. Spacious rooms, a private garden, a terrace with views and a high-end fitted kitchen. Located in an exclusive residential area with easy access to shopping and business centers.",
    type: "venta",
    price: 12500000,
    currency: "MXN",
    location: "Santa Fe",
    city: "Ciudad de México",
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    area: 320,
    featured: true,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"],
    tourUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
  },
  {
    id: "2",
    slug: "departamento-renta-roma",
    title: "Departamento en Renta - Roma Norte",
    description: "Acogedor departamento en una de las zonas más vibrantes de la ciudad. Cerca de restaurantes, cafeterías y vida nocturna. Ideal para jóvenes profesionales. Incluye todos los servicios y está listo para habitar.",
    titleEn: "Apartment for Rent - Roma Norte",
    descriptionEn: "Cozy apartment in one of the city's most vibrant neighborhoods. Close to restaurants, cafés and nightlife. Ideal for young professionals. Includes all utilities and is move-in ready.",
    type: "renta",
    price: 25000,
    currency: "MXN",
    location: "Roma Norte",
    city: "Ciudad de México",
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    area: 85,
    featured: false,
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
  },
  {
    id: "3",
    slug: "penthouse-lujo-reforma",
    title: "Penthouse de Lujo en Reforma",
    description: "Exclusivo penthouse con terraza privada y vista 360° de la ciudad. Acabados premium, cocina italiana, sistema de domótica y acceso a piscina y gimnasio. La oportunidad perfecta para vivir en el corazón financiero de la ciudad.",
    titleEn: "Luxury Penthouse in Reforma",
    descriptionEn: "Exclusive penthouse with a private terrace and 360° views of the city. Premium finishes, an Italian kitchen, a home automation system and access to a pool and gym. The perfect opportunity to live in the city's financial heart.",
    type: "venta",
    price: 18500000,
    currency: "MXN",
    location: "Paseo de la Reforma",
    city: "Ciudad de México",
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 250,
    featured: true,
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"],
  },
  {
    id: "4",
    slug: "casa-renta-coyoacan",
    title: "Casa en Renta - Coyoacán",
    description: "Encantadora casa tradicional con patio central y mucho carácter. Ubicada en una calle tranquila del histórico barrio de Coyoacán. Perfecta para familias que buscan un ambiente tranquilo y cercano a parques y escuelas.",
    titleEn: "House for Rent - Coyoacán",
    descriptionEn: "Charming traditional house with a central courtyard and plenty of character. Located on a quiet street in the historic neighborhood of Coyoacán. Perfect for families looking for a peaceful setting close to parks and schools.",
    type: "renta",
    price: 35000,
    currency: "MXN",
    location: "Coyoacán",
    city: "Ciudad de México",
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: 200,
    featured: false,
    images: ["https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
  }
];

/**
 * Helper to get a property by slug.
 */
export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

/**
 * Helper to get featured properties.
 */
export function getFeaturedProperties(): Property[] {
  return properties.filter((property) => property.featured === true);
}

/**
 * Helper to get the unique cities across all properties.
 */
export function getUniqueCities(): string[] {
  const cities = properties.map((property) => property.city);
  return Array.from(new Set(cities));
}

/**
 * Returns a copy of the property with text fields in the given locale.
 * For "en" it uses titleEn/descriptionEn when present; otherwise Spanish.
 * Price, currency, city and location are kept intact (local context).
 */
export function localizeProperty(property: Property, locale?: string): Property {
  if (locale !== "en") return property;
  return {
    ...property,
    title: property.titleEn ?? property.title,
    description: property.descriptionEn ?? property.description,
  };
}

/** Applies localizeProperty to a list of properties. */
export function localizeProperties(
  list: Property[],
  locale?: string
): Property[] {
  return list.map((property) => localizeProperty(property, locale));
}
