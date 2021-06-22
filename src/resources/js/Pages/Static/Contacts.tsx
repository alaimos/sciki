import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

const Index: React.FC = () => {
    return (
        <>
            <Header title="Contacts" headerBg="bg-gradient-red" />
            <Container className="mt--7" fluid>
                <Row>
                    <Col xl="8" className="mb-5 mb-xl-0">
                        <Card className="bg-gradient-default shadow">
                            <CardHeader className="bg-transparent">
                                <h2 className="mb-0 text-white">Authors</h2>
                            </CardHeader>
                            <CardBody className="text-white">
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
                                <p>
                                    Red Cross Blood Bank Foundation Curaçao and
                                    Curaçao Biomedical Health Research Institute
                                </p>
                                <ul>
                                    <li>Ashley J. Duits</li>
                                </ul>
                                <p>
                                    University of Naples Federico II, Shanghai
                                    University of Medicine and Health Sciences,
                                    and Insilico Medicine
                                </p>
                                <ul>
                                    <li>Evelyne Bischof</li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="4">
                        <Card className="shadow mt-2">
                            <CardHeader>
                                <h2 className="mb-0">Bug Reporting</h2>
                            </CardHeader>
                            <CardBody>
                                For bugs reporting, please open a new issue in
                                our GitHub repository:
                                <a
                                    href="https://github.com/alaimos/sciki/issues"
                                    className="ml-1"
                                >
                                    https://github.com/alaimos/sciki/issues
                                </a>
                                .
                            </CardBody>
                        </Card>
                        <Card className="shadow mt-2">
                            <CardHeader>
                                <h2 className="mb-0">
                                    Get help or suggestions
                                </h2>
                            </CardHeader>
                            <CardBody>
                                To get help or suggest new features, use our
                                community forum on GitHub:
                                <a
                                    href="https://github.com/alaimos/sciki/discussions"
                                    className="ml-1"
                                >
                                    https://github.com/alaimos/sciki/discussions
                                </a>
                                .
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Index;
