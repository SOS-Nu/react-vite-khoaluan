import { Divider } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import ManageCV from "@/components/client/card/management.card";
import bg from "assets/section.svg";

const HomePage = () => {
  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      {/* <div
        style={{
          backgroundImage: `url(${bg})`,
          width: "100%",
          height: 500,
          position: "absolute",
          top: 0,
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      ></div> */}
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>

      <ManageCV />
      <div style={{ margin: 50 }}></div>
      <Divider />

      <JobCard />
      <Divider />
    </div>
  );
};

export default HomePage;
