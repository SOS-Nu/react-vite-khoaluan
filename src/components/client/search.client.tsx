import {
  Button,
  Col,
  Form,
  Row,
  Select,
  notification,
  Input,
  Upload,
} from "antd";
import {
  SearchOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  UploadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { LOCATION_LIST } from "@/config/utils";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { findJobsByAI } from "@/redux/slice/jobSlide";
import Typewriter from "typewriter-effect";
import "@/styles/stylespotfolio/search.client.scss";
import { useCurrentApp } from "../context/app.context";

const { Option } = Select;

const SearchClient = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchType, setSearchType] = useState("job");
  const [fileList, setFileList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme } = useCurrentApp();

  useEffect(() => {
    // CẬP NHẬT USEEFFECT ĐỂ ĐỌC CẢ THAM SỐ CỦA AI SEARCH
    const searchTypeParam = searchParams.get("search_type");
    const filterParam = searchParams.get("filter");
    const promptParam = searchParams.get("prompt");
    const locationParam = searchParams.get("location");

    if (searchTypeParam === "ai") {
      // Trường hợp là AI Search
      setSearchType("ai");
      form.setFieldsValue({
        searchQuery: promptParam,
        location: locationParam,
      });
    } else if (filterParam) {
      // Trường hợp là search thường
      if (location.pathname.startsWith("/job")) setSearchType("job");
      if (location.pathname.startsWith("/company")) setSearchType("company");

      const nameMatch = filterParam.match(/name~'([^']*)'/);
      const locationMatch = filterParam.match(/location~'([^']*)'/);
      const searchQueryValue = nameMatch ? nameMatch[1] : null;
      const savedLocationValue = locationMatch ? locationMatch[1] : null;

      form.setFieldsValue({
        searchQuery: searchQueryValue,
        location: savedLocationValue,
      });
    }
  }, [searchParams, form, location.pathname]);

  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const { searchQuery, location: locationValue } = values;

      if (searchType === "ai") {
        // ... (Phần còn lại của logic xác thực của bạn)

        let promptText =
          searchQuery || "Tìm công việc phù hợp dựa trên CV của tôi";
        const finalPrompt = promptText;

        if (locationValue && locationValue !== "tatca") {
          const locationObject = LOCATION_LIST.find(
            (loc) => loc.value === locationValue
          );
          if (locationObject) {
            promptText += ` ở ${locationObject.label}`;
          }
        }

        const formData = new FormData();
        formData.append("skillsDescription", promptText);
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("file", fileList[0].originFileObj);
        }

        // Đợi cho đến khi dispatch hoàn tất
        await dispatch(findJobsByAI({ formData })).unwrap(); // Sử dụng unwrap để bắt lỗi

        // Bây giờ điều hướng
        const params = new URLSearchParams();
        params.set("search_type", "ai");
        if (finalPrompt) {
          params.set("prompt", finalPrompt);
        }
        if (locationValue) {
          params.set("location", locationValue);
        }

        navigate(`/job?${params.toString()}`);
      } else {
        // Logic tìm kiếm thông thường không thay đổi
        let filterParts = [];
        if (searchQuery) filterParts.push(`name~'${searchQuery}'`);
        if (locationValue && locationValue !== "tatca")
          filterParts.push(`location~'${locationValue}'`);

        if (filterParts.length === 0) {
          const targetPath = searchType === "job" ? "/job" : "/company";
          navigate(targetPath);
          return;
        }

        const query = `filter=${filterParts.join(" and ")}&sort=updatedAt,desc`;
        const targetPath =
          searchType === "job" ? `/job?${query}` : `/company?${query}`;
        navigate(targetPath);
      }
    } catch (error) {
      console.error("Search failed:", error);
      notification.error({
        message: "Lỗi",
        description: "Quá trình tìm kiếm đã xảy ra lỗi. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleUploadChange = ({ fileList }: { fileList: any[] }) =>
    setFileList(fileList.slice(-1));
  const handleRemoveFile = () => {
    setFileList([]);
    return false;
  };

  const renderSearchInput = () => {
    switch (searchType) {
      case "ai":
        return (
          <div className="ai-input-wrapper">
            <Form.Item name="searchQuery" noStyle>
              <Input.TextArea
                placeholder="Nhập mô tả công việc bạn mong muốn, kỹ năng của bạn..."
                rows={1}
                bordered={false}
                autoSize={{ minRows: 1, maxRows: 1 }}
              />
            </Form.Item>
            <div className="ai-upload-container">
              {fileList.length > 0 ? (
                <div className="custom-upload-item">
                  <span className="file-name-text" title={fileList[0].name}>
                    {fileList[0].name}
                  </span>
                  <CloseOutlined
                    className="delete-icon"
                    onClick={handleRemoveFile}
                  />
                </div>
              ) : (
                <Upload
                  className="ai-upload-button"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />} type="text">
                    {" "}
                    Tải lên CV{" "}
                  </Button>
                </Upload>
              )}
            </div>
          </div>
        );
      case "company":
        return (
          <div className="ai-input-wrapper">
            <Form.Item name="searchQuery" noStyle>
              <Input
                placeholder="Nhập tên công ty bạn quan tâm..."
                bordered={false}
              />
            </Form.Item>
          </div>
        );
      case "job":
      default:
        return (
          <div className="ai-input-wrapper">
            <Form.Item name="searchQuery" noStyle>
              <Input
                placeholder="Nhập tên công việc, ví dụ: Java, Frontend, DevOps..."
                bordered={false}
              />
            </Form.Item>
          </div>
        );
    }
  };

  return (
    <div className="search-form-container">
      <div className="search-form-overlay">
        <Row justify="center">
          <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2
              style={{
                ...(theme === "dark"
                  ? {
                      background:
                        "linear-gradient(90deg, #1b74ff, #a880ff 96.79%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      fontWeight: 500,
                    }
                  : { color: "white" }),
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              <Typewriter
                options={{
                  strings: [
                    "Tìm Việc làm nhanh chóng ",
                    "mới nhất toàn quốc",
                    "Tìm Việc làm Bởi AI",
                  ],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 120,
                }}
              />
            </h2>
          </Col>
        </Row>
        <Form form={form} onFinish={onFinish}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={17}>
              <div className="search-input-wrapper">
                <Input.Group compact className="custom-input-group">
                  <Select
                    value={searchType}
                    onChange={(value) => setSearchType(value)}
                    className="search-type-select"
                    dropdownClassName="search-type-dropdown"
                  >
                    <Option value="job">
                      <SearchOutlined /> Tên Job
                    </Option>
                    <Option value="company">
                      <ApartmentOutlined /> Công ty
                    </Option>
                    <Option value="ai">
                      <FileTextOutlined /> Dùng AI
                    </Option>
                  </Select>
                  {renderSearchInput()}
                </Input.Group>
              </div>
            </Col>
            <Col xs={24} md={4}>
              <div className="search-input-wrapper">
                <div className="custom-input-group">
                  <Form.Item name="location" noStyle>
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .includes(
                            input
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                          )
                      }
                      notFoundContent="Không tìm thấy"
                      allowClear
                      showArrow
                      placeholder="Địa Điểm"
                      optionLabelProp="label"
                      options={LOCATION_LIST}
                      className="location-select-standalone"
                      dropdownClassName="search-type-dropdown"
                      style={{ width: "100%", paddingLeft: "6px" }}
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col xs={24} md={3}>
              {/* CẬP NHẬT NÚT TÌM KIẾM */}
              <Button
                type="primary"
                // Bỏ onClick vì Form sẽ tự xử lý
                className="search-action-button"
                loading={isLoading}
                // Thêm htmlType="submit" để Form nhận diện Enter
                htmlType="submit"
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default SearchClient;
