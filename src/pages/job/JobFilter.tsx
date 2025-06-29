// src/components/client/JobFilter.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const LEVELS = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR"];

interface IFilterData {
  levels: string[];
  salary: {
    min: string;
    max: string;
  };
}

interface IProps {
  onFilter: (filterData: IFilterData) => void;
}

const JobFilter = (props: IProps) => {
  const { onFilter } = props;
  const [searchParams] = useSearchParams();

  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");

  // =========================================================================
  // >>> THAY ĐỔI LOGIC ĐỌC THAM SỐ TỪ URL <<<
  // =========================================================================
  useEffect(() => {
    const searchType = searchParams.get("search_type");

    // Nếu là AI search, đọc các tham số riêng biệt
    if (searchType === "ai") {
      const levelsFromUrl = searchParams.getAll("level"); // Lấy tất cả giá trị 'level'
      const minSalaryFromUrl = searchParams.get("salary_min") || "";
      const maxSalaryFromUrl = searchParams.get("salary_max") || "";

      setSelectedLevels(levelsFromUrl);
      setMinSalary(minSalaryFromUrl);
      setMaxSalary(maxSalaryFromUrl);
    }
    // Nếu là search thường, giữ logic cũ
    else {
      const filterParam = searchParams.get("filter") || "";

      const levelMatches = filterParam.match(/level = '([^']*)'/g) || [];
      const currentLevels = levelMatches.map((match) =>
        match.replace(/level = '([^']*)'/, "$1")
      );
      setSelectedLevels(currentLevels);

      const minSalaryMatch = filterParam.match(/salary >= (\d+)/);
      setMinSalary(minSalaryMatch ? minSalaryMatch[1] : "");

      const maxSalaryMatch = filterParam.match(/salary <= (\d+)/);
      setMaxSalary(maxSalaryMatch ? maxSalaryMatch[1] : "");
    }
  }, [searchParams]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedLevels((prev) =>
      checked ? [...prev, value] : prev.filter((level) => level !== value)
    );
  };

  const handleApplyFilter = () => {
    onFilter({
      levels: selectedLevels,
      salary: {
        min: minSalary,
        max: maxSalary,
      },
    });
  };

  return (
    // ... JSX return không đổi ...
    <div className="job-filter-container bg-dark p-3 rounded mb-4 border border-secondary">
      <div className="row g-3 align-items-end">
        {/* Level Filter */}
        <div className="col-12 col-md-6">
          <label className="form-label text-white-50">Trình độ (Level)</label>
          <div className="d-flex flex-wrap gap-3">
            {LEVELS.map((level) => (
              <div className="form-check" key={level}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={level}
                  id={`level-${level}`}
                  checked={selectedLevels.includes(level)}
                  onChange={handleLevelChange}
                />
                <label
                  className="form-check-label text-white"
                  htmlFor={`level-${level}`}
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Filter */}
        <div className="col-12 col-md-4">
          <label className="form-label text-white-50">Mức lương (VND)</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              placeholder="Từ"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
            <span className="input-group-text">-</span>
            <input
              type="number"
              className="form-control"
              placeholder="Đến"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="col-12 col-md-2">
          <button className="btn btn-primary w-100" onClick={handleApplyFilter}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilter;
