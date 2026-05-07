"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import {
  type CountryInsightsListResponse,
  type DepartmentInsightsListResponse,
  type EmployeeInsightsOverview,
  type HiringTrendResponse,
  type JobTitleInsightsListResponse,
  type TenureBandInsightsListResponse,
  listInsightsByCountryJobTitles
} from "../lib/dashboard-api";
import { formatCurrency } from "../lib/formatters";

type OverviewChartsProps = {
  overview: EmployeeInsightsOverview;
  countryInsights: CountryInsightsListResponse | null;
  departmentInsights: DepartmentInsightsListResponse | null;
  tenureBandInsights: TenureBandInsightsListResponse | null;
  hiringTrend: HiringTrendResponse | null;
  initialCountry: string | null;
  initialCountryJobTitleInsights: JobTitleInsightsListResponse | null;
};

type BarChartDatum = {
  label: string;
  value: number;
};

type TrendChartDatum = {
  label: string;
  value: number;
};

type ExpandablePanelShellProps = {
  panelId: string;
  title: string;
  expandedPanelId: string | null;
  onToggle: (panelId: string) => void;
  children: ReactNode;
};

function parseSalary(value: string | null) {
  if (value === null) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatCurrencyNumber(value: number, currency: string) {
  return formatCurrency(value.toFixed(2), currency);
}

function formatCountNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatMonthLabel(value: string) {
  const parsed = new Date(`${value}-01T00:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC"
  }).format(parsed);
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("a, button, input, label, option, select, textarea"));
}

function ExpandablePanelShell({
  panelId,
  title,
  expandedPanelId,
  onToggle,
  children
}: ExpandablePanelShellProps) {
  const isExpanded = expandedPanelId === panelId;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    onToggle(panelId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(panelId);
    }
  };

  return (
    <article
      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} panel`}
      aria-pressed={isExpanded}
      className={`dashboard-panel overview-chart-panel${isExpanded ? " overview-chart-panel-expanded" : ""}`}
      data-expanded={isExpanded ? "true" : "false"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {children}
    </article>
  );
}

function HorizontalBarChartContent({
  data,
  emptyMessage,
  ariaLabel,
  formatValue
}: {
  data: BarChartDatum[];
  emptyMessage: string;
  ariaLabel: string;
  formatValue: (value: number) => string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const width = 760;
    const height = Math.max(240, data.length * 38 + 90);
    const margin = { top: 16, right: 32, bottom: 42, left: 160 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (data.length === 0) {
      return;
    }

    const maxValue = d3.max(data, (item) => item.value) ?? 0;
    const x = d3
      .scaleLinear()
      .domain([0, maxValue * 1.08 || 1])
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleBand<string>()
      .domain(data.map((item) => item.label))
      .range([margin.top, height - margin.bottom])
      .padding(0.24);

    const xAxis = d3
      .axisBottom(x)
      .ticks(5)
      .tickFormat((value) => formatValue(Number(value)));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("class", "overview-chart-axis")
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "overview-chart-axis")
      .call(d3.axisLeft(y).tickSize(0))
      .call((g) => g.select(".domain").remove());

    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", x(0))
      .attr("y", (item) => y(item.label) ?? 0)
      .attr("height", y.bandwidth())
      .attr("width", (item) => x(item.value) - x(0))
      .attr("rx", 8)
      .attr("class", "overview-bar");

    svg
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("x", (item) => x(item.value) + 8)
      .attr("y", (item) => (y(item.label) ?? 0) + y.bandwidth() / 2 + 4)
      .attr("class", "overview-bar-label")
      .text((item) => formatValue(item.value));
  }, [data, formatValue]);

  if (data.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <svg
      aria-label={ariaLabel}
      className="overview-chart"
      preserveAspectRatio="xMidYMid meet"
      ref={svgRef}
      role="img"
    />
  );
}

