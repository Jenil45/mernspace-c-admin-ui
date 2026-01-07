import { Card, Col, Form, Input, Row, Space } from "antd";

const TenantForm = () => {
  return (
    <Row>
      <Col span={24}>
        <Space vertical size={"large"}>
          <Card title="Basic Info">
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label="Restaurant Name"
                  name={"name"}
                  rules={[
                    {
                      required: true,
                      message: "Name is required",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name={"address"}
                  rules={[
                    {
                      required: true,
                      message: "Address is required",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default TenantForm;
