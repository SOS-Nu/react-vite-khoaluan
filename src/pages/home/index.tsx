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
// BƯỚC 1: IMPORT useNavigate VÀ useLocation
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchJob } from "@/redux/slice/jobSlide";
import { fetchCompany } from "@/redux/slice/companySlide";
import { Container } from "react-bootstrap";
import Skill from "../skill";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // BƯỚC 2: KHỞI TẠO useNavigate

  // Lấy dữ liệu jobs từ Redux
  const { result: jobsResult, isFetching: isJobFetching } = useAppSelector(
    (state) => state.job
  );

  // Lấy dữ liệu companies từ Redux
  const { result: companiesResult, isFetching: isCompanyFetching } =
    useAppSelector((state) => state.company);

  // BƯỚC 3: LẤY THÔNG TIN USER TỪ REDUX
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);

  // BƯỚC 4: THÊM useEffect ĐỂ KIỂM TRA VÀ CHUYỂN HƯỚNG
  useEffect(() => {
    // Chỉ kiểm tra và chuyển hướng nếu người dùng đã được xác thực
    // và có thông tin công ty (user.company tồn tại)
    if (isAuthenticated && user?.company) {
      navigate("/recruiter", { replace: true });
      // { replace: true } sẽ thay thế trang hiện tại trong lịch sử duyệt web
      // để người dùng không thể nhấn "Back" quay lại trang chủ và bị redirect lặp lại.
    }
  }, [isAuthenticated, user, navigate]); // Dependencies của effect

  useEffect(() => {
    const defaultJobQuery = "sort=updatedAt,desc&size=6";
    const defaultCompanyQuery = "sort=updatedAt,desc&size=6";

    dispatch(fetchJob({ query: defaultJobQuery }));
    dispatch(fetchCompany({ query: defaultCompanyQuery }));
  }, [dispatch]);

  // Nếu đang trong quá trình chuyển hướng, có thể trả về null hoặc một loading spinner
  // để tránh hiển thị nội dung trang chủ trong giây lát.
  if (isAuthenticated && user?.company) {
    return null; // Hoặc <Loading />
  }

  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>
      <ManageCV />
      <JobCard
        jobs={jobsResult}
        isLoading={isJobFetching}
        title="Công Việc Mới Nhất"
      />
      <Divider />
      <CompanyCard
        companies={companiesResult}
        isLoading={isCompanyFetching}
        title="Nhà Tuyển Dụng Hàng Đầu"
      />
      <Divider />
      <Introduction />
      <Banner />
      <section>
        <Container>
          <Skill />
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
