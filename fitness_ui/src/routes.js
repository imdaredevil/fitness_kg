
import Home from "./components/Home";
import Explore from "./components/Explore";


const routes = [
    {
        name: "Home",
        href: "/",
        component: Home,
    },
    {
        name: "Explore",
        href: "/explore",
        component: Explore,
    },
    {
        name: "Skills",
        href: "/skills",
        component: Home,
    },
    {
        name: "Projects",
        href: "/projects",
        component: Home,
    },
    {
        name: "Certifications",
        href: "/certifications",
        component: Home,
    },
    {
        name: "Awards",
        href: "/awards",
        component: Home,
    },
];

export default routes;