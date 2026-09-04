import dellLogo from "@/assets/dell.svg";
import hyperVLogo from "@/assets/hyperv.png";
import lenovoLogo from "@/assets/lenovo.png";
import microsoftLogo from "@/assets/microsoft.png";
import office365Logo from "@/assets/office-365.png";
import pax8Logo from "@/assets/pax8.png";
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
import veeamLogo from "@/assets/veeam.png";
import vmwareLogo from "@/assets/vmware.png";

export const company = {
  name: "EvaroTech Network Solutions",
  short: "EvaroTech",
  tagline: "Managing partnerships, providing solutions.",
  owner: "Tim J. Kroekenstoel, C.Tech",
  role: "Owner and Operator",
  phone: "+1 (613) 813-6245",
  phoneHref: "tel:+16138136245",
  email: "service@evarotech.ca",
  facebook: "https://www.facebook.com/evarotech.ca",
};export const services = [
  {
    title: "Network installation & management",
    body: "Configure, install and maintain firewalls, switches and network components — with hardened devices protecting the edge of your network.",
    image: serviceNetwork,
    alt: "Ethernet cables plugged into network equipment inside a server rack",
    caption: "Switches, patch panels and terminated cabling in a network rack",
    points: [
      "Firewalls, switches and VLAN design",
      "Wired and wireless site surveys",
      "Hardened edge security with monitoring",
    ],
  },
  {
    title: "Server implementation & management",
    body: "Physical and virtual server infrastructure, domain environments, and ongoing management of user security and permissions.",
    image: serviceServers,
    alt: "Corridor of server racks in a modern data center",
    caption: "Physical and virtual server environments",
    points: [
      "Physical and virtual server builds",
      "Active Directory, users and permissions",
      "Patch, backup and monitoring routines",
    ],
  },
  {
    title: "Wireless installation & management",
    body: "Indoor and outdoor wireless, building-to-building bridges, and guest network configuration that keeps visitors off your business systems.",
    image: serviceWireless,
    alt: "Modern wireless router with antennas on a desk",
    caption: "Access points deployed across the property",
    points: [
      "Access point design and rollout",
      "Building-to-building wireless links",
      "Separated staff and guest networks",
    ],
  },
  {
    title: "Cabling & camera systems",
    body: "Cable runs wired and terminated, cabinets and racks installed, plus camera system installation and management.",
    image: serviceCameras,
    alt: "Indoor security camera mounted on a ceiling inside a commercial space",
    caption: "Indoor camera systems installed on site",
    points: [
      "Cat5e, Cat6 and fibre cable runs",
      "Racks, cabinets and patch panels",
      "Indoor and outdoor camera systems",
    ],
  },
  {
    title: "Backup & disaster recovery",
    body: "Local backup paired with offsite and cloud copies, and recovery plans for data corruption and hardware failure.",
    image: serviceBackup,
    alt: "Laptop and external hard drives set up for data storage and backup",
    caption: "Local and offsite backup copies",
    points: [
      "Image-based backup appliances",
      "Offsite and cloud copies",
      "Recovery plans with test restores",
    ],
  },
  {
    title: "Computer setup & data transfer",
    body: "Workstation configuration, hardware and software installation, repairs, data transfer and data recovery.",
    image: serviceComputers,
    alt: "Technician repairing the motherboard of a laptop",
    caption: "Workstations configured and repaired",
    points: [
      "Workstation setup and migration",
      "Hardware and software installation",
      "Data transfer and data recovery",
    ],
  },
];

export const managed = [
  {
    title: "Managed Security Suite",
    body: "Endpoint detection and response, content filtering, patch management, plus remote access and monitoring — closing the gaps attackers look for and resolving issues without a site visit.",
    points: [
      "Endpoint detection and response on every device",
      "Content and web filtering for staff",
      "Automated patch and update management",
      "Remote monitoring and secure support access",
    ],
    software: [
      { name: "SolarWinds", logo: solarwindsLogo, website: "https://www.solarwinds.com" },
      { name: "Microsoft", logo: microsoftLogo, website: "https://www.microsoft.com/security/business" },
    ],
  },
  {
    title: "Managed Backup Solution",
    body: "A fully managed backup service with encrypted on-site and off-site copies, verified weekly so a restore is never a guess.",
    points: [
      "Image-based backup for servers and workstations",
      "Encrypted on-site and off-site copies",
      "Weekly verification and test restores",
      "Recovery coverage for corruption and hardware failure",
    ],
    software: [
      { name: "Veeam", logo: veeamLogo, website: "https://www.veeam.com" },
      { name: "StorageCraft", logo: storagecraftLogo, website: "https://www.storagecraft.com" },
    ],
  },
  {
    title: "Microsoft 365 Mail & Apps",
    body: "Exchange mail, Office applications, Teams, OneDrive and SharePoint, with spam filtering and cloud mail backup.",
    points: [
      "Exchange Online mail, calendars and contacts",
      "Word, Excel, PowerPoint and the Office apps",
      "Teams chat, meetings and collaboration",
      "OneDrive and SharePoint file storage",
      "Spam filtering and cloud mail backup",
    ],
    software: [
      { name: "Microsoft 365", logo: office365Logo, website: "https://www.microsoft.com/microsoft-365" },
    ],
  },
];

