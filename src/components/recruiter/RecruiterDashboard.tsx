// src/components/recruiter/RecruiterDashboard.tsx
import { useState } from "react";
import { Tab, Tabs, Spinner } from "react-bootstrap";
import { useAppSelector } from "@/redux/hooks";
import CompanyForm from "./CompanyForm";
import CandidateSearchForm from "./CandidateSearchForm";
import CandidateResults from "./CandidateResults";
import { ICandidate } from "@/types/backend";

const RecruiterDashboard = () => {
  const user = useAppSelector((state) => state.account.user);
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<ICandidate[]>([]);

  return (
    <Tabs defaultActiveKey="find-candidates" className="mb-3">
      <Tab eventKey="company-info" title="Thông tin công ty">
        <CompanyForm initialData={user.company} />
      </Tab>
      <Tab eventKey="find-candidates" title="Tìm kiếm ứng viên (AI)">
        <CandidateSearchForm
          setIsSearching={setIsSearching}
          setCandidates={setCandidates}
        />
        {isSearching && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">
              AI đang phân tích, vui lòng chờ trong giây lát...
            </p>
          </div>
        )}
        {!isSearching && candidates.length > 0 && (
          <CandidateResults candidates={candidates} />
        )}
      </Tab>
      <Tab eventKey="manage-jobs" title="Quản lý tin tuyển dụng" disabled>
        {/* Sắp ra mắt */}
      </Tab>
    </Tabs>
  );
};

export default RecruiterDashboard;
