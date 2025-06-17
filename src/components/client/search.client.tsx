// SearchClient.js

import { Button, Col, Form, Row, Select, notification } from "antd";
import { EnvironmentOutlined, MonitorOutlined } from "@ant-design/icons";
import { LOCATION_LIST } from "@/config/utils";
import { ProForm } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { callFetchAllSkill } from "@/config/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Import file SCSS mới mà chúng ta sẽ tạo ở bước 2

const SearchClient = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const optionsLocations = LOCATION_LIST;
  const [form] = Form.useForm();
  const [optionsSkills, setOptionsSkills] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (location.search) {
      const queryLocation = searchParams.get("location");
      const querySkills = searchParams.get("skills");
      if (queryLocation) {
        form.setFieldValue("location", queryLocation.split(","));
      }
      if (querySkills) {
        form.setFieldValue("skills", querySkills.split(","));
      }
    }
  }, [location.search]);

  useEffect(() => {
    fetchSkill();
  }, []);

  const fetchSkill = async () => {
    let query = `page=1&size=100&sort=createdAt,desc`;

    const res = await callFetchAllSkill(query);
    if (res && res.data) {
      const arr =
        res?.data?.result?.map((item) => {
          return {
            label: item.name as string,
            value: (item.id + "") as string,
          };
        }) ?? [];
      setOptionsSkills(arr);
    }
  };

  const onFinish = async (values: any) => {
    let query = "";
    if (values?.location?.length) {
      query = `location=${values?.location?.join(",")}`;
    }
    if (values?.skills?.length) {
      query = values.location?.length
        ? query + `&skills=${values?.skills?.join(",")}`
        : `skills=${values?.skills?.join(",")}`;
    }

    if (!query) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: "Vui lòng chọn tiêu chí để search",
      });
      return;
    }
    navigate(`/job?${query}`);
  };

  return (
    // Container chính với ảnh nền và lớp phủ tối màu
    <div className="search-form-container">
      <div className="search-form-overlay">
        <Row justify="center">
          <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2>Việc Làm IT Cho Developer "Chất"</h2>
          </Col>
        </Row>
        <ProForm
          form={form}
          onFinish={onFinish}
          submitter={{ render: () => <></> }}
        >
          {/* ===== BẮT ĐẦU CẤU TRÚC HÀNG NGANG ===== */}
          <Row gutter={[16, 16]} align="middle">
            {/* 1. Ô tìm kiếm theo kỹ năng (rộng nhất) */}
            <Col xs={24} md={16}>
              <div className="search-input-wrapper">
                <ProForm.Item name="skills">
                  <Select
                    mode="multiple"
                    allowClear
                    showArrow
                    style={{ width: "100%" }}
                    placeholder={
                      <>
                        <MonitorOutlined /> Tìm theo kỹ năng...
                      </>
                    }
                    optionLabelProp="label"
                    options={optionsSkills}
                  />
                </ProForm.Item>
              </div>
            </Col>

            {/* 2. Ô tìm kiếm theo địa điểm */}
            <Col xs={24} md={5}>
              <div className="search-input-wrapper">
                <ProForm.Item name="location">
                  <Select
                    mode="multiple"
                    allowClear
                    showArrow
                    style={{ width: "100%" }}
                    placeholder={
                      <>
                        <EnvironmentOutlined /> Địa điểm...
                      </>
                    }
                    optionLabelProp="label"
                    options={optionsLocations}
                  />
                </ProForm.Item>
              </div>
            </Col>

            {/* 3. Nút Search */}
            <Col xs={24} md={3}>
              <Button
                type="primary"
                onClick={() => form.submit()}
                className="search-action-button"
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
          {/* ===== KẾT THÚC CẤU TRÚC HÀNG NGANG ===== */}
        </ProForm>
      </div>
    </div>
  );
};
export default SearchClient;
