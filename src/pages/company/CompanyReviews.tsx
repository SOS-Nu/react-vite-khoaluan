// src/components/company/CompanyReviews.tsx

import { IComment, ICompany, IModelPaginate } from "@/types/backend";
import { useEffect, useState } from "react";

import { callCreateComment, callFetchCommentsByCompany } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { Comment } from "@ant-design/compatible";
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  notification,
  Pagination,
  Rate,
  Skeleton,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSearchParams } from "react-router-dom";

dayjs.extend(relativeTime);

interface IProps {
  companyId: number;
  companyDetail?: ICompany;
  onCommentSuccess?: () => void;
}

const CompanyReviews = ({
  companyId,
  companyDetail,
  onCommentSuccess,
}: IProps) => {
  const [form] = Form.useForm();
  const [reviews, setReviews] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [meta, setMeta] = useState<IModelPaginate<IComment>["meta"] | null>(
    null,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated,
  );
  const currentUser = useAppSelector((state) => state.account.user);

  const fetchReviews = async () => {
    setIsLoading(true);
    const page = searchParams.get("review_page") || "1";
    const res = await callFetchCommentsByCompany(
      companyId.toString(),
      `page=${page}&size=5&sort=createdAt,desc`,
    );
    if (res?.data) {
      setReviews(res.data.result);
      setMeta(res.data.meta);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [searchParams, companyId]);

  const handleOnFinish = async (values: {
    comment: string;
    rating: number;
  }) => {
    if (!companyId) return;

    setIsSubmitting(true);
    try {
      const res = await callCreateComment({ ...values, companyId });

      // Tùy vào cách bạn config Axios Interceptor mà res có thể là data hoặc throw error
      if (res?.data) {
        notification.success({ message: "Gửi đánh giá thành công!" });
        form.resetFields();
        await fetchReviews();
        if (onCommentSuccess) {
          onCommentSuccess();
        }
      } else {
        // Trường hợp backend trả về 200 nhưng logic nghiệp vụ báo lỗi
        notification.error({
          message: "Có lỗi xảy ra",
          description: res?.message || "Vui lòng thử lại sau",
        });
      }
    } catch (error: any) {
      // Bắt lỗi 400, 401, 500... từ backend trả về
      console.error("Check review error:", error);
      notification.error({
        message: "Gửi đánh giá thất bại",
        description:
          error?.response?.data?.message || error?.message || "Lỗi hệ thống",
      });
    } finally {
      // Đảm bảo luôn tắt loading dù thành công hay thất bại
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(
      (prev) => {
        prev.set("review_page", page.toString());
        return prev;
      },
      { replace: true },
    );
  };

  return (
    <div className="company-reviews-container" style={{ marginTop: "20px" }}>
      {/* Form để lại đánh giá */}
      {isAuthenticated && companyDetail?.comment && (
        <Comment
          avatar={
            <Avatar>{currentUser.name?.substring(0, 2)?.toUpperCase()}</Avatar>
          }
          content={
            <>
              <Form form={form} onFinish={handleOnFinish}>
                <Form.Item
                  name="rating"
                  rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
                >
                  <Rate defaultValue={0} />
                </Form.Item>
                <Form.Item
                  name="comment"
                  rules={[
                    { required: true, message: "Vui lòng viết đánh giá!" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Viết đánh giá của bạn về công ty..."
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    htmlType="submit"
                    loading={isSubmitting}
                    type="primary"
                  >
                    Gửi đánh giá
                  </Button>
                </Form.Item>
              </Form>
            </>
          }
        />
      )}

      {/* Danh sách các đánh giá đã có */}
      {isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      ) : reviews.length > 0 ? (
        <List
          className="comment-list"
          header={`${meta?.total || 0} đánh giá`}
          itemLayout="horizontal"
          dataSource={reviews}
          renderItem={(item) => (
            <li>
              <Comment
                author={<a>{item.user.name}</a>}
                avatar={
                  <Avatar>
                    {item.user.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                }
                content={
                  <>
                    <Rate
                      disabled
                      allowHalf
                      value={item.rating}
                      style={{ fontSize: 14 }}
                    />
                    <p>{item.comment}</p>
                  </>
                }
                datetime={
                  <Tooltip
                    title={dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  >
                    <span>{dayjs(item.createdAt).fromNow()}</span>
                  </Tooltip>
                }
              />
            </li>
          )}
        />
      ) : (
        <Empty description="Chưa có đánh giá nào." />
      )}

      {meta && meta.total > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Pagination
            current={meta.page}
            total={meta.total}
            pageSize={meta.pageSize}
            onChange={handlePageChange}
            responsive
          />
        </div>
      )}
    </div>
  );
};

export default CompanyReviews;