function HorizontalBarChartPanel({
  panelId,
  expandedPanelId,
  onToggle,
  data,
  title,
  copy,
  emptyMessage,
  formatValue
}: {
  panelId: string;
  expandedPanelId: string | null;
  onToggle: (panelId: string) => void;
  data: BarChartDatum[];
  title: string;
  copy?: string;
  emptyMessage: string;
  formatValue: (value: number) => string;
}) {
  return (
    <ExpandablePanelShell
      expandedPanelId={expandedPanelId}
      onToggle={onToggle}
      panelId={panelId}
      title={title}
    >
      <h2>{title}</h2>
      {copy ? <p className="overview-chart-copy">{copy}</p> : null}
      <HorizontalBarChartContent
        ariaLabel={title}
        data={data}
        emptyMessage={emptyMessage}
        formatValue={formatValue}
      />
    </ExpandablePanelShell>
  );
}

function TrendBarChartPanel({
  panelId,
  expandedPanelId,
  onToggle,
  data,
  title,
  copy,
  emptyMessage
}: {
  panelId: string;
  expandedPanelId: string | null;
  onToggle: (panelId: string) => void;
  data: TrendChartDatum[];
  title: string;
  copy?: string;
  emptyMessage: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const width = 760;
    const height = 250;
    const margin = { top: 20, right: 16, bottom: 56, left: 48 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (data.length === 0) {
      return;
    }

    const x = d3
      .scaleBand<string>()
      .domain(data.map((item) => item.label))
      .range([margin.left, width - margin.right])
      .padding(0.24);

    const maxValue = d3.max(data, (item) => item.value) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1 || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("class", "overview-chart-axis")
      .call(d3.axisBottom(x))
      .call((group) => group.selectAll("text").attr("transform", "rotate(-30)").style("text-anchor", "end"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "overview-chart-axis")
      .call(d3.axisLeft(y).ticks(4).tickFormat((value) => formatCountNumber(Number(value))));

    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (item) => x(item.label) ?? 0)
      .attr("y", (item) => y(item.value))
      .attr("width", x.bandwidth())
      .attr("height", (item) => height - margin.bottom - y(item.value))
      .attr("rx", 8)
      .attr("class", "overview-column");

    svg
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("x", (item) => (x(item.label) ?? 0) + x.bandwidth() / 2)
      .attr("y", (item) => y(item.value) - 8)
      .attr("text-anchor", "middle")
      .attr("class", "overview-bar-label")
      .text((item) => formatCountNumber(item.value));
  }, [data]);

  return (
    <ExpandablePanelShell
      expandedPanelId={expandedPanelId}
      onToggle={onToggle}
      panelId={panelId}
      title={title}
    >
      <h2>{title}</h2>
      {copy ? <p className="overview-chart-copy">{copy}</p> : null}
      {data.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <svg
          aria-label={title}
          className="overview-chart"
          preserveAspectRatio="xMidYMid meet"
          ref={svgRef}
          role="img"
        />
      )}
    </ExpandablePanelShell>
  );
}