export const testimonials = [
  {
    quote:
      "We have had a very positive experience working with Tim for our organization's IT needs. He is professional, knowledgeable, reliable, and always willing to help when issues arise. His support has helped keep our systems running smoothly and has provided our staff with confidence knowing that assistance is available when needed. He communicates clearly, responds in a timely manner, and takes the time to understand the needs of our organization. We truly appreciate the quality of service, attention to detail, and ongoing support he provides. We would highly recommend his IT services to other organizations looking for dependable and professional technology support.",
    name: "Kelly Nolan, CEO",
    where: "St. Leonard's HPE",
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
    image: stepAssessment,
    alt: "Engineer inspecting network cables and connections inside a server room",
    caption: "Looking at the real environment in person",
    points: [
      "A walkthrough of your network, servers and backups",
      "How your team actually uses technology day to day",
      "A written summary of findings and priorities",
    ],
  },
  {
    title: "Right-sized solutions",
    body: "Recommendations scoped to your operation — no oversized platforms, no licences you will never use.",
    image: stepSolutions,
    alt: "Client and consultant smiling as they review options together on a laptop",
    caption: "Working through the right options together",
    points: [
      "Recommendations matched to how you operate",
      "No oversized platforms or unused licences",
      "Plain-language options with clear scope",
    ],
  },
  {
    title: "Certified execution",
    body: "Installation and configuration handled by a certified technician who stands behind the work.",
    image: stepExecution,
    alt: "Technician installing hardware into a server rack on site",
    caption: "Built and configured hands-on",
    points: [
      "Scheduled around your working hours",
      "Workmanship that follows vendor best practice",
      "Documentation and handover when it's done",
    ],
  },
  {
    title: "Ongoing partnership",
    body: "Managed packages keep systems patched, monitored and backed up long after install day.",
    image: stepPartnership,
    alt: "Laptop showing monitoring dashboards and system charts",
    caption: "Monitored and managed after install day",
    points: [
      "Scheduled monitoring, patching and maintenance",
      "Backups verified so a restore is never a guess",
      "Direct access to Tim when something breaks",
    ],
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
    name: "SolarWinds",
    logo: solarwindsLogo,
    website: "https://www.solarwinds.com",
    description: "Network monitoring and visibility that helps us find issues before they interrupt work.",
  },
  {
    name: "Pax8",
    logo: pax8Logo,
    website: "https://www.pax8.com",
    description: "Cloud marketplace and platform for sourcing, managing and billing Microsoft 365 and cloud security services.",
  },
  {
    name: "Dell",
    logo: dellLogo,
    website: "https://www.dell.com",
    description: "PowerEdge servers, storage and business PCs engineered for dependable everyday IT.",
  },
  {
    name: "Lenovo",
    logo: lenovoLogo,
    website: "https://www.lenovo.com",
    description: "Business laptops, desktops and workstations configured for dependable daily use.",
  },
  {
    name: "Microsoft 365",
    logo: office365Logo,
    website: "https://www.microsoft.com/microsoft-365",
    description: "Email, Teams, OneDrive, SharePoint and the connected tools your team uses every day.",
  },
  {
    name: "Microsoft HyperV",
    logo: hyperVLogo,
    website: "https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-technology-overview",
    description: "Microsoft's hypervisor platform for running multiple virtual machines on one physical server.",
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
  { label: "Managed Services", to: "/managed" },
  { label: "Client Approach", to: "/approach" },
  { label: "Client Feedback", to: "/clients" },
  { label: "Contact", to: "/contact" },
] as const;
