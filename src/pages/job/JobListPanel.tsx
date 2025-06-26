// src/components/client/panel/JobListPanel.tsx

import React from "react";
import { IJob } from "@/types/backend";
import JobCard from "@/components/client/card/job.card";

interface IProps {
  jobList: IJob[] | null;
  isLoading: boolean;
}

const JobListPanel = (props: IProps) => {
  const { jobList, isLoading } = props;

  // Component này không cần style layout đặc biệt nữa, nó chỉ là một danh sách.
  // CSS `isListPage` trong JobCard sẽ xử lý việc hiển thị các card theo hàng dọc.
  return (
    <div className="left-panel-container">
      <div className="left-panel-header">Danh sách việc làm</div>
      <div className="left-panel-body">
        <JobCard jobs={jobList} isLoading={isLoading} isListPage={true} />
      </div>
    </div>
  );
};

export default React.memo(JobListPanel);
