import React from "react";
import Button from "@atlaskit/button";
import PageHeader from "@atlaskit/page-header";
import { Toaster } from "react-hot-toast";
import { Status } from "./status";
import { ContractList } from "./contract";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import { Map } from "./map";
import {
  Content,
  LeftSidebarWithoutResize,
  Main,
  PageLayout,
  TopNavigation,
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
      <div className="dashboard">
        <PageLayout>
          <TopNavigation>Dash</TopNavigation>
          <Content>
            <LeftSidebarWithoutResize isFixed={true}>
              <Button>qwe</Button>
              <p>2</p>
            </LeftSidebarWithoutResize>
            <Main>
              <Status />
              <Map />
              <ContractList />
            </Main>
          </Content>
        </PageLayout>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
