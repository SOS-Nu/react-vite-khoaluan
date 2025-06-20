import { Divider } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import ManageCV from "@/components/client/card/management.card";
import bg from "assets/section.svg";
import Banner from "@/components/client/introduction/banner";
import Partners from "@/components/client/introduction/partner";
import Introduction from "@/components/client/introduction/introduction";

const HomePage = () => {
  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>

      <Partners />
      <Introduction />
      <ManageCV />
      <JobCard />
      {/* <div style={{ margin: 50 }}></div> */}
      {/* <Divider /> */}

      <Divider />
      <CompanyCard />
      <Divider />
      <Banner />
    </div>
  );
};

export default HomePage;