function SalaryDistributionChart({
  panelId,
  expandedPanelId,
  onToggle,
  overview
}: {
  panelId: string;
  expandedPanelId: string | null;
  onToggle: (panelId: string) => void;
  overview: EmployeeInsightsOverview;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const points = useMemo(() => {
    const min = parseSalary(overview.min_salary);
    const p25 = parseSalary(overview.p25_salary);
    const median = parseSalary(overview.median_salary);
    const p75 = parseSalary(overview.p75_salary);
    const max = parseSalary(overview.max_salary);

    if ([min, p25, median, p75, max].some((value) => value === null)) {
      return null;
    }

    return {
      min: min as number,
      p25: p25 as number,
      median: median as number,
      p75: p75 as number,
      max: max as number
    };
  }, [overview.max_salary, overview.median_salary, overview.min_salary, overview.p25_salary, overview.p75_salary]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const width = 760;
    const height = 220;
    const margin = { top: 28, right: 28, bottom: 48, left: 28 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (!points) {
      return;
    }

    const domainMin = Math.min(points.min, points.p25, points.median, points.p75, points.max);
    const domainMax = Math.max(points.min, points.p25, points.median, points.p75, points.max);
    const rangePadding = domainMax === domainMin ? 1 : 0;

    const x = d3
      .scaleLinear()
      .domain([domainMin - rangePadding, domainMax + rangePadding])
      .nice()
      .range([margin.left, width - margin.right]);

    const lineY = 108;

    svg
      .append("line")
      .attr("x1", x(points.min))
      .attr("x2", x(points.max))
      .attr("y1", lineY)
      .attr("y2", lineY)
      .attr("class", "overview-distribution-line");

    svg
      .append("rect")
      .attr("x", x(points.p25))
      .attr("y", lineY - 18)
      .attr("width", Math.max(1, x(points.p75) - x(points.p25)))
      .attr("height", 36)
      .attr("rx", 8)
      .attr("class", "overview-distribution-box");

    const markers = [
      { key: "Min", value: points.min },
      { key: "P25", value: points.p25 },
      { key: "Median", value: points.median },
      { key: "P75", value: points.p75 },
      { key: "Max", value: points.max }
    ];

    svg
      .append("g")
      .selectAll("circle")
      .data(markers)
      .join("circle")
      .attr("cx", (item) => x(item.value))
      .attr("cy", lineY)
      .attr("r", 6)
      .attr("class", (item) =>
        item.key === "Median" ? "overview-distribution-point overview-distribution-point-highlight" : "overview-distribution-point"
      );

    svg
      .append("g")
      .selectAll("text")
      .data(markers)
      .join("text")
      .attr("x", (item) => x(item.value))
      .attr("y", lineY - 24)
      .attr("text-anchor", "middle")
      .attr("class", "overview-distribution-key")
      .text((item) => item.key);

    svg
      .append("g")
      .selectAll("text")
      .data(markers)
      .join("text")
      .attr("x", (item) => x(item.value))
      .attr("y", lineY + 28)
      .attr("text-anchor", "middle")
      .attr("class", "overview-distribution-value")
      .text((item) => formatCurrencyNumber(item.value, overview.currency));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("class", "overview-chart-axis")
      .call(d3.axisBottom(x).ticks(5).tickFormat((value) => formatCurrencyNumber(Number(value), overview.currency)));
  }, [overview.currency, points]);

  return (
    <ExpandablePanelShell
      expandedPanelId={expandedPanelId}
      onToggle={onToggle}
      panelId={panelId}
      title="Salary distribution"
    >
      <h2>Salary distribution</h2>
      <p className="overview-chart-copy">Spread from minimum to maximum salary with quartiles and median.</p>
      {points ? (
        <svg
          aria-label="Salary distribution chart"
          className="overview-chart"
          preserveAspectRatio="xMidYMid meet"
          ref={svgRef}
          role="img"
        />
      ) : (
        <p>Distribution data is unavailable for this snapshot.</p>
      )}
    </ExpandablePanelShell>
  );
}

export function OverviewCharts({
  overview,
  countryInsights,
  departmentInsights,
  tenureBandInsights,
  hiringTrend,
  initialCountry,
  initialCountryJobTitleInsights
}: OverviewChartsProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialCountry ?? countryInsights?.items[0]?.country ?? ""
  );
  const [jobTitleInsights, setJobTitleInsights] = useState<JobTitleInsightsListResponse | null>(
    initialCountryJobTitleInsights
  );
  const [jobTitleLoading, setJobTitleLoading] = useState(false);
  const [jobTitleFailed, setJobTitleFailed] = useState(false);
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);
  const usedInitialResponseRef = useRef(false);

  const togglePanelExpansion = (panelId: string) => {
    setExpandedPanelId((currentPanelId) => (currentPanelId === panelId ? null : panelId));
  };

  useEffect(() => {
    if (!selectedCountry) {
      setJobTitleInsights(null);
      setJobTitleFailed(false);
      return;
    }

    if (
      initialCountryJobTitleInsights &&
      selectedCountry === initialCountry &&
      !usedInitialResponseRef.current
    ) {
      usedInitialResponseRef.current = true;
      setJobTitleInsights(initialCountryJobTitleInsights);
      setJobTitleFailed(false);
      return;
    }

    let ignore = false;

    const run = async () => {
      setJobTitleLoading(true);
      setJobTitleFailed(false);

      try {
        const response = await listInsightsByCountryJobTitles(selectedCountry, 10, 0);

        if (!ignore) {
          setJobTitleInsights(response);
        }
      } catch {
        if (!ignore) {
          setJobTitleInsights(null);
          setJobTitleFailed(true);
        }
      } finally {
        if (!ignore) {
          setJobTitleLoading(false);
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [initialCountry, initialCountryJobTitleInsights, selectedCountry]);

  const countryAverageSalaryData = useMemo<BarChartDatum[]>(() => {
    if (!countryInsights) {
      return [];
    }

    return countryInsights.items
      .map((item) => {
        const averageSalary = parseSalary(item.average_salary);

        if (averageSalary === null) {
          return null;
        }

        return {
          label: item.country,
          value: averageSalary
        };
      })
      .filter((item): item is BarChartDatum => item !== null);
  }, [countryInsights]);

  const countryHeadcountData = useMemo<BarChartDatum[]>(() => {
    if (!countryInsights) {
      return [];
    }

    return [...countryInsights.items]
      .sort((left, right) => right.employee_count - left.employee_count || left.country.localeCompare(right.country))
      .map((item) => ({
        label: item.country,
        value: item.employee_count
      }));
  }, [countryInsights]);

  const departmentHeadcountData = useMemo<BarChartDatum[]>(() => {
    if (!departmentInsights) {
      return [];
    }

    return departmentInsights.items.map((item) => ({
      label: item.department,
      value: item.employee_count
    }));
  }, [departmentInsights]);

  const departmentAverageSalaryData = useMemo<BarChartDatum[]>(() => {
    if (!departmentInsights) {
      return [];
    }

    return departmentInsights.items
      .map((item) => {
        const averageSalary = parseSalary(item.average_salary);

        if (averageSalary === null) {
          return null;
        }

        return {
          label: item.department,
          value: averageSalary
        };
      })
      .filter((item): item is BarChartDatum => item !== null);
  }, [departmentInsights]);

  const jobTitleAverageSalaryData = useMemo<BarChartDatum[]>(() => {
    if (!jobTitleInsights) {
      return [];
    }

    return jobTitleInsights.items
      .map((item) => {
        const averageSalary = parseSalary(item.average_salary);

        if (averageSalary === null) {
          return null;
        }

        return {
          label: item.job_title,
          value: averageSalary
        };
      })
      .filter((item): item is BarChartDatum => item !== null);
  }, [jobTitleInsights]);

  const jobTitleSalaryRangeData = useMemo<BarChartDatum[]>(() => {
    if (!jobTitleInsights) {
      return [];
    }

    return jobTitleInsights.items
      .map((item) => {
        const salaryRange = parseSalary(item.salary_range);

        if (salaryRange === null) {
          return null;
        }

        return {
          label: item.job_title,
          value: salaryRange
        };
      })
      .filter((item): item is BarChartDatum => item !== null);
  }, [jobTitleInsights]);

  const tenureBandHeadcountData = useMemo<BarChartDatum[]>(() => {
    if (!tenureBandInsights) {
      return [];
    }

    return tenureBandInsights.items.map((item) => ({
      label: item.tenure_band,
      value: item.employee_count
    }));
  }, [tenureBandInsights]);

  const hiringTrendData = useMemo<TrendChartDatum[]>(() => {
    if (!hiringTrend) {
      return [];
    }

    return hiringTrend.items.map((item) => ({
      label: formatMonthLabel(item.month),
      value: item.hires_count
    }));
  }, [hiringTrend]);

  const selectedCountryLabel = selectedCountry || "No country selected";
  const jobTitleEmptyMessage = selectedCountry
    ? "No job title insights available for the selected country."
    : "Country insights are unavailable right now.";

  return (
    <section aria-label="Overview charts" className="overview-charts-grid">
      <SalaryDistributionChart
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        overview={overview}
        panelId="salary-distribution"
      />

      <HorizontalBarChartPanel
        data={countryAverageSalaryData}
        formatValue={(value) => formatCurrencyNumber(value, overview.currency)}
        emptyMessage="Country insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="country-average-salary"
        title="Average salary by country"
      />

      <HorizontalBarChartPanel
        copy="Workforce distribution across current operating countries."
        data={countryHeadcountData}
        formatValue={formatCountNumber}
        emptyMessage="Country headcount insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="country-headcount"
        title="Headcount by country"
      />

      <HorizontalBarChartPanel
        copy="Compare current team size across departments, including any unassigned employees."
        data={departmentHeadcountData}
        formatValue={formatCountNumber}
        emptyMessage="Department insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="department-headcount"
        title="Headcount by department"
      />

      <HorizontalBarChartPanel
        copy="Average pay by department highlights where salary benchmarks diverge across the org."
        data={departmentAverageSalaryData}
        formatValue={(value) => formatCurrencyNumber(value, overview.currency)}
        emptyMessage="Department pay insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="department-average-salary"
        title="Average salary by department"
      />

      <ExpandablePanelShell
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="job-title-average-salary"
        title="Average salary by job title"
      >
        <div className="overview-chart-panel-header">
          <h2>Average salary by job title</h2>
          <label className="overview-filter" htmlFor="overview-country-filter">
            <span>Country</span>
            <select
              id="overview-country-filter"
              onChange={(event) => setSelectedCountry(event.target.value)}
              value={selectedCountry}
            >
              {(countryInsights?.items ?? []).map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="overview-selected-country">Selected country: {selectedCountryLabel}</p>
        <p className="overview-chart-copy">Drill into pay benchmarks for the roles represented in the selected country.</p>

        {jobTitleLoading ? <p>Loading job title insights...</p> : null}
        {jobTitleFailed ? <p>Job title insights are unavailable right now.</p> : null}

        {!jobTitleLoading && !jobTitleFailed ? (
          <HorizontalBarChartContent
            ariaLabel="Average salary by job title"
            data={jobTitleAverageSalaryData}
            emptyMessage={jobTitleEmptyMessage}
            formatValue={(value) => formatCurrencyNumber(value, overview.currency)}
          />
        ) : null}
      </ExpandablePanelShell>

      <HorizontalBarChartPanel
        copy={`Selected country: ${selectedCountryLabel}. Compare salary spread between the highest and lowest paid employees in each role.`}
        data={!jobTitleLoading && !jobTitleFailed ? jobTitleSalaryRangeData : []}
        formatValue={(value) => formatCurrencyNumber(value, overview.currency)}
        emptyMessage={jobTitleFailed ? "Job title salary spread insights are unavailable right now." : jobTitleEmptyMessage}
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="job-title-salary-range"
        title="Salary range by job title"
      />

      <HorizontalBarChartPanel
        copy="Tenure mix helps spot whether the workforce is weighted toward recent hiring or longer-term retention."
        data={tenureBandHeadcountData}
        formatValue={formatCountNumber}
        emptyMessage="Tenure insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="tenure-mix"
        title="Workforce tenure mix"
      />

      <TrendBarChartPanel
        copy="Monthly hiring counts for the trailing year surface hiring bursts and recent slowdown risk."
        data={hiringTrendData}
        emptyMessage="Hiring trend insights are unavailable right now."
        expandedPanelId={expandedPanelId}
        onToggle={togglePanelExpansion}
        panelId="hiring-trend"
        title="Hiring trend"
      />
    </section>
  );
}
