import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import Heading from "@theme/Heading";
import styles from "./index.module.css";
import "./timeLine.min.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import timeLineData from "./timeLineData";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title=""
      description="技术和生活"
    >
      <main>
        <div className="timeLine-container">
          <div className="entries">
            {timeLineData.map((item) => {
              return (
                <div className="entry" key={item.title}>
                  <div className="titleWrap">
                    <Link to={item.filePath + "/" + item.title} className="title">
                      {item.title}
                    </Link>
                    <div className="time"> {item.time} </div>
                  </div>

                  <div className="body">
                    <p>{item.abstract}</p>
                    {item.img ? (
                      <div
                        className="imgWrap"
                        style={{
                          background: `url(${useBaseUrl(
                            "/img/home/" + item.img
                          )})`,
                          color: "red",
                        }}
                      ></div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
}
