/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Header from "../../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";
import type { CommonPageProps } from "../../../Types/page";
import route from "ziggy-js";
import { useForm } from "@inertiajs/inertia-react";
import classNames from "classnames";

interface Props extends CommonPageProps {
    roles: Record<number, string>;
    user: {
        id: number;
        name: string;
        email: string;
        role_id: number;
    };
}

interface FormType {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id?: number;
}

const Index: React.FC<Props> = ({ roles, user }: Props) => {
    const { id: userId } = user;
    const { data, setData, errors, put, processing } = useForm<FormType>({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        role_id: user.role_id,
    });

    const submitForm = async (
        e:
            | React.MouseEvent<HTMLAnchorElement>
            | React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        await put(route("admin.users.update", userId));
    };

    return (
        <Form onSubmit={submitForm}>
            <Header title="New user" />
            <Container className="mt--7" fluid>
                <Row className="mb-2">
                    <Col lg={12} className="text-right">
                        <Nav
                            className="nav-fill flex-column-reverse flex-sm-row-reverse"
                            pills
                        >
                            <NavItem className="flex-grow-0">
                                <NavLink
                                    className="mb-sm-3 mb-md-0"
                                    onClick={submitForm}
                                    disabled={processing}
                                    href="#"
                                >
                                    <i className="fas fa-save mr-2" />
                                    Save
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <Card className="shadow">
                    <CardBody>
                        <FormGroup
                            className={classNames({
                                "has-danger": !!errors.name,
                            })}
                        >
                            <Label for="create-simulation-name">Name</Label>
                            <Input
                                id="create-simulation-name"
                                placeholder="Name"
                                type="text"
                                value={data.name}
                                invalid={!!errors.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            <FormFeedback
                                tag="span"
                                className="invalid-feedback"
                                style={{ display: "block" }}
                            >
                                <strong>{errors.name}</strong>
                            </FormFeedback>
                        </FormGroup>
                        <FormGroup
                            className={classNames({
                                "has-danger": !!errors.email,
                            })}
                        >
                            <Label for="create-simulation-email">E-mail</Label>
                            <Input
                                id="create-simulation-email"
                                placeholder="Email"
                                type="email"
                                autoComplete="new-email"
                                value={data.email}
                                invalid={!!errors.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <FormFeedback
                                tag="span"
                                className="invalid-feedback"
                                style={{ display: "block" }}
                            >
                                <strong>{errors.email}</strong>
                            </FormFeedback>
                        </FormGroup>
                        <FormGroup
                            className={classNames({
                                "has-danger": !!errors.password,
                            })}
                        >
                            <Label for="create-simulation-password">
                                Password (If empty password will not be changed)
                            </Label>
                            <Input
                                id="create-simulation-password"
                                placeholder="Password"
                                type="password"
                                autoComplete="new-password"
                                value={data.password}
                                invalid={!!errors.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <FormFeedback
                                tag="span"
                                className="invalid-feedback"
                                style={{ display: "block" }}
                            >
                                <strong>{errors.password}</strong>
                            </FormFeedback>
                        </FormGroup>
                        <FormGroup
                            className={classNames({
                                "has-danger": !!errors.password_confirmation,
                            })}
                        >
                            <Label for="create-simulation-password-confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="create-simulation-password-confirmation"
                                placeholder="Confirm Password"
                                type="password"
                                autoComplete="new-password-confirmation"
                                value={data.password_confirmation}
                                invalid={!!errors.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value
                                    )
                                }
                            />
                            <FormFeedback
                                tag="span"
                                className="invalid-feedback"
                                style={{ display: "block" }}
                            >
                                <strong>{errors.password_confirmation}</strong>
                            </FormFeedback>
                        </FormGroup>
                        <FormGroup
                            className={classNames({
                                "has-danger": !!errors.role_id,
                            })}
                        >
                            <Label for="create-simulation-role_id">Role</Label>
                            <Input
                                id="create-simulation-role_id"
                                type="select"
                                value={data.role_id}
                                invalid={!!errors.role_id}
                                onChange={(e) =>
                                    setData("role_id", +e.target.value)
                                }
                            >
                                {Object.entries(roles).map(([id, name]) => (
                                    <option value={id} key={id}>
                                        {name}
                                    </option>
                                ))}
                            </Input>
                            <FormFeedback
                                tag="span"
                                className="invalid-feedback"
                                style={{ display: "block" }}
                            >
                                <strong>{errors.role_id}</strong>
                            </FormFeedback>
                        </FormGroup>
                    </CardBody>
                </Card>
            </Container>
        </Form>
    );
};

export default Index;
