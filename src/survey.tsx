import { Card, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import EventEmitter from "eventemitter3";
import { useEffect, useState } from "react";
import { Survey, SurveyDeposit } from "./spacetraders-sdk";
import { SystemDB, SystemEvent } from "./system-db";
import { getSystemSymbol } from "./utils";
const { Text } = Typography;

class SurveyDatabase extends EventEmitter {
  private _surveys: Survey[];

  constructor() {
    super();
    this._surveys = [];
    const cachedSurveys = localStorage.getItem("surveys");
    if (cachedSurveys) {
      this._surveys = JSON.parse(cachedSurveys);
      this._surveys = this._surveys.filter((s) => {
        const date = new Date(s.expiration);
        return Date.now() < date.getTime();
      });
    }
  }

  public push(survey: Survey) {
    this._surveys.push(survey);
    this.emit("update", this._surveys);
    localStorage.setItem("surveys", JSON.stringify(this._surveys));
  }
  get all() {
    return this._surveys;
  }
}

const SurveyDB = new SurveyDatabase();

const SurveyList = () => {
  const [surveys, setSurveys] = useState<Survey[]>([...SurveyDB.all]);

  useEffect(() => {
    const onUpdate = (newSurveys: Survey[]) => {
      setSurveys([...newSurveys]);
      console.log("update -> ", newSurveys);
    };
    SurveyDB.addListener("update", onUpdate);
    return () => {
      SurveyDB.removeListener("update", onUpdate);
    };
  }, []);

  const columns: ColumnsType<Survey> = [
    // {
    //   title: "Location",
    //   key: "symbol",
    //   dataIndex: "symbol",
    // },
    {
      title: "Signature",
      key: "signature",
      dataIndex: "signature",
      render: (sig, survey) => (
        <button
          className="link-button"
          onClick={() => {
            const system = SystemDB.all.find(
              (sys) => sys.symbol === getSystemSymbol(survey.symbol)
            )!;
            SystemEvent.emit("locateWaypoint", {
              system: system,
              waypoint: system.waypoints.find(
                (w) => w.symbol === survey.symbol
              ),
            });
          }}
        >
          {sig}
        </button>
      ),
    },
    {
      title: "Size",
      key: "size",
      dataIndex: "size",
    },
    {
      title: "Deposits",
      key: "deposits",
      dataIndex: "deposits",
      render: (deposits: SurveyDeposit[]) =>
        deposits.map((d, idx) => (
          <Tag style={{ fontSize: "7pt" }} key={idx}>
            {d.symbol}
          </Tag>
        )),
    },
    {
      title: "Expiration",
      key: "expiration",
      dataIndex: "expiration",
      render: (exp) => {
        const date = new Date(exp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
    },
  ];

  console.log(surveys);

  return (
    <Card
      size="small"
      title={<Text className="small-heading">Surveys</Text>}
      type="inner"
      style={{ minWidth: "600px" }}
    >
      <Table
        className="small-table"
        rowClassName="table-row"
        size="small"
        columns={columns}
        dataSource={surveys}
        pagination={false}
      ></Table>
    </Card>
  );
};

export { SurveyDB, SurveyList };
