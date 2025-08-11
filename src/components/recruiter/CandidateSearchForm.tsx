// src/components/recruiter/CandidateSearchForm.tsx

import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";

import { callInitiateCandidateSearch } from "@/config/api";
import { ICandidate, IMeta } from "@/types/backend";

// --- PROPS NHẬN VỀ TỪ COMPONENT CHA ---
interface IProps {
  setIsSearching: (isSearching: boolean) => void;
  setCandidates: (candidates: ICandidate[]) => void;
  setMeta: (meta: IMeta | null) => void;
  setSearchId: (id: string | null) => void;
  onNewSearch: () => void;
}

const CandidateSearchForm = (props: IProps) => {
  const { setIsSearching, setCandidates, setMeta, setSearchId, onNewSearch } =
    props;

  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!jobDescription && !cvFile) {
      toast.error("Vui lòng nhập mô tả công việc hoặc tải lên file mô tả.");
      return;
    }

    // 1. Reset các state của lần tìm kiếm trước
    onNewSearch();
    setIsSearching(true);

    // 2. Chuẩn bị dữ liệu form
    const formData = new FormData();
    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }
    if (cvFile) {
      formData.append("file", cvFile);
    }

    try {
      // 3. Gọi API để bắt đầu phiên tìm kiếm mới
      const res = await callInitiateCandidateSearch(formData, 1, 10); // Bắt đầu từ trang 1, 10 kết quả/trang

      if (res.data?.candidates && res.data.candidates.length > 0) {
        // 4. Cập nhật state ở component cha với kết quả nhận được
        setCandidates(res.data.candidates);
        setMeta(res.data.meta);
        setSearchId(res.data.searchId);

        toast.success(
          `Tìm thấy ${res.data.candidates.length} ứng viên phù hợp!`
        );
      } else {
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra trong quá trình tìm kiếm.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5">Tìm kiếm ứng viên thông minh</Card.Header>
      <Card.Body>
        <p>
          Nhập mô tả công việc hoặc tải lên file mô tả để AI tìm giúp bạn những
          ứng viên phù hợp nhất.
        </p>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>1. Mô tả công việc (Job Description)</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="I. Mô tả công việc..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </Form.Group>

          <div className="text-center my-3 fw-bold">HOẶC</div>

          <Form.Group className="mb-3">
            <Form.Label>2. Tải lên một file mô tả</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  setCvFile(e.target.files[0]);
                }
              }}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            <i className="bi bi-search me-2"></i>
            Tìm kiếm
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CandidateSearchForm;
