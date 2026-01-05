import { Card, Col, Input, Row } from "antd";

type TenantsFiltersProps = {
    children: React.ReactNode;
    onFilterChange: (filterName: string, filterValue: string) => void;
};

const TenantsFilter = ({ onFilterChange, children }: TenantsFiltersProps) => {
  return (
    <Card>
      <Row justify={"space-between"}>
        <Col span={16}>
          <Row gutter={"20px"}>
            <Col span={12}>
              <Input.Search
                placeholder="Search.."
                allowClear={true}
                onChange={(e) => onFilterChange("searchFilter", e.target.value)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={8} style={{ display: "flex", justifyContent: "end" }}>
          {children}
        </Col>
      </Row>
    </Card>
  );
};

export default TenantsFilter;
