// What the code owns: images, logos, routes. Everything a visitor reads lives in
// `src/content/site-content.json` instead, so it can be edited on the server.
//
// Each editable list entry in that file carries an `id`, and the maps below key
// off it: a service or platform whose id has no image here is rendered without
// one rather than breaking, so an edit can't crash the page.
import dellLogo from "@/assets/dell.svg";
import hpeLogo from "@/assets/hpe.webp";
import hyperVLogo from "@/assets/hyperv.png";
import lenovoLogo from "@/assets/lenovo.png";
import merakiLogo from "@/assets/meraki.svg";
import microsoftLogo from "@/assets/microsoft.png";
import office365Logo from "@/assets/office-365.png";
import pax8Logo from "@/assets/pax8.png";
import sentineloneLogo from "@/assets/sentinelone.svg";
import serviceBackup from "@/assets/service-backup.jpg";
import serviceCameras from "@/assets/service-cameras.jpg";
import serviceComputers from "@/assets/service-computers.jpg";
import serviceNetwork from "@/assets/service-network.jpg";
import serviceServers from "@/assets/service-servers.jpg";
import serviceWireless from "@/assets/service-wireless.jpg";
import stepAssessment from "@/assets/step-assessment.jpg";
import stepExecution from "@/assets/step-execution.jpg";
import stepPartnership from "@/assets/step-partnership.jpg";
import stepSolutions from "@/assets/step-solutions.jpg";
import solarwindsLogo from "@/assets/solarwinds.png";
import storagecraftLogo from "@/assets/storagecraft.png";
import ubiquitiLogo from "@/assets/ubiquiti.png";
import veeamLogo from "@/assets/veeam.png";
import vmwareLogo from "@/assets/vmware.png";
import watchguardLogo from "@/assets/watchguard.svg";

import type { SiteContent } from "./content-store";

/**
 * Routes are code, labels are content. The pages never move without us, but the
 * words in the menu, the footer and the page curtain all come from the `nav`
 * section of the content file.
 */
export const nav = [
  { key: "home", to: "/" },
  { key: "services", to: "/services" },
  { key: "managed", to: "/managed" },
  { key: "approach", to: "/approach" },
  { key: "contact", to: "/contact" },
] as const;

export type NavKey = (typeof nav)[number]["key"];

export type GroupItem = SiteContent["services"]["partners"]["groups"][number]["items"][number];
export type ServiceItem = SiteContent["services"]["items"][number];
export type PackageItem = SiteContent["managed"]["packages"]["items"][number];

/** Platform logos, keyed by the `id` in the content file. */
export const platformLogos: Record<string, string> = {
  veeam: veeamLogo,
  storagecraft: storagecraftLogo,
  watchguard: watchguardLogo,
  meraki: merakiLogo,
  ubiquiti: ubiquitiLogo,
  solarwinds: solarwindsLogo,
  sentinelone: sentineloneLogo,
  m365: office365Logo,
  pax8: pax8Logo,
  hyperv: hyperVLogo,
  vmware: vmwareLogo,
  dell: dellLogo,
  lenovo: lenovoLogo,
  hpe: hpeLogo,
};

/** Logos for the software named inside each managed package. */
export const softwareLogos: Record<string, string> = {
  ...platformLogos,
  microsoft: microsoftLogo,
};

type Media = { image: string; alt: string };

/** Photos behind the Services accordion, keyed by service id. */
export const serviceMedia: Record<string, Media> = {
  network: {
    image: serviceNetwork,
    alt: "Ethernet cables plugged into network equipment inside a server rack",
  },
  servers: { image: serviceServers, alt: "Corridor of server racks in a modern data center" },
  wireless: { image: serviceWireless, alt: "Modern wireless router with antennas on a desk" },
  cabling: {
    image: serviceCameras,
    alt: "Indoor security camera mounted on a ceiling inside a commercial space",
  },
  backup: {
    image: serviceBackup,
    alt: "Laptop and external hard drives set up for data storage and backup",
  },
  computers: { image: serviceComputers, alt: "Technician repairing the motherboard of a laptop" },
};

/** Photos behind the Client Approach steps, keyed by step id. */
export const stepMedia: Record<string, Media> = {
  assessment: {
    image: stepAssessment,
    alt: "Engineer inspecting network cables and connections inside a server room",
  },
  solutions: {
    image: stepSolutions,
    alt: "Client and consultant smiling as they review options together on a laptop",
  },
  execution: {
    image: stepExecution,
    alt: "Technician installing hardware into a server rack on site",
  },
  partnership: {
    image: stepPartnership,
    alt: "Laptop showing monitoring dashboards and system charts",
  },
};

/** The hostname a platform's "Learn more" link points at, for display only. */
export function hostOf(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}
