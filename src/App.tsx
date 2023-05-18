import React from "react";
import Button from "@atlaskit/button";
import PageHeader from "@atlaskit/page-header";
import { Toaster } from "react-hot-toast";
import { Status } from "./status";
import { ContractList } from "./contract";
import { Map } from "./map";
import FleetList from "./fleet";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import {
  Content,
  LeftSidebarWithoutResize,
  Main,
  PageLayout,
} from "@atlaskit/page-layout";

function App() {
  const breadcrumbs = (
    <Breadcrumbs>
      <BreadcrumbsItem text="Home"></BreadcrumbsItem>
      <BreadcrumbsItem text="Map"></BreadcrumbsItem>
    </Breadcrumbs>
  );

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div className="dashboard">
        <PageHeader breadcrumbs={breadcrumbs}>Dash</PageHeader>
        <Status />
        <Map />
        <ContractList />
        <FleetList />
      </div>
      <div style={{ minHeight: "300px" }}>Footer</div>
    </div>
  );
}

export default App;
