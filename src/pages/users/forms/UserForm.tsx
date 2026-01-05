import { useQuery } from "@tanstack/react-query";
import { Card, Col, Form, Input, Row, Select, Space } from "antd";
import { getTenants } from "../../../http/api";
import type { Tenant } from "../../../types";

const UserForm = () => {
    const {
        data: tenants
      } = useQuery({
        queryKey: ["tenants"],
        queryFn: async () => {
          const res = await getTenants();
          console.log("Fetch data: ", res);
          return res.data;
        },
      });

  return (
    <Row>
      <Col span={24}>
        <Space vertical size={"large"}>
          <Card title="Basic Info">
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="First name" name={"firstName"}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Last name" name={"lastName"}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name={"email"}>
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Security Info">
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="Password" name={"password"}>
                  <Input size="large" type={"password"} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Role and Tenant">
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="Role" name={"role"}>
                  <Select
                    size="large"
                    style={{ width: "100%" }}
                    allowClear={true}
                    placeholder="Select Role"
                  >
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="manager">Manager</Select.Option>
                    <Select.Option value="customer">Customer</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tenant" name={"tenantId"}>
                  <Select
                    size="large"
                    style={{ width: "100%" }}
                    allowClear={true}
                    placeholder="Select Restaurant"
                  >
                    {
                        tenants?.map((tenant: Tenant) => (
                            <Select.Option value={tenant.id}>{tenant.name}</Select.Option>
                        ))
                    }
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default UserForm;
