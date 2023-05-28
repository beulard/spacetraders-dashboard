import { Popover, Tag } from "antd";

const HoverTag = (props: {
  tooltip: string | undefined;
  text: string | number;
  color?: string;
}) => (
  <Popover content={props.tooltip} mouseEnterDelay={0.3}>
    <Tag color={props.color} className="hover-tag">
      {props.text}
    </Tag>
  </Popover>
);

export { HoverTag };
