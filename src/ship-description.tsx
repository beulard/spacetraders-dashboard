import { Divider, Popover, Space, Tag } from "antd";
import { Ship, ShipCargo, ShipMount, ShipReactor } from "./spacetraders-sdk";
import { HoverTag } from "./components/hover-tag";

export const ReactorDescription = (props: { reactor: ShipReactor }) => (
  <Space>
    Reactor
    <HoverTag tooltip={props.reactor.description} text={props.reactor.name} />
  </Space>
);

export const MountTag = (props: { mount: ShipMount }) => (
  <HoverTag tooltip={props.mount.description} text={props.mount.name} />
);

export const CargoInventory = (props: { cargo: ShipCargo }) => (
  <div>
    {props.cargo.inventory.map((item, idx) => (
      <Popover key={idx} content={item.description}>
        <Tag>{item.symbol}</Tag>
        <Tag>{item.units}</Tag>
      </Popover>
    ))}
  </div>
);

export const ShipDescription = (props: { ship: Ship }) => (
  <Space direction="vertical">
    {/* Symbol */}
    <Space>
      <big>
        <b>{props.ship.symbol}</b> <Tag>{props.ship.registration.role}</Tag>
      </big>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Crew */}
    <Space>
      <span>
        Crew{" "}
        <Tag>
          {props.ship.crew.capacity} / {props.ship.crew.required}
        </Tag>
      </span>
      <Tag>{props.ship.crew.rotation}</Tag>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Frame */}
    <Space>
      Frame
      <HoverTag
        tooltip={props.ship.frame.description}
        text={props.ship.frame.name}
      />
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Reactor */}
    <ReactorDescription reactor={props.ship.reactor} />

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Engine */}
    <Space>
      Engine
      <HoverTag
        tooltip={props.ship.engine.description}
        text={props.ship.engine.name}
      />
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Modules */}
    <div style={{ width: "300px" }}>
      <p>Modules</p>
      {props.ship.modules.map((module, idx) => (
        <Space key={idx} wrap size="small">
          <HoverTag tooltip={module.description} text={module.name} />
        </Space>
      ))}
    </div>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Mounts */}
    <div style={{ width: "300px" }}>
      <p>Mounts</p>
      {props.ship.mounts.map((mount, idx) => (
        <Space key={idx} wrap size={[6, 16]}>
          <MountTag mount={mount} />
        </Space>
      ))}
    </div>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Cargo */}
    <Space>
      Cargo
      <Popover content={<CargoInventory cargo={props.ship.cargo} />}>
        <Tag>
          {props.ship.cargo.units} / {props.ship.cargo.capacity}
        </Tag>
      </Popover>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Fuel */}
    <Space>
      Fuel
      <Tag>
        {props.ship.fuel.current} / {props.ship.fuel.capacity}
      </Tag>
    </Space>
  </Space>
);
