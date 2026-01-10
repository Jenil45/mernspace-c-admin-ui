import {
  Breadcrumb,
  Button,
  Drawer,
  Flex,
  Form,
  Space,
  Spin,
  Table,
  Typography,
  theme,
} from "antd";
import { RightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link, Navigate } from "react-router-dom";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateUserData, FieldData, User } from "../../types";
import { createUser, getUsers, updateUser } from "../../http/api";
import { useAuthStore } from "../../store";
import UsersFilter from "./UsersFilters";
import { useEffect, useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import UserForm from "./forms/UserForm";
import { PER_PAGE } from "../../constants";
import { debounce } from "lodash";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "firstName",
    key: "firstName",
    render: (_text: string, record: User) => {
      return (
        <div>
          {record.firstName} {record.lastName}
        </div>
      );
    },
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Restaurant",
    dataIndex: "tenant",
    key: "tenant",
    render: (_text: string, record: User) => {
      return <div>{record.tenant?.name}</div>;
    },
  },
];

const Users = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [currentEditingUser, setCurrentEditingUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const [queryParams, setQueryParams] = useState({
    perPage: PER_PAGE,
    currentPage: 1,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if(currentEditingUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrawerOpen(true);
      form.setFieldsValue({...currentEditingUser, tenantId: currentEditingUser.tenant?.id})
    }
  }, [currentEditingUser, form])

  const { user } = useAuthStore();

  const {
    data: users,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: async () => {
      const filteredParams = Object.fromEntries(
        Object.entries(queryParams).filter((item) => !!item[1])
      );
      const queryString = new URLSearchParams(
        filteredParams as unknown as Record<string, string>
      ).toString();
      const res = await getUsers(queryString);
      console.log("Fetch data: ", res);

      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { mutate: userMutate } = useMutation({
    mutationKey: ["addUser"],
    mutationFn: async (data: CreateUserData) =>
      createUser(data).then((res) => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return;
    },
  });

  const { mutate: userUpdateMutate } = useMutation({
    mutationKey: ["updateser"],
    mutationFn: async (data: CreateUserData) =>
      updateUser(data, currentEditingUser!.id).then((res) => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return;
    },
  });

  const onHandleSubmit = async () => {
    const isEditMode = !!currentEditingUser;
    await form.validateFields();
    if(isEditMode) {
      await userUpdateMutate(form.getFieldsValue());
      
    } else {
      await userMutate(form.getFieldsValue());
    }
    form.resetFields();
    setCurrentEditingUser(null);
    setDrawerOpen(false);
  };

  const debounceQUpdate = useMemo(() => {
    return debounce((value: string | undefined) => {
      setQueryParams((prev) => ({ ...prev, q: value, currentPage: 1 }));
    }, 500);
  }, []);

  const onFilterChange = (changedFields: FieldData[]) => {
    const changedFilterFields = changedFields
      .map((item) => {
        return {
          [item.name[0]]: item.value,
        };
      })
      .reduce((acc, item) => ({ ...acc, ...item }), {});

    if ("q" in changedFilterFields) {
      debounceQUpdate(changedFilterFields.q);
    } else {
      setQueryParams((prev) => ({
        ...prev,
        ...changedFilterFields,
        currentPage: 1,
      }));
    }
  };

  if (user?.role !== "admin") {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      <Space vertical style={{ width: "100%" }} size={"large"}>
        <Flex justify="space-between">
          <Breadcrumb
            separator={<RightOutlined />}
            items={[
              { title: <Link to={"/"}>Dashboard</Link> },
              { title: "Users" },
            ]}
          />
          {isFetching && (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
              spinning
            />
          )}
          {isError && (
            <Typography.Text type="danger">{error.message}</Typography.Text>
          )}
        </Flex>
        <Form form={filterForm} onFieldsChange={onFilterChange}>
          <UsersFilter>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setDrawerOpen(true);
              }}
            >
              Add User
            </Button>
          </UsersFilter>
        </Form>
        <Table
          columns={[
            ...columns,
            {
              title: "Actions",
              key: "action",
              render: (_: string, record: User) => {
                return (
                  <Space>
                    <Button type="link" onClick={() => {
                      setCurrentEditingUser(record);
                    }}>Edit</Button>
                  </Space>
                );
              },
            },
          ]}
          dataSource={users?.data}
          rowKey={"id"}
          pagination={{
            total: users?.total,
            pageSize: queryParams.perPage,
            current: queryParams.currentPage,
            onChange: (page) => {
              setQueryParams((prev) => {
                return {
                  ...prev,
                  currentPage: page,
                };
              });
            },
            showTotal: (total: number, range: number[]) => {
              return `Showing ${range[0]}-${range[1]} of ${total} items`;
            },
          }}
        />

        <Drawer
          title={currentEditingUser ? "Edit User" : "Create User"}
          size={720}
          destroyOnHidden={true}
          styles={{ body: { background: colorBgLayout } }}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setCurrentEditingUser(null);
            form.resetFields();
          }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  form.resetFields();
                  setCurrentEditingUser(null);
                  setDrawerOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={onHandleSubmit}>
                Submit
              </Button>
            </Space>
          }
        >
          <Form layout="vertical" form={form}>
            <UserForm isEditMode={!!currentEditingUser} />
          </Form>
        </Drawer>
      </Space>
    </>
  );
};

export default Users;
