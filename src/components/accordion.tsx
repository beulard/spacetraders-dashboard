import Button from "@atlaskit/button";
import IconChevronDown from "@atlaskit/icon/glyph/chevron-down";
import {
  Children,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  isValidElement,
  useState,
} from "react";

const Accordion = (props: PropsWithChildren<{}>) => {
  const [shown, setShown] = useState(true);
  return (
    <div>
      {Children.map(props.children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement, {
            setShown: setShown,
            shown: shown,
          });
        }
      })}
    </div>
  );
};

interface AccordionProps {
  setShown: Function;
  shown: boolean;
}

const AccordionHeader = (props: PropsWithChildren<AccordionProps>) => {
  return (
    <Button
      style={{
        alignItems: "center",
        width: "100%",
      }}
      appearance="default"
      onClick={() => props.setShown(!props.shown)}
      iconAfter={
        <div
          style={{
            transform: props.shown ? "" : "rotate(-90deg)",
            transition: "transform 150ms ease",
          }}
        >
          <IconChevronDown label="" />
        </div>
      }
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ flexGrow: 5, textAlign: "left" }}>{props.children}</span>
        <span
          style={{
            flexGrow: 1,
            textAlign: "right",
          }}
        ></span>
      </div>
    </Button>
  );
};

const AccordionBody = (props: PropsWithChildren<AccordionProps>) => {
  return (
    <div
      style={{
        display: props.shown ? "block" : "none",
        margin: "0.5em",
      }}
    >
      {props.children}
    </div>
  );
};

export { Accordion, AccordionBody, AccordionHeader };
