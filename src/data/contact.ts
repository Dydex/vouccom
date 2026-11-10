// TODO: replace with Vouccom's real contact details.
export const CONTACT = {
  email: "info@vouccom.ng",
  phone: "+234 812 345 6789",
  // The design shows placeholder text here.
  address: "Address placeholder,\nLagos, Nigeria.",
};

export type SocialLink = {
  id: string;
  label: string;
  /** Result of require("...png"): a white 4x export (80x80). */
  icon: number;
  url?: string;
};

// TODO: add the real profile links. The design shows the Facebook icon twice.
export const SOCIALS: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    icon: require("@/assets/images/social/Instagram.png"),
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: require("@/assets/images/social/Facebook.png"),
  },
  { id: "x", label: "X", icon: require("@/assets/images/social/X.png") },
  {
    id: "facebook2",
    label: "Facebook",
    icon: require("@/assets/images/social/Facebook.png"),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: require("@/assets/images/social/LinkedIn.png"),
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: require("@/assets/images/social/YouTube.png"),
  },
];
