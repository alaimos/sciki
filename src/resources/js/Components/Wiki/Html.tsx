import React from "react";

interface Props {
    content: string;
}

const Html: React.FC<Props> = ({ content }: Props) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export default Html;
