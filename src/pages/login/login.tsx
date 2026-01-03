import {
  Alert,
  Button,
  Card,
  Checkbox,
  Flex,
  Form,
  Input,
  Layout,
  Space,
} from "antd";
import { LockFilled, UserOutlined, LockOutlined } from "@ant-design/icons";
import Logo from "../../components/icons/Logo";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Credentials } from "../../types";
import { login, logout, self } from "../../http/api";
import { useAuthStore } from "../../store";
import { usePermission } from "../../hooks/usePermissions";

const loginUser = async (userData: Credentials) => {
  const { data } = await login(userData);
  return data;
};

const getSelf = async () => {
  const { data } = await self();
  return data;
};

const LoginPage = () => {

  const {isAllowed} = usePermission();
  const { setUser, logout: logoutFromStore } = useAuthStore();
  
  const { refetch } = useQuery({
    queryKey: ["self"],
    queryFn: getSelf,
    enabled: false,
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: async () => {
      const selfDataPromise = await refetch();

      // logout or redirect to client ui
      if(!isAllowed(selfDataPromise.data)) {
        await logout();
        logoutFromStore();
        return;
      } 

      setUser(selfDataPromise.data);
    },
  });

  return (
    <>
      <Layout
        style={{ height: "100vh", display: "grid", placeItems: "center" }}
      >
        <Space orientation="vertical" align="center" size="large">
          <Layout.Content
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Logo />
          </Layout.Content>

          <Card
            style={{ width: 300 }}
            variant="borderless"
            title={
              <Space
                style={{
                  width: "100%",
                  fontSize: "16",
                  justifyContent: "center",
                }}
              >
                <LockFilled />
                Sign in
              </Space>
            }
          >
            <Form
              initialValues={{ remember: true }}
              onFinish={(values) => {
                mutate({ email: values.username, password: values.password });
                console.log(values);
              }}
            >
              {isError && (
                <Alert
                  style={{ marginBottom: 24 }}
                  type="error"
                  title={error?.message}
                />
              )}

              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username",
                  },
                  {
                    type: "email",
                    message: "Email is not valid",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>

              <Flex justify="space-between">
                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a href="" id="login-form-forgot">
                  Forgot password
                </a>
              </Flex>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%" }}
                  loading={isPending}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </Layout>
    </>
  );
};

export default LoginPage;
