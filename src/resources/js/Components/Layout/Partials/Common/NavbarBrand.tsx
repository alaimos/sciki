import React from "react";
import { NavbarBrand as NB } from "reactstrap";
import { InertiaLink } from "@inertiajs/inertia-react";
import route from "ziggy-js";

const NavbarBrand: React.FC = () => (
    <NB className="pt-0" tag={InertiaLink} href={route("wiki.index")}>
        {/*<img*/}
        {/*    alt={logo.imgAlt}*/}
        {/*    className="navbar-brand-img"*/}
        {/*    src={logo.imgSrc}*/}
        {/*/>*/}
        SciKi
    </NB>
);

export default NavbarBrand;
