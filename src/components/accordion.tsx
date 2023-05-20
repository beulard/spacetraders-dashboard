import Button from "@atlaskit/button";
import IconChevronDown from "@atlaskit/icon/glyph/chevron-down";
import { ReactNode, useState } from "react";

const Accordion = (props: {
  isOpen: boolean;
  header: ReactNode;
  body: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  return (
    <div>
      <AccordionHeader isOpen={isOpen} setIsOpen={setIsOpen}>
        {props.header}
      </AccordionHeader>
      <AccordionBody isOpen={isOpen}>{props.body}</AccordionBody>
    </div>
  );
};

const AccordionHeader = (props: {
  isOpen: boolean;
  setIsOpen: Function;
  children: ReactNode;
}) => {
  return (
    <div style={{ margin: "0.2em" }}>
      <Button
        style={{
          alignItems: "center",
          width: "100%",
        }}
        appearance="default"
        onClick={() => props.setIsOpen(!props.isOpen)}
        iconAfter={
          <div
            style={{
              transform: props.isOpen ? "" : "rotate(-90deg)",
              transition: "transform 150ms ease",
            }}
          >
            <IconChevronDown label="" />
          </div>
        }
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flexGrow: 5, textAlign: "left" }}>
            {props.children}
          </span>
          <span
            style={{
              flexGrow: 1,
              textAlign: "right",
            }}
          ></span>
        </div>
      </Button>
    </div>
  );
};

const AccordionBody = (props: { isOpen: boolean; children: ReactNode }) => {
  return (
    <div
      style={{
        display: props.isOpen ? "block" : "none",
        padding: "1em",
      }}
    >
      {props.children}
    </div>
  );
};

export { Accordion };
