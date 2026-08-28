import hpeLogo from "@/assets/hpe.webp";
import lenovoLogo from "@/assets/lenovo.png";
import microsoftLogo from "@/assets/microsoft.png";
import office365Logo from "@/assets/office-365.png";
import sherwebLogo from "@/assets/sherweb.png";
import solarwindsLogo from "@/assets/solarwinds.png";
import storagecraftLogo from "@/assets/storagecraft.png";
import veeamLogo from "@/assets/veeam.png";
import vmwareLogo from "@/assets/vmware.png";

export const company = {
  name: "EvaroTech Network Solutions",
  short: "EvaroTech",
  tagline: "Managing partnerships, providing solutions.",
  owner: "Tim J. Kroekenstoel, C.Tech",
  role: "Owner and Operator",
  address: ["34 Cattail Crescent", "Trenton, Ontario", "K8V 0J4"],
  phone: "+1 (613) 813-6245",
  phoneHref: "tel:+16138136245",
  email: "service@evarotech.ca",
  facebook: "https://www.facebook.com/evarotech.ca",
};

export const services = [
  {
    title: "Network installation & management",
    body: "Configure, install and maintain firewalls, switches and network components — with hardened devices protecting the edge of your network.",
  },
  {
    title: "Server implementation & management",
    body: "Physical and virtual server infrastructure, domain environments, and ongoing management of user security and permissions.",
  },
  {
    title: "Wireless installation & management",
    body: "Indoor and outdoor wireless, building-to-building bridges, and guest network configuration that keeps visitors off your business systems.",
  },
  {
    title: "Cabling & camera systems",
    body: "Cable runs wired and terminated, cabinets and racks installed, plus camera system installation and management.",
  },
  {
    title: "Backup & disaster recovery",
    body: "Local backup paired with offsite and cloud copies, and recovery plans for data corruption and hardware failure.",
  },
  {
    title: "Computer setup & data transfer",
    body: "Workstation configuration, hardware and software installation, repairs, data transfer and data recovery.",
  },
];

export const managed = [
  {
    title: "Managed Security Suite",
    body: "Endpoint detection and response, content filtering, patch management, plus remote access and monitoring — closing the gaps attackers look for and resolving issues without a site visit.",
  },
  {
    title: "Managed Backup Solution",
    body: "A fully managed backup service with encrypted on-site and off-site copies, verified weekly so a restore is never a guess.",
  },
  {
    title: "Microsoft 365 Mail & Apps",
    body: "Exchange mail, Office applications, Teams, OneDrive and SharePoint, with spam filtering and cloud mail backup.",
  },
];

export const testimonials = [
  {
    quote:
      "I had a massive emergency that needed to be corrected. I reached out for help and got more than help — fast to reply, and everything possible was done to find a solution. Fast, reliable and very honest, trustworthy service.",
    name: "Dan",
    where: "Goderich, Ontario",
  },
  {
    quote:
      "I run my own business and it is crucial that I stay operable at all times. Every time I needed help you would step me through it over the phone, and if I could not figure it out you came the same day and got me fixed up. Thank you Tim!",
    name: "Dean",
    where: "Huron Transmission",
  },
  {
    quote:
      "Tim was very efficient and knowledgeable when I had him help me with my computer problems. Will recommend — thanks for all your help.",
    name: "Joel Howes",
    where: "Howes Lawn & Landscape",
  },
];

export const principles = [
  {
    title: "On-site assessment",
    body: "We come to you, look at the real environment, and map what your business actually depends on.",
  },
  {
    title: "Right-sized solutions",
    body: "Recommendations scoped to your operation — no oversized platforms, no licences you will never use.",
  },
  {
    title: "Certified execution",
    body: "Installation and configuration handled by a certified technician who stands behind the work.",
  },
  {
    title: "Ongoing partnership",
    body: "Managed packages keep systems patched, monitored and backed up long after install day.",
  },
];

export const technologyPartners = [
  {
    name: "StorageCraft",
    logo: storagecraftLogo,
    website: "https://www.storagecraft.com",
    description: "Business continuity, image-based backup and fast recovery when systems fail.",
  },
  {
    name: "Veeam",
    logo: veeamLogo,
    website: "https://www.veeam.com",
    description: "Reliable backup and replication for virtual, cloud and physical workloads.",
  },
  {
    name: "Microsoft",
    logo: microsoftLogo,
    website: "https://www.microsoft.com",
    description: "Windows, Azure, security and productivity platforms for modern businesses.",
  },
  {
    name: "SherWeb",
    logo: sherwebLogo,
    website: "https://www.sherweb.com",
    description: "Cloud hosting, Microsoft solutions and managed services backed by Canadian support.",
  },
  {
    name: "Lenovo",
    logo: lenovoLogo,
    website: "https://www.lenovo.com",
    description: "Business laptops, desktops and workstations configured for dependable daily use.",
  },
  {
    name: "SolarWinds",
    logo: solarwindsLogo,
    website: "https://www.solarwinds.com",
    description: "Network monitoring and visibility that helps us find issues before they interrupt work.",
  },
  {
    name: "HP Enterprise",
    logo: hpeLogo,
    website: "https://www.hpe.com",
    description: "Servers, storage and infrastructure engineered to support growing operations.",
  },
  {
    name: "Office 365",
    logo: office365Logo,
    website: "https://www.microsoft.com/microsoft-365",
    description: "Email, Teams, OneDrive, SharePoint and the connected tools your team uses every day.",
  },
  {
    name: "VMware",
    logo: vmwareLogo,
    website: "https://www.vmware.com",
    description: "Virtualized server environments that make infrastructure flexible and resilient.",
  },
];

export const nav = [
  { label: "Services", to: "/services" },
  { label: "Managed", to: "/managed" },
  { label: "Approach", to: "/approach" },
  { label: "Clients", to: "/clients" },
  { label: "Contact", to: "/contact" },
] as const;
