import SearchClient from "@/components/client/search.client";
import { Col, Divider, Row, Pagination } from "antd";
import styles from "styles/client.module.scss";
import JobCard from "@/components/client/card/job.card";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { clearJobs, fetchJob } from "@/redux/slice/jobSlide";

const ClientJobPage = () => {
  const dispatch = useAppDispatch();
  const { result, isFetching, meta } = useAppSelector((state) => state.job);
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (searchParams.get("search_type") === "ai") {
      // Đánh dấu là đã qua lần load đầu tiên để nếu người dùng
      // thực hiện search thường ngay sau đó, logic sẽ chạy đúng
      isInitialLoad.current = false;
      return;
    }
    const query = searchParams.toString();

    // BƯỚC 3: Áp dụng logic mới
    // Trường hợp 1: Lần đầu tiên component được tải (truy cập mới hoặc refresh)
    if (isInitialLoad.current) {
      isInitialLoad.current = false; // Đánh dấu không còn là lần đầu nữa
      // Luôn fetch dữ liệu: hoặc theo query trên URL (nếu có), hoặc fetch mặc định
      dispatch(fetchJob({ query: query || "sort=updatedAt,desc&size=6" }));
    } else {
      // Trường hợp 2: Component re-render do URL thay đổi (tức là người dùng vừa thực hiện hành động)
      if (query) {
        // Nếu có query mới -> là một lần tìm kiếm mới
        if (searchParams.get("search_type") === "ai") {
          return; // AI search đã có dữ liệu, không làm gì
        } else {
          dispatch(fetchJob({ query })); // Search thường
        }
      } else {
        // Nếu query rỗng -> người dùng vừa xóa tìm kiếm (vd: click header)
        // -> Chỉ xóa kết quả cũ, không fetch mặc định
        dispatch(clearJobs());
      }
    }
  }, [searchParams, dispatch]);

  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      return prev;
    });
  };

  return (
    <div className={styles["container"]} style={{ marginTop: 20 }}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <SearchClient />
        </Col>
        <Divider />
        <Col span={24}>
          <JobCard
            jobs={result}
            isLoading={isFetching}
            title="Kết Quả Tìm Kiếm"
            showPagination={true}
          />
        </Col>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px 0",
          }}
        >
          {/* BƯỚC 5: Chỉ hiển thị pagination nếu không phải AI search */}
          {!isFetching &&
            meta.total > 0 &&
            searchParams.get("search_type") !== "ai" && (
              <Pagination
                current={meta.page}
                total={meta.total}
                pageSize={meta.pageSize}
                onChange={handleOnchangePage}
                responsive
                showSizeChanger
              />
            )}
        </Col>
      </Row>
    </div>
  );
};

export default ClientJobPage;
