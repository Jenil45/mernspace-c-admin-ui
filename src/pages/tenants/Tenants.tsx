import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createTenants, getTenants, updateTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { Link, Navigate } from "react-router-dom";
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
} from "antd";
import { RightOutlined, LoadingOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import TenantsFilter from "./TenantsFilter";
import { useEffect, useMemo, useState } from "react";
import type { CreateTenantData, FieldData, Tenant } from "../../types";
import TenantForm from "./forms/TenantForm";
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
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

const Tenants = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [currentEditingTenant, setCurrentEditingTenant] = useState<Tenant | null>(null);

  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  const [queryParams, setQueryParams] = useState({
    perPage: PER_PAGE,
    currentPage: 1,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if(currentEditingTenant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrawerOpen(true);
      form.setFieldsValue(currentEditingTenant);
    }
  }, [currentEditingTenant])

  const {
    data: tenants,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["tenants", queryParams],
    queryFn: async () => {
      const filteredParams = Object.fromEntries(
        Object.entries(queryParams).filter((item) => !!item[1])
      );
      const queryString = new URLSearchParams(
        filteredParams as unknown as Record<string, string>
      ).toString();
      const res = await getTenants(queryString);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { mutate: tenantMutate } = useMutation({
    mutationKey: ["addTenant"],
    mutationFn: async (data: CreateTenantData) =>
      createTenants(data).then((res) => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      return;
    },
  });

  const { mutate: updateTenantMutate } = useMutation({
    mutationKey: ["updateTenant"],
    mutationFn: async (data: CreateTenantData) =>
      updateTenants(data, currentEditingTenant!.id).then((res) => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      return;
    },
  });

  const onHandleSubmit = async () => {
    const isEditMode = !!currentEditingTenant;
    await form.validateFields();
    if(isEditMode) {
      await updateTenantMutate(form.getFieldsValue());
    }else {
      await tenantMutate(form.getFieldsValue());
    }

    form.resetFields();
    setCurrentEditingTenant(null);
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
              { title: "Tenants" },
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
          <TenantsFilter>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setDrawerOpen(true);
              }}
            >
              Add Restaurant
            </Button>
          </TenantsFilter>
        </Form>

        <Table
          dataSource={tenants?.data}
          rowKey={"id"}
          columns={[...columns, 
            {
              title: "Actions",
              key: "action",
              render: (_: string, record: Tenant) => {
                return (
                  <Space>
                    <Button type="link" onClick={() => {
                      setCurrentEditingTenant(record);
                    }}>Edit</Button>
                  </Space>
                );
              },
            },
          ]}
          pagination={{
            total: tenants?.total,
            current: queryParams.currentPage,
            pageSize: queryParams.perPage,
            onChange: (page) => {
              setQueryParams((prev) => ({ ...prev, currentPage: page }));
            },
            showTotal: (total: number, range: number[]) => {
              return `Showing ${range[0]} - ${range[1]} of ${total} items`;
            },
          }}
        />

        <Drawer
          size={720}
          title={currentEditingTenant? "Update Restaurant": "Create Restaurant"}
          destroyOnHidden={true}
          open={drawerOpen}
          onClose={() => {
            setCurrentEditingTenant(null);
            setDrawerOpen(false);
            form.resetFields();
          }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  form.resetFields();
                  setCurrentEditingTenant(null);
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
            <TenantForm />
          </Form>
        </Drawer>
      </Space>
    </>
  );
};

export default Tenants;
