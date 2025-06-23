import SearchClient from "@/components/client/search.client";
import { Col, Divider, Row, Pagination } from "antd";
import styles from "styles/client.module.scss";
import JobCard from "@/components/client/card/job.card";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchJob } from "@/redux/slice/jobSlide";

const ClientJobPage = () => {
  const dispatch = useAppDispatch();
  const { result, isFetching, meta } = useAppSelector((state) => state.job);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    dispatch(fetchJob({ query: query || "sort=updatedAt,desc&size=6" }));
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
          {!isFetching && meta.total > 0 && (
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
