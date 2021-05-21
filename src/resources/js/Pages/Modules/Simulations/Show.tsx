/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Header from "../../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    // Col,
    Container,
    // Nav,
    // NavItem,
    // NavLink,
    // Row,
} from "reactstrap";
import type { CommonPageProps } from "../../../Types/page";
import PathwaysTable from "../../../Components/Wiki/Plugins/Modules/Simulations/PathwaysTable";
// import axios from "axios";
// import route from "ziggy-js";
// import { InertiaLink } from "@inertiajs/inertia-react";

interface Props extends CommonPageProps {
    simulation: {
        id: number;
        name: string;
    };
    pathwaysToNames: Record<string, string>;
    nodesToNames: Record<string, string>;
}

const Index: React.FC<Props> = ({
    simulation,
    pathwaysToNames,
    nodesToNames,
}: Props) => {
    console.log(simulation, pathwaysToNames, nodesToNames);
    return (
        <>
            <Header title={simulation.name} />
            <Container className="mt--7" fluid>
                <Card className="shadow">
                    <CardBody>
                        <PathwaysTable simulation={simulation.id} sortable />
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Index;
