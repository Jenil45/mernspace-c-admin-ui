import { useQuery } from "@tanstack/react-query";
import { Card, Col, Form, Input, Row, Select, Space } from "antd";
import { getTenants } from "../../../http/api";
import type { Tenant } from "../../../types";

const UserForm = ({ isEditMode = false }: { isEditMode: boolean }) => {

  const selectedRole = Form.useWatch('role');

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await getTenants(`perPage=100&currentPage=1`);
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
                <Form.Item
                  label="First name"
                  name={"firstName"}
                  rules={[
                    {
                      required: true,
                      message: "First name is required",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last name"
                  name={"lastName"}
                  rules={[
                    {
                      required: true,
                      message: "Last name is required",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name={"email"}
                  rules={[
                    {
                      required: true,
                      message: "Email is required",
                    },
                    { type: "email", message: "Email is not valid" },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {!isEditMode && (
            <Card title="Security Info">
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label="Password"
                    name={"password"}
                    rules={[
                      {
                        required: true,
                        message: "Password is required",
                      },
                    ]}
                  >
                    <Input size="large" type={"password"} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          <Card title={selectedRole==="manager"?"Role and Tenant":"Role"}>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name={"role"}
                  rules={[
                    {
                      required: true,
                      message: "Role is required",
                    },
                  ]}
                >
                  <Select
                    id="selectBoxInUserForm"
                    size="large"
                    style={{ width: "100%" }}
                    allowClear={true}
                    placeholder="Select Role"
                  >
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="manager">Manager</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {
                selectedRole==="manager" && (
                <Col span={12}>
                  <Form.Item
                    label="Tenant"
                    name={"tenantId"}
                    rules={[
                      {
                        required: true,
                        message: "Restaurant is required",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      style={{ width: "100%" }}
                      allowClear={true}
                      placeholder="Select Restaurant"
                    >
                      {tenants?.data.map((tenant: Tenant) => (
                        <Select.Option value={tenant.id} key={tenant.id}>
                          {tenant.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                )
              }
            </Row>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default UserForm;
