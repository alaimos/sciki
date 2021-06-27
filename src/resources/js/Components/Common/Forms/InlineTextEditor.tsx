import React, { useState } from "react";
import {
    Button,
    ButtonProps,
    Input,
    InputGroup,
    InputGroupAddon,
    InputProps,
} from "reactstrap";
import classNames from "classnames";

interface Props {
    value: string;
    onChange: (newValue: string) => void;
    disabled?: boolean;
    allowEmpty?: boolean;
    inputProps?: Omit<
        Partial<InputProps>,
        "type" | "value" | "onChange" | "onKeyPress"
    >;
    editButtonProps?: Omit<Partial<ButtonProps>, "onClick">;
    submitButtonProps?: Omit<Partial<ButtonProps>, "onClick">;
}

const InlineTextEditor: React.FC<Props> = ({
    value: origValue,
    onChange,
    disabled = false,
    allowEmpty = false,
    inputProps = {},
    editButtonProps = {},
    submitButtonProps = {},
}: Props) => {
    const [value, setValue] = useState<string>(origValue);
    const [isEditorShown, setIsEditorShown] = useState(false);

    const handleUpdate = () => {
        const trimmedValue = value.trim();
        if (trimmedValue !== "" || allowEmpty) {
            onChange(trimmedValue);
        } else {
            setValue(origValue);
        }
        setIsEditorShown(false);
    };

    const { className, ...otherInputProps } = inputProps;

    return (
        <>
            {(!isEditorShown || disabled) && (
                <>
                    <span>
                        {value}{" "}
                        {!disabled && (
                            <Button
                                outline
                                color="success"
                                onClick={() => setIsEditorShown(true)}
                                {...editButtonProps}
                            >
                                <i className="fas fa-pencil-alt" />
                            </Button>
                        )}
                    </span>
                </>
            )}
            {isEditorShown && !disabled && (
                <>
                    <InputGroup>
                        <Input
                            className={classNames(
                                "form-control bg-light text-dark",
                                className
                            )}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdate();
                                }
                            }}
                            {...otherInputProps}
                        />
                        <InputGroupAddon addonType="prepend">
                            <Button
                                onClick={() => handleUpdate()}
                                {...submitButtonProps}
                            >
                                <i className="fas fa-save" />
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </>
            )}
        </>
    );
};

export default InlineTextEditor;
