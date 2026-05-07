"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import {
  type CountryInsightsListResponse,
  type EmployeeInsightsOverview,
  type JobTitleInsightsListResponse,
  listInsightsByCountryJobTitles
} from "../lib/dashboard-api";
import { formatCurrency } from "../lib/formatters";

type OverviewChartsProps = {
  overview: EmployeeInsightsOverview;
  countryInsights: CountryInsightsListResponse | null;
  initialCountry: string | null;
  initialCountryJobTitleInsights: JobTitleInsightsListResponse | null;
};

type BarChartDatum = {
  label: string;
  value: number;
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

function CountryAverageSalaryChart({
  data,
  currency,
  title,
  emptyMessage
}: {
  data: BarChartDatum[];
  currency: string;
  title: string;
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
      .tickFormat((value) => formatCurrencyNumber(Number(value), currency));

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
      .text((item) => formatCurrencyNumber(item.value, currency));
  }, [currency, data]);

  return (
    <article className="dashboard-panel overview-chart-panel">
      <h2>{title}</h2>
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
    </article>
  );
}

function SalaryDistributionChart({
  overview
}: {
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
    <article className="dashboard-panel overview-chart-panel">
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
    </article>
  );
}

export function OverviewCharts({
  overview,
  countryInsights,
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
  const usedInitialResponseRef = useRef(false);

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

  return (
    <section aria-label="Overview charts" className="overview-charts-grid">
      <SalaryDistributionChart overview={overview} />

      <CountryAverageSalaryChart
        currency={overview.currency}
        data={countryAverageSalaryData}
        emptyMessage="Country insights are unavailable right now."
        title="Average salary by country"
      />

      <article className="dashboard-panel overview-chart-panel">
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

        {jobTitleLoading ? <p>Loading job title insights...</p> : null}
        {jobTitleFailed ? <p>Job title insights are unavailable right now.</p> : null}

        {!jobTitleLoading && !jobTitleFailed ? (
          <CountryAverageSalaryChart
            currency={overview.currency}
            data={jobTitleAverageSalaryData}
            emptyMessage="No job title insights available for the selected country."
            title="Job titles"
          />
        ) : null}
      </article>
    </section>
  );
}
