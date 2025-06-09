import { Settings } from "@mui/icons-material";
import {
  IconAperture,
  IconBoxMultiple,
  IconBuildingCircus,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconNewSection,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard",
  },
  {
    navlabel: true,
    subheader: "CONTENIDO DEL MUSEO",
  },
  {
    id: uniqueId(),
    title: "Secciones",
    icon: IconCopy,
    href: "/utilities/SeccionesPage",
  },
  {
    id: uniqueId(),
    title: "Horarios Shows",
    icon: IconBuildingCircus,
    href: "/admin/horarios",
  },
  {
    navlabel: true,
    subheader: "EDUCACIÓN Y NOTICIAS",
  },
  {
    id: uniqueId(),
    title: "Noticias",
    icon: IconNewSection,
    href: "/admin/noticias",
  },
  {
    navlabel: true,
    subheader: " EXTRA",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: Settings,
    href: "/icons",
  },

];

export default Menuitems;


