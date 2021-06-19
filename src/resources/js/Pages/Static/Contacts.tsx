import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Container } from "reactstrap";

const Index: React.FC = () => {
    return (
        <>
            <Header title="Contacts" headerBg="bg-gradient-red" />
            <Container className="mt--7" fluid>
                <div className="row">
                    <div className="col-xl-8 mb-5 mb-xl-0">
                        <div className="card bg-gradient-default shadow">
                            <div className="card-header bg-transparent">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h2 className="text-white mb-0">
                                            Authors
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body text-white">
                                <p>University of Catania</p>
                                <ul>
                                    <li>
                                        Salvatore Alaimo - Department of
                                        Clinical and Experimental Medicine
                                    </li>
                                    <li>
                                        Rosaria Valentina Rapicavoli -
                                        Department of Physics and Astronomy
                                    </li>
                                    <li>
                                        Alfredo Pulvirenti - Department of
                                        Clinical and Experimental Medicine
                                    </li>
                                    <li>
                                        Alfredo Ferro - Department of Clinical
                                        and Experimental Medicine
                                    </li>
                                </ul>
                                <p>Northwell Health</p>
                                <ul>
                                    <li>
                                        Naomi I. Maria - Institute of Molecular
                                        Medicine, The Feinstein Institutes for
                                        Medical Research
                                    </li>
                                </ul>
                                <p>New York University</p>
                                <ul>
                                    <li>
                                        Bud Mishra - Department of Computer
                                        Science, Courant Institute of
                                        Mathematical Sciences
                                    </li>
                                </ul>
                                <p>Red Cross Blood Bank Foundation Curaçao</p>
                                <ul>
                                    <li>Ashley J. Duits</li>
                                </ul>
                                <p>?</p>
                                <ul>
                                    <li>Evelyne Bischof</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="card shadow">
                            <div className="card-header bg-transparent">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h2 className="mb-0">
                                            Bug Reporting and Suggestions
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <p>
                                    For bugs reporting or suggestions on new
                                    features, please open a new issue in our
                                    GitHub repository:
                                    <a
                                        href="https://github.com/alaimos/sciki/issues"
                                        className="ml-1"
                                    >
                                        https://github.com/alaimos/sciki/issues
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default Index;
