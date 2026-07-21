/**
 * CENTRAL SITE CONFIGURATION
 *
 * This file contains all the configuration that needs to be customized
 * for each broker. To duplicate the site for another broker, you only need
 * to change the values in this file.
 */

export interface SiteConfig {
  // Site information
  siteName: string;
  siteUrl: string; // Absolute production site URL (e.g. "https://juanperez.com") without a trailing slash
  logoText: string;
  logoUrl?: string; // Logo image URL (optional)
  heroImage?: string; // Hero section background image URL (optional)
  primaryColor: string; // Primary color in hex format (e.g. "#0EA5E9")
  secondaryColor: string; // Secondary color in hex format (e.g. "#06B6D4")

  // Broker data
  businessType?: "broker" | "agencia" | "desarrollador"; // Type of account. Defaults to "broker"
  brokerName: string;
  agentsCount?: number; // Agency only: number of agents
  developmentName?: string; // Developer only: name of the project/development
  phone: string;
  whatsapp: string; // Number without spaces or special characters (e.g. "5215512345678")
  email: string;
  city: string;
  address: string;
  slogan: string;

  // Social media (optional)
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;

  // Automation hooks (optional)
  leadWebhookUrl?: string; // Webhook URL for sending leads (Make, Zapier, etc.)
  chatScript?: string; // Chat widget HTML/JS (Crisp, Intercom, Tidio, etc.)
}

export const siteConfig: SiteConfig = {
  // ============================================
  // SITE INFORMATION
  // ============================================
  siteName: "Cardone Real Estate",
  siteUrl: "https://realestatex.com",
  logoText: "Cardone Real Estate",
  logoUrl: undefined,
  heroImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920",
  primaryColor: "#008cb4",
  secondaryColor: "#004d65",

  // ============================================
  // BROKER DATA
  // ============================================
  businessType: "agencia",
  brokerName: "Cardone Real Estate",
  agentsCount: 25,
  developmentName: undefined,
  phone: "+52 55 1234 5678",
  whatsapp: "5215512345678",
  email: "contacto@realestatex.com",
  city: "Ciudad de México",
  address: "Av. Reforma 123, Col. Centro, CDMX",
  slogan: "Tu hogar ideal te está esperando",
  
  // ============================================
  // SOCIAL MEDIA
  // ============================================
  facebook: "https://facebook.com/tu-pagina",
  instagram: "https://instagram.com/tu-cuenta",
  tiktok: undefined,
  linkedin: undefined,
  website: undefined,
  
  // ============================================
  // AUTOMATIONS
  // ============================================
  leadWebhookUrl: undefined,
  chatScript: undefined,
};

