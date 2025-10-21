import { Divider } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import ManageCV from "@/components/client/card/management.card";
import Banner from "@/components/client/introduction/banner";
import Introduction from "@/components/client/introduction/introduction";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
// >> THÊM MỚI: import useState
import { useEffect, useState } from "react";
import { fetchJob } from "@/redux/slice/jobSlide";
import { fetchCompany } from "@/redux/slice/companySlide";
import { Container } from "react-bootstrap";
import Skill from "../skill";
import { IUser } from "@/types/backend";
import { useTranslation } from "react-i18next";
import bg from "assets/top-bg.svg";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation(); // Lấy hàm t từ hook

  // >> THÊM MỚI: Thêm state để quản lý search type cho SearchClient
  const [currentSearchType, setCurrentSearchType] = useState("job");

  const { result: jobsResult, isFetching: isJobFetching } = useAppSelector(
    (state) => state.job
  );

  const { result: companiesResult, isFetching: isCompanyFetching } =
    useAppSelector((state) => state.company);

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user) as IUser;

  useEffect(() => {
    if (isAuthenticated && user?.company) {
      navigate("/recruiter", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const defaultJobQuery = "sort=updatedAt,desc&size=6";
    const defaultCompanyQuery = "sort=updatedAt,desc&size=6";

    dispatch(fetchJob({ query: defaultJobQuery, user }));
    dispatch(fetchCompany({ query: defaultCompanyQuery }));
  }, [dispatch]);

  if (isAuthenticated && user?.company) {
    return null;
  }

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${bg})`,
          width: "100%",
          height: 500,
          position: "absolute",
          top: 50,
          backgroundRepeat: "repeat",
          zIndex: 0,
        }}
      ></div>
      <div className={`${styles["container"]} ${styles["home-section"]}`}>
        <div className="search-content" style={{ marginTop: 20 }}>
          <SearchClient
            searchType={currentSearchType}
            onSearchTypeChange={setCurrentSearchType}
          />
        </div>
        <ManageCV />
        <JobCard
          jobs={jobsResult}
          isLoading={isJobFetching}
          title={t("job.newjob")}
        />
        <Divider />
        <CompanyCard
          companies={companiesResult}
          isLoading={isCompanyFetching}
          title={t("company.newcompany")}
        />
        <Divider />
        <Introduction />
        <Banner />
        {/* <Partners /> */}
        <section>
          <Container>
            <Skill />
          </Container>
        </section>
      </div>
    </>
  );
};

export default HomePage;
