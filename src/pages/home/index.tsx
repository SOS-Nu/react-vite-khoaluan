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
import { fetchCompany } from "@/redux/slice/companySlide";

const HomePage = () => {
  const dispatch = useAppDispatch();

  // Lấy dữ liệu jobs từ Redux
  const { result: jobsResult, isFetching: isJobFetching } = useAppSelector(
    (state) => state.job
  );

  // BƯỚC 2: Lấy dữ liệu companies từ Redux và đổi tên để tránh trùng lặp
  const { result: companiesResult, isFetching: isCompanyFetching } =
    useAppSelector((state) => state.company);

  // BƯỚC 3: Sửa lại useEffect để fetch cả job và company khi tải trang
  useEffect(() => {
    // Chỉ fetch dữ liệu mặc định cho trang chủ, không phụ thuộc vào searchParams
    const defaultJobQuery = "sort=updatedAt,desc&size=6";
    const defaultCompanyQuery = "sort=updatedAt,desc&size=6";

    dispatch(fetchJob({ query: defaultJobQuery }));
    dispatch(fetchCompany({ query: defaultCompanyQuery }));
  }, [dispatch]); // Chỉ chạy 1 lần khi component được mount
  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>

      <Partners />

      <ManageCV />
      <JobCard
        jobs={jobsResult}
        isLoading={isJobFetching}
        title="Công Việc Mới Nhất"
      />
      {/* <div style={{ margin: 50 }}></div> */}
      {/* <Divider /> */}

      <Divider />
      <CompanyCard
        companies={companiesResult}
        isLoading={isCompanyFetching}
        title="Nhà Tuyển Dụng Hàng Đầu"
      />
      <Divider />
      <Introduction />
      <Banner />
    </div>
  );
};

export default HomePage;
