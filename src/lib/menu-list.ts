import { Dumbbell, FileText, Video, ClipboardList } from "lucide-react";
import { LucideIcon } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/exercises",
          label: "Ćwiczenia",
          icon: Dumbbell,
          submenus: [],
        },
        {
          href: "/workouts",
          label: "Konspekty",
          icon: FileText,
          submenus: [],
        },
        {
          href: "/planer",
          label: "Planer",
          icon: ClipboardList,
          submenus: [],
        },
        {
          href: "/analyser",
          label: "Wideo analizator",
          icon: Video,
          submenus: [],
        },
      ],
    },
  ];
}
