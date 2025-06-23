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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { fetchJob } from "@/redux/slice/jobSlide";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { result, isFetching, meta } = useAppSelector((state) => state.job);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    dispatch(fetchJob({ query: query || "sort=updatedAt,desc&size=6" }));
  }, [searchParams, dispatch]);

  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>

      <Partners />

      <ManageCV />
      <JobCard
        jobs={result}
        isLoading={isFetching}
        title="Công Việc Mới Nhất"
        showPagination={false}
      />
      {/* <div style={{ margin: 50 }}></div> */}
      {/* <Divider /> */}

      <Divider />
      <CompanyCard />
      <Divider />
      <Introduction />
      <Banner />
    </div>
  );
};

export default HomePage;
