import { Settings } from "@mui/icons-material";
import {
  IconAperture,
  IconBoxMultiple,
  IconBuildingCircus,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
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
    href: "/utilities/HorariosShows",
  },
  {
    navlabel: true,
    subheader: "EDUCACIÓN Y NOTICIAS",
  },
  {
    id: uniqueId(),
    title: "Noticias",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Actividades Educativas",
    icon: IconUserPlus,
    href: "/authentication/register",
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
  {
    id: uniqueId(),
    title: "Sample Page",
    icon: IconAperture,
    href: "/sample-page",
  },

];

export default Menuitems;


