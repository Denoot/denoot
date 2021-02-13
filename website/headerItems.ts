import icons from "./icons.ts";
import { Theme } from "./build.ts";

interface HeaderItem {
    name?: string;
    path: string;
    icon?: string;
}

const headerItems: { [K in Theme]: HeaderItem[] } = {
    dark: [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "Getting started",
            path: "/getting-started",
        },
        {
            name: "Docs",
            path: "/creating-denoot-app",
        },
        {
            path: "?changeTheme",
            icon: icons.sun,

        },
        {
            name: "",
            icon: icons.gitHub,
            path: "https://github.com/Denoot/denoot",
        }
    ],
    light: [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "Getting started",
            path: "/getting-started",
        },
        {
            name: "Docs",
            path: "/creating-denoot-app",
        },
        {
            path: "?changeTheme",
            icon: icons.moon,

        },
        {
            name: "",
            icon: icons.gitHub,
            path: "https://github.com/Denoot/denoot",
        },
    ]
}


export default (theme: Theme) => {

    return headerItems[theme];

}